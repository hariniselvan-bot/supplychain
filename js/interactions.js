/* STACKLY — interactions.js
   FAQ search/categories, copy helpers, demo interactions */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- FAQ page: categories + live search ---------- */
  var faqLayout = $('[data-faq-layout]');
  if (faqLayout) {
    var items = $$('.sl-faq-item', faqLayout);
    var cats = $$('.sl-faq-cat');
    var search = $('[data-faq-search]');
    var empty = $('.sl-faq-empty');
    var activeCat = 'all';

    function highlight(el, q) {
      var p = $('.sl-faq-a p', el);
      if (!p) return;
      var text = p.getAttribute('data-original') || p.textContent;
      p.setAttribute('data-original', text);
      if (!q) { p.innerHTML = text; return; }
      var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      p.innerHTML = text.replace(re, '<span class="sl-mark">$1</span>');
    }

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var visible = 0;
      items.forEach(function (item) {
        var cat = item.getAttribute('data-faq-cat') || 'general';
        var text = item.textContent.toLowerCase();
        var show = (activeCat === 'all' || cat === activeCat) && (!q || text.indexOf(q) !== -1);
        item.style.display = show ? '' : 'none';
        if (show) { visible++; highlight(item, q); }
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    cats.forEach(function (c) {
      c.addEventListener('click', function () {
        cats.forEach(function (x) { x.classList.remove('is-active'); });
        c.classList.add('is-active');
        activeCat = c.getAttribute('data-faq-cat');
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
  }

  /* ---------- Track (order tracking) timeline animation ---------- */
  var trackBox = $('[data-track-steps]');
  if (trackBox) {
    var steps = $$('.sl-track-step', trackBox);
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        steps.forEach(function (s, i) {
          setTimeout(function () { s.classList.add('done'); }, i * 350);
        });
      });
    }, { threshold: .3 });
    io.observe(trackBox);
  }

  /* ---------- Demo interactive widgets ---------- */
  /* Shipment ID checker */
  var checker = $('[data-track-form]');
  if (checker) {
    checker.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input', checker);
      var result = $('[data-track-result]');
      if (!input.value.trim()) { window.slToast('Enter a shipment ID to track.'); return; }
      if (result) {
        result.hidden = false;
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      window.slToast('Tracking ' + input.value.trim().toUpperCase() + ' — live data connected.');
    });
  }

  /* Animated percentage rings */
  $$('[data-ring]').forEach(function (ring) {
    var val = parseInt(ring.getAttribute('data-ring'), 10);
    var circle = $('circle:last-child', ring) || $('circle[data-ring-val]', ring);
    if (!circle) return;
    var r = parseFloat(circle.getAttribute('r'));
    var C = 2 * Math.PI * r;
    circle.style.strokeDasharray = C;
    circle.style.strokeDashoffset = C;
    var io2 = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        io2.unobserve(en.target);
        circle.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)';
        circle.style.strokeDashoffset = C * (1 - val / 100);
      });
    }, { threshold: .4 });
    io2.observe(ring);
  });
})();
