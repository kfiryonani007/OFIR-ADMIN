/* ============================================================
   David Balaish Architecture — local backend
   - Serves the static site
   - Reads/writes leads, analytics, projects, stories, settings and
     page-level SEO overrides through Supabase (Postgres, hosted).
   - Serves the admin panel (admin.html), protected by a PIN that
     lives in server/.env only — never in the database, never sent
     to the browser.
   ============================================================ */
'use strict';
require('dotenv').config();
const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5500;
const SITE_ROOT = path.join(__dirname, '..');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SECRET_KEY in server/.env — see supabase/schema.sql for setup.');
  process.exit(1);
}
const ADMIN_PIN = str(process.env.ADMIN_PIN);
if (!ADMIN_PIN) {
  console.error('Missing ADMIN_PIN in server/.env — the admin panel cannot start without one.');
  process.exit(1);
}
// Falling back to a random per-boot secret would silently log the admin out on
// every restart, so require it explicitly rather than paper over a missing value.
const SESSION_SECRET = str(process.env.SESSION_SECRET);
if (!SESSION_SECRET) {
  console.error('Missing SESSION_SECRET in server/.env.');
  process.exit(1);
}
const SESSION_HOURS = 12;

// secret key — full access, bypasses Row Level Security. Server-side only,
// never sent to the browser (same rule as never shipping a DB password to the client).
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

// nothing here was compressed before — a 59KB stylesheet went out as 59KB
// on the wire every time, even though the client always advertises gzip
// support; text assets (html/css/js) typically shrink 70-80% with this
app.use(compression());
app.use(express.json({ limit: '256kb' }));

function str(v) { return v == null ? '' : String(v); }

/* ============================================================
   LEAD EMAIL NOTIFICATION — via formsubmit.co, which needs no
   account or API key: the destination inbox just has to click a
   one-time "confirm" link the first time a submission arrives.
   Wrapped in try/catch with a timeout so a slow or failing email
   relay never blocks or fails the lead — it's already safely in
   Supabase and visible in the admin panel either way.
   ============================================================ */
