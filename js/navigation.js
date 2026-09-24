/* STACKLY — navigation.js
   Header behavior, mobile menu, dropdowns, page veil transitions */
(function () {
  'use strict';

  var header = document.querySelector('.sl-header');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector('.sl-burger');
  var menu = document.querySelector('#sl-mobile-menu');
  if (burger && menu) {
    var menuOpen = false;
    var setMenu = function (open) {
      menuOpen = open;
      burger.classList.toggle('is-active', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      menu.style.visibility = open ? 'visible' : 'hidden';
      if (open && window.gsap) {
        gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: .35, ease: 'power2.out' });
        gsap.fromTo(menu.querySelectorAll('.sl-mobile-link, .sl-mobile-menu-foot > *'),
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: .05, duration: .5, ease: 'power3.out', delay: .12, clearProps: 'all' });
      }
    };
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (menuOpen) setMenu(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
    window.__slCloseMenu = function () { if (menuOpen) setMenu(false); };
  }

  /* ---------- Services dropdown ---------- */
  document.querySelectorAll('.sl-has-dropdown').forEach(function (item) {
    var link = item.querySelector('.sl-nav-link');
    var dd = item.querySelector('.sl-dropdown');
    if (!link || !dd) return;
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');
    var open = function (v) {
      item.classList.toggle('open', v);
      link.setAttribute('aria-expanded', v ? 'true' : 'false');
    };
    link.addEventListener('click', function (e) {
      e.preventDefault();
      open(!item.classList.contains('open'));
    });
    item.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) open(true); });
    item.addEventListener('mouseleave', function () { open(false); });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) open(false); });
  });

  /* ---------- Active nav link ---------- */
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sl-nav-links a[href], .sl-mobile-menu a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('is-active');
  });

  /* ---------- Page veil transitions ---------- */
  var veil = document.querySelector('.sl-veil');
  if (veil && window.gsap) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href$=".html"], a[href="index.html"]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      if (window.__slCloseMenu) window.__slCloseMenu();
      gsap.timeline()
        .set(veil, { transformOrigin: 'bottom' })
        .to(veil, { scaleY: 1, duration: .45, ease: 'power3.inOut' })
        .add(function () { window.location.href = href; });
    });
    gsap.fromTo(veil, { scaleY: 1, transformOrigin: 'top' }, { scaleY: 0, duration: .6, ease: 'power3.inOut', delay: .1 });
  }
})();
