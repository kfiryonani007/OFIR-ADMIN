/* ============================================================
   Lightweight first-party analytics — sends events to the local
   backend (/api/track), which stores them in SQLite.
   Captures: pageviews, clicks, time-on-page, device, traffic source.
   Privacy: no cookies, no personal data — only anonymous usage.
   ============================================================ */
(function () {
  'use strict';

  // never track the admin dashboard itself
  if (/\/admin(\.html)?$/i.test(location.pathname)) return;

  /* ---- anonymous per-session id ---- */
  var session_id;
  try {
    session_id = sessionStorage.getItem('dba_sid');
    if (!session_id) {
      session_id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
      sessionStorage.setItem('dba_sid', session_id);
    }
  } catch (e) { session_id = 'nostore'; }

  /* ---- device ---- */
  var device = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  /* ---- traffic source from referrer ---- */
  function trafficSource() {
    var ref = document.referrer || '';
    if (!ref) return 'ישיר';
    var host = '';
    try { host = new URL(ref).hostname.replace(/^www\./, ''); } catch (e) { host = ref; }
    if (host === location.hostname) return '';           // internal navigation — ignore as a source
    if (/google\./.test(host) || /bing\.|duckduckgo\.|yahoo\./.test(host)) return 'google';
    if (/facebook\.|instagram\.|tiktok\.|t\.co|twitter\.|x\.com|linkedin\.|youtube\.|whatsapp/.test(host)) return 'רשתות חברתיות';
    return 'אחר (' + host + ')';
  }

  var page = location.pathname || '/';
  var base = { session_id: session_id, page: page, device: device };
  var queue = [];
  var flushTimer = null;

  function send(events, useBeacon) {
    if (!events.length) return;
    var body = JSON.stringify({ events: events });
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: body, keepalive: true
      }).catch(function () {});
    }
  }
  function flush(useBeacon) {
    if (!queue.length) return;
    var batch = queue.splice(0, queue.length);
    send(batch, useBeacon);
  }
  function track(ev) {
    queue.push(Object.assign({}, base, ev));
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, 1200);
  }

  /* ---- pageview ---- */
  track({ event_type: 'pageview', referrer_source: trafficSource(), referrer: document.referrer || '' });

  /* ---- clicks on links & buttons ---- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button');
    if (!el) return;
    var label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || '')
      .replace(/\s+/g, ' ').trim().slice(0, 80);
    if (!label) return;
    track({ event_type: 'click', target: label });
  }, true);

  /* ---- time on page (sent on hide / unload) ---- */
  var start = Date.now();
  var sentTime = false;
  function sendTime() {
    if (sentTime) return;
    sentTime = true;
    queue.push(Object.assign({}, base, { event_type: 'page_time', duration_ms: Date.now() - start }));
    flush(true);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendTime();
  });
  window.addEventListener('pagehide', sendTime);
})();