const LEAD_NOTIFY_EMAIL = 'davidbalaish1@gmail.com';
const SERVICE_LABELS = {
  homes: 'בתים פרטיים', interior: 'עיצוב ותכנון פנים', permits: 'היתרי בנייה והסדרת חריגות',
  pools: 'בריכות שחייה', business: 'רישוי עסקים', farms: 'משקים ונחלות', other: 'אחר'
};
async function sendLeadNotification(lead) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const r = await fetch(`https://formsubmit.co/ajax/${LEAD_NOTIFY_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `פנייה חדשה מהאתר — ${lead.name || 'ללא שם'}`,
        'שם': str(lead.name), 'טלפון': str(lead.phone), 'אימייל': str(lead.email),
        'עיר': str(lead.city), 'שירות מבוקש': SERVICE_LABELS[lead.service] || str(lead.service),
        'הודעה': str(lead.message), 'הגיע מדף': str(lead.source_page)
      }),
      signal: controller.signal
    });
    if (!r.ok) console.error('Lead email failed:', r.status, await r.text().catch(() => ''));
  } catch (e) {
    console.error('Lead email error:', e.message);
  } finally {
    clearTimeout(timeout);
  }
}

/* ============================================================
   ADMIN AUTH — signed session cookie, PIN from .env
   ============================================================ */
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  raw.split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function signToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600 * 1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function verifyToken(token) {
  if (!token || token.indexOf('.') < 0) return false;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return !!(data.exp && data.exp > Date.now());
  } catch { return false; }
}
function requireAdmin(req, res, next) {
  if (!verifyToken(parseCookies(req).dba_admin)) return res.status(401).json({ error: 'unauthorized' });
  next();
}
// constant-time compare so a wrong PIN can't be discovered by timing
function pinMatches(given) {
  const a = Buffer.from(str(given));
  const b = Buffer.from(ADMIN_PIN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// 3 failed attempts per IP → locked out for 15 minutes.
const LOGIN_MAX_ATTEMPTS = 3;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
const loginAttempts = new Map();
// Vercel terminates TLS in front of the function, so the request Express
// sees is plain HTTP — check the forwarded-proto header instead of req.secure.
function isHttps(req) { return req.headers['x-forwarded-proto'] === 'https'; }
function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

app.post('/api/admin/login', (req, res) => {
  const ip = clientIp(req);
  const now = Date.now();
  let rec = loginAttempts.get(ip);
  if (rec && rec.lockedUntil > now) {
    return res.status(429).json({ error: 'too_many_attempts', minutesLeft: Math.ceil((rec.lockedUntil - now) / 60000) });
  }
  if (rec && rec.lockedUntil && rec.lockedUntil <= now) rec = null;

  if (!pinMatches((req.body || {}).pin)) {
    const count = (rec ? rec.count : 0) + 1;
    if (count >= LOGIN_MAX_ATTEMPTS) {
      loginAttempts.set(ip, { count: 0, lockedUntil: now + LOGIN_LOCKOUT_MS });
      return res.status(429).json({ error: 'too_many_attempts', minutesLeft: Math.ceil(LOGIN_LOCKOUT_MS / 60000) });
    }
    loginAttempts.set(ip, { count, lockedUntil: 0 });
    return res.status(401).json({ error: 'bad_pin', attemptsLeft: LOGIN_MAX_ATTEMPTS - count });
  }
  loginAttempts.delete(ip);
  res.setHeader('Set-Cookie',
    `dba_admin=${signToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${isHttps(req) ? '; Secure' : ''}`);
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', `dba_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${isHttps(req) ? '; Secure' : ''}`);
  res.json({ ok: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => res.json({ ok: true }));

/* ========== PUBLIC: capture a lead ========== */
app.post('/api/lead', async (req, res) => {
  const b = req.body || {};
  const { error } = await supabase.from('leads').insert({
    name: str(b.name), phone: str(b.phone), email: str(b.email), city: str(b.city),
    service: str(b.service), message: str(b.message), source_page: str(b.source_page),
    source_url: str(b.source_url), project_ref: str(b.project_ref)
  });
  if (error) return res.status(500).json({ error: 'insert_failed' });
  await sendLeadNotification(b);
  res.json({ ok: true });
});

/* ========== PUBLIC: capture analytics events (batch) ========== */
app.post('/api/track', async (req, res) => {
  const events = Array.isArray(req.body && req.body.events) ? req.body.events : [];
  const rows = events.slice(0, 50).map(ev => ({
    session_id: str(ev.session_id), event_type: str(ev.event_type), page: str(ev.page),
    target: str(ev.target), device: str(ev.device), referrer_source: str(ev.referrer_source),
    referrer: str(ev.referrer),
    duration_ms: Number.isFinite(ev.duration_ms) ? Math.round(ev.duration_ms) : null
  }));
  if (!rows.length) return res.json({ ok: true });
  const { error } = await supabase.from('analytics_events').insert(rows);
  if (error) return res.status(500).json({ error: 'insert_failed' });
  res.json({ ok: true });
});

/* ========== PUBLIC: projects (for the website) ========== */
// gallery comes back from Supabase as a parsed array (jsonb) — re-stringify
// it so the response shape matches what the frontend has always expected
// (it does JSON.parse(p.gallery)), with no frontend changes required.
function serializeProject(p) {
  return { ...p, gallery: p.gallery ? JSON.stringify(p.gallery) : null };
}
app.get('/api/projects', async (req, res) => {
  const cat = str(req.query.category).trim();
  let query = supabase.from('projects').select('*').order('sort_order', { ascending: false }).order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'query_failed' });
  let rows = data.map(serializeProject);
  if (cat && cat !== 'all') {
    rows = rows.filter(p => String(p.category || '').split(',').map(s => s.trim()).indexOf(cat) > -1);
  }
  res.json({ projects: rows });
});
app.get('/api/projects/:id', async (req, res) => {
  const { data, error } = await supabase.from('projects').select('*').eq('id', Number(req.params.id)).maybeSingle();
  if (error || !data) return res.status(404).json({ error: 'not_found' });
  res.json({ project: serializeProject(data) });
});

/* ========== PUBLIC: success stories (for the website) ========== */
app.get('/api/stories', async (req, res) => {
  const cat = str(req.query.category).trim();
  const { data, error } = await supabase.from('stories').select('*').eq('published', true)
    .order('sort_order', { ascending: false }).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'query_failed' });
  let rows = data;
  if (cat && cat !== 'all') rows = rows.filter(s => String(s.category || '').trim() === cat);
  res.json({ stories: rows });
});

/* ========== PUBLIC: site settings (homepage stats) ========== */
app.get('/api/settings', async (req, res) => {
  const { data, error } = await supabase.from('settings').select('key,value');
  if (error) return res.status(500).json({ error: 'query_failed' });
  const out = {};
  data.forEach(r => { out[r.key] = r.value; });
  res.json(out);
});

/* ============================================================
   ADMIN API — everything below requires a valid session
   ============================================================ */

/* ---------- leads ---------- */
app.get('/api/admin/leads', requireAdmin, async (req, res) => {
  const q = str(req.query.q).trim();
  const service = str(req.query.service).trim();
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(1000);
  if (service) query = query.eq('service', service);
  if (q) {
    // escape PostgREST's or() delimiters so a comma or paren in the search
    // box can't break out of the filter expression
    const safe = q.replace(/[,()]/g, ' ');
    query = query.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%,city.ilike.%${safe}%,message.ilike.%${safe}%`);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'query_failed' });
  res.json({ leads: data });
});

