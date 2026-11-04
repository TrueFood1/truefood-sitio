// Carrusel de fotos de producto: se desliza con el dedo (scroll-snap) y,
// en pantalla grande, con las flechas. Sin este script igual se puede deslizar.
document.querySelectorAll('.carrusel').forEach(function (c) {
  var pista = c.querySelector('.car-pista');
  var puntos = c.querySelectorAll('.car-puntos span');
  function actual() { return Math.round(pista.scrollLeft / pista.clientWidth); }
  function marcar() { var i = actual(); puntos.forEach(function (p, j) { p.classList.toggle('on', i === j); }); }
  function ir(d) { pista.scrollBy({ left: d * pista.clientWidth, behavior: 'smooth' }); }
  c.querySelector('.car-ant').addEventListener('click', function () { ir(-1); });
  c.querySelector('.car-sig').addEventListener('click', function () { ir(1); });
  pista.addEventListener('scroll', function () { window.requestAnimationFrame(marcar); }, { passive: true });
  pista.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') ir(1); if (e.key === 'ArrowLeft') ir(-1); });
  marcar();
});
