/* STACKLY — dashboard.js
   Sidebar, animated charts (canvas), KPI counters, tables */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Sidebar */
  var sidebar = $('.sl-sidebar');
  var overlay = $('.sl-side-overlay');
  var toggle = $('.sl-side-toggle');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('is-open');
      if (overlay) overlay.classList.toggle('is-open');
    });
    if (overlay) overlay.addEventListener('click', function () {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-open');
    });
  }
  var path = location.pathname.split('/').pop();
  $$('.sl-side-link').forEach(function (a) {
    if (a.getAttribute('href') === path) a.classList.add('is-active');
  });

  /* Notification demo */
  var bell = $('[data-bell]');
  if (bell) bell.addEventListener('click', function () {
    var badge = $('.sl-badge', bell);
    if (badge) badge.remove();
    window.slToast('You are all caught up. No new notifications.');
  });

  /* ---- Canvas charts ---- */
  function setupCanvas(cv) {
    var dpr = window.devicePixelRatio || 1;
    var r = cv.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: r.width, h: r.height };
  }

  /* Line chart */
  var line = $('[data-line-chart]');
  if (line) {
    var data = JSON.parse(line.getAttribute('data-line-chart') || '[12,19,14,25,22,31,28,38,35,44,41,52]');
    var d2 = JSON.parse(line.getAttribute('data-line-chart-2') || '[8,12,10,16,18,22,20,26,25,31,30,36]');
    var s = setupCanvas(line);
    var ctx = s.ctx, W = s.w, H = s.h;
    var max = Math.max.apply(null, data.concat(d2)) * 1.15;
    var pad = 8;
    var px = function (i) { return pad + i * (W - pad * 2) / (data.length - 1); };
    var py = function (v) { return H - pad - (v / max) * (H - pad * 2); };
    var progress = { v: 0 };
    var draw = function () {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(17,17,17,.06)';
      ctx.lineWidth = 1;
      for (var g = 1; g < 4; g++) {
        ctx.beginPath(); ctx.moveTo(0, H * g / 4); ctx.lineTo(W, H * g / 4); ctx.stroke();
      }
      var upto = Math.max(2, Math.floor(data.length * progress.v));
      function series(arr, color, fill) {
        ctx.beginPath();
        for (var i = 0; i < upto; i++) {
          var x = px(i), y = py(arr[i]);
          if (i === 0) ctx.moveTo(x, y);
          else {
            var xp = px(i - 1), yp = py(arr[i - 1]);
            var cx = (xp + x) / 2;
            ctx.bezierCurveTo(cx, yp, cx, y, x, y);
          }
        }
        if (fill) {
          var grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'rgba(200,137,47,.22)');
          grad.addColorStop(1, 'rgba(200,137,47,0)');
          ctx.save();
          ctx.lineTo(px(upto - 1), H); ctx.lineTo(px(0), H); ctx.closePath();
          ctx.fillStyle = grad; ctx.fill(); ctx.restore();
          ctx.beginPath();
          for (var j = 0; j < upto; j++) {
            var x2 = px(j), y2 = py(arr[j]);
            if (j === 0) ctx.moveTo(x2, y2);
            else { var xp2 = px(j - 1), yp2 = py(arr[j - 1]); var cx2 = (xp2 + x2) / 2; ctx.bezierCurveTo(cx2, yp2, cx2, y2, x2, y2); }
          }
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
      }
      series(d2, 'rgba(17,17,17,.25)', false);
      series(data, '#C8892F', true);
      var lx = px(upto - 1), ly = py(data[upto - 1]);
      ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fillStyle = '#C8892F'; ctx.fill();
      ctx.beginPath(); ctx.arc(lx, ly, 9, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(200,137,47,.4)'; ctx.stroke();
    };
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var t0 = null;
        var anim = function (ts) {
          if (!t0) t0 = ts;
          progress.v = Math.min((ts - t0) / 1400, 1);
          draw();
          if (progress.v < 1) requestAnimationFrame(anim);
        };
        requestAnimationFrame(anim);
      });
    }, { threshold: .3 });
    io.observe(line);
    window.addEventListener('resize', function () { var ns = setupCanvas(line); ctx = ns.ctx; W = ns.w; H = ns.h; draw(); });
  }

  /* Bar chart */
  var bar = $('[data-bar-chart]');
  if (bar) {
    var vals = JSON.parse(bar.getAttribute('data-bar-chart') || '[42,58,50,66,61,74,70]');
    var s2 = setupCanvas(bar);
    var bctx = s2.ctx, bW = s2.w, bH = s2.h;
    var bmax = Math.max.apply(null, vals) * 1.15;
    var bp = { v: 0 };
    var bdraw = function () {
      bctx.clearRect(0, 0, bW, bH);
      var n = vals.length;
      var gap = bW * .04;
      var bw = (bW - gap * (n - 1)) / n;
      for (var i = 0; i < n; i++) {
        var h = (vals[i] / bmax) * (bH - 20) * Math.min(bp.v * n - i, 1);
        h = Math.max(h, 0);
        var x = i * (bw + gap);
        var y = bH - h;
        var grad = bctx.createLinearGradient(0, y, 0, bH);
        grad.addColorStop(0, '#E9C27A'); grad.addColorStop(1, '#C8892F');
        bctx.fillStyle = i === n - 1 ? grad : 'rgba(200,137,47,.35)';
        bctx.beginPath();
        var rr = Math.min(8, bw / 2, h);
        bctx.moveTo(x, bH);
        bctx.lineTo(x, y + rr);
        bctx.arcTo(x, y, x + rr, y, rr);
        bctx.lineTo(x + bw - rr, y);
        bctx.arcTo(x + bw, y, x + bw, y + rr, rr);
        bctx.lineTo(x + bw, bH);
        bctx.closePath(); bctx.fill();
      }
    };
    var io2 = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        io2.unobserve(en.target);
        var t0 = null;
        var anim = function (ts) {
          if (!t0) t0 = ts;
          bp.v = Math.min((ts - t0) / 1200, 1);
          bdraw();
          if (bp.v < 1) requestAnimationFrame(anim);
        };
        requestAnimationFrame(anim);
      });
    }, { threshold: .3 });
    io2.observe(bar);
    window.addEventListener('resize', function () { var ns = setupCanvas(bar); bctx = ns.ctx; bW = ns.w; bH = ns.h; bdraw(); });
  }

  /* KPI counters */
  $$('[data-dash-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-dash-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var io3 = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        io3.unobserve(el);
        var t0 = null;
        var anim = function (ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1500, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased).toLocaleString('en-US') + suffix;
          if (p < 1) requestAnimationFrame(anim);
        };
        requestAnimationFrame(anim);
      });
    }, { threshold: .4 });
    io3.observe(el);
  });

  /* Row action demos */
  $$('[data-row-action]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.slToast(btn.getAttribute('data-row-action'));
    });
  });
})();