app.delete('/api/admin/leads/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'delete_failed' });
  res.json({ ok: true });
});

/* ---------- dashboard stats ---------- */
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('leads').select('created_at,service');
  if (error) return res.status(500).json({ error: 'query_failed' });
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 864e5);
  const counts = { total: data.length, today: 0, week: 0, month: 0 };
  const byService = {};
  data.forEach(l => {
    const d = new Date(l.created_at);
    if (d >= startOfDay) counts.today++;
    if (d >= weekAgo) counts.week++;
    if (d >= startOfMonth) counts.month++;
    const label = str(l.service).trim() || 'לא צויין';
    byService[label] = (byService[label] || 0) + 1;
  });
  res.json({
    ...counts,
    services: Object.keys(byService).map(label => ({ label, n: byService[label] })).sort((a, b) => b.n - a.n)
  });
});

/* ---------- analytics ---------- */
app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('analytics_events')
    .select('created_at,session_id,event_type,page,target,device,referrer_source,duration_ms')
    .order('created_at', { ascending: false }).limit(20000);
  if (error) return res.status(500).json({ error: 'query_failed' });

  const tally = (rows, pick, fallback) => {
    const m = {};
    rows.forEach(r => { const k = str(pick(r)).trim() || fallback; m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(label => ({ label, n: m[label] })).sort((a, b) => b.n - a.n);
  };
  const views = data.filter(e => e.event_type === 'pageview');
  const clicks = data.filter(e => e.event_type === 'click');
  const times = data.filter(e => e.event_type === 'page_time' && e.duration_ms > 0);

  const days = [];
  for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));
  const byDay = {};
  views.forEach(v => { const d = str(v.created_at).slice(0, 10); byDay[d] = (byDay[d] || 0) + 1; });

  res.json({
    totalViews: views.length,
    totalClicks: clicks.length,
    uniqueSessions: new Set(data.map(e => e.session_id).filter(Boolean)).size,
    avgTimeMs: times.length ? times.reduce((s, t) => s + t.duration_ms, 0) / times.length : 0,
    devices: tally(views, r => r.device, 'לא ידוע'),
    sources: tally(views, r => r.referrer_source, 'ישיר'),
    topPages: tally(views, r => r.page, '/').slice(0, 8),
    topClicks: tally(clicks, r => r.target, '—').slice(0, 8),
    viewsByDay: days.map(label => ({ label, n: byDay[label] || 0 }))
  });
});

