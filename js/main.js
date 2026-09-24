/* STACKLY — main.js
   Preloader, counters, FAQ, pricing toggle, slider, filters, forms, cursor, misc */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Preloader ---------- */
  var pre = $('.sl-preloader');
  if (pre) {
    document.body.style.overflow = 'hidden';
    var pct = $('.sl-preloader-pct', pre);
    var bar = $('.sl-preloader-bar i', pre);
    var letters = $$('.sl-preloader-word span', pre);
    var done = function () {
      document.body.style.overflow = '';
      if (window.gsap) {
        gsap.timeline()
          .to(pre, { yPercent: -100, duration: .8, ease: 'power4.inOut', delay: .15 })
          .set(pre, { display: 'none' })
          .add(function () { document.dispatchEvent(new Event('sl:ready')); }, '-=.5');
      } else { pre.style.display = 'none'; document.dispatchEvent(new Event('sl:ready')); }
    };
    if (window.gsap) {
      gsap.to(letters, { y: 0, duration: .7, stagger: .05, ease: 'power3.out' });
      var obj = { v: 0 };
      gsap.to(obj, {
        v: 100, duration: 1.4, ease: 'power2.inOut',
        onUpdate: function () {
          var v = Math.round(obj.v);
          if (pct) pct.textContent = v + '%';
          if (bar) bar.style.width = v + '%';
        },
        onComplete: done
      });
    } else { done(); }
  } else {
    document.dispatchEvent(new Event('sl:ready'));
  }

  /* ---------- Toast ---------- */
  window.slToast = function (msg) {
    var t = $('.sl-toast');
    if (!t) { t = document.createElement('div'); t.className = 'sl-toast'; document.body.appendChild(t); }
    t.innerHTML = '<svg width="18" height="18" fill="none" stroke="#E9C27A" stroke-width="2.2" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>' + msg;
    t.classList.add('is-visible');
    clearTimeout(t.__h);
    t.__h = setTimeout(function () { t.classList.remove('is-visible'); }, 2800);
  };

  /* ---------- Animated counters ---------- */
  var counters = $$('[data-count]');
  if (counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var dec = el.getAttribute('data-count-dec') ? 1 : 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var start = null;
        var dur = 1800;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var v = target * eased;
          el.textContent = (dec ? v.toFixed(1) : Math.round(v).toLocaleString('en-US')) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: .4 });
    counters.forEach(function (c) { io.observe(c); });
  }

  /* ---------- FAQ accordion ---------- */
  $$('.sl-faq-item').forEach(function (item) {
    var q = $('.sl-faq-q', item);
    var a = $('.sl-faq-a', item);
    if (!q || !a) return;
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      var group = item.closest('.sl-faq-list, [data-faq-group]');
      if (group && group.hasAttribute('data-single')) {
        $$('.sl-faq-item.is-open', group).forEach(function (o) {
          if (o !== item) { o.classList.remove('is-open'); $('.sl-faq-a', o).style.maxHeight = null; $('.sl-faq-q', o).setAttribute('aria-expanded', 'false'); }
        });
      }
      item.classList.toggle('is-open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });

  /* ---------- Pricing toggle ---------- */
  $$('[data-pricing-toggle]').forEach(function (wrap) {
    var sw = $('.sl-switch', wrap);
    if (!sw) return;
    var mLabel = $('[data-cycle="monthly"]', wrap);
    var yLabel = $('[data-cycle="annual"]', wrap);
    sw.setAttribute('role', 'switch');
    sw.addEventListener('click', function () {
      var annual = !sw.classList.contains('is-annual');
      sw.classList.toggle('is-annual', annual);
      sw.setAttribute('aria-checked', String(annual));
      if (mLabel) mLabel.classList.toggle('is-on', !annual);
      if (yLabel) yLabel.classList.toggle('is-on', annual);
      $$('[data-monthly]').forEach(function (el) {
        var v = annual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
        if (window.gsap) {
          gsap.fromTo(el, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'power2.out' });
        }
        el.textContent = v;
      });
    });
  });

  /* ---------- Testimonial slider ---------- */
  $$('[data-slider]').forEach(function (slider) {
    var track = $('.sl-testi-track', slider);
    var slides = $$('.sl-testi-slide', slider);
    var prev = $('[data-slide="prev"]', slider.parentElement || document);
    var next = $('[data-slide="next"]', slider.parentElement || document);
    var dotsWrap = $('.sl-testi-dots', slider.parentElement || document);
    if (!track || !slides.length) return;
    var i = 0;
    var dots = slides.map(function (_, n) {
      var d = document.createElement('i');
      d.setAttribute('role', 'button');
      d.setAttribute('aria-label', 'Go to testimonial ' + (n + 1));
      d.addEventListener('click', function () { go(n); });
      if (dotsWrap) dotsWrap.appendChild(d);
      return d;
    });
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (i * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
    }
    if (prev) prev.addEventListener('click', function () { go(i - 1); });
    if (next) next.addEventListener('click', function () { go(i + 1); });
    go(0);
    var auto = setInterval(function () { go(i + 1); }, 6000);
    slider.addEventListener('pointerenter', function () { clearInterval(auto); });
    var touchX = null;
    track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
      touchX = null;
    }, { passive: true });
  });

  /* ---------- Blog filter ---------- */
  var filterWrap = $('[data-blog-filter]');
  if (filterWrap) {
    var cards = $$('[data-category]');
    $$('.sl-cat-btn', filterWrap).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('.sl-cat-btn', filterWrap).forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var cat = btn.getAttribute('data-filter');
        cards.forEach(function (c) {
          var show = cat === 'all' || c.getAttribute('data-category') === cat;
          c.classList.toggle('is-hidden', !show);
          if (show && window.gsap) gsap.fromTo(c, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' });
        });
      });
    });
  }

  /* ---------- Form validation ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(field, msg) {
    if (!field) return;
    field.classList.add('has-error');
    var e = $('.sl-field-error', field);
    if (e) e.textContent = msg;
  }
  function clearError(field) { if (field) field.classList.remove('has-error'); }
  $$('form[data-validate]').forEach(function (form) {
    form.setAttribute('novalidate', 'novalidate');
    $$('input, select, textarea', form).forEach(function (input) {
      input.addEventListener('input', function () { clearError(input.closest('.sl-field')); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[data-required]', form).forEach(function (input) {
        var field = input.closest('.sl-field');
        var v = input.type === 'checkbox' ? (input.checked ? 'yes' : '') : input.value.trim();
        if (!v) { setError(field, 'This field is required.'); ok = false; return; }
        if (input.type === 'email' && !emailRe.test(v)) { setError(field, 'Please enter a valid email address.'); ok = false; }
        if (input.type === 'password' && input.hasAttribute('data-min') && v.length < parseInt(input.getAttribute('data-min'), 10)) {
          setError(field, 'Password must be at least ' + input.getAttribute('data-min') + ' characters.'); ok = false;
        }
        if (input.hasAttribute('data-match')) {
          var other = $(input.getAttribute('data-match'), form);
          if (other && v !== other.value) { setError(field, 'Passwords do not match.'); ok = false; }
        }
      });
      if (!ok) return;
      var success = $('.sl-form-success', form.parentElement || document);
      var redirect = form.getAttribute('data-redirect');
      if (form.getAttribute('data-demo-login') === 'true') {
        window.slToast('Welcome back. Redirecting to your dashboard…');
        setTimeout(function () { window.location.href = 'dashboard.html'; }, 900);
        return;
      }
      if (form.getAttribute('data-demo-register') === 'true') {
        window.slToast('Account created. Redirecting…');
        setTimeout(function () { window.location.href = 'login.html'; }, 900);
        return;
      }
      if (success) {
        success.classList.add('is-visible');
        form.reset();
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        window.slToast('Message sent. Our team will respond within 24 hours.');
      } else {
        window.slToast('Done.');
        form.reset();
      }
      if (redirect) setTimeout(function () { window.location.href = redirect; }, 800);
    });
  });

  /* ---------- Showreel modal ---------- */
  var modal = $('.sl-modal');
  if (modal) {
    var openBtns = $$('[data-open-modal]');
    var closeBtn = $('.sl-modal-close', modal);
    var set = function (v) {
      modal.classList.toggle('is-open', v);
      modal.setAttribute('aria-hidden', String(!v));
      document.body.style.overflow = v ? 'hidden' : '';
    };
    openBtns.forEach(function (b) { b.addEventListener('click', function () { set(true); }); });
    if (closeBtn) closeBtn.addEventListener('click', function () { set(false); });
    modal.addEventListener('click', function (e) { if (e.target === $('.sl-modal-backdrop', modal)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* ---------- Custom cursor ---------- */
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var dot = document.createElement('div'); dot.className = 'sl-cursor-dot';
    var ring = document.createElement('div'); ring.className = 'sl-cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      dot.style.transform = 'translate(' + (mx - 3.5) + 'px,' + (my - 3.5) + 'px)';
      ring.style.transform = 'translate(' + (rx - 19) + 'px,' + (ry - 19) + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      ring.classList.toggle('is-hover', !!e.target.closest('a,button,.sl-cat-btn'));
    });
  }

  /* ---------- Spotlight + tilt ---------- */
  $$('.sl-spotlight').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  $$('.sl-tilt').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - .5;
      var py = (e.clientY - r.top) / r.height - .5;
      card.style.transform = 'perspective(800px) rotateY(' + (px * 6) + 'deg) rotateX(' + (-py * 6) + 'deg) translateY(-4px)';
    });
    card.addEventListener('pointerleave', function () { card.style.transform = ''; });
  });

  /* ---------- Magnetic buttons ---------- */
  $$('.sl-magnetic').forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .18 + 'px,' + (e.clientY - r.top - r.height / 2) * .28 + 'px)';
    });
    btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
  });

  /* ---------- Back to top ---------- */
  var topBtn = document.createElement('button');
  topBtn.className = 'sl-icon-btn';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  topBtn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:800;opacity:0;visibility:hidden;transition:.4s;box-shadow:0 10px 30px rgba(17,17,17,.18)';
  document.body.appendChild(topBtn);
  window.addEventListener('scroll', function () {
    var show = window.scrollY > 600;
    topBtn.style.opacity = show ? '1' : '0';
    topBtn.style.visibility = show ? 'visible' : 'hidden';
  }, { passive: true });
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
