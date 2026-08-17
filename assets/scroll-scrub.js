/* ============================================================
   Scroll-scrub image sequence — the "Apple product page" effect:
   a stack of images pinned in place, swapped frame-by-frame as
   the user scrolls through a tall wrapper section. No video —
   just N photos taken from the SAME camera angle at different
   stages, so scrolling feels like watching progress happen.

   Markup contract:
     <div class="scroll-scrub" style="--frames:4">
       <div class="scroll-scrub__sticky">
         <img class="scroll-scrub__frame" src="stage-1.jpg" data-frame="0">
         <img class="scroll-scrub__frame" src="stage-2.jpg" data-frame="1">
         ...
         <div class="scroll-scrub__caption">optional overlay text</div>
       </div>
     </div>
   The wrapper's height (set in CSS, e.g. 400vh) controls how much
   scrolling it takes to play through all frames — taller = slower.
   ============================================================ */
(function () {
  'use strict';
  var reduce = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    (function () { try { return localStorage.getItem('dba_a11y_motion') === '1'; } catch (e) { return false; } })();

  function init(wrap) {
    var frames = Array.prototype.slice.call(wrap.querySelectorAll('.scroll-scrub__frame'));
    if (!frames.length) return;
    var caps = Array.prototype.slice.call(wrap.querySelectorAll('.scroll-scrub__cap'));
    var dotsWrap = wrap.querySelector('.scroll-scrub__progress');
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
    var hint = wrap.querySelector('.scroll-scrub__hint');

    function setActive(idx) {
      frames.forEach(function (f, i) { f.classList.toggle('is-active', i === idx); });
      caps.forEach(function (c, i) { c.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
      if (hint) hint.style.opacity = idx === 0 ? '' : '0';
    }

    if (reduce) {
      // no scroll-linked motion — just show the final frame
      setActive(frames.length - 1);
      return;
    }

    var ticking = false;
    function update() {
      ticking = false;
      var rect = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var scrollable = rect.height - vh;
      var progress = scrollable > 0 ? (-rect.top) / scrollable : 0;
      progress = Math.max(0, Math.min(1, progress));
      var idx = Math.min(frames.length - 1, Math.floor(progress * frames.length));
      setActive(idx);
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  function boot() {
    document.querySelectorAll('.scroll-scrub').forEach(init);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