/* ---------- projects CRUD ---------- */
function projectFields(b) {
  const gallery = Array.isArray(b.gallery) ? b.gallery.filter(Boolean) : [];
  return {
    title: str(b.title), city: str(b.city), category: str(b.category),
    image_url: str(b.image_url), summary: str(b.summary), challenge: str(b.challenge),
    solution: str(b.solution), result: str(b.result),
    featured: !!b.featured,
    sort_order: Number.isFinite(+b.sort_order) ? +b.sort_order : 0,
    gallery: gallery.length ? gallery : null,
    meta_title: str(b.meta_title) || null, meta_description: str(b.meta_description) || null
  };
}
app.post('/api/admin/projects', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('projects').insert(projectFields(req.body || {})).select().single();
  if (error) return res.status(500).json({ error: 'insert_failed' });
  res.json({ ok: true, id: data.id });
});
app.put('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('projects').update(projectFields(req.body || {})).eq('id', Number(req.params.id));
  if (error) return res.status(500).json({ error: 'update_failed' });
  res.json({ ok: true });
});
app.delete('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('projects').delete().eq('id', Number(req.params.id));
  if (error) return res.status(500).json({ error: 'delete_failed' });
  res.json({ ok: true });
});

/* ---------- stories CRUD ---------- */
app.get('/api/admin/stories', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('stories').select('*')
    .order('sort_order', { ascending: false }).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'query_failed' });
  res.json({ stories: data });
});
function storyFields(b) {
  return {
    title: str(b.title), client: str(b.client), category: str(b.category),
    image_url: str(b.image_url), situation: str(b.situation), action: str(b.action),
    result: str(b.result), quote: str(b.quote),
    published: !!b.published,
    sort_order: Number.isFinite(+b.sort_order) ? +b.sort_order : 0,
    meta_title: str(b.meta_title) || null, meta_description: str(b.meta_description) || null
  };
}
app.post('/api/admin/stories', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('stories').insert(storyFields(req.body || {})).select().single();
  if (error) return res.status(500).json({ error: 'insert_failed' });
  res.json({ ok: true, id: data.id });
});
app.put('/api/admin/stories/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('stories').update(storyFields(req.body || {})).eq('id', Number(req.params.id));
  if (error) return res.status(500).json({ error: 'update_failed' });
  res.json({ ok: true });
});
app.delete('/api/admin/stories/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('stories').delete().eq('id', Number(req.params.id));
  if (error) return res.status(500).json({ error: 'delete_failed' });
  res.json({ ok: true });
});

/* ---------- settings ---------- */
app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  const b = req.body || {};
  const rows = Object.keys(b).map(k => ({ key: k, value: str(b[k]) }));
  if (!rows.length) return res.json({ ok: true });
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
  if (error) return res.status(500).json({ error: 'save_failed' });
  res.json({ ok: true });
});

/* ---------- reset leads + analytics ---------- */
app.post('/api/admin/reset-data', requireAdmin, async (req, res) => {
  // .delete() refuses to run without a filter, so match every row via a
  // condition that is always true rather than deleting by an id list
  const a = await supabase.from('leads').delete().not('id', 'is', null);
  const b = await supabase.from('analytics_events').delete().not('id', 'is', null);
  if (a.error || b.error) return res.status(500).json({ error: 'reset_failed' });
  res.json({ ok: true });
});

/* ========== SEO: per-page META TAG overrides for the static pages ==========
   Managed from the admin panel's "הגדרות אתר" view.
   Row not found / blank title+description = the page's own file default. */
