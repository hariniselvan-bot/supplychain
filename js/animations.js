/* STACKLY — animations.js
   GSAP hero intro, parallax, ScrollTrigger reveals, horizontal process, chart bars */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* AOS init (optional CDN) */
  if (window.AOS) {
    AOS.init({ duration: 850, easing: 'ease-out-cubic', once: true, offset: 70 });
  } else {
    /* Fallback: IntersectionObserver adds .aos-animate */
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('aos-animate'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    $$('[data-aos]').forEach(function (el) { io.observe(el); });
  }

  if (!window.gsap) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Hero intro ---------- */
  document.addEventListener('sl:ready', function () {
    var hero = $('.sl-hero');
    if (!hero) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.sl-hero-bg img', { scale: 1.18 }, { scale: 1.08, duration: 2.2, ease: 'power2.out' }, 0)
      .to('.sl-hero-title .sl-line > span', { yPercent: 0, duration: 1.1, stagger: .12 }, .1)
      .fromTo('.sl-hero-chip', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, .2)
      .fromTo('.sl-hero-sub', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, .55)
      .fromTo('.sl-hero-cta > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .08 }, .7)
      .fromTo('.sl-hero-proof', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, .9)
      .fromTo('.sl-reach-card', { y: 60, opacity: 0, rotate: 2 }, { y: 0, opacity: 1, rotate: 0, duration: 1.1, ease: 'power4.out' }, .5)
      .fromTo('.sl-hero-stats .sl-stat-chip', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .1 }, .75)
      .fromTo('.sl-map-tag', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: .7, stagger: .12 }, .85);
    gsap.set('.sl-hero-title .sl-line > span', { yPercent: 110 });
    tl.play();
    gsap.to('.sl-hero-title .sl-line > span', {
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      yPercent: -20, opacity: .4, stagger: .05
    });
  });

  /* ---------- Mouse parallax ---------- */
  var heroEl = $('.sl-hero');
  if (heroEl && window.matchMedia('(hover:hover)').matches) {
    var bgX = gsap.quickTo('.sl-hero-bg img', 'x', { duration: 1.2, ease: 'power3' });
    var bgY = gsap.quickTo('.sl-hero-bg img', 'y', { duration: 1.2, ease: 'power3' });
    var cardX = gsap.quickTo('.sl-reach-card', 'x', { duration: 1, ease: 'power3' });
    var cardY = gsap.quickTo('.sl-reach-card', 'y', { duration: 1, ease: 'power3' });
    var tagX = gsap.quickTo('.sl-map-tags', 'x', { duration: 1.4, ease: 'power3' });
    heroEl.addEventListener('mousemove', function (e) {
      var cx = (e.clientX / window.innerWidth - .5);
      var cy = (e.clientY / window.innerHeight - .5);
      bgX(cx * -26); bgY(cy * -16);
      cardX(cx * 18); cardY(cy * 12);
      tagX(cx * 30);
    });
  }

  /* ---------- Generic parallax elements ---------- */
  $$('[data-parallax]').forEach(function (el) {
    var speed = parseFloat(el.getAttribute('data-parallax')) || .2;
    gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- Horizontal process ---------- */
  var process = $('.sl-process');
  if (process && window.ScrollTrigger) {
    var track = $('.sl-process-track', process);
    var bar = $('.sl-process-progress i', process);
    if (track && window.innerWidth > 992) {
      var getDist = function () { return track.scrollWidth - process.clientWidth; };
      gsap.to(track, {
        x: function () { return -getDist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: process, start: 'top top', end: function () { return '+=' + getDist(); },
          pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { if (bar) bar.style.width = (self.progress * 100) + '%'; }
        }
      });
    }
  }

  /* ---------- Analytics bars ---------- */
  $$('.sl-bars').forEach(function (bars) {
    var items = $$('.sl-bar i', bars);
    ScrollTrigger.create({
      trigger: bars, start: 'top 85%', once: true,
      onEnter: function () {
        gsap.to(items, { scaleY: 1, duration: 1.1, stagger: .07, ease: 'power3.out' });
      }
    });
  });

  /* ---------- Mini progress tracks ---------- */
  $$('.sl-mini-track i, .sl-progress-mini i').forEach(function (el) {
    var w = el.getAttribute('data-w') || el.style.width || '70%';
    el.style.width = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () { gsap.to(el, { width: w, duration: 1.3, ease: 'power3.out' }); }
    });
  });

  /* ---------- SVG route drawing ---------- */
  $$('.sl-route').forEach(function (path) {
    var len = path.getTotalLength ? path.getTotalLength() : 600;
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 1.2, yoyo: true
    });
  });

  /* ---------- Risk ring ---------- */
  var ring = $('.sl-risk-ring i');
  if (ring) {
    var target = parseInt(ring.getAttribute('data-val') || '68', 10);
    var C = 2 * Math.PI * 44;
    gsap.set(ring, { strokeDasharray: C, strokeDashoffset: C });
    ScrollTrigger.create({
      trigger: ring, start: 'top 85%', once: true,
      onEnter: function () {
        gsap.to(ring, { strokeDashoffset: C * (1 - target / 100), duration: 1.8, ease: 'power3.out' });
      }
    });
  }

  /* ---------- Section head reveals ---------- */
  $$('.sl-section-head').forEach(function (h) {
    gsap.from(h.children, {
      y: 40, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out',
      scrollTrigger: { trigger: h, start: 'top 85%', once: true }
    });
  });

  /* ---------- Image clip reveals ---------- */
  $$('[data-clip-reveal]').forEach(function (img) {
    gsap.fromTo(img, { clipPath: 'inset(12% 8% 12% 8% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, ease: 'power3.out',
      scrollTrigger: { trigger: img, start: 'top 85%', once: true }
    });
  });

  window.addEventListener('load', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();
