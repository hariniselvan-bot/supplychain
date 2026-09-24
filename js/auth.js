/* STACKLY — auth.js
   Login / register: role pills, password strength, visibility toggle */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Role selector */
  $$('.sl-role-select').forEach(function (group) {
    var pills = $$('.sl-role-pill', group);
    var hidden = $('input[type="hidden"]', group);
    pills.forEach(function (p) {
      p.setAttribute('role', 'radio');
      p.setAttribute('aria-checked', 'false');
      p.addEventListener('click', function () {
        pills.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-checked', 'false'); });
        p.classList.add('is-active');
        p.setAttribute('aria-checked', 'true');
        if (hidden) hidden.value = p.getAttribute('data-role') || p.textContent.trim();
      });
    });
    if (pills.length && !pills.some(function (p) { return p.classList.contains('is-active'); })) pills[0].click();
  });

  /* Password visibility */
  $$('[data-pw-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.getAttribute('data-pw-toggle'));
      if (!input) return;
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = show
        ? '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.5 0 2.9-.3 4.1-.9M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
        : '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  /* Password strength meter */
  var pw = $('#password');
  var meter = $('.sl-pw-meter i');
  var label = $('.sl-pw-label');
  if (pw && meter) {
    pw.addEventListener('input', function () {
      var v = pw.value;
      var score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      var levels = [
        { w: '12%', c: '#e05252', t: 'Weak password' },
        { w: '32%', c: '#e08a3c', t: 'Fair password' },
        { w: '58%', c: '#c8b03a', t: 'Good password' },
        { w: '82%', c: '#7fb54a', t: 'Strong password' },
        { w: '100%', c: '#16a34a', t: 'Excellent password' }
      ];
      var L = levels[Math.min(score, 4)];
      meter.style.width = v ? L.w : '0';
      meter.style.background = L.c;
      if (label) label.textContent = v ? L.t : '';
      if (label) label.style.color = L.c;
    });
  }

  /* Demo social buttons */
  $$('[data-demo-social]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      window.slToast('Demo build — SSO is disabled in this preview.');
    });
  });
})();
