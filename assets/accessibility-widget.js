/* ============================================================
   Accessibility toolbar — floating button + panel, present on
   every page. Persists choices in localStorage so they carry
   across navigation (matches the language-toggle pattern).

   Settings and what they actually do:
     fs        text size, 0-3 steps -> zoom on <html>
     contrast  inverts the whole page (a standard "high contrast"
               trick); images/video/canvas get a counter-invert so
               photos still read normally
     grayscale desaturates the whole page
     links     forces underlines on every link
     font      swaps --sans/--serif to a plain, highly legible face
     motion    same effect as the OS "reduce motion" preference —
               also read by motion.js / blur-text.js / scroll-scrub.js
               at their own init, so the JS-driven hero mesh and
               word reveals honor it too (hence the reload on toggle)
   ============================================================ */
(function () {
  'use strict';

  var STORAGE = 'dba_a11y';
  var DEFAULTS = { fs: 0, contrast: false, grayscale: false, links: false, font: false, motion: false };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE);
      return raw ? Object.assign({}, DEFAULTS, JSON.parse(raw)) : Object.assign({}, DEFAULTS);
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save(state) {
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch (e) {}
    try { localStorage.setItem('dba_a11y_motion', state.motion ? '1' : '0'); } catch (e) {}
  }

  var ZOOM = { 0: '', 1: '1.15', 2: '1.3', 3: '1.45' };

  function apply(state) {
    var html = document.documentElement;
    html.style.zoom = ZOOM[state.fs] || '';
    html.classList.toggle('a11y-contrast', !!state.contrast);
    html.classList.toggle('a11y-links', !!state.links);
    html.classList.toggle('a11y-font', !!state.font);
    html.classList.toggle('a11y-motion', !!state.motion);

    var filters = [];
    if (state.grayscale) filters.push('grayscale(1)');
    if (state.contrast) filters.push('invert(1) hue-rotate(180deg)');
    html.style.filter = filters.join(' ');
  }

  function buildUI(state) {
    var wrap = document.createElement('div');
    wrap.className = 'a11y-widget';
    wrap.innerHTML =
      '<button type="button" class="a11y-btn" aria-haspopup="true" aria-expanded="false" aria-controls="a11yPanel" aria-label="תפריט נגישות">' +
        /* International Symbol of Access (wheelchair) */
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
          '<circle cx="12.3" cy="4.3" r="1.9"/>' +
          '<path d="M11.4 8.3c-.7 0-1.3.6-1.3 1.3v4.2c0 .6.3 1.1.8 1.4l4.4 2.6c.4.2.9.1 1.2-.3.3-.4.1-1-.3-1.2l-3.8-2.3v-2l2.6.9c.5.2 1-.1 1.2-.6.2-.5-.1-1-.6-1.2l-3.5-1.2c-.2-.1-.4-.2-.7-.2Z"/>' +
          '<path d="M9.6 15.1a4.6 4.6 0 1 0 6.9 4.4 1 1 0 0 0-2-.2 2.6 2.6 0 1 1-3.9-2.5 1 1 0 0 0-1-1.7Z"/>' +
        '</svg>' +
      '</button>' +
      '<div class="a11y-panel" id="a11yPanel" role="region" aria-label="הגדרות נגישות" hidden>' +
        '<div class="a11y-head"><b>נגישות</b><button type="button" class="a11y-close" aria-label="סגירה">&times;</button></div>' +
        '<div class="a11y-row a11y-fsrow">' +
          '<span>גודל טקסט</span>' +
          '<div class="a11y-fsbtns">' +
            '<button type="button" data-a11y="fs-down" aria-label="הקטן טקסט">A-</button>' +
            '<button type="button" data-a11y="fs-up" aria-label="הגדל טקסט">A+</button>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="a11y-toggle" data-a11y="contrast" aria-pressed="false">ניגודיות גבוהה</button>' +
        '<button type="button" class="a11y-toggle" data-a11y="grayscale" aria-pressed="false">גווני אפור</button>' +
        '<button type="button" class="a11y-toggle" data-a11y="links" aria-pressed="false">הדגשת קישורים</button>' +
        '<button type="button" class="a11y-toggle" data-a11y="font" aria-pressed="false">פונט קריא</button>' +
        '<button type="button" class="a11y-toggle" data-a11y="motion" aria-pressed="false">עצירת אנימציות</button>' +
        '<button type="button" class="a11y-reset" data-a11y="reset">איפוס הגדרות</button>' +
        '<a class="a11y-statement" href="accessibility.html">הצהרת נגישות המשרד</a>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function syncUI(wrap, state) {
    wrap.querySelectorAll('[data-a11y]').forEach(function (btn) {
      var key = btn.getAttribute('data-a11y');
      if (key === 'contrast' || key === 'grayscale' || key === 'links' || key === 'font' || key === 'motion') {
        var on = !!state[key];
        btn.setAttribute('aria-pressed', String(on));
        btn.classList.toggle('is-on', on);
      }
    });
    var down = wrap.querySelector('[data-a11y="fs-down"]');
    var up = wrap.querySelector('[data-a11y="fs-up"]');
    down.disabled = state.fs <= 0;
    up.disabled = state.fs >= 3;
  }

  function boot() {
    var state = load();
    apply(state);
    var wrap = buildUI(state);
    syncUI(wrap, state);

    var btn = wrap.querySelector('.a11y-btn');
    var panel = wrap.querySelector('.a11y-panel');

    // keyboard/screen-reader focus should follow the panel's open state,
    // not just its visibility — otherwise a keyboard user who opens the
    // panel has no idea their focus is still sitting on the button behind it
    function setOpen(open) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      wrap.classList.toggle('is-open', open);
      if (open) { wrap.querySelector('.a11y-close').focus(); }
      else if (panel.contains(document.activeElement)) { btn.focus(); }
    }
    btn.addEventListener('click', function () { setOpen(panel.hidden); });
    wrap.querySelector('.a11y-close').addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !wrap.contains(e.target)) setOpen(false);
    });
    // keep keyboard focus from silently leaving into the page behind the
    // panel while it's open (a lightweight focus trap for the popover)
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var items = panel.querySelectorAll('button, a[href]');
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    panel.addEventListener('click', function (e) {
      var target = e.target.closest('[data-a11y]');
      if (!target) return;
      var key = target.getAttribute('data-a11y');

      if (key === 'fs-up') { state.fs = Math.min(3, state.fs + 1); }
      else if (key === 'fs-down') { state.fs = Math.max(0, state.fs - 1); }
      else if (key === 'reset') { state = Object.assign({}, DEFAULTS); }
      else if (key in state) { state[key] = !state[key]; }
      else { return; }

      save(state);
      apply(state);
      syncUI(wrap, state);

      // motion.js / blur-text.js / scroll-scrub.js only read the flag once,
      // at their own script init — reload so the JS-driven animations
      // (hero mesh, word reveals) actually honor the new setting too
      if (key === 'motion') { location.reload(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
