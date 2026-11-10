// Entrada suave de las partes de cada sección al aparecer (solo fundido y 20 px; nada se oculta sin script).
(function () {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sel = 'main h2, main .dc-lede, main figure, main .dc-pasos > div, main .dc-prod, main .dc-brownie, main .donde li, main .dc-cierre-in > *';
  var els = document.querySelectorAll(sel);
  if (!els.length) return;
  document.documentElement.classList.add('js-entra');
  var io = new IntersectionObserver(function (ent) {
    ent.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, hermanos = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(hermanos, 5) * 70 + 'ms';
      el.classList.add('visto'); io.unobserve(el);
    });
  }, { rootMargin: '0px 0px 0px 0px' });
  els.forEach(function (el) { if (!el.closest('.dc-hero')) { el.classList.add('entra'); io.observe(el); } });
})();
