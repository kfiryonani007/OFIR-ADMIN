/* ============================================================
   Admin login — a page of its own, so no dashboard markup exists
   here to be revealed before authenticating.
   ============================================================ */
(function () {
  'use strict';

  // opened as a file:// page? the guard took over the document — stop here,
  // the elements this script expects no longer exist
  if (window.__adminFileGuard && window.__adminFileGuard()) return;

  var form = document.getElementById('loginForm');
  var errEl = document.getElementById('loginErr');
  var pin = document.getElementById('lg-pin');

  // digits only — a stray letter (e.g. the keyboard left in Hebrew) is
  // dropped as you type instead of silently producing a code that can't match
  pin.addEventListener('input', function () {
    var cleaned = pin.value.replace(/[^0-9]/g, '');
    if (cleaned !== pin.value) pin.value = cleaned;
  });

  function api(path, opts) {
    opts = opts || {};
    opts.credentials = 'include';
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch('/api/' + path, opts);
  }

  // already signed in from an earlier visit? go straight through
  api('admin/me').then(function (r) {
    if (r.ok) location.href = 'admin-dashboard.html';
  }).catch(function () {});

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errEl.hidden = true;
    api('admin/login', { method: 'POST', body: JSON.stringify({ pin: pin.value }) })
      .then(function (r) {
        return r.json().then(function (data) { return { ok: r.ok, data: data }; });
      })
      .then(function (res) {
        if (res.ok) { location.href = 'admin-dashboard.html'; return; }
        var msg = 'קוד שגוי';
        if (res.data.error === 'too_many_attempts') {
          msg = 'יותר מדי ניסיונות. נסו שוב בעוד ' + res.data.minutesLeft + ' דקות.';
        } else if (typeof res.data.attemptsLeft === 'number') {
          msg = res.data.attemptsLeft === 1
            ? 'קוד שגוי. נותר ניסיון אחד.'
            : 'קוד שגוי. נותרו ' + res.data.attemptsLeft + ' ניסיונות.';
        }
        errEl.textContent = msg;
        errEl.hidden = false;
        pin.value = '';
        pin.focus();
      })
      .catch(function () {
        errEl.textContent = 'לא הצלחנו להתחבר לשרת. ודאו שהשרת רץ ונסו שוב.';
        errEl.hidden = false;
      });
  });
})();
