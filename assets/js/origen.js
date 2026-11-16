// De dónde llegó la visita (16-nov-2026). Se mira al entrar a CUALQUIER página y se guarda para la visita
// (sessionStorage), así un anuncio que cae en un producto o en links.html sigue contando cuando la persona llega
// a la tienda. La tienda lo manda con el pedido como p.origen; la base lo vuelve a limpiar (TIENDA_ORIGEN.sql).
//   · Con utm_* en la dirección: gana siempre (es un clic nuevo en un anuncio), aunque ya hubiera otro guardado.
//   · Sin utm_*: si no hay nada guardado, el sitio de donde vino (instagram.com, l.facebook.com…), nunca el propio.
// Nada de esto puede romper la página: todo va en try/catch y, si falla, el pedido sale sin origen.
(function () {
  var CLAVE = 'tf_origen';
  var CAMPOS = ['source', 'medium', 'campaign', 'content'];

  function limpio(v) {
    var s = String(v == null ? '' : v).trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 60);
    return s || null;
  }

  function leer() {
    try { var o = JSON.parse(window.sessionStorage.getItem(CLAVE) || 'null'); return o && typeof o === 'object' ? o : null; }
    catch (e) { return null; }
  }

  function guardar(o) {
    try { window.sessionStorage.setItem(CLAVE, JSON.stringify(o)); } catch (e) {}
  }

  var actual = leer();
  try {
    var q = new URLSearchParams(window.location.search);
    var utm = {};
    var hay = false;
    CAMPOS.forEach(function (k) { var v = limpio(q.get('utm_' + k)); if (v) { utm[k] = v; hay = true; } });
    if (hay) {
      actual = utm;
      guardar(actual);
    } else if (!actual && document.referrer) {
      var host = limpio(new URL(document.referrer).hostname.replace(/^www\./, ''));
      var propio = window.location.hostname.replace(/^www\./, '');
      if (host && host !== propio) { actual = { ref: host }; guardar(actual); }
    }
  } catch (e) {}

  // Lo que la tienda manda: solo campos con texto corto y limpio, o null si no hay nada.
  window.tfOrigen = function () {
    var o = actual || leer();
    if (!o) return null;
    var r = {};
    var hay = false;
    CAMPOS.concat('ref').forEach(function (k) { var v = limpio(o[k]); if (v) { r[k] = v; hay = true; } });
    return hay ? r : null;
  };
})();
