-- ============================================================
-- David Balaish Architecture — Supabase schema
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- It creates every table the site needs (leads, analytics, projects,
-- stories, settings, page-level SEO overrides) with Row-Level-Security
-- so the public site can read published content and submit leads, while
-- the server (using the secret key, which bypasses RLS) has full access
-- for everything else. Manage all the data directly in the Table Editor —
-- there is no separate custom admin panel anymore.
-- ============================================================

-- ---------- LEADS: contact-form submissions ----------
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text,
  phone        text,
  email        text,
  city         text,
  service      text,
  message      text,
  source_page  text,
  source_url   text,
  project_ref  text
);

-- ---------- ANALYTICS: pageviews, clicks, time-on-page ----------
create table if not exists public.analytics_events (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  session_id       text,
  event_type       text,          -- 'pageview' | 'click' | 'page_time'
  page             text,          -- e.g. '/index.html'
  target           text,          -- for clicks: label of the button/link
  device           text,          -- 'mobile' | 'desktop'
  referrer_source  text,          -- 'google' | 'social' | 'direct' | 'other'
  referrer         text,          -- raw referrer url
  duration_ms      integer,       -- for page_time events
  meta             jsonb
);

-- ---------- PROJECTS: the portfolio ----------
create table if not exists public.projects (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  title             text,
  city              text,
  category          text,          -- comma-separated tags: homes,interior,permits,pools,business,farms
  image_url         text,
  summary           text,
  challenge         text,
  solution          text,
  result            text,
  featured          boolean default false,
  sort_order        integer default 0,
  gallery           jsonb,         -- array of extra image URLs for the project detail page
  meta_title        text,          -- SEO <title> override (blank = auto from title)
  meta_description  text           -- SEO meta description override (blank = auto from summary)
);

-- ---------- STORIES: client success stories / testimonials ----------
create table if not exists public.stories (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  title             text,
  client            text,          -- "משפחת כהן, תל אביב"
  category          text,          -- single tag, matches project categories
  image_url         text,
  situation         text,
  action            text,
  result            text,
  quote             text,
  published         boolean default true,
  sort_order        integer default 0,
  meta_title        text,
  meta_description  text
);

-- ---------- SETTINGS: homepage stat numbers ----------
create table if not exists public.settings (
  key   text primary key,
  value text
);

-- ---------- PAGE_META: SEO title/description overrides for static pages ----------
create table if not exists public.page_meta (
  page        text primary key,   -- e.g. "index.html", "about.html"
  title       text,
  description text
);

create index if not exists idx_leads_created     on public.leads (created_at desc);
create index if not exists idx_events_created    on public.analytics_events (created_at desc);
create index if not exists idx_events_type       on public.analytics_events (event_type);
create index if not exists idx_projects_sort     on public.projects (sort_order desc, created_at desc);
create index if not exists idx_stories_sort      on public.stories (sort_order desc, created_at desc);

-- ---------- Row Level Security ----------
alter table public.leads            enable row level security;
alter table public.analytics_events enable row level security;
alter table public.projects         enable row level security;
alter table public.stories          enable row level security;
alter table public.settings         enable row level security;
alter table public.page_meta        enable row level security;

-- Public (anon) may INSERT only — visitors submit leads / send analytics.
drop policy if exists "anon insert leads"  on public.leads;
create policy "anon insert leads"  on public.leads
  for insert to anon, authenticated with check (true);

drop policy if exists "anon insert events" on public.analytics_events;
create policy "anon insert events" on public.analytics_events
  for insert to anon, authenticated with check (true);

-- Only the server (secret key, bypasses RLS) may read/delete leads and
-- analytics — this protects customer PII. No public policy needed here.

-- Public (anon) may READ projects, stories, settings, page_meta — this is
-- all public marketing content the website itself displays to visitors.
drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects
  for select to anon, authenticated using (true);

drop policy if exists "public read stories" on public.stories;
create policy "public read stories" on public.stories
  for select to anon, authenticated using (true);

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings
  for select to anon, authenticated using (true);

drop policy if exists "public read page_meta" on public.page_meta;
create policy "public read page_meta" on public.page_meta
  for select to anon, authenticated using (true);

-- Writes to projects/stories/settings/page_meta happen only through the
-- Supabase Table Editor (as the project owner) or the server's secret key —
-- both bypass RLS, so no public write policy is defined for these tables.
