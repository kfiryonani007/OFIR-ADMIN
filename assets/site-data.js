/* ============================================================
   Public site data — pulls projects + settings from the backend
   so they can be managed from the admin dashboard.
   Self-detects which page it is on.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function get(url) { return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }

  // Projects and stories are admin-managed (change over time), so their
  // structured data is generated here from the live API response rather
  // than hardcoded in HTML — it would go stale otherwise. Google's crawler
  // executes this JS; the static LocalBusiness/FAQPage/BreadcrumbList schema
  // elsewhere in <head> covers crawlers that don't render JavaScript.
  function injectSchema(obj) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }

  var CAT_HE = { homes: 'בתים פרטיים', interior: 'עיצוב פנים', permits: 'היתרים וחריגות', pools: 'בריכות', business: 'רישוי עסקים', farms: 'משקים ונחלות' };

  /* ---------- homepage: stats from settings ---------- */
  if (document.querySelector('.stats-band')) {
    get('/api/settings').then(function (s) {
      if (!s) return;
      document.querySelectorAll('.stat-num[data-stat]').forEach(function (el) {
        var v = s[el.getAttribute('data-stat')];
        if (v != null && v !== '') el.setAttribute('data-count', v);
      });
      document.querySelectorAll('.stat-label[data-stat-label]').forEach(function (el) {
        var v = s[el.getAttribute('data-stat-label')];
        if (v != null && v !== '') el.textContent = v;
      });
    });
  }

  /* ---------- card builders ---------- */
  function featuredCard(p) {
    var inner = p.image_url
      ? '<div class="ph"><img src="' + esc(p.image_url) + '" alt="' + esc(p.title) + '" loading="lazy"><div class="cap"><h3>' + esc(p.title) + '</h3><span class="city">' + esc(p.city) + '</span></div></div>'
      : '<div class="ph" data-label="David Balaish Architecture"><div class="cap"><h3>' + esc(p.title) + '</h3><span class="city">' + esc(p.city) + '</span></div></div>';
    return '<a class="proj-card" href="project.html?id=' + p.id + '" data-tilt="4">' + inner + '</a>';
  }
  function galleryCard(p) {
    var ph = p.image_url
      ? '<div class="ph"><img src="' + esc(p.image_url) + '" alt="' + esc(p.title) + '" loading="lazy"></div>'
      : '<div class="ph" data-label="David Balaish Architecture"></div>';
    return '<a class="proj-card" href="project.html?id=' + p.id + '" data-cats="' + esc(p.category || '') + '">' +
      ph + '<div class="meta"><h3>' + esc(p.title) + '</h3><span class="city">' + esc(p.city) + '</span></div></a>';
  }

  /* ---------- homepage: featured projects ---------- */
  var featured = document.getElementById('featuredGrid');
  if (featured) {
    get('/api/projects').then(function (d) {
      var list = (d && d.projects || []).filter(function (p) { return p.featured; }).slice(0, 6);
      var section = document.getElementById('projects');
      if (!list.length) { if (section) section.style.display = 'none'; return; }
      featured.innerHTML = list.map(featuredCard).join('');
      featured.removeAttribute('data-cine');
      featured.classList.add('in');
    });
  }

  /* ---------- projects.html: full gallery + filter ---------- */
  var grid = document.getElementById('projectsGrid');
  if (grid) {
    var allProjects = [];
    var countEl = document.querySelector('.proj-count');
    var emptyEl = document.getElementById('projectsEmpty');
    var filterBar = document.querySelector('.filter-bar');

    function renderGrid(cat) {
      var list = (cat && cat !== 'all')
        ? allProjects.filter(function (p) { return String(p.category || '').split(',').map(function (s) { return s.trim(); }).indexOf(cat) > -1; })
        : allProjects;
      grid.innerHTML = list.map(galleryCard).join('');
      if (countEl) countEl.textContent = list.length ? 'מוצגים ' + list.length + ' פרויקטים' : '';
      grid.classList.add('in');
    }

    get('/api/projects').then(function (d) {
      allProjects = (d && d.projects) || [];
      if (emptyEl) emptyEl.hidden = allProjects.length > 0;
      renderGrid('all');
      if (allProjects.length) {
        injectSchema({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: allProjects.map(function (p, i) {
            return {
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'CreativeWork',
                name: p.title,
                url: 'https://davidbalaish.co.il/project.html?id=' + p.id,
                description: p.summary || undefined,
                locationCreated: p.city || undefined
              }
            };
          })
        });
      }
    });

    if (filterBar) {
      filterBar.querySelectorAll('.pill').forEach(function (p) {
        p.addEventListener('click', function () {
          filterBar.querySelectorAll('.pill').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
          p.classList.add('active'); p.setAttribute('aria-pressed', 'true');
          renderGrid(p.getAttribute('data-filter'));
        });
      });
    }
  }

  /* ============================================================
     Generic per-page blocks. All three read their category from
     `data-category` on the placeholder, falling back to the page's
     entry in assets/content.js (SITE_CONTENT.PAGE_CATEGORY).
     ============================================================ */
  var CONTENT = window.SITE_CONTENT || { QUOTES: {}, PAGE_CATEGORY: {} };
  var PAGE = (location.pathname.split('/').pop() || 'index.html');

  function pageCategory(el) {
    return (el && el.getAttribute('data-category')) || CONTENT.PAGE_CATEGORY[PAGE] || '';
  }

  /* ---------- wisdom quote (content-driven) ---------- */
  var quoteHost = document.querySelector('[data-page-quote]');
  if (quoteHost) {
    var q = CONTENT.QUOTES[PAGE] || CONTENT.QUOTES.DEFAULT;
    if (q) {
      quoteHost.innerHTML =
        '<div class="wrap"><figure class="wisdom">' +
        '<svg class="wisdom-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5C6.5 6.6 4.8 9.3 4.8 12.6c0 2.7 1.6 4.6 3.9 4.6 2 0 3.5-1.5 3.5-3.4 0-1.9-1.3-3.3-3.1-3.3-.3 0-.6 0-.9.1.4-1.6 1.6-3 3.3-4L9.5 5Zm9 0c-3 1.6-4.7 4.3-4.7 7.6 0 2.7 1.6 4.6 3.9 4.6 2 0 3.5-1.5 3.5-3.4 0-1.9-1.3-3.3-3.1-3.3-.3 0-.6 0-.9.1.4-1.6 1.6-3 3.3-4L18.5 5Z" fill="currentColor"/></svg>' +
        '<blockquote>' + esc(q.text) + '</blockquote>' +
        '<figcaption>' + esc(q.author) + '</figcaption>' +
        '</figure></div>';
      quoteHost.hidden = false;
    }
  }

  /* ---------- relevant project for this page ---------- */
  var relHost = document.querySelector('[data-relevant-project]');
  if (relHost) {
    var relCat = pageCategory(relHost);
    get('/api/projects').then(function (d) {
      // A project with no category (incomplete/draft entry) must never match —
      // an empty relCat would otherwise trivially satisfy ''.split(',') === [''].
      var all = (d && d.projects || []).filter(function (p) { return p.title && p.category; });
      var match = relCat
        ? all.filter(function (p) { return String(p.category).split(',').map(function (s) { return s.trim(); }).indexOf(relCat) > -1; })
        : [];
      var p = match[0] || all[0];
      if (!p) { relHost.remove(); return; }
      var media = p.image_url
        ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.title) + '" loading="lazy">'
        : '<span class="rel-noimg">David Balaish Architecture</span>';
      relHost.innerHTML =
        '<div class="wrap">' +
        '<div class="sec-head"><p class="eyebrow">מהתיק שלנו</p><h2>פרויקט רלוונטי לעמוד הזה</h2></div>' +
        '<a class="rel-proj" href="project.html?id=' + p.id + '">' +
        '<div class="rel-media">' + media + '</div>' +
        '<div class="rel-body">' +
        '<h3>' + esc(p.title) + '</h3>' +
        (p.city ? '<span class="rel-city">' + esc(p.city) + '</span>' : '') +
        (p.summary ? '<p>' + esc(p.summary) + '</p>' : '') +
        '<span class="rel-link">לצפייה בפרויקט <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6"/></svg></span>' +
        '</div></a></div>';
      relHost.hidden = false;
    });
  }

  /* ---------- success stories (admin-managed) ---------- */
  function storyCard(s) {
    var media = s.image_url
      ? '<img src="' + esc(s.image_url) + '" alt="' + esc(s.title) + '" loading="lazy">'
      : '<svg class="story-img-art" viewBox="0 0 200 200" fill="none" aria-hidden="true"><path d="M0 40H200M0 80H200M0 120H200M0 160H200M40 0V200M80 0V200M120 0V200M160 0V200" stroke="var(--bronze)" stroke-width="0.4" opacity="0.25"/><path d="M40 140V90L100 50L160 90V140H40Z" stroke="var(--bronze-hi)" stroke-width="1.6"/><path d="M85 140V105H115V140" stroke="var(--bronze-hi)" stroke-width="1.6"/><path d="M55 105H70V120H55Z" stroke="var(--bronze-hi)" stroke-width="1.2"/><path d="M130 105H145V120H130Z" stroke="var(--bronze-hi)" stroke-width="1.2"/></svg>';
    var steps = '';
    if (s.situation) steps += '<div><b>המצב: </b>' + esc(s.situation) + '</div>';
    if (s.action) steps += '<div><b>הפעולה: </b>' + esc(s.action) + '</div>';
    if (s.result) steps += '<div><b>התוצאה: </b>' + esc(s.result) + '</div>';
    return '<div class="story">' +
      '<div class="story-img">' + media + (s.client ? '<span>' + esc(s.client) + '</span>' : '') + '</div>' +
      '<div class="story-body"><h3>' + esc(s.title) + '</h3>' +
      (steps ? '<div class="story-steps">' + steps + '</div>' : '') +
      (s.quote ? '<blockquote>"' + esc(s.quote) + '"</blockquote>' : '') +
      (s.client ? '<cite>' + esc(s.client) + '</cite>' : '') +
      '</div></div>';
  }

  var storyHost = document.getElementById('storiesHost');
  if (storyHost) {
    var stCat = pageCategory(storyHost);
    var limit = parseInt(storyHost.getAttribute('data-limit'), 10) || 0;
    get('/api/stories').then(function (d) {
      var all = (d && d.stories) || [];
      // Prefer stories from this page's field, then fill with the rest.
      var list = stCat
        ? all.filter(function (s) { return s.category === stCat; })
            .concat(all.filter(function (s) { return s.category !== stCat; }))
        : all;
      if (limit) list = list.slice(0, limit);
      if (!list.length) { var sec = storyHost.closest('section'); if (sec) sec.style.display = 'none'; return; }
      storyHost.innerHTML = list.map(storyCard).join('');
      storyHost.classList.add('in');

      // Genuine client testimonials, marked up as Review — no star rating is
      // fabricated since none was ever collected; reviewBody + author only.
      // Extends the page's existing static LocalBusiness schema rather than
      // adding a second same-named entity, which parsers could read as two
      // distinct, conflicting businesses.
      var withQuotes = list.filter(function (s) { return s.quote && s.client; });
      if (withQuotes.length) {
        var reviews = withQuotes.map(function (s) {
          return {
            '@type': 'Review',
            reviewBody: s.quote,
            author: { '@type': 'Person', name: s.client.split(',')[0].trim() }
          };
        });
        var existing = [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map(function (el) { try { return { el: el, data: JSON.parse(el.textContent) }; } catch (e) { return null; } })
          .filter(Boolean)
          .find(function (x) { return x.data['@type'] === 'ProfessionalService'; });
        if (existing) {
          existing.data.review = reviews;
          existing.el.textContent = JSON.stringify(existing.data);
        } else {
          injectSchema({ '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'David Balaish Architecture', review: reviews });
        }
      }
    });
  }

  /* ---------- project.html: single detail by ?id ---------- */
  var detail = document.getElementById('projectDetail');
  if (detail) {
    var id = new URLSearchParams(location.search).get('id');
    if (!id) { location.replace('projects.html'); return; }
    get('/api/projects/' + id).then(function (d) {
      if (!d || !d.project) { location.replace('projects.html'); return; }
      var p = d.project;
      // admin-set SEO overrides win; otherwise fall back to the auto title/summary
      document.title = p.meta_title
        ? p.meta_title
        : p.title + (p.city ? ', ' + p.city : '') + ' | פרויקט אדריכל | David Balaish Architecture';
      var metaDesc = document.querySelector('meta[name="description"]');
      var descVal = p.meta_description || p.summary;
      if (metaDesc && descVal) metaDesc.setAttribute('content', descVal);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', document.title);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && descVal) ogDesc.setAttribute('content', descVal);
      var canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute('href', 'https://davidbalaish.co.il/project.html?id=' + encodeURIComponent(p.id));
      setText('pd-title', p.title);
      setText('pd-crumb', (p.title || '') + (p.city ? ', ' + p.city : ''));
      setText('pd-summary', p.summary);
      setText('pd-city', p.city || '—');
      var catNames = String(p.category || '').split(',').map(function (c) { return CAT_HE[c.trim()] || c.trim(); }).filter(Boolean).join(', ');
      setText('pd-cats', catNames || '—');
      var img = document.getElementById('pd-img');
      if (img) {
        if (p.image_url) { img.src = p.image_url; img.alt = p.title; }
        else { img.closest('.proj-hero-img').style.display = 'none'; }
      }
      block('pd-challenge-wrap', 'pd-challenge', p.challenge);
      block('pd-solution-wrap', 'pd-solution', p.solution);
      block('pd-result-wrap', 'pd-result', p.result);
      renderGallery(p);
      detail.style.visibility = 'visible';
    });
    function renderGallery(p) {
      var gallery = [];
      try { gallery = p.gallery ? JSON.parse(p.gallery) : []; } catch (e) { gallery = []; }
      var wrap = document.getElementById('pd-gallery-wrap');
      var host = document.getElementById('pd-gallery');
      if (!wrap || !host || !gallery.length) return;
      host.innerHTML = gallery.map(function (url) {
        return '<button type="button"><img src="' + esc(url) + '" alt="' + esc(p.title) + '" loading="lazy"></button>';
      }).join('');
      wrap.style.display = '';
      var lb = document.getElementById('lightbox');
      if (!lb) return;
      var lbImg = lb.querySelector('img');
      host.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          var img = b.querySelector('img');
          if (img && lbImg) { lbImg.src = img.src; lbImg.alt = img.alt; }
          lb.classList.add('open');
        });
      });
    }
    function setText(elId, val) { var el = document.getElementById(elId); if (el) el.textContent = val || ''; }
    function block(wrapId, textId, val) {
      var wrap = document.getElementById(wrapId);
      if (!wrap) return;
      if (val) { document.getElementById(textId).textContent = val; }
      else { wrap.style.display = 'none'; }
    }
  }
})();
