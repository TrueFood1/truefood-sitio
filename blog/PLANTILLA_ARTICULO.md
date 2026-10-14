# Plantilla de artículo del blog

Este es el formato exacto de un artículo. Lo sigue Instinct al proponer uno y
cualquiera que escriba a mano.

## Dónde va

- Un archivo por artículo en `blog/articulos/`.
- El nombre del archivo es la dirección de la página: `pan-sin-gluten.md` sale
  publicado en `truefoodcr.com/blog/pan-sin-gluten.html`.
- Solo minúsculas, números y guiones. Sin tildes, sin eñes, sin espacios.
- Fotos nuevas en `assets/img/blog/`, en JPG, de 1600 px de ancho como máximo.
  También se pueden usar las fotos que ya están en `assets/img/`.

## El archivo

Copia esto tal cual y cambia los valores. El bloque entre las dos líneas `---`
es el encabezado; todo lo de abajo es el texto del artículo.

```markdown
---
titulo: Cómo armar una tostada francesa sin gluten
fecha: 2026-10-20
descripcion: Una frase de 120 a 160 caracteres. Sale en Google, al compartir por WhatsApp y en la lista del blog.
foto: assets/img/blog/tostada-francesa.jpg
foto_alt: Tostada francesa con fresas sobre un plato blanco
borrador: no
---

Primer párrafo del artículo.

## Un subtítulo

Más texto, con un [enlace](/productos.html) si hace falta.
```

## Los campos

| Campo         | ¿Obligatorio? | Cómo va |
|---------------|---------------|---------|
| `titulo`      | sí            | El título, sin comillas. |
| `fecha`       | sí            | `AAAA-MM-DD`. Ordena la lista: el más nuevo va primero. |
| `descripcion` | sí            | Una sola línea, de 120 a 160 caracteres. |
| `foto`        | no            | Ruta desde la raíz del sitio, dentro de `assets/img/`. Si no hay, al compartir sale la foto general del sitio. |
| `foto_alt`    | sí, si hay foto | Qué se ve en la foto, para lectores de pantalla. |
| `borrador`    | no            | `si` o `no`. Con `si` el artículo no se publica. Si falta, vale `no`. |

Ningún otro campo se acepta: si el encabezado trae uno desconocido, el blog no se arma
y la Action marca el error.

## El texto

- Subtítulos con `##` (y `###` si hace falta). Nunca `#`: el título ya lo pone el encabezado.
- Listas con `-` o `1.`, **negrita**, *cursiva*, `> cita`, enlaces e imágenes
  (`![qué se ve](assets/img/blog/foto.jpg)`).
- Nada de HTML con código: `<script>`, `<iframe>`, formularios o `onclick` hacen
  que la Action rechace el artículo.

## Tono (del README del sitio)

- Español de **"tú", no voseo**: nada de "querés", "escribinos", "conseguís".
- El mantra va siempre en este orden: **delicioso · saludable · gluten free**.
- Sin frases de plantilla: ni "líderes en", ni "calidad garantizada".
- El gluten free lo certifica **Gluten-Free Food Program (GFFP)**. **No es NSF**: nunca
  se menciona NSF.
- Datos duros (precios, specs de caja) no van en el sitio.

## Cómo se propone un artículo

1. Rama nueva desde `main`, llamada `articulo/<nombre-del-archivo>`.
2. Agregar **solo** el `.md` (y su foto, si es nueva). No se toca ningún `.html`:
   las páginas las arma la Action.
3. Push de la rama y pull request hacia `main`. La Action agrega a la rama la
   página del artículo para revisarla. `blog.html` no cambia en el pull request;
   se rearma solo en `main` al aprobarlo, para que dos artículos pendientes no
   choquen.
4. Una socia revisa y aprueba. Al unir el pull request, el artículo sale en el sitio.
