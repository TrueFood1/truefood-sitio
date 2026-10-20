#!/usr/bin/env python3
"""Arma el blog de truefoodcr.com a partir de los .md de blog/articulos/.

Todo se genera desde cero en cada corrida, nunca editando encima:
  - blog/<nombre>.html  una pagina por articulo publicado
  - blog.html           la lista, mas nuevo primero

Los articulos con `borrador: si` no generan nada. Si un articulo pasa a
borrador o se borra su .md, su pagina desaparece en la siguiente corrida.

Uso:
  python3 blog/armar.py                    articulos + blog.html (lo que corre en main)
  python3 blog/armar.py --solo-articulos   sin tocar blog.html (lo que corre en las ramas,
                                           para que dos articulos pendientes no choquen)
  python3 blog/armar.py --borradores --salida /otra/carpeta
                                           vista previa local con borradores incluidos;
                                           nunca contra el repo

El formato de cada articulo esta en blog/PLANTILLA_ARTICULO.md.
"""

import argparse
import datetime
import html
import re
import sys
from pathlib import Path

import markdown

SITIO = "https://truefoodcr.com"
RAIZ_REPO = Path(__file__).resolve().parent.parent
ARTICULOS = RAIZ_REPO / "blog" / "articulos"
PLANTILLA = RAIZ_REPO / "blog" / "plantillas" / "pagina.html"

OBLIGATORIOS = ("titulo", "fecha", "descripcion")
PERMITIDOS = OBLIGATORIOS + ("foto", "foto_alt", "borrador")
MESES = ("enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre")
# El sitio no lleva scripts de terceros; un articulo tampoco.
PROHIBIDO = re.compile(r"<\s*(script|iframe|style|object|embed|form)\b|javascript:|<[^>]*\son\w+\s*=",
                       re.IGNORECASE)


# Solo aparece en la vista previa con --borradores; en el sitio un borrador no existe.
MARCA_BORRADOR = ' <span class="marca-borrador">Borrador</span>'


class ErrorArticulo(Exception):
    pass


def leer_articulo(ruta):
    texto = ruta.read_text(encoding="utf-8")
    nombre = ruta.stem
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", nombre):
        raise ErrorArticulo("el nombre del archivo solo lleva minusculas, numeros y guiones "
                            "(sin tildes ni espacios), por ejemplo pan-sin-gluten.md")

    m = re.match(r"\A---\n(.*?)\n---\n(.*)\Z", texto.replace("\r\n", "\n"), re.DOTALL)
    if not m:
        raise ErrorArticulo("falta el encabezado entre dos lineas de tres guiones (---)")

    datos = {}
    for n, linea in enumerate(m.group(1).split("\n"), start=2):
        if not linea.strip():
            continue
        if ":" not in linea:
            raise ErrorArticulo("linea %d del encabezado no tiene la forma  campo: valor" % n)
        clave, valor = linea.split(":", 1)
        clave = clave.strip().lower()
        if clave not in PERMITIDOS:
            raise ErrorArticulo("campo desconocido en el encabezado: %r" % clave)
        valor = valor.strip()
        if len(valor) >= 2 and valor[0] == valor[-1] and valor[0] in "\"'":
            valor = valor[1:-1]
        datos[clave] = valor

    for clave in OBLIGATORIOS:
        if not datos.get(clave):
            raise ErrorArticulo("falta el campo obligatorio %r" % clave)

    try:
        fecha = datetime.date.fromisoformat(datos["fecha"])
    except ValueError:
        raise ErrorArticulo("la fecha va como AAAA-MM-DD, por ejemplo 2026-10-14")

    borrador = datos.get("borrador", "no").lower()
    if borrador not in ("si", "sí", "no"):
        raise ErrorArticulo("borrador va como  si  o  no")

    foto = datos.get("foto", "")
    if foto:
        foto = foto.lstrip("/")
        if not foto.startswith("assets/img/"):
            raise ErrorArticulo("la foto va dentro de assets/img/ (las nuevas, en assets/img/blog/)")
        if not (RAIZ_REPO / foto).is_file():
            raise ErrorArticulo("no existe la foto %s" % foto)
        if not datos.get("foto_alt"):
            raise ErrorArticulo("si hay foto, foto_alt describe lo que se ve en ella")

    cuerpo = m.group(2).strip()
    if not cuerpo:
        raise ErrorArticulo("el articulo no tiene texto")
    if PROHIBIDO.search(cuerpo):
        raise ErrorArticulo("el texto trae codigo (script, iframe, formulario o similar); "
                            "un articulo es solo texto, enlaces e imagenes")
    if re.search(r"^# ", cuerpo, re.MULTILINE):
        raise ErrorArticulo("el titulo ya lo pone el encabezado; los subtitulos van con ##")

    return {
        "nombre": nombre,
        "titulo": datos["titulo"],
        "fecha": fecha,
        "descripcion": datos["descripcion"],
        "foto": foto,
        "foto_alt": datos.get("foto_alt", ""),
        "borrador": borrador != "no",
        "cuerpo": cuerpo,
    }


