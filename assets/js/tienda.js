(function () {
  // Conexión a Supabase. La anon key es pública por diseño; lo que protege es la RLS.
  var SUPA_URL = 'https://tomijkqnmpjcraaoeviq.supabase.co';
  var SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbWlqa3FubXBqY3JhYW9ldmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Mzk1MDQsImV4cCI6MjA5ODQxNTUwNH0.4fvlH0Tk4oLDe33JfvUs1crop7vC2Yt0hNlmhOMh6Cg';
  var BUCKET = 'tienda-comprobantes';
  var WHATSAPP = '50671369029';
  var MAX_ARCHIVO = 5242880;
  var ENVIO = 4000;
  var EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'application/pdf': 'pdf' };

  // Idioma de la página: tienda.html (es) o en/shop.html (en). Solo cambia lo que se
  // MUESTRA; lo que se manda a Supabase (ids, entrega, método) es igual en los dos.
  var EN = (document.documentElement.lang || '').slice(0, 2) === 'en';
  var BASE = EN ? '../' : '';

  // Solo para mostrar: el total que vale lo recalcula tienda_crear_pedido().
  var PRODUCTOS = [
    { id: 'blanco', url: EN ? 'product/white-bread.html' : 'producto/pan-blanco.html', n: EN ? 'White Bread' : 'Pan Blanco', d: EN ? 'Per loaf' : 'Por unidad', p: 5500, img: BASE + 'assets/img/bolsa-blanco.jpg' },
    { id: 'semillas', url: EN ? 'product/seeds-bread.html' : 'producto/pan-de-semillas.html', n: EN ? 'Seeds Bread' : 'Pan de Semillas', d: EN ? 'Per loaf' : 'Por unidad', p: 6000, img: BASE + 'assets/img/bolsa-semillas.jpg' },
    { id: 'frances', url: EN ? 'product/french-bread.html' : 'producto/pan-frances.html', n: EN ? 'French Bread' : 'Pan Francés', d: EN ? 'Pack of 4' : 'Paquete de 4', p: 4800, img: BASE + 'assets/img/bolsa-frances.jpg' },
    { id: 'buns', url: EN ? 'product/buns.html' : 'producto/buns.html', n: EN ? 'Buns' : 'Pan de Hamburguesa', d: EN ? 'Pack of 4' : 'Paquete de 4', p: 5500, img: BASE + 'assets/img/bolsa-buns.jpg' },
    { id: 'pizza', url: EN ? 'product/pizza-crust.html' : 'producto/pizza-crust.html', n: 'Pizza Crust', d: EN ? 'Pack of 2' : 'Paquete de 2', p: 5400, img: BASE + 'assets/img/bolsa-pizza.jpg' },
    { id: 'cookie', url: EN ? 'product/cookie-dough.html' : 'producto/cookie-dough.html', n: 'Cookie Dough', d: EN ? '340 g tub' : 'Pote de 340 g', p: 4500, img: BASE + 'assets/img/bolsa-cookie.jpg' }
  ];
  var BROWNIE = { id: 'brownie', n: EN ? 'Brownie Mix' : 'Premezcla para Brownie', p: 4800 };

  var T = EN ? {
    quitar: 'Remove ', agregar: 'Add ',
    producto: ' item', productos: ' items', masEnvio: ' + delivery', escoge: 'Choose your products',
    whatsapp: 'Message us on WhatsApp',
    fuera: 'We can\u2019t take orders on the website right now.',
    nombre: 'Please enter your name.',
    tel: 'Please enter an 8-digit phone number.',
    dir: 'Please enter the delivery address.',
    sinArchivo: 'Please attach your payment receipt.',
    tipoArchivo: 'The receipt must be a photo or a PDF.',
    pesoArchivo: 'The receipt is larger than 5 MB.',
    correo: 'Please enter your email: we\u2019ll send your electronic receipt there.',
    feNumero: { '01': 'A c\u00e9dula f\u00edsica has 9 digits (no leading zero).', '02': 'A c\u00e9dula jur\u00eddica has 10 digits.',
                '03': 'A DIMEX has 11 or 12 digits (no leading zero).', '04': 'A NITE has 10 digits.' },
    feNombre: 'Please enter the name or company name for the invoice.',
    feCorreo: 'Please check the email for the invoice.',
    feAyuda: { '01': '9 digits', '02': '10 digits', '03': '11 or 12 digits', '04': '10 digits' },
    listoCorreo: 'We\u2019ll email your electronic receipt to ', listoFactura: 'We\u2019ll email your electronic invoice to ',
    enviando: 'Sending\u2026', enviar: 'Place order'
  } : {
    quitar: 'Quitar ', agregar: 'Agregar ',
    producto: ' producto', productos: ' productos', masEnvio: ' + envío', escoge: 'Escoge tus productos',
    whatsapp: 'Escríbenos por WhatsApp',
    fuera: 'Ahora mismo no podemos recibir pedidos en la página.',
    nombre: 'Escribe tu nombre.',
    tel: 'Escribe un teléfono de 8 dígitos.',
    dir: 'Escribe la dirección de entrega.',
    sinArchivo: 'Adjunta el comprobante de tu pago.',
    tipoArchivo: 'El comprobante tiene que ser una foto o un PDF.',
    pesoArchivo: 'El comprobante pesa más de 5 MB.',
    correo: 'Escribe tu correo: ahí te enviamos tu comprobante electrónico.',
    feNumero: { '01': 'La cédula física tiene 9 dígitos (sin cero adelante).', '02': 'La cédula jurídica tiene 10 dígitos.',
                '03': 'El DIMEX tiene 11 o 12 dígitos (sin cero adelante).', '04': 'El NITE tiene 10 dígitos.' },
    feNombre: 'Escribe el nombre o la razón social de la factura.',
    feCorreo: 'Revisa el correo para la factura.',
    feAyuda: { '01': '9 dígitos', '02': '10 dígitos', '03': '11 o 12 dígitos', '04': '10 dígitos' },
    listoCorreo: 'Te enviaremos el comprobante electrónico a ', listoFactura: 'Te enviaremos la factura electrónica a ',
    enviando: 'Enviando…', enviar: 'Hacer pedido'
  };

  var ERRORES = EN ? {
    'tienda:total_distinto': 'A price has changed. Please reload the page and put your order together again.',
    'tienda:producto': 'One of the products is no longer available. Please reload the page.',
    'tienda:falta_direccion': 'Please enter the delivery address.',
    'tienda:sin_comprobante': 'We couldn\u2019t save your receipt. Please try again.',
    'tienda:sin_productos': 'Choose at least one product.',
    'tienda:datos': 'Please check your details: name and phone number.',
    'tienda:correo': 'Please check your email.',
    'tienda:factura': 'Please check the invoice details: ID type, ID number, name and email.'
  } : {
    'tienda:total_distinto': 'Un precio cambió. Recarga la página y vuelve a armar tu pedido.',
    'tienda:producto': 'Uno de los productos ya no está disponible. Recarga la página.',
    'tienda:falta_direccion': 'Escribe la dirección de entrega.',
    'tienda:sin_comprobante': 'No pudimos guardar tu comprobante. Inténtalo de nuevo.',
    'tienda:sin_productos': 'Escoge al menos un producto.',
    'tienda:datos': 'Revisa tus datos: nombre y teléfono.',
    'tienda:correo': 'Revisa tu correo.',
    'tienda:factura': 'Revisa los datos de la factura: tipo y número de identificación, nombre y correo.'
  };

  // Las mismas reglas que tienda_crear_pedido (CAMBIO_TIENDA_FACTURA.sql): la base las vuelve a revisar.
  var RE_CORREO = /^[^@\s<>"',;]+@[^@\s<>"',;]+\.[A-Za-z]{2,}$/;
  var FE_FORMATO = { '01': /^[1-9]\d{8}$/, '02': /^\d{10}$/, '03': /^[1-9]\d{10,11}$/, '04': /^\d{10}$/ };

  var $ = function (id) { return document.getElementById(id); };
  var cant = {};
  var fmt = function (v) { return '₡' + String(v).replace(/\B(?=(\d{3})+$)/g, '.'); };
  var todos = PRODUCTOS.concat([BROWNIE]);
  todos.forEach(function (p) { cant[p.id] = 0; });

  function paso(p) {
    return '<div class="tienda-paso"><button type="button" aria-label="' + T.quitar + p.n + '" data-id="' + p.id + '" data-d="-1">−</button>' +
      '<output id="c-' + p.id + '">0</output>' +
      '<button type="button" aria-label="' + T.agregar + p.n + '" data-id="' + p.id + '" data-d="1">+</button></div>';
  }

  $('brownie-paso').innerHTML = paso(BROWNIE);
  $('tienda-lista').innerHTML = PRODUCTOS.map(function (p) {
    return '<div class="tienda-prod"><img src="' + p.img + '" alt="" width="64" height="64" loading="lazy">' +
      '<div><div class="tienda-n"><a href="' + p.url + '" target="_blank" rel="noopener">' + p.n + '</a></div><div class="tienda-d">' + p.d + '</div><div class="tienda-p">' + fmt(p.p) + '</div></div>' +
      paso(p) + '</div>';
  }).join('');

  function entrega() { return document.querySelector('input[name=entrega]:checked').value; }

  function calcular() {
    var sub = 0, n = 0;
    todos.forEach(function (p) { sub += cant[p.id] * p.p; n += cant[p.id]; });
    var envio = entrega() === 'envio' && n > 0 ? ENVIO : 0;
    return { sub: sub, n: n, envio: envio, total: sub + envio };
  }

  // Una página vieja en caché (sin los campos nuevos) con este tienda.js tiene que seguir vendiendo: cada campo
  // nuevo se lee con val() y, si no está, el pedido sale como antes (sin correo y sin factura).
  function val(id) { var e = $(id); return e ? String(e.value || '').trim() : ''; }
  function hayCorreo() { return !!$('correo'); }
  function factura() {
    if (!$('fe') || !$('fe').checked || !$('fe-tipo')) return null;
    var f = { tipo: $('fe-tipo').value, numero: val('fe-numero').replace(/[\s.-]/g, ''), nombre: val('fe-nombre') };
    var cor = val('fe-correo');
    if (cor) f.correo = cor;
    return f;
  }

  function pintar() {
    var c = calcular();
    $('l-dir').hidden = entrega() !== 'envio';
    if ($('fe-campos') && $('fe')) $('fe-campos').hidden = !$('fe').checked;
    if ($('fe-numero') && $('fe-tipo')) $('fe-numero').placeholder = T.feAyuda[$('fe-tipo').value] || '';
    $('tienda-total').textContent = fmt(c.total);
    $('tienda-monto').textContent = fmt(c.total);
    $('tienda-detalle').textContent = c.n
      ? c.n + (c.n > 1 ? T.productos : T.producto) + (c.envio ? T.masEnvio : '')
      : T.escoge;
  }

  document.querySelector('.tienda').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]');
    if (!b) return;
    cant[b.dataset.id] = Math.max(0, Math.min(50, cant[b.dataset.id] + Number(b.dataset.d)));
    $('c-' + b.dataset.id).textContent = cant[b.dataset.id];
    pintar();
  });
  $('tienda-form').addEventListener('change', pintar);

  document.querySelectorAll('.tienda-lados button').forEach(function (b) {
    b.addEventListener('click', function () {
      $('brownie-img').src = BASE + 'assets/img/brownie-' + b.dataset.lado + '.jpg';
      document.querySelectorAll('.tienda-lados button').forEach(function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
    });
  });

  function mostrarError(texto, conWhatsapp) {
    var el = $('tienda-error');
    el.textContent = texto + (conWhatsapp ? ' ' : '');
    if (conWhatsapp) {
      var a = document.createElement('a');
      a.href = 'https://wa.me/' + WHATSAPP;
      a.textContent = T.whatsapp;
      a.target = '_blank';
      a.rel = 'noopener';
      el.appendChild(a);
    }
    el.hidden = false;
    el.scrollIntoView({ block: 'center' });
  }

  var FUERA = T.fuera;

  function validar(c, archivo) {
    if (!c.n) return ERRORES['tienda:sin_productos'];
    if ($('nombre').value.trim().length < 2) return T.nombre;
    if ($('tel').value.replace(/\D/g, '').length < 8) return T.tel;
    if (hayCorreo() && !RE_CORREO.test(val('correo'))) return T.correo;
    if (entrega() === 'envio' && !$('dir').value.trim()) return T.dir;
    var f = factura();
    if (f) {
      if (!FE_FORMATO[f.tipo] || !FE_FORMATO[f.tipo].test(f.numero)) return T.feNumero[f.tipo] || ERRORES['tienda:factura'];
      if (f.nombre.length < 2 || f.nombre.length > 100) return T.feNombre;
      if (f.correo && !RE_CORREO.test(f.correo)) return T.feCorreo;
    }
    if (!archivo) return T.sinArchivo;
    if (!EXT[archivo.type]) return T.tipoArchivo;
    if (archivo.size > MAX_ARCHIVO) return T.pesoArchivo;
    return null;
  }

  function auth() { return { apikey: SUPA_ANON, Authorization: 'Bearer ' + SUPA_ANON }; }

  async function enviar(c, archivo) {
    var id = crypto.randomUUID();
    var path = id + '/comprobante.' + EXT[archivo.type];

    // Se arma antes de subir: el carrito puede cambiar mientras sube el archivo.
    var pedido = JSON.stringify({
      p: {
        id: id,
        nombre: $('nombre').value.trim(),
        telefono: $('tel').value.trim(),
        entrega: entrega(),
        direccion: entrega() === 'envio' ? $('dir').value.trim() : null,
        correo: hayCorreo() ? val('correo') : undefined,
        factura: factura(),
        metodo_pago: document.querySelector('input[name=metodo]:checked').value,
        comprobante_path: path,
        total_crc: c.total,
        lineas: todos.filter(function (p) { return cant[p.id] > 0; })
          .map(function (p) { return { id: p.id, cant: cant[p.id] }; })
      }
    });

    var sube = await fetch(SUPA_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: Object.assign(auth(), { 'Content-Type': archivo.type }),
      body: archivo
    });
    if (!sube.ok) throw { fuera: true };

    var res = await fetch(SUPA_URL + '/rest/v1/rpc/tienda_crear_pedido', {
      method: 'POST',
      headers: Object.assign(auth(), { 'Content-Type': 'application/json' }),
      body: pedido
    });
    var cuerpo = await res.json().catch(function () { return {}; });
    if (!res.ok) throw ERRORES[cuerpo.message] ? { texto: ERRORES[cuerpo.message] } : { fuera: true };
    return cuerpo;
  }

  $('tienda-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    $('tienda-error').hidden = true;
    var c = calcular();
    var archivo = $('comprobante').files[0];
    var malo = validar(c, archivo);
    if (malo) { mostrarError(malo); return; }

    var boton = $('tienda-enviar');
    boton.disabled = true;
    boton.textContent = T.enviando;
    try {
      var r = await enviar(c, archivo);
      $('listo-numero').textContent = '#' + r.numero;
      $('listo-total').textContent = fmt(r.total_crc);
      var f = factura();
      if ($('listo-correo') && hayCorreo()) $('listo-correo').textContent = (f ? T.listoFactura + (f.correo || val('correo')) : T.listoCorreo + val('correo')) + '.';
      $('tienda-form').hidden = true;
      $('tienda-ticket').hidden = true;
      $('tienda-listo').hidden = false;
      window.scrollTo(0, 0);
    } catch (err) {
      if (err && err.texto) mostrarError(err.texto);
      else mostrarError(FUERA, true);
      boton.disabled = false;
      boton.textContent = T.enviar;
    }
  });

  pintar();
})();
