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

## Certificaciones

**BRC y NSF Gluten-Free NO llevan logo** mientras no haya certificado emitido.
Van como línea de texto en la sección B2B, en el bloque `.certs` — un solo
lugar en cada idioma. Cuando lleguen los certificados: se agrega el logo a la
lista `<ul>` y se borra el párrafo `.tramite`.

## Publicar

GitHub Pages desde la rama `main`, carpeta raíz. El archivo `.nojekyll` evita
que Pages procese el sitio con Jekyll.

Los enlaces de idioma usan rutas absolutas (`/` y `/en/`), así que el sitio
tiene que servirse desde la raíz de un dominio. Con `truefoodcr.com` apuntado
por `CNAME` funciona; desde una subcarpeta de github.io, no.

## DNS — el sábado 29 de agosto

Se cambian **solo** los registros que apuntan el sitio.

> ⚠️ Los registros **MX** de GoDaddy no se tocan. Ahí viven `andrea@` e
> `info@truefoodcr.com`, y con ellos los avisos de pago de Automercado y
> Walmart. Borrarlos tumba el correo.
