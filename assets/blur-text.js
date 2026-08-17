/* ============================================================
   BlurText — vanilla-JS port of the React Bits component
   (originally built on `motion/react`).
   Splits an element's content into words (or letters) and reveals
   each with a staggered blur/opacity/translateY animation once it
   scrolls into view, matching the original 3-keyframe timing:
     0%   -> blur(10px) opacity:0  y:from
     50%  -> blur(5px)  opacity:.5 y:mid
     100% -> blur(0)    opacity:1  y:0
   Existing inline elements inside the target (e.g. a colored
   <span>) are preserved as single word units instead of being
   torn apart, so per-word styling (like the bronze accent) survives.
   Mounts on any element with [data-blur-text].
   ============================================================ */
(function () {
  'use strict';

  function num(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  // Break the element's current children into "word" units. A run of
  // plain text is split on spaces; an existing child element (e.g. the
  // bronze-colored <span>) is kept whole as one unit so its styling and
  // class list survive the rebuild.
  function collectWordUnits(el) {
    var units = [];
    var buffer = '';

    function flush() {
      if (buffer.length) {
        buffer.split(' ').forEach(function (w) {
          if (w.length) units.push({ text: w });
        });
        buffer = '';
      }
    }

    el.childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        buffer += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        flush();
        // a <br> carries no text to animate — keep it as a real line break
        // instead of collapsing into an empty animated segment
        if (node.tagName === 'BR') { units.push({ isBreak: true }); }
        else { units.push({ text: node.textContent, className: node.className, tag: node.tagName.toLowerCase() }); }
      }
    });
    flush();
    return units;
  }

  function collectLetterUnits(el) {
    var text = el.textContent;
    var units = [];
    for (var i = 0; i < text.length; i++) {
      units.push({ text: text[i] === ' ' ? ' ' : text[i] });
    }
    return units;
  }

  function init(el) {
    var reduce = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
      (function () { try { return localStorage.getItem('dba_a11y_motion') === '1'; } catch (e) { return false; } })();

    var d = el.dataset;
    var animateBy = d.animateBy || 'words';
    var direction = d.direction || 'top';
    var delay = num(d.delay, 200);
    var stepDuration = num(d.stepDuration, 0.35);
    var threshold = num(d.threshold, 0.1);
    var rootMargin = d.rootMargin || '0px';

    var units = animateBy === 'letters' ? collectLetterUnits(el) : collectWordUnits(el);
    if (!units.length) return;

    el.innerHTML = '';
    el.classList.add('blur-text-wrap');

    var fromY = direction === 'top' ? -50 : 50;
    var midY = direction === 'top' ? 5 : -5;
    var totalDuration = stepDuration * 2; // 3 keyframe stops -> 2 intervals

    if (reduce) {
      // Skip the animation machinery entirely; just render the final text.
      units.forEach(function (u, i) {
        el.appendChild(u.isBreak ? document.createElement('br') : buildSegment(u, i, animateBy));
      });
      return;
    }

    units.forEach(function (u, i) {
      if (u.isBreak) { el.appendChild(document.createElement('br')); return; }
      var span = buildSegment(u, i, animateBy);
      span.classList.add('blur-text-segment');
      span.style.setProperty('--from-y', fromY + 'px');
      span.style.setProperty('--mid-y', midY + 'px');
      span.style.setProperty('--dur', totalDuration + 's');
      span.style.setProperty('--delay', ((i * delay) / 1000) + 's');
      el.appendChild(span);
    });

    var reveal = function () {
      el.classList.add('in-view');
      io.unobserve(el);
      clearTimeout(safety);
    };
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) reveal();
    }, { threshold: threshold, rootMargin: rootMargin });
    io.observe(el);
    // Safety net: this text must never stay permanently invisible just
    // because a scroll-into-view was missed (fast fling-scroll, a tab
    // restored mid-scroll, etc.) — force it in after a generous timeout.
    var safety = setTimeout(reveal, 4000);
  }

  function buildSegment(unit, index, animateBy) {
    var span = document.createElement('span');
    span.style.display = 'inline-block';
    if (unit.className) span.className = unit.className;
    span.textContent = unit.text;
    if (animateBy === 'words') span.style.whiteSpace = 'pre';
    return span;
  }

  function boot() {
    var nodes = document.querySelectorAll('[data-blur-text]');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
