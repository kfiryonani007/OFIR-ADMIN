/* ============================================================
   Admin dashboard client. Talks to the local backend, which in
   turn talks to Supabase. Auth is an httpOnly session cookie —
   this page redirects to the login screen if it isn't valid.
   ============================================================ */
(function () {
  'use strict';

  // opened as a file:// page? the guard took over the document — stop here,
  // the elements this script expects no longer exist
  if (window.__adminFileGuard && window.__adminFileGuard()) return;

  var refreshTimer = null;
  var BRONZE = ['#A2793F', '#C9A876', '#6E5027', '#8A8371', '#D9D1BE', '#B8AF98'];

  function api(path, opts) {
    opts = opts || {};
    opts.credentials = 'include';
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch('/api/' + path, opts);
  }
  function noop() {}
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  // fetch() only rejects on a network failure — a 401 (expired session) or a
  // 500 still resolves, so without this every save would look successful even
  // when nothing was written. Every mutating call runs through it.
  function checkOk(r) {
    if (!r.ok) {
      throw new Error(r.status === 401
        ? 'ההתחברות פגה, יש להתחבר מחדש.'
        : 'השרת החזיר שגיאה (קוד ' + r.status + '). נסו שוב.');
    }
    return r;
  }
  function showErr(err) {
    alert(err && err.message ? err.message : 'אירעה שגיאה, נסו שוב.');
    if (err && /ההתחברות פגה/.test(err.message)) location.href = 'admin.html';
  }
  function fmtDate(s) {
    if (!s) return '';
    var d = new Date(s);
    if (isNaN(d)) return esc(s);
    return d.toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function fmtDuration(ms) {
    var s = Math.round((ms || 0) / 1000);
    if (s < 60) return s + ' שנ׳';
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + ' דק׳';
  }
  function setNum(id, n) { document.getElementById(id).textContent = Number(n || 0).toLocaleString('he-IL'); }
  function setBadge(id, n) {
    var el = document.getElementById(id);
    if (!el) return;
    n = Number(n || 0);
    el.textContent = n > 99 ? '99+' : n;
    el.hidden = n === 0;
  }

  /* ---------- sidebar navigation ---------- */
  var VIEW_TITLES = { overview: 'מסך בקרה', leads: 'מערכת לידים', projects: 'מערכת פרויקטים', stories: 'סיפורי הצלחה', settings: 'הגדרות אתר' };
  var sideNav = document.querySelector('.side-nav');
  var sideLinks = [].slice.call(document.querySelectorAll('.side-link'));
  var viewPanels = [].slice.call(document.querySelectorAll('[data-view-panel]'));

  function goToView(name) {
    if (!VIEW_TITLES[name]) name = 'overview';
    viewPanels.forEach(function (p) { p.hidden = p.getAttribute('data-view-panel') !== name; });
    sideLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-view') === name); });
    document.getElementById('viewTitle').textContent = VIEW_TITLES[name];
    sideNav.classList.remove('is-open');
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
  }
  sideLinks.forEach(function (link) {
    link.addEventListener('click', function () { goToView(link.getAttribute('data-view')); });
  });
  window.addEventListener('hashchange', function () { goToView(location.hash.slice(1)); });
  document.getElementById('sideToggle').addEventListener('click', function () {
    sideNav.classList.toggle('is-open');
  });

  /* ---------- renderers ---------- */
  function renderBarList(id, rows) {
    var el = document.getElementById(id);
    if (!el) return;
    rows = rows || [];
    if (!rows.length) { el.innerHTML = '<p class="empty-note">אין נתונים עדיין.</p>'; return; }
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; })) || 1;
    el.innerHTML = rows.map(function (r) {
      return '<div class="bar-line"><span class="bl-label" title="' + esc(r.label) + '">' + esc(r.label) + '</span>' +
        '<span class="bl-track"><span class="bl-fill" style="width:' + Math.round((r.n / max) * 100) + '%"></span></span>' +
        '<b class="bl-n">' + r.n + '</b></div>';
    }).join('');
  }
  function renderTimeBars(id, rows) {
    var el = document.getElementById(id);
    if (!el) return;
    rows = rows || [];
    if (!rows.length) { el.innerHTML = '<p class="empty-note">אין נתונים עדיין.</p>'; return; }
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; })) || 1;
    el.innerHTML = rows.map(function (r) {
      var h = Math.round((r.n / max) * 100);
      var day = String(r.label).slice(8) + '/' + String(r.label).slice(5, 7);
      return '<div class="bt-col" title="' + esc(r.label) + ': ' + r.n + '">' +
        '<span class="bt-bar" style="height:' + Math.max(h, 2) + '%"></span>' +
        '<span class="bt-lab">' + day + '</span></div>';
    }).join('');
  }
  function renderDonut(donutId, legendId, rows) {
    var d = document.getElementById(donutId), l = document.getElementById(legendId);
    if (!d || !l) return;
    rows = rows || [];
    var total = rows.reduce(function (s, r) { return s + r.n; }, 0);
    if (!total) {
      d.style.background = 'var(--bg-alt)';
      l.innerHTML = '<p class="empty-note">אין נתונים עדיין.</p>';
      return;
    }
    var acc = 0, stops = [];
    rows.forEach(function (r, i) {
      var start = (acc / total) * 100;
      acc += r.n;
      var end = (acc / total) * 100;
      stops.push(BRONZE[i % BRONZE.length] + ' ' + start + '% ' + end + '%');
    });
    d.style.background = 'conic-gradient(' + stops.join(',') + ')';
    d.style.mask = 'radial-gradient(circle, transparent 52%, #000 53%)';
    d.style.webkitMask = 'radial-gradient(circle, transparent 52%, #000 53%)';
    l.innerHTML = rows.map(function (r, i) {
      var pct = Math.round((r.n / total) * 100);
      return '<div class="legend-row"><span class="legend-dot" style="background:' + BRONZE[i % BRONZE.length] + '"></span>' +
        esc(r.label) + ': <b>' + pct + '%</b></div>';
    }).join('');
  }

  /* ---------- data loading ---------- */
  function loadAll() { loadStats(); loadAnalytics(); loadLeads(); loadProjects(); loadStories(); loadSettings(); loadPageMeta(); }

  function loadStats() {
    api('admin/stats').then(checkOk).then(function (r) { return r.json(); }).then(function (s) {
      setNum('k-total', s.total); setNum('k-today', s.today);
      setNum('k-week', s.week); setNum('k-month', s.month);
      renderBarList('ch-services', s.services);
      setBadge('navLeadsBadge', s.total);
    }).catch(noop);
  }

  function loadAnalytics() {
    api('admin/analytics').then(checkOk).then(function (r) { return r.json(); }).then(function (a) {
      setNum('a-views', a.totalViews); setNum('a-sessions', a.uniqueSessions);
      document.getElementById('a-time').textContent = fmtDuration(a.avgTimeMs);
      setNum('a-clicks', a.totalClicks);
      renderTimeBars('ch-days', a.viewsByDay);
      renderDonut('ch-devices-donut', 'ch-devices-legend', a.devices);
      renderBarList('ch-sources', a.sources);
      renderBarList('ch-pages', a.topPages);
      renderBarList('ch-clicks', a.topClicks);
    }).catch(noop);
  }

  /* ---------- leads ---------- */
  function loadLeads() {
    var q = document.getElementById('searchInput').value.trim();
    var service = document.getElementById('serviceFilter').value;
    var params = new URLSearchParams();
    if (q) params.set('q', q);
    if (service) params.set('service', service);
    api('admin/leads?' + params.toString()).then(checkOk).then(function (r) { return r.json(); }).then(function (data) {
      renderLeads(data.leads || []);
    }).catch(noop);
  }
  function renderLeads(leads) {
    var body = document.getElementById('leadsBody');
    document.getElementById('leadsEmpty').hidden = leads.length > 0;
    body.innerHTML = leads.map(function (l) {
      return '<tr>' +
        '<td>' + fmtDate(l.created_at) + '</td>' +
        '<td><b>' + esc(l.name) + '</b></td>' +
        '<td>' + (l.phone ? '<a href="tel:' + esc(l.phone) + '">' + esc(l.phone) + '</a>' : '') + '</td>' +
        '<td>' + (l.email ? '<a href="mailto:' + esc(l.email) + '">' + esc(l.email) + '</a>' : '') + '</td>' +
        '<td>' + esc(l.city) + '</td>' +
        '<td>' + esc(l.service) + '</td>' +
        '<td class="td-msg">' + esc(l.message) + '</td>' +
        '<td><button class="lead-del" title="מחיקה" data-id="' + esc(l.id) + '">&times;</button></td>' +
        '</tr>';
    }).join('');
  }
  document.getElementById('leadsBody').addEventListener('click', function (e) {
    var btn = e.target.closest('.lead-del');
    if (!btn) return;
    if (!confirm('למחוק את הליד?')) return;
    api('admin/leads/' + encodeURIComponent(btn.getAttribute('data-id')), { method: 'DELETE' })
      .then(checkOk).then(function () { loadLeads(); loadStats(); }).catch(showErr);
  });
  document.getElementById('searchInput').addEventListener('input', debounce(loadLeads, 300));
  document.getElementById('serviceFilter').addEventListener('change', loadLeads);
  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ---------- SEO helpers (shared by both forms) ---------- */
  var SITE_SUFFIX = ' | David Balaish Architecture';
  function setCount(id, el, max) {
    var c = document.getElementById(id);
    if (!c) return;
    var n = el.value.length;
    c.textContent = n + ' / ' + max;
    c.classList.toggle('over', n >= max);
  }

  /* ---------- image upload (project/story photos) ----------
     Resized client-side before upload, both to stay well under the
     server's size limit and so a phone photo doesn't ship at full
     multi-MB size just to be shown as a card thumbnail. ---------- */
  function resizeImage(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        var cw = Math.round(img.naturalWidth * scale), ch = Math.round(img.naturalHeight * scale);
        var canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
        canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('resize_failed')); }, 'image/jpeg', quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('load_failed')); };
      img.src = url;
    });
  }
  function uploadImage(file) {
    return resizeImage(file, 2000, 0.85).then(function (blob) {
      var fd = new FormData();
      fd.append('file', blob, 'photo.jpg');
      return fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: fd });
    }).then(checkOk).then(function (r) { return r.json(); }).then(function (d) { return d.url; });
  }
  function linesOf(hidden) { return hidden.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean); }
  // single-image field: box shows either an empty placeholder or a thumbnail
  // with a remove (x); the hidden input stays the single source of truth so
  // the existing submit-payload code (reads hidden.value) needs no changes.
  function wireSingleImageField(hiddenId, boxId, fileId, statusId) {
    var hidden = document.getElementById(hiddenId), box = document.getElementById(boxId);
    var fileInput = document.getElementById(fileId), status = document.getElementById(statusId);
    function render() {
      box.innerHTML = hidden.value
        ? '<div class="img-upload-thumb"><img src="' + esc(hidden.value) + '" alt=""><span class="img-upload-remove" title="הסרה">&times;</span></div>'
        : '<div class="img-upload-empty">לא נבחרה תמונה</div>';
    }
    box.addEventListener('click', function (e) {
      if (!e.target.closest('.img-upload-remove')) return;
      hidden.value = '';
      render();
    });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      fileInput.value = '';
      if (!file) return;
      status.textContent = 'מעלה...';
      uploadImage(file).then(function (url) {
        hidden.value = url; status.textContent = ''; render();
      }).catch(function () { status.textContent = 'ההעלאה נכשלה, נסו שוב.'; });
    });
    return render;
  }
  // gallery field: same idea, but the hidden textarea holds one URL per line
  // (unchanged from the old manual-paste format) so it's still a plain
  // newline list on submit — only how it gets filled in has changed.
  function wireGalleryField(gridId, hiddenId, fileId, statusId) {
    var grid = document.getElementById(gridId), hidden = document.getElementById(hiddenId);
    var fileInput = document.getElementById(fileId), status = document.getElementById(statusId);
    function render() {
      grid.innerHTML = linesOf(hidden).map(function (u, i) {
        return '<div class="img-upload-thumb" data-i="' + i + '"><img src="' + esc(u) + '" alt=""><span class="img-upload-remove" title="הסרה">&times;</span></div>';
      }).join('');
    }
    grid.addEventListener('click', function (e) {
      var thumb = e.target.closest('.img-upload-thumb');
      if (!thumb || !e.target.closest('.img-upload-remove')) return;
      var urls = linesOf(hidden);
      urls.splice(Number(thumb.getAttribute('data-i')), 1);
      hidden.value = urls.join('\n');
      render();
    });
    fileInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(fileInput.files);
      fileInput.value = '';
      if (!files.length) return;
      status.textContent = 'מעלה ' + files.length + ' תמונות...';
      Promise.allSettled(files.map(uploadImage)).then(function (results) {
        var okUrls = results.filter(function (r) { return r.status === 'fulfilled'; }).map(function (r) { return r.value; });
        var failCount = results.length - okUrls.length;
        hidden.value = linesOf(hidden).concat(okUrls).join('\n');
        status.textContent = failCount ? (failCount + ' תמונות נכשלו, נסו שוב.') : '';
        render();
      });
    });
    return render;
  }
  var renderPImage = wireSingleImageField('p-image', 'p-image-box', 'p-image-file', 'p-image-status');
  var renderPGallery = wireGalleryField('p-gallery-grid', 'p-gallery', 'p-gallery-file', 'p-gallery-status');
  var renderStImage = wireSingleImageField('st-image', 'st-image-box', 'st-image-file', 'st-image-status');

  /* ---------- projects ---------- */
  var projForm = document.getElementById('projForm');

  function loadProjects() {
    fetch('/api/projects').then(checkOk).then(function (r) { return r.json(); }).then(function (data) {
      var list = data.projects || [];
      renderProjectList(list);
      setBadge('navProjBadge', list.length);
    }).catch(noop);
  }
  function renderProjectList(list) {
    var el = document.getElementById('projList');
    document.getElementById('projCount').textContent = list.length;
    if (!list.length) { el.innerHTML = '<p class="proj-empty">אין פרויקטים עדיין. הוסיפו את הראשון מימין.</p>'; return; }
    el.innerHTML = list.map(function (p) {
      var img = p.image_url
        ? '<img src="' + esc(p.image_url) + '" alt="" onerror="this.outerHTML=\'<div class=&quot;noimg&quot;>אין</div>\'">'
        : '<div class="noimg">אין</div>';
      return '<div class="proj-item">' + img +
        '<div class="pi-info"><div class="pi-title">' + esc(p.title) + (p.featured ? ' <span class="pi-badge">בעמוד הבית</span>' : '') + '</div>' +
        '<div class="pi-sub">' + esc(p.city || '') + (p.category ? ' · ' + esc(p.category) : '') + '</div></div>' +
        '<div class="pi-actions"><button class="pi-btn edit" title="עריכה" data-id="' + p.id + '">✎</button>' +
        '<button class="pi-btn del" title="מחיקה" data-id="' + p.id + '">&times;</button></div></div>';
    }).join('');
  }
  document.getElementById('projList').addEventListener('click', function (e) {
    var btn = e.target.closest('.pi-btn');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    if (btn.classList.contains('del')) {
      if (!confirm('למחוק את הפרויקט?')) return;
      api('admin/projects/' + id, { method: 'DELETE' })
        .then(checkOk).then(function () { loadProjects(); }).catch(showErr);
    } else {
      fetch('/api/projects/' + id).then(checkOk).then(function (r) { return r.json(); })
        .then(function (d) { fillProjectForm(d.project); }).catch(showErr);
    }
  });
  function fillProjectForm(p) {
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-title').value = p.title || '';
    document.getElementById('p-city').value = p.city || '';
    document.getElementById('p-image').value = p.image_url || '';
    renderPImage();
    var gallery = [];
    try { gallery = p.gallery ? JSON.parse(p.gallery) : []; } catch (e) { gallery = []; }
    document.getElementById('p-gallery').value = gallery.join('\n');
    renderPGallery();
    document.getElementById('p-summary').value = p.summary || '';
    document.getElementById('p-challenge').value = p.challenge || '';
    document.getElementById('p-solution').value = p.solution || '';
    document.getElementById('p-result').value = p.result || '';
    document.getElementById('p-meta-title').value = p.meta_title || '';
    document.getElementById('p-meta-desc').value = p.meta_description || '';
    document.getElementById('p-sort').value = p.sort_order || 0;
    document.getElementById('p-featured').checked = !!p.featured;
    var cats = String(p.category || '').split(',').map(function (s) { return s.trim(); });
    projForm.querySelectorAll('.pf-cats input').forEach(function (c) { c.checked = cats.indexOf(c.value) > -1; });
    syncProjSeo();
    document.getElementById('projFormTitle').textContent = 'עריכת פרויקט';
    document.getElementById('projCancel').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetProjectForm() {
    projForm.reset();
    document.getElementById('p-id').value = '';
    document.getElementById('p-sort').value = 0;
    renderPImage();
    renderPGallery();
    document.getElementById('projFormTitle').textContent = 'הוספת פרויקט חדש';
    document.getElementById('projCancel').hidden = true;
    syncProjSeo();
  }
  document.getElementById('projCancel').addEventListener('click', resetProjectForm);

  // Show the auto-generated default as the placeholder, so it's clear exactly
  // what will be used when the SEO fields are left blank.
  function syncProjSeo() {
    var title = document.getElementById('p-title').value.trim();
    var city = document.getElementById('p-city').value.trim();
    var summary = document.getElementById('p-summary').value.trim();
    var mt = document.getElementById('p-meta-title');
    var md = document.getElementById('p-meta-desc');
    mt.placeholder = title ? (title + (city ? ', ' + city : '') + SITE_SUFFIX) : 'שם הפרויקט' + SITE_SUFFIX;
    md.placeholder = summary || 'התיאור הקצר של הפרויקט';
    setCount('p-meta-title-count', mt, 70);
    setCount('p-meta-desc-count', md, 180);
  }
  ['p-title', 'p-city', 'p-summary', 'p-meta-title', 'p-meta-desc'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', syncProjSeo);
  });
  syncProjSeo();

  projForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var cats = [];
    projForm.querySelectorAll('.pf-cats input:checked').forEach(function (c) { cats.push(c.value); });
    var payload = {
      title: document.getElementById('p-title').value,
      city: document.getElementById('p-city').value,
      category: cats.join(','),
      image_url: document.getElementById('p-image').value,
      gallery: document.getElementById('p-gallery').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean),
      summary: document.getElementById('p-summary').value,
      challenge: document.getElementById('p-challenge').value,
      solution: document.getElementById('p-solution').value,
      result: document.getElementById('p-result').value,
      meta_title: document.getElementById('p-meta-title').value.trim(),
      meta_description: document.getElementById('p-meta-desc').value.trim(),
      featured: document.getElementById('p-featured').checked,
      // an explicit field, not derived from "featured" — deriving it silently
      // reset a project's position every time it was saved
      sort_order: Number(document.getElementById('p-sort').value) || 0
    };
    var id = document.getElementById('p-id').value;
    api('admin/projects' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      .then(checkOk).then(function () { resetProjectForm(); loadProjects(); }).catch(showErr);
  });

  /* ---------- stories ---------- */
  var storyForm = document.getElementById('storyForm');
  var CAT_LABELS = { homes: 'בתים פרטיים', interior: 'עיצוב פנים', permits: 'היתרים', pools: 'בריכות', business: 'רישוי עסקים', farms: 'משקים ונחלות' };

  function loadStories() {
    api('admin/stories').then(checkOk).then(function (r) { return r.json(); }).then(function (data) {
      var list = data.stories || [];
      renderStoryList(list);
      setBadge('navStoryBadge', list.length);
    }).catch(noop);
  }
  function renderStoryList(list) {
    var el = document.getElementById('storyList');
    document.getElementById('storyCount').textContent = list.length;
    if (!list.length) { el.innerHTML = '<p class="proj-empty">אין סיפורים עדיין.</p>'; return; }
    el.innerHTML = list.map(function (s) {
      var img = s.image_url
        ? '<img src="' + esc(s.image_url) + '" alt="" onerror="this.outerHTML=\'<div class=&quot;noimg&quot;>אין</div>\'">'
        : '<div class="noimg">אין</div>';
      return '<div class="proj-item">' + img +
        '<div class="pi-info"><div class="pi-title">' + esc(s.title) + (s.published ? '' : ' <span class="pi-badge">מוסתר</span>') + '</div>' +
        '<div class="pi-sub">' + esc(s.client || '') + (s.category ? ' · ' + esc(CAT_LABELS[s.category] || s.category) : '') + '</div></div>' +
        '<div class="pi-actions"><button class="pi-btn edit" title="עריכה" data-id="' + s.id + '">✎</button>' +
        '<button class="pi-btn del" title="מחיקה" data-id="' + s.id + '">&times;</button></div></div>';
    }).join('');
  }
  document.getElementById('storyList').addEventListener('click', function (e) {
    var btn = e.target.closest('.pi-btn');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    if (btn.classList.contains('del')) {
      if (!confirm('למחוק את הסיפור?')) return;
      api('admin/stories/' + id, { method: 'DELETE' })
        .then(checkOk).then(function () { loadStories(); }).catch(showErr);
    } else {
      api('admin/stories').then(checkOk).then(function (r) { return r.json(); }).then(function (d) {
        var s = (d.stories || []).filter(function (x) { return String(x.id) === String(id); })[0];
        if (s) fillStoryForm(s);
      }).catch(showErr);
    }
  });
  function fillStoryForm(s) {
    document.getElementById('st-id').value = s.id;
    document.getElementById('st-title').value = s.title || '';
    document.getElementById('st-client').value = s.client || '';
    document.getElementById('st-cat').value = s.category || '';
    document.getElementById('st-image').value = s.image_url || '';
    renderStImage();
    document.getElementById('st-situation').value = s.situation || '';
    document.getElementById('st-action').value = s.action || '';
    document.getElementById('st-result').value = s.result || '';
    document.getElementById('st-quote').value = s.quote || '';
    document.getElementById('st-meta-title').value = s.meta_title || '';
    document.getElementById('st-meta-desc').value = s.meta_description || '';
    document.getElementById('st-published').checked = !!s.published;
    syncStorySeo();
    document.getElementById('storyFormTitle').textContent = 'עריכת סיפור';
    document.getElementById('storyCancel').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetStoryForm() {
    storyForm.reset();
    document.getElementById('st-id').value = '';
    document.getElementById('st-published').checked = true;
    renderStImage();
    document.getElementById('storyFormTitle').textContent = 'הוספת סיפור חדש';
    document.getElementById('storyCancel').hidden = true;
    syncStorySeo();
  }
  document.getElementById('storyCancel').addEventListener('click', resetStoryForm);

  function syncStorySeo() {
    var title = document.getElementById('st-title').value.trim();
    var result = document.getElementById('st-result').value.trim();
    var mt = document.getElementById('st-meta-title');
    var md = document.getElementById('st-meta-desc');
    mt.placeholder = title ? (title + SITE_SUFFIX) : 'כותרת הסיפור' + SITE_SUFFIX;
    md.placeholder = result || 'תיאור קצר של הסיפור';
    setCount('st-meta-title-count', mt, 70);
    setCount('st-meta-desc-count', md, 180);
  }
  ['st-title', 'st-result', 'st-meta-title', 'st-meta-desc'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', syncStorySeo);
  });
  syncStorySeo();

  storyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var payload = {
      title: document.getElementById('st-title').value,
      client: document.getElementById('st-client').value,
      category: document.getElementById('st-cat').value,
      image_url: document.getElementById('st-image').value,
      situation: document.getElementById('st-situation').value,
      action: document.getElementById('st-action').value,
      result: document.getElementById('st-result').value,
      quote: document.getElementById('st-quote').value,
      meta_title: document.getElementById('st-meta-title').value.trim(),
      meta_description: document.getElementById('st-meta-desc').value.trim(),
      published: document.getElementById('st-published').checked,
      sort_order: 0
    };
    var id = document.getElementById('st-id').value;
    api('admin/stories' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      .then(checkOk).then(function () { resetStoryForm(); loadStories(); }).catch(showErr);
  });

  /* ---------- settings ---------- */
  var STAT_KEYS = ['stat_pools', 'stat_clients', 'stat_years', 'stat_satisfaction'];
  function loadSettings() {
    fetch('/api/settings').then(checkOk).then(function (r) { return r.json(); }).then(function (s) {
      STAT_KEYS.forEach(function (k) {
        var el = document.getElementById('s-' + k);
        if (el) el.value = s[k] || '';
      });
      document.getElementById('s-tracking_pixels').value = s.tracking_pixels || '';
    }).catch(noop);
  }
  document.getElementById('settingsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var body = {};
    STAT_KEYS.forEach(function (k) { body[k] = document.getElementById('s-' + k).value; });
    api('admin/settings', { method: 'PUT', body: JSON.stringify(body) })
      .then(checkOk).then(function () {
        var n = document.getElementById('settingsSaved');
        n.hidden = false; setTimeout(function () { n.hidden = true; }, 2500);
      }).catch(showErr);
  });
  document.getElementById('pixelsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var body = { tracking_pixels: document.getElementById('s-tracking_pixels').value };
    api('admin/settings', { method: 'PUT', body: JSON.stringify(body) })
      .then(checkOk).then(function () {
        var n = document.getElementById('pixelsSaved');
        n.hidden = false; setTimeout(function () { n.hidden = true; }, 2500);
      }).catch(showErr);
  });

  /* ---------- page META tags ---------- */
  function loadPageMeta() {
    api('admin/page-meta').then(checkOk).then(function (r) { return r.json(); }).then(function (d) {
      var list = document.getElementById('pageMetaList');
      list.innerHTML = (d.pages || []).map(function (p) {
        return '<div class="pm-item" data-page="' + esc(p.page) + '">' +
          '<h4>' + esc(p.label) + ' <code>' + esc(p.page) + '</code></h4>' +
          '<div class="pm-grid">' +
            '<div class="a-field"><label>META Title</label>' +
              '<input type="text" class="pm-title" maxlength="70" value="' + esc(p.title) + '" placeholder="' + esc(p.placeholderTitle) + '"></div>' +
            '<div class="a-field"><label>META Description</label>' +
              '<textarea class="pm-desc" rows="2" maxlength="180" placeholder="' + esc(p.placeholderDescription) + '">' + esc(p.description) + '</textarea></div>' +
          '</div></div>';
      }).join('');
    }).catch(noop);
  }
  document.getElementById('pageMetaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var pages = [];
    document.querySelectorAll('#pageMetaList .pm-item').forEach(function (item) {
      pages.push({
        page: item.getAttribute('data-page'),
        title: item.querySelector('.pm-title').value,
        description: item.querySelector('.pm-desc').value
      });
    });
    api('admin/page-meta', { method: 'PUT', body: JSON.stringify({ pages: pages }) })
      .then(checkOk).then(function () {
        var n = document.getElementById('pageMetaSaved');
        n.hidden = false; setTimeout(function () { n.hidden = true; }, 2500);
      }).catch(showErr);
  });

  /* ---------- reset + logout ---------- */
  document.getElementById('resetBtn').addEventListener('click', function () {
    if (!confirm('לאפס את כל הלידים והאנליטיקה לאפס? (הפרויקטים לא יימחקו)')) return;
    api('admin/reset-data', { method: 'POST' })
      .then(checkOk).then(function () { loadStats(); loadAnalytics(); loadLeads(); }).catch(showErr);
  });
  document.getElementById('logoutBtn').addEventListener('click', function () {
    api('admin/logout', { method: 'POST' }).finally(function () {
      if (refreshTimer) clearInterval(refreshTimer);
      location.href = 'admin.html';
    });
  });

  /* ---------- boot: this whole page requires a valid session ---------- */
  api('admin/me').then(function (r) {
    if (!r.ok) { location.href = 'admin.html'; return; }
    goToView(location.hash.slice(1) || 'overview');
    loadAll();
    refreshTimer = setInterval(function () { loadStats(); loadAnalytics(); loadLeads(); }, 20000);
  }).catch(function () { location.href = 'admin.html'; });
})();