def fecha_larga(d):
    return "%d de %s de %d" % (d.day, MESES[d.month - 1], d.year)


def llenar(plantilla, valores):
    """Una sola pasada: lo que traiga el articulo nunca se interpreta como marcador."""
    def poner(m):
        clave = m.group(1)
        if clave not in valores:
            raise KeyError("la plantilla pide {{%s}} y el script no lo da" % clave)
        return valores[clave]
    return re.sub(r"\{\{(\w+)\}\}", poner, plantilla)


def pagina_articulo(plantilla, a):
    e = html.escape
    raiz = "../"
    cuerpo = markdown.markdown(a["cuerpo"], extensions=["extra", "sane_lists", "smarty"],
                               output_format="html")
    # Las imagenes del cuerpo se escriben desde la raiz del sitio (assets/img/blog/...).
    cuerpo = re.sub(r'(<img[^>]*\ssrc=")/?(assets/)', r"\1" + raiz + r"\2", cuerpo)
    cuerpo = cuerpo.replace("<img ", '<img loading="lazy" ')

    foto = ""
    if a["foto"]:
        foto = ('    <img class="articulo-foto" src="%s%s" alt="%s">\n'
                % (raiz, e(a["foto"]), e(a["foto_alt"])))
    contenido = (
        '  <nav class="miga" aria-label="Ruta"><a href="../blog.html">Blog</a> '
        '<span aria-hidden="true">/</span> %(titulo)s</nav>\n'
        '  <article class="seccion articulo">\n'
        '    <p class="rotulo"><time datetime="%(iso)s">%(larga)s</time>%(marca)s</p>\n'
        '    <h1>%(titulo)s</h1>\n'
        '    <p class="lede">%(desc)s</p>\n'
        '%(foto)s'
        '    <div class="articulo-cuerpo">\n%(cuerpo)s\n    </div>\n'
        '    <p class="cta-vuelta"><a href="../blog.html">&larr; Todos los art&iacute;culos</a></p>\n'
        '  </article>'
    ) % {"titulo": e(a["titulo"]), "iso": a["fecha"].isoformat(), "larga": fecha_larga(a["fecha"]),
         "desc": e(a["descripcion"]), "foto": foto, "cuerpo": cuerpo,
         "marca": MARCA_BORRADOR if a["borrador"] else ""}

    imagen = "%s/%s" % (SITIO, a["foto"] or "assets/img/og.jpg")
    return llenar(plantilla, {
        "titulo_pagina": e(a["titulo"]) + " &mdash; True Food",
        "descripcion": e(a["descripcion"]),
        "canonical": "%s/blog/%s.html" % (SITIO, a["nombre"]),
        "og_type": "article",
        "og_image": imagen,
        "extra_head": '<meta property="article:published_time" content="%s">\n' % a["fecha"].isoformat(),
        "raiz": raiz,
        "inicio": raiz,
        "yo": a["nombre"] + ".html",
        "contenido": contenido,
    })


