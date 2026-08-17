/* ============================================================
   David Balaish Architecture — immersive motion layer
   Vanilla JS, no libraries. Canvas 3D mesh + parallax +
   scroll progress + 3D tilt + counters. Reduced-motion aware.
   ============================================================ */
(function () {
  'use strict';
  var reduce = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    (function () { try { return localStorage.getItem('dba_a11y_motion') === '1'; } catch (e) { return false; } })();

  /* ---------- scroll progress bar ---------- */
  (function () {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    var update = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  })();

  /* ---------- parallax on scroll ---------- */
  (function () {
    if (reduce) return;
    var items = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length) return;
    var ticking = false;
    // Offset is based on each element's distance from the viewport center
    // (self-correcting: it shrinks back toward 0 as the element approaches
    // mid-screen, regardless of how far down the page it sits) — but capped
    // to a small max so it's always a subtle depth cue, never large enough
    // to drag content out of its own section. Two real bugs came from the
    // uncapped versions: a pure scroll-delta version grew without bound for
    // anything far down a long page (269px drift, text landed in the wrong
    // section), and an earlier version had no cap either and could offset
    // content that wasn't naturally centered in the viewport (the hero,
    // bottom-aligned) by 53px even before any scrolling happened.
    var CAP = 40;
    var run = function () {
      var vh = window.innerHeight;
      // read every element's layout first, then write — interleaving
      // getBoundingClientRect() with style writes per-element forces the
      // browser to flush and recompute layout between each one
      var offsets = items.map(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var rect = el.getBoundingClientRect();
        var raw = -((rect.top + rect.height / 2) - vh / 2) * speed;
        return Math.max(-CAP, Math.min(CAP, raw));
      });
      items.forEach(function (el, i) { el.style.transform = 'translate3d(0,' + offsets[i].toFixed(1) + 'px,0)'; });
      ticking = false;
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', run);
    run();
  })();

  /* ---------- animated number counters ---------- */
  (function () {
    var els = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduce) { el.textContent = target + suffix; return; }
        var t0 = performance.now(), dur = 1400;
        var step = function (t) {
          var k = Math.min(1, (t - t0) / dur);
          var eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 3D tilt on cards ---------- */
  (function () {
    if (reduce || !window.matchMedia('(hover:hover)').matches) return;
    [].slice.call(document.querySelectorAll('[data-tilt]')).forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      el.classList.add('tilt');
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg) translateZ(6px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  })();

  /* ---------- hero cinematic scroll exit (camera push-through) ---------- */
  var heroScrollFrac = 0; // 0 = top of hero, 1 = scrolled past it — read by the mesh below
  (function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var video = hero.querySelector('.hero-video');
    var logo = hero.querySelector('.hero-frame.is-logo');
    var ticking = false;
    var run = function () {
      var h = hero.offsetHeight || window.innerHeight;
      heroScrollFrac = Math.max(0, Math.min(1, window.scrollY / (h * 0.92)));
      if (!reduce) {
        var scale = 1 + heroScrollFrac * 0.16;
        var fade = 1 - heroScrollFrac * 0.85;
        if (video) video.style.transform = 'scale(' + scale.toFixed(3) + ')';
        if (video) video.style.opacity = (0.42 * fade).toFixed(3);
        if (logo) logo.style.transform = 'scale(' + (1 + heroScrollFrac * 0.1).toFixed(3) + ')';
        if (logo) logo.style.opacity = Math.max(0, 1 - heroScrollFrac * 1.3).toFixed(3);
      }
      ticking = false;
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', run);
    run();
  })();

  /* ---------- generic scroll-scrubbed cinematic reveal (3D emergence) ---------- */
  (function () {
    var groups = [].slice.call(document.querySelectorAll('[data-cine]'));
    if (!groups.length) return;

    var registry = []; // {el, startOffset}
    groups.forEach(function (g) {
      var mode = g.getAttribute('data-cine');
      if (mode === 'group') {
        var kids = [].slice.call(g.children);
        kids.forEach(function (k, i) { registry.push({ el: k, startOffset: i * 46 }); });
      } else {
        registry.push({ el: g, startOffset: 0 });
      }
    });

    if (reduce) {
      registry.forEach(function (item) { item.el.style.opacity = 1; });
      return;
    }

    registry.forEach(function (item) {
      item.el.style.transition = 'none';
      item.el.style.willChange = 'transform, opacity';
    });

    var ticking = false;
    var vh;
    function run() {
      vh = window.innerHeight;
      var enterAt = vh * 0.9, settleAt = vh * 0.42;
      var span = enterAt - settleAt;
      // batch every getBoundingClientRect() read before any style write —
      // reading layout right after writing it on the previous item forces
      // the browser to flush and recompute synchronously, every frame
      var updates = [];
      registry.forEach(function (item) {
        var rect = item.el.getBoundingClientRect();
        if (rect.top > vh + 50 || rect.bottom < -50) return; // offscreen: skip work
        var top = rect.top - item.startOffset;
        var p = (enterAt - top) / span;
        p = Math.max(0, Math.min(1, p));
        var ease = 1 - Math.pow(1 - p, 3); // cubic-out feel, computed per-frame from scroll pos
        updates.push({ el: item.el, ease: ease });
      });
      updates.forEach(function (u) {
        u.el.style.opacity = u.ease;
        u.el.style.transform =
          'perspective(1300px) ' +
          'translateY(' + ((1 - u.ease) * 64).toFixed(1) + 'px) ' +
          'translateZ(' + ((1 - u.ease) * -160).toFixed(1) + 'px) ' +
          'rotateX(' + ((1 - u.ease) * 14).toFixed(2) + 'deg) ' +
          'scale(' + (0.93 + u.ease * 0.07).toFixed(3) + ')';
      });
      ticking = false;
    }
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    run();
  })();

  /* ---------- hero 3D wireframe mesh (Canvas) ---------- */
  (function () {
    var canvas = document.querySelector('.hero-canvas');
    if (!canvas || reduce) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var W, H, dpr;
    // grid of points on a plane; y animated by layered sines -> topographic mesh
    var COLS = 34, ROWS = 18, SP = 34;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      SP = Math.max(26, W / 24); // scale grid spacing to viewport so the mesh always spans the full hero, not just a fixed-size patch
    }
    resize();
    window.addEventListener('resize', resize);

    var mx = 0, my = 0, tmx = 0, tmy = 0;
    window.addEventListener('mousemove', function (e) {
      tmx = (e.clientX / window.innerWidth - 0.5);
      tmy = (e.clientY / window.innerHeight - 0.5);
    });

    function project(x, y, z, cx, cy, zoom) {
      var f = 320 * zoom, zz = z + 520;
      var s = f / zz;
      return { x: cx + x * s, y: cy + y * s, s: s };
    }

    var t = 0, running = true, inView = true;
    function frame() {
      if (!running) return;
      if (!inView) { requestAnimationFrame(frame); return; } // paused off-screen, keeps the tick alive to resume instantly
      t += 0.012;
      mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
      ctx.clearRect(0, 0, W, H);

      var cx = W * 0.5, cy = H * 0.52;
      var scrollPush = heroScrollFrac; // 0..1 — camera dollies forward as user scrolls
      var rot = 1.02 + mx * 0.25 + scrollPush * 0.9;   // yaw: mouse + scroll-driven spin
      var tilt = -0.62 + my * 0.18 - scrollPush * 0.35; // pitch dips as camera pushes in
      var zoom = 1 + scrollPush * 0.55;                 // dolly forward
      var fade = Math.max(0, 1 - scrollPush * 1.15);

      var pts = [];
      for (var r = 0; r < ROWS; r++) {
        pts[r] = [];
        for (var c = 0; c < COLS; c++) {
          var gx = (c - COLS / 2) * SP;
          var gz = (r - ROWS / 2) * SP;
          // height field
          var gy = Math.sin(gx * 0.010 + t) * 22 +
                   Math.cos(gz * 0.013 - t * 0.8) * 20 +
                   Math.sin((gx + gz) * 0.006 + t * 0.5) * 14;
          // rotate around Y then tilt around X
          var rx = gx * Math.cos(rot) - gz * Math.sin(rot);
          var rz = gx * Math.sin(rot) + gz * Math.cos(rot);
          var ry = gy * Math.cos(tilt) - rz * Math.sin(tilt);
          var rz2 = gy * Math.sin(tilt) + rz * Math.cos(tilt);
          pts[r][c] = project(rx, ry, rz2, cx, cy, zoom);
        }
      }

      // draw wireframe
      for (var r2 = 0; r2 < ROWS; r2++) {
        for (var c2 = 0; c2 < COLS; c2++) {
          var p = pts[r2][c2];
          var a = Math.max(0, Math.min(0.5, (p.s - 0.35) * 0.9)) * fade;
          if (c2 < COLS - 1) {
            var pr = pts[r2][c2 + 1];
            ctx.strokeStyle = 'rgba(201,168,118,' + a + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pr.x, pr.y); ctx.stroke();
          }
          if (r2 < ROWS - 1) {
            var pd = pts[r2 + 1][c2];
            ctx.strokeStyle = 'rgba(162,121,63,' + (a * 0.75) + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pd.x, pd.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    // pause computation when hero scrolls fully out of view or tab hidden (perf)
    var hero = canvas.closest('.hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
    requestAnimationFrame(frame);
  })();

})();