const EDITABLE_PAGES = [
  { page: 'index.html',            label: 'עמוד הבית' },
  { page: 'about.html',            label: 'מי אנחנו' },
  { page: 'services.html',         label: 'שירותים (ריכוז)' },
  { page: 'service-homes.html',    label: 'בתים פרטיים' },
  { page: 'service-interior.html', label: 'עיצוב ותכנון פנים' },
  { page: 'service-permits.html',  label: 'היתרי בנייה והסדרת חריגות' },
  { page: 'service-pools.html',    label: 'בריכות שחייה' },
  { page: 'service-business.html', label: 'רישוי עסקים' },
  { page: 'service-farms.html',    label: 'משקים ונחלות' },
  { page: 'projects.html',         label: 'פרויקטים (גלריה)' },
  { page: 'contact.html',          label: 'יצירת קשר' },
  { page: 'privacy.html',          label: 'מדיניות פרטיות' },
  { page: 'terms.html',            label: 'תנאי שימוש' },
  { page: 'accessibility.html',    label: 'הצהרת נגישות' }
];
const EDITABLE_SET = new Set(EDITABLE_PAGES.map(p => p.page));

// Pull the current <title> + meta description straight out of a page's HTML,
// so the dashboard can show the real live text as the field's placeholder.
function readFileMeta(page) {
  try {
    const html = fs.readFileSync(path.join(SITE_ROOT, page), 'utf8');
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const desc = (html.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/i) || [])[1] || '';
    return { title: title.trim(), description: desc.trim() };
  } catch (e) { return { title: '', description: '' }; }
}

