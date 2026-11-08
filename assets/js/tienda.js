(function () {
  // Conexión a Supabase. La anon key es pública por diseño; lo que protege es la RLS.
  var SUPA_URL = 'https://tomijkqnmpjcraaoeviq.supabase.co';
  var SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbWlqa3FubXBqY3JhYW9ldmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Mzk1MDQsImV4cCI6MjA5ODQxNTUwNH0.4fvlH0Tk4oLDe33JfvUs1crop7vC2Yt0hNlmhOMh6Cg';
  var BUCKET = 'tienda-comprobantes';
  var WHATSAPP = '50671369029';
  var MAX_ARCHIVO = 5242880;
  var ENVIO = 4000;
  var EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'application/pdf': 'pdf' };

  // Solo para mostrar: el total que vale lo recalcula tienda_crear_pedido().
  var PRODUCTOS = [
    { id: 'blanco', n: 'Pan Blanco', d: 'Suave y esponjoso', p: 5500, img: 'assets/img/bolsa-blanco.jpg' },
    { id: 'semillas', n: 'Pan de Semillas', d: 'Bolsa', p: 6000, img: 'assets/img/bolsa-semillas.jpg' },
    { id: 'frances', n: 'Pan Francés', d: 'Paquete de 4', p: 4800, img: 'assets/img/bolsa-frances.jpg' },
    { id: 'buns', n: 'Pan de Hamburguesa', d: 'Paquete de 4', p: 5500, img: 'assets/img/bolsa-buns.jpg' },
    { id: 'pizza', n: 'Pizza Crust', d: 'Paquete de 2', p: 5400, img: 'assets/img/bolsa-pizza.jpg' },
    { id: 'cookie', n: 'Cookie Dough', d: 'Pote de 340 g', p: 4500, img: 'assets/img/bolsa-cookie.jpg' }
  ];
  var BROWNIE = { id: 'brownie', n: 'Premezcla para Brownie', p: 4800 };

  var ERRORES = {
    'tienda:referencia_repetida': 'Ese número de comprobante ya se usó en otro pedido. Revísalo.',
    'tienda:total_distinto': 'Un precio cambió. Recarga la página y vuelve a armar tu pedido.',
    'tienda:producto': 'Uno de los productos ya no está disponible. Recarga la página.',
    'tienda:falta_direccion': 'Escribe la dirección de entrega.',
    'tienda:sin_comprobante': 'No pudimos guardar tu comprobante. Inténtalo de nuevo.',
    'tienda:sin_productos': 'Escoge al menos un producto.',
    'tienda:datos': 'Revisa tus datos: nombre, teléfono y número de comprobante.'
  };

  var $ = function (id) { return document.getElementById(id); };
  var cant = {};
  var fmt = function (v) { return '₡' + String(v).replace(/\B(?=(\d{3})+$)/g, '.'); };
  var todos = PRODUCTOS.concat([BROWNIE]);
  todos.forEach(function (p) { cant[p.id] = 0; });

  function paso(p) {
    return '<div class="tienda-paso"><button type="button" aria-label="Quitar ' + p.n + '" data-id="' + p.id + '" data-d="-1">−</button>' +
      '<output id="c-' + p.id + '">0</output>' +
      '<button type="button" aria-label="Agregar ' + p.n + '" data-id="' + p.id + '" data-d="1">+</button></div>';
  }

  $('brownie-paso').innerHTML = paso(BROWNIE);
  $('tienda-lista').innerHTML = PRODUCTOS.map(function (p) {
    return '<div class="tienda-prod"><img src="' + p.img + '" alt="" width="64" height="64" loading="lazy">' +
      '<div><div class="tienda-n">' + p.n + '</div><div class="tienda-d">' + p.d + '</div><div class="tienda-p">' + fmt(p.p) + '</div></div>' +
      paso(p) + '</div>';
  }).join('');

  function entrega() { return document.querySelector('input[name=entrega]:checked').value; }

  function calcular() {
    var sub = 0, n = 0;
    todos.forEach(function (p) { sub += cant[p.id] * p.p; n += cant[p.id]; });
    var envio = entrega() === 'envio' && n > 0 ? ENVIO : 0;
    return { sub: sub, n: n, envio: envio, total: sub + envio };
  }

  function pintar() {
    var c = calcular();
    $('l-dir').hidden = entrega() !== 'envio';
    $('tienda-total').textContent = fmt(c.total);
    $('tienda-monto').textContent = fmt(c.total);
    $('tienda-detalle').textContent = c.n
      ? c.n + (c.n > 1 ? ' productos' : ' producto') + (c.envio ? ' + envío' : '')
      : 'Escoge tus productos';
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
      $('brownie-img').src = 'assets/img/brownie-' + b.dataset.lado + '.jpg';
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
      a.textContent = 'Escríbenos por WhatsApp';
      a.target = '_blank';
      a.rel = 'noopener';
      el.appendChild(a);
    }
    el.hidden = false;
    el.scrollIntoView({ block: 'center' });
  }

  var FUERA = 'Ahora mismo no podemos recibir pedidos en la página.';

  function validar(c, archivo) {
    if (!c.n) return 'Escoge al menos un producto.';
    if ($('nombre').value.trim().length < 2) return 'Escribe tu nombre.';
    if ($('tel').value.replace(/\D/g, '').length < 8) return 'Escribe un teléfono de 8 dígitos.';
    if (entrega() === 'envio' && !$('dir').value.trim()) return 'Escribe la dirección de entrega.';
    if ($('ref').value.trim().length < 4) return 'Escribe el número de comprobante de tu pago.';
    if (!archivo) return 'Adjunta el comprobante de tu pago.';
    if (!EXT[archivo.type]) return 'El comprobante tiene que ser una foto o un PDF.';
    if (archivo.size > MAX_ARCHIVO) return 'El comprobante pesa más de 5 MB.';
    return null;
  }

  function auth() { return { apikey: SUPA_ANON, Authorization: 'Bearer ' + SUPA_ANON }; }

  async function enviar(c, archivo) {
    var id = crypto.randomUUID();
    var path = id + '/comprobante.' + EXT[archivo.type];

    var sube = await fetch(SUPA_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: Object.assign(auth(), { 'Content-Type': archivo.type }),
      body: archivo
    });
    if (!sube.ok) throw { fuera: true };

    var res = await fetch(SUPA_URL + '/rest/v1/rpc/tienda_crear_pedido', {
      method: 'POST',
      headers: Object.assign(auth(), { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        p: {
          id: id,
          nombre: $('nombre').value.trim(),
          telefono: $('tel').value.trim(),
          entrega: entrega(),
          direccion: entrega() === 'envio' ? $('dir').value.trim() : null,
          metodo_pago: document.querySelector('input[name=metodo]:checked').value,
          referencia: $('ref').value.trim(),
          comprobante_path: path,
          total_crc: c.total,
          lineas: todos.filter(function (p) { return cant[p.id] > 0; })
            .map(function (p) { return { id: p.id, cant: cant[p.id] }; })
        }
      })
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
    boton.textContent = 'Enviando…';
    try {
      var r = await enviar(c, archivo);
      $('listo-numero').textContent = '#' + r.numero;
      $('listo-total').textContent = fmt(r.total_crc);
      $('tienda-form').hidden = true;
      $('tienda-ticket').hidden = true;
      $('tienda-listo').hidden = false;
      window.scrollTo(0, 0);
    } catch (err) {
      if (err && err.texto) mostrarError(err.texto);
      else mostrarError(FUERA, true);
      boton.disabled = false;
      boton.textContent = 'Enviar pedido';
    }
  });

  pintar();
})();