def pagina_lista(plantilla, articulos):
    e = html.escape
    if articulos:
        filas = []
        # Flavor first for the reviewed list. Future articles follow by date.
        first = ["si-no-es-divino-no-es-true-food", "if-its-not-delicious-its-not-true-food",
                 "comer-gluten-free-hoy", "eating-gluten-free-today",
                 "certificado-gluten-free", "certified-gluten-free"]
        ordered = sorted(articulos, key=lambda a: first.index(a["nombre"]) if a["nombre"] in first else len(first))
        for a in ordered:
            seal = a["nombre"] in ("certificado-gluten-free", "certified-gluten-free")
            photo = "assets/img/blog/gffp-list.png" if seal else a["foto"]
            if not photo:
                photo = {"if-its-not-delicious-its-not-true-food":"assets/img/servido-frances.jpg",
                         "eating-gluten-free-today":"assets/img/servido-blanco.jpg"}.get(a["nombre"], "")
            alt = "Gluten-Free Food Program" if seal else (a["foto_alt"] or "True Food, served")
            foto = ('<div class="blog-miniatura%s"><img src="%s" alt="%s" loading="lazy"></div>'
                    % (" sello-articulo" if seal else "", e(photo), e(alt))) if photo else ""
            filas.append(
                '      <li class="blog-item">\n'
                '        %s\n'
                '        <div class="blog-texto">\n'
                '          <time datetime="%s">%s</time>\n'
                '          <h2><a href="blog/%s.html">%s</a></h2>\n'
                '          <p class="blog-extracto">%s</p>\n'
                '        </div><span class="blog-flecha" aria-hidden="true">↗</span>\n'
                '      </li>'
                % (foto, a["fecha"].isoformat(), ("%d %s %d" % (a["fecha"].day, MESES[a["fecha"].month - 1][:3], a["fecha"].year)),
                   a["nombre"], e(a["titulo"]), e(a["descripcion"])))
        lista = '    <ul class="blog-lista">\n%s\n    </ul>' % "\n".join(filas)
    else:
        lista = ('    <p class="blog-vacio">Muy pronto, historias para antojarse. Mientras tanto, '
                 '<a href="productos.html">conoce nuestros productos</a>.</p>')

    contenido = (
        '  <section class="seccion blog-cab" aria-labelledby="t-blog">\n'
        '    <div class="inner">\n'
        '    <h1 id="t-blog">Blog</h1>\n'
        '    <p class="lede">Recetas, ideas y lo que vamos aprendiendo sobre comer delicioso, '
        'saludable y Gluten Free.</p>\n'
        '%s\n'
        '    </div>\n'
        '  </section>'
    ) % lista

    return llenar(plantilla, {
        "titulo_pagina": "Blog &mdash; True Food",
        "descripcion": "Recetas, ideas y novedades de True Food: delicioso, saludable y Gluten Free.",
        "canonical": SITIO + "/blog.html",
        "og_type": "website",
        "og_image": SITIO + "/assets/img/og.jpg",
        "extra_head": "",
        "raiz": "",
        "inicio": "./",
        "yo": "blog.html",
        "contenido": contenido,
    })


def main():
    p = argparse.ArgumentParser(description="Arma el blog desde blog/articulos/*.md")
    p.add_argument("--solo-articulos", action="store_true",
                   help="no tocar blog.html (para las ramas de articulos)")
    p.add_argument("--borradores", action="store_true",
                   help="incluir borradores; solo para vista previa con --salida")
    p.add_argument("--salida", type=Path, default=RAIZ_REPO,
                   help="carpeta donde se escribe (por defecto, el repo)")
    args = p.parse_args()

    salida = args.salida.resolve()
    if args.borradores and salida == RAIZ_REPO:
        sys.exit("--borradores escribe borradores: solo se usa con --salida apuntando fuera del repo")

    errores, articulos = [], []
    for ruta in sorted(ARTICULOS.glob("*.md")):
        try:
            articulos.append(leer_articulo(ruta))
        except ErrorArticulo as err:
            errores.append("%s: %s" % (ruta.relative_to(RAIZ_REPO), err))
    if errores:
        # Nada se escribe si un articulo esta mal: el sitio queda como estaba.
        sys.exit("No se armo el blog:\n  " + "\n  ".join(errores))

    publicables = [a for a in articulos if args.borradores or not a["borrador"]]
    publicables.sort(key=lambda a: (a["fecha"], a["nombre"]), reverse=True)
    plantilla = PLANTILLA.read_text(encoding="utf-8")

    carpeta = salida / "blog"
    carpeta.mkdir(parents=True, exist_ok=True)
    # Desde cero: en blog/ solo viven paginas generadas, asi que se borran todas.
    for viejo in carpeta.glob("*.html"):
        viejo.unlink()
    for a in publicables:
        (carpeta / (a["nombre"] + ".html")).write_text(pagina_articulo(plantilla, a), encoding="utf-8")
    if not args.solo_articulos:
        (salida / "blog.html").write_text(pagina_lista(plantilla, publicables), encoding="utf-8")

    # English counterpart uses the same reviewed ES parser and runs after ES pages.
    if (RAIZ_REPO / "blog/articulos-en/equivalencias.json").exists() and salida == RAIZ_REPO:
        import subprocess
        cmd = [sys.executable, str(RAIZ_REPO / "blog/armar-en.py")]
        if args.solo_articulos:
            cmd.append("--solo-articulos")
        subprocess.run(cmd, check=True)

    saltados = len(articulos) - len(publicables)
    print("Blog armado: %d articulo(s) publicado(s), %d borrador(es) sin publicar%s."
          % (len(publicables), saltados, "" if not args.solo_articulos else ", blog.html sin tocar"))


if __name__ == "__main__":
    main()
