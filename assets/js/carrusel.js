// Carrusel de fotos de producto: se desliza con el dedo (scroll-snap) y,
// en pantalla grande, con las flechas. Sin este script igual se puede deslizar.
document.querySelectorAll('.carrusel').forEach(function (c) {
  var pista = c.querySelector('.car-pista');
  var puntos = c.querySelectorAll('.car-puntos span');
  function actual() { return Math.round(pista.scrollLeft / pista.clientWidth); }
  // El video corre solo mientras su lámina está a la vista; con «reducir movimiento», queda quieto y con controles.
  var items = pista.querySelectorAll('.car-item');
  var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function videos(i) {
    items.forEach(function (it, j) {
      var v = it.querySelector('video'); if (!v) return;
      if (quieto) { v.controls = true; return; }
      if (i === j) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); }
    });
  }
  function marcar() { var i = actual(); puntos.forEach(function (p, j) { p.classList.toggle('on', i === j); }); videos(i); }
  function ir(d) { pista.scrollBy({ left: d * pista.clientWidth, behavior: 'smooth' }); }
  c.querySelector('.car-ant').addEventListener('click', function () { ir(-1); });
  c.querySelector('.car-sig').addEventListener('click', function () { ir(1); });
  pista.addEventListener('scroll', function () { window.requestAnimationFrame(marcar); }, { passive: true });
  pista.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') ir(1); if (e.key === 'ArrowLeft') ir(-1); });
  marcar();
});
