/* ============================================================
   Guards the single most common way the admin panel appears to be
   "broken": double-clicking admin.html inside the folder opens it
   as a file:// page with no server behind it, so every API call
   fails at the network level — which looks exactly like a wrong
   code. Detect that, and either bounce to the real server URL (if
   it is already running) or say plainly what to do instead.
   ============================================================ */
(function () {
  'use strict';
  var SERVER = 'http://localhost:5500';

  window.__adminFileGuard = function () {
    if (location.protocol !== 'file:') return false;

    var page = location.pathname.split('/').pop() || 'admin.html';
    var target = SERVER + '/' + page;

    document.body.innerHTML =
      '<section class="login-view"><div class="login-card">' +
        '<div class="login-logo"><b>DAVID BALAISH</b><em>ADMIN</em></div>' +
        '<h1>צריך להפעיל את השרת</h1>' +
        '<p style="font-size:14.5px; color:#55503F; line-height:1.75; margin:0 0 22px; text-align:right;">' +
          'פתחתם את הקובץ ישירות מהתיקייה, ולכן אין שרת שיטפל בהתחברות.<br>' +
          'סגרו את החלון הזה והפעילו את <b>start-server.bat</b> שבתיקייה — הדפדפן ייפתח לבד בכתובת הנכונה.' +
        '</p>' +
        '<a class="a-btn a-btn-primary" style="display:block; text-decoration:none;" href="' + target + '">' +
          'כבר הפעלתי את השרת — קחו אותי לשם' +
        '</a>' +
        '<p id="guardProbe" style="font-size:13px; color:#655E4E; margin:14px 0 0;">בודק אם השרת כבר רץ…</p>' +
      '</div></section>';

    // If the server is already up there is no reason to make anyone click.
    // no-cors is enough here: we only need to know whether the connection
    // succeeds, not to read the response body.
    fetch(SERVER + '/api/admin/me', { mode: 'no-cors' })
      .then(function () { location.href = target; })
      .catch(function () {
        var p = document.getElementById('guardProbe');
        if (p) p.textContent = 'השרת לא רץ כרגע.';
      });

    return true;
  };
})();