app.get('/api/admin/page-meta', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('page_meta').select('page,title,description');
  if (error) return res.status(500).json({ error: 'query_failed' });
  const byPage = {};
  data.forEach(r => { byPage[r.page] = r; });
  res.json({
    pages: EDITABLE_PAGES.map(p => {
      const current = readFileMeta(p.page);
      const ov = byPage[p.page] || {};
      return {
        page: p.page, label: p.label,
        title: ov.title || '', description: ov.description || '',
        placeholderTitle: current.title, placeholderDescription: current.description
      };
    })
  });
});
app.put('/api/admin/page-meta', requireAdmin, async (req, res) => {
  const items = (Array.isArray(req.body && req.body.pages) ? req.body.pages : [])
    .filter(it => EDITABLE_SET.has(it.page));
  const toSave = [], toDelete = [];
  items.forEach(it => {
    const title = str(it.title).trim();
    const description = str(it.description).trim();
    // both blank → drop the row entirely so the page falls back to its file default
    if (!title && !description) toDelete.push(it.page);
    else toSave.push({ page: it.page, title, description });
  });
  if (toDelete.length) {
    const { error } = await supabase.from('page_meta').delete().in('page', toDelete);
    if (error) return res.status(500).json({ error: 'save_failed' });
  }
  if (toSave.length) {
    const { error } = await supabase.from('page_meta').upsert(toSave, { onConflict: 'page' });
    if (error) return res.status(500).json({ error: 'save_failed' });
  }
  res.json({ ok: true });
});

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
// Rewrite title/description (+ their Open Graph twins) in an HTML string using
// whatever override is stored for this page. Blank/absent override = untouched.
function applyMetaOverrides(html, row) {
  if (!row) return html;
  if (row.title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + escapeHtml(row.title) + '</title>');
    html = html.replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(">)/i, '$1' + escapeAttr(row.title) + '$2');
  }
  if (row.description) {
    html = html.replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(">)/i, '$1' + escapeAttr(row.description) + '$2');
    html = html.replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(">)/i, '$1' + escapeAttr(row.description) + '$2');
  }
  return html;
}

/* ========== SEO: sitemap (dynamic — project pages come from Supabase) ========== */
const SITE_URL = 'https://davidbalaish.co.il';
const STATIC_PAGES = [
  { path: '/', priority: '1.0', freq: 'weekly' },
  { path: '/about.html', priority: '0.8', freq: 'monthly' },
  { path: '/services.html', priority: '0.8', freq: 'monthly' },
  { path: '/service-homes.html', priority: '0.8', freq: 'monthly' },
  { path: '/service-interior.html', priority: '0.8', freq: 'monthly' },
  { path: '/service-permits.html', priority: '0.8', freq: 'monthly' },
  { path: '/service-pools.html', priority: '0.8', freq: 'monthly' },
  { path: '/service-business.html', priority: '0.8', freq: 'monthly' },
  { path: '/service-farms.html', priority: '0.8', freq: 'monthly' },
  { path: '/projects.html', priority: '0.9', freq: 'weekly' },
  { path: '/project-interior.html', priority: '0.5', freq: 'monthly' },
  { path: '/project-permits.html', priority: '0.5', freq: 'monthly' },
  { path: '/project-pool.html', priority: '0.5', freq: 'monthly' },
  { path: '/project-business.html', priority: '0.5', freq: 'monthly' },
  { path: '/project-farm.html', priority: '0.5', freq: 'monthly' },
  { path: '/contact.html', priority: '0.7', freq: 'yearly' },
  { path: '/privacy.html', priority: '0.2', freq: 'yearly' },
  { path: '/terms.html', priority: '0.2', freq: 'yearly' },
  { path: '/accessibility.html', priority: '0.2', freq: 'yearly' }
];
app.get('/sitemap.xml', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const { data: projects } = await supabase.from('projects').select('id,created_at');
  const urls = STATIC_PAGES.map(p =>
    `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>`
  ).concat((projects || []).map(p =>
    `  <url><loc>${SITE_URL}/project.html?id=${p.id}</loc><lastmod>${String(p.created_at || today).slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
  ));
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  );
});

/* ========== SEO: serve editable static pages with META overrides applied ==========
   Runs before express.static so the Supabase-managed <title>/description win.
   Any page without an override (or not in the editable set) just falls through. */
app.get(/.*/, async (req, res, next) => {
  if (req.method !== 'GET') return next();
  let page;
  if (req.path === '/') page = 'index.html';
  else {
    const name = req.path.replace(/^\//, '');
    page = /\.html$/i.test(name) ? name : name + '.html';
  }
  if (!EDITABLE_SET.has(page)) return next();
  fs.readFile(path.join(SITE_ROOT, page), 'utf8', async (err, html) => {
    if (err) return next();
    const { data: row } = await supabase.from('page_meta').select('title,description').eq('page', page).maybeSingle();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(applyMetaOverrides(html, row));
  });
});

/* ========== STATIC SITE ========== */
// HTML must stay no-cache (content can change via Supabase-driven SEO
// overrides). Everything else has no cache-busting (no hashed filenames), so
// a long max-age would risk serving stale CSS/JS after a real update — this
// splits the difference: images rarely change once uploaded, so they get a
// long cache; CSS/JS get a short one that still helps repeat views without
// much staleness risk.
app.use(express.static(SITE_ROOT, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (/\.html$/i.test(filePath)) res.setHeader('Cache-Control', 'no-cache');
    else if (/\.(jpg|jpeg|png|webp|svg|ico)$/i.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=604800');
    // admin*.js/css must never be cached: a stale copy that no longer matches
    // the current admin markup can throw on load, leave the login handler
    // unattached, and make the login button silently do nothing — a failure
    // that looks exactly like a wrong password. Not worth 5 minutes of caching.
    else if (/[\\/]admin[^\\/]*\.(css|js)$/i.test(filePath)) res.setHeader('Cache-Control', 'no-cache');
    else if (/\.(css|js)$/i.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    else res.setHeader('Cache-Control', 'no-cache');
  }
}));

// Vercel imports this file as a serverless function and calls the exported
// app directly per-request — it must not also bind a port itself. Running
// `node server.js` locally is still `require.main === module`, so that path
// is untouched.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`David Balaish backend running → http://localhost:${PORT}/`);
    console.log(`Manage content → https://supabase.com/dashboard/project/${process.env.SUPABASE_URL.match(/https:\/\/(.*?)\.supabase\.co/)[1]}/editor`);
  });
}

module.exports = app;
