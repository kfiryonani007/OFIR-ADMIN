/* ============================================================
   Scroll-driven image-sequence hero (canvas frame scrubber).
   Converts a video/GIF (pre-exported to numbered JPG frames) into
   a scroll-scrubbed animation: the frame index tracks the user's
   scroll position through a tall sticky section — down advances,
   up rewinds. Text overlays fade in/out per scroll stage.

   Performance: one <canvas> + preloaded Image[]; a single drawImage
   per animation frame; scroll only schedules a requestAnimationFrame
   (no heavy work in the scroll handler); an IntersectionObserver
   skips all work while the section is off-screen.

   Markup:
     <section class="scroll-seq" data-path="assets/pool-seq/f"
              data-frames="40" data-pad="3" data-ext=".jpg">
       <div class="scroll-seq__sticky">
         <canvas class="scroll-seq__canvas"></canvas>
         <div class="scroll-seq__captions">
           <div class="scroll-seq__cap" data-from="0" data-to="0.18">…</div> …
         </div>
         <div class="scroll-seq__progress"><span></span>…</div>
       </div>
     </section>
   ============================================================ */
(function () {
  'use strict';

  function init(section) {
    var canvas = section.querySelector('.scroll-seq__canvas');
    var sticky = section.querySelector('.scroll-seq__sticky');
    if (!canvas || !sticky) return;
    var ctx = canvas.getContext('2d');

    var path = section.getAttribute('data-path') || '';
    var total = parseInt(section.getAttribute('data-frames'), 10) || 0;
    var pad = parseInt(section.getAttribute('data-pad'), 10) || 3;
    var ext = section.getAttribute('data-ext') || '.jpg';
    if (!total) return;

    var caps = Array.prototype.slice.call(section.querySelectorAll('.scroll-seq__cap'));
    var dots = Array.prototype.slice.call(section.querySelectorAll('.scroll-seq__progress span'));
    var hint = section.querySelector('.scroll-seq__hint');

    /* ---- preload frames ---- */
    var images = new Array(total);
    var loaded = new Array(total);
    var firstLoaded = -1;
    function frameUrl(i) { return path + String(i + 1).padStart(pad, '0') + ext; }
    for (var i = 0; i < total; i++) {
      (function (idx) {
        var img = new Image();
        img.decoding = 'async';
        img.onload = function () {
          loaded[idx] = true;
          if (firstLoaded === -1) { firstLoaded = idx; scheduleDraw(); }
        };
        img.src = frameUrl(idx);
        images[idx] = img;
      })(i);
    }
    // nearest already-loaded frame, so scrubbing never shows a blank
    function resolveFrame(idx) {
      if (loaded[idx]) return images[idx];
      for (var d = 1; d < total; d++) {
        if (idx - d >= 0 && loaded[idx - d]) return images[idx - d];
        if (idx + d < total && loaded[idx + d]) return images[idx + d];
      }
      return null;
    }

    /* ---- canvas sizing (cover) ---- */
    var W = 0, H = 0, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = sticky.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function drawCover(img) {
      if (!img) return;
      var iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw || !ih) return;
      var scale = Math.max(W / iw, H / ih);
      var dw = iw * scale, dh = ih * scale;
      var dx = (W - dw) / 2, dy = (H - dh) / 2;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    /* ---- scroll → frame + captions ---- */
    var lastIdx = -1;
    function progress() {
      var rect = section.getBoundingClientRect();
      var scrollable = rect.height - window.innerHeight;
      var p = scrollable > 0 ? (-rect.top) / scrollable : 0;
      return Math.max(0, Math.min(1, p));
    }
    function render() {
      pending = false;
      var p = progress();
      var idx = Math.min(total - 1, Math.max(0, Math.round(p * (total - 1))));
      if (idx !== lastIdx) { drawCover(resolveFrame(idx)); lastIdx = idx; }
      // captions: show the one whose [from,to) range holds p
      var activeCap = -1;
      caps.forEach(function (c, ci) {
        var from = parseFloat(c.getAttribute('data-from')) || 0;
        var to = c.hasAttribute('data-to') ? parseFloat(c.getAttribute('data-to')) : 1.01;
        var on = p >= from && p < to;
        c.classList.toggle('is-active', on);
        if (on) activeCap = ci;
      });
      dots.forEach(function (d, di) { d.classList.toggle('is-active', di === activeCap); });
      if (hint) hint.style.opacity = p < 0.04 ? '' : '0';
    }

    var pending = false, inView = true;
    function scheduleDraw() {
      if (pending || !inView) return;
      pending = true;
      requestAnimationFrame(render);
    }
    function onScroll() { scheduleDraw(); }

    /* ---- wire up (light scroll handler + IO gate) ---- */
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { resize(); lastIdx = -1; scheduleDraw(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) scheduleDraw();
      }, { threshold: 0 }).observe(section);
    }
    // ResizeObserver keeps the canvas backing store correct even if layout
    // wasn't ready at init (0-size), which also self-heals on orientation change.
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { resize(); lastIdx = -1; scheduleDraw(); }).observe(sticky);
    }
    resize();
    scheduleDraw();
  }

  function boot() {
    document.querySelectorAll('.scroll-seq').forEach(init);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
