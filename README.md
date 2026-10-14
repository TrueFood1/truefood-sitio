# truefoodcr.com — sitio informativo

Sitio estático de True Food CR. Sin carrito, sin precios, sin formularios.
El CTA es "conseguinos en los congeladores de…".

## Estructura

```
index.html          español  (por defecto)
en/index.html       inglés   (el QR del summit apunta a /en/#b2b)
assets/css/site.css hoja de estilo única
assets/img/         imágenes optimizadas para web
material-*/         material de origen — NO se publica, es respaldo
```

## Reglas de marca

Todo sale de `TrueFood_VisualDNA.pdf`.

- Lima **#E9FE60** (Pantone 387 C). Negro puro, blanco, gris #58595B.
- Tipografías: **Josefin Sans** (titulares) + **DM Sans** (cuerpo). Google Fonts.
- El mantra va siempre en este orden: **delicioso · saludable · gluten free**.
- El logo lleva la mancha. La versión sin mancha del Shopify viejo no se usa.
- Colores por producto = colores del empaque (guía pág. 7 + ficha técnica).

## Tono

El sitio vende el concepto; los datos duros van por correo. El español va en
**"tu", no voseo** — nada de "querés", "escribinos" ni "conseguís". Sin frases
de plantilla: ni "líderes en", ni "calidad garantizada".

## La ficha técnica

Las specs de caja **no están en el sitio**. Viven en
`material-marca/TrueFood-ficha-tecnica.pdf`, una página A4 bilingüe con la
marca puesta, para adjuntar por correo. El sitio solo lleva la línea de
contexto (congelado · vida útil 9 meses · empacado por caja) y el llamado a
pedirla.

Para regenerarla: el fuente es `ficha/ficha.html` en el scratchpad de la
sesión. Si cambian las specs, se edita ahí y se vuelve a exportar.

## Certificaciones

El gluten free lo certifica **Gluten-Free Food Program** (GFFP), certificado
`P1589`, emitido 26-ago-2026, vence 25-ago-2027, umbral **5 ppm**.
⚠️ **No es NSF.** El sello de NSF no se usa nunca: no son ellos quienes
certifican.

El logo oficial de GFFP ya llegó y está montado (`sello-gf-certified.svg`).

**BRCGS START!** está certificado — confirmado por Lorena el 1-sep-2026 — y
lleva sello: `sello-brcgs.png`, junto a GFFP y Kosher en la tira del pie y en
las páginas de producto.
⚠️ **Ese archivo salió de una nota de blog, no del paquete de marca de BRCGS.**
Hay que reemplazarlo por el oficial cuando llegue; el nombre del archivo no
cambia. Falta también anotar acá el número de certificado y el vencimiento,
como los tiene GFFP.

## Publicar

GitHub Pages desde la rama `main`, carpeta raíz. El archivo `.nojekyll` evita
que Pages procese el sitio con Jekyll.

Los enlaces de idioma usan rutas absolutas (`/` y `/en/`), así que el sitio
tiene que servirse desde la raíz de un dominio. Con `truefoodcr.com` apuntado
por `CNAME` funciona; desde una subcarpeta de github.io, no.

## Blog

Solo en español. Los artículos son archivos `.md` en `blog/articulos/`; el
formato exacto está en `blog/PLANTILLA_ARTICULO.md`. Nadie edita a mano
`blog.html` ni `blog/*.html`: los arma `blog/armar.py` desde cero en cada corrida.

- La Action `.github/workflows/blog.yml` corre en cada push que toque `blog/`.
  En una rama arma solo las páginas de los artículos, para revisarlas en el
  pull request. En `main` rearma también `blog.html` y pide a Pages que publique.
- `borrador: si` no publica nada. Ojo: el repo es público, así que el texto de un
  borrador se puede leer en GitHub aunque no esté en el sitio.
- Vista previa local, con borradores, fuera del repo:
  `pip install -r blog/requirements.txt` y luego
  `python3 blog/armar.py --borradores --salida /carpeta/copia-del-sitio`.

⚠️ **El menú vive copiado en doce lugares:** las once páginas en español y
`blog/plantillas/pagina.html`, que es el encabezado y el pie de todo el blog.
Si cambia el menú, cambia en los doce. Las páginas en inglés no llevan Blog.

## DNS — el sábado 29 de agosto

Se cambian **solo** los registros que apuntan el sitio.

> ⚠️ Los registros **MX** de GoDaddy no se tocan. Ahí viven `andrea@` e
> `info@truefoodcr.com`, y con ellos los avisos de pago de Automercado y
> Walmart. Borrarlos tumba el correo.
