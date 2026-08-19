/* ============================================================
   David Balaish Architecture — shared behaviors
   ============================================================ */
(function () {
  'use strict';

  /* ---------- header solid on scroll ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('solid', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile drawer ---------- */
  var drawer = document.getElementById('drawer');
  var burger = document.getElementById('burgerBtn');
  var drawerClose = document.getElementById('drawerClose');
  function openDrawer() { if (drawer) { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); if (burger) burger.setAttribute('aria-expanded', 'true'); } }
  function closeDrawer() { if (drawer) { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); if (burger) burger.setAttribute('aria-expanded', 'false'); } }
  if (burger) burger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawer) drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      var parent = item.parentElement;
      parent.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        var b = i.querySelector('.faq-q'); if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- active nav link (match by pathname) ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(function (a) {
    if (a.getAttribute('data-page') === here) a.classList.add('active');
  });

  /* ---------- current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- projects filter ---------- */
  var filterBar = document.querySelector('.filter-bar');
  var staticCards = document.querySelectorAll('.proj-grid:not([data-dynamic]) .proj-card');
  if (filterBar && staticCards.length) {
    var cards = Array.prototype.slice.call(staticCards);
    var countEl = document.querySelector('.proj-count');
    var apply = function (cat) {
      var shown = 0;
      cards.forEach(function (c) {
        var cats = (c.getAttribute('data-cats') || '').split(',');
        var match = cat === 'all' || cats.indexOf(cat) !== -1;
        c.classList.toggle('hide', !match);
        if (match) shown++;
      });
      if (countEl) countEl.textContent = 'מוצגים ' + shown + ' פרויקטים';
    };
    filterBar.querySelectorAll('.pill').forEach(function (p) {
      p.addEventListener('click', function () {
        filterBar.querySelectorAll('.pill').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
        p.classList.add('active'); p.setAttribute('aria-pressed', 'true');
        apply(p.getAttribute('data-filter'));
      });
    });
    // deep-link: projects.html?cat=pools
    var params = new URLSearchParams(location.search);
    var initial = params.get('cat');
    if (initial) {
      var target = filterBar.querySelector('.pill[data-filter="' + initial + '"]');
      if (target) target.click();
    }
  }

  /* ---------- lightbox (single project gallery) ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('.gallery button').forEach(function (b) {
      b.addEventListener('click', function () {
        var img = b.querySelector('img');
        if (img && lbImg) { lbImg.src = img.src; lbImg.alt = img.alt; }
        lb.classList.add('open');
      });
    });
    var close = function () { lb.classList.remove('open'); };
    lb.addEventListener('click', close);
    var lbClose = lb.querySelector('.lightbox-close');
    if (lbClose) lbClose.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------- dynamic contact heading by ?service= or data attr ---------- */
  var HEADINGS = {
    pools:    'רוצים לבדוק האם ניתן לקבל היתר לבריכה בנכס שלכם?',
    farms:    'רוצים להבין מה ניתן להסדיר במשק?',
    homes:    'מתכננים לבנות בית? בואו נתחיל בבדיקת המגרש והצרכים.',
    business: 'פותחים עסק או נדרשים להסדיר רישיון קיים?'
  };
  var dynHead = document.querySelector('[data-contact-heading]');
  if (dynHead) {
    var ctx = dynHead.getAttribute('data-contact-heading') || new URLSearchParams(location.search).get('service');
    if (ctx && HEADINGS[ctx]) dynHead.textContent = HEADINGS[ctx];
  }

  /* ---------- lead form: validate + honeypot + WhatsApp delivery ----------
     David wants leads on WhatsApp, not email. There's no server-side way
     to place a WhatsApp message for someone without a paid business API,
     so this hands the visitor a pre-filled chat to David's number and
     lets them tap send — same interaction as the site's existing
     WhatsApp button, just pre-filled with what they typed. ---------- */
  var WHATSAPP_NUMBER = '972503851111';
  document.querySelectorAll('form.lead-form').forEach(function (form) {
    var statusEl = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');

    var setStatus = function (msg, ok) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.add('show');
      statusEl.classList.toggle('ok', !!ok);
      statusEl.classList.toggle('bad', !ok);
    };

    // inline validation clears on input
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        var f = el.closest('.field'); if (f) f.classList.remove('invalid');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // honeypot — silently drop bots
      var hp = form.querySelector('input[name="company_url"]');
      if (hp && hp.value.trim() !== '') return;

      // validate required
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (el) {
        var f = el.closest('.field') || el.closest('.consent');
        var bad = (el.type === 'checkbox') ? !el.checked : el.value.trim() === '';
        if (el.type === 'email' && el.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value)) bad = true;
        if (bad && f) { f.classList.add('invalid'); valid = false; }
      });
      if (!valid) { setStatus('נא למלא את כל שדות החובה בצורה תקינה.', false); return; }

      // build payload + auto metadata
      var params = new URLSearchParams(location.search);
      var payload = {};
      new FormData(form).forEach(function (v, k) { if (k !== 'company_url') payload[k] = v; });
      payload.source_page = document.title;
      payload.source_url = location.href;
      payload.page_key = here;
      payload.project_ref = form.getAttribute('data-project') || '';
      payload.submitted_at = new Date().toISOString();
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (u) {
        payload[u] = params.get(u) || '';
      });

      if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.disabled = true; }
      setStatus('שולח…', true);

      // Best-effort: store the lead in our own DB (admin dashboard) too —
      // fire-and-forget so a slow/failed save never blocks the WhatsApp handoff.
      try {
        fetch('/api/lead', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name, phone: payload.phone, email: payload.email,
            city: payload.city, service: payload.service, message: payload.message,
            source_page: payload.source_page, source_url: payload.source_url,
            project_ref: payload.project_ref
          }), keepalive: true
        }).catch(function () {});
      } catch (e) {}

      var lines = [
        'פנייה חדשה מהאתר',
        'שם: ' + (payload.name || ''),
        'טלפון: ' + (payload.phone || ''),
        payload.email ? 'אימייל: ' + payload.email : '',
        payload.city ? 'עיר: ' + payload.city : '',
        payload.service ? 'שירות: ' + payload.service : '',
        payload.message ? 'הודעה: ' + payload.message : ''
      ].filter(Boolean);
      try { sessionStorage.setItem('dba_lead', '1'); } catch (err) {}
      window.location.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    });
  });

})();
