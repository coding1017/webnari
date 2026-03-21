-- ═══════════════════════════════════════════════════════════
--  Webnari — Supabase Schema
--  Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════

-- ── 1. Profiles (links auth users to roles) ──────────────
create table if not exists profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  role      text not null check (role in ('admin', 'client')),
  name      text,
  initials  text,
  client_id text   -- for client users: matches their client record id in agency_db
);

-- Auto-create a blank profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, role, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'client'), new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ── 2. Agency DB (entire dashboard state per admin) ──────
-- Stores the full DB object as JSONB — one row per admin account.
-- This means zero changes to existing JS data access patterns.
create table if not exists agency_db (
  id         uuid primary key default gen_random_uuid(),
  admin_id   uuid references auth.users(id) on delete cascade unique,
  data       jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Auto-update timestamp on save
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_updated_at on agency_db;
create trigger set_updated_at
  before update on agency_db
  for each row execute procedure touch_updated_at();


-- ── 3. Form Submissions (leads from client websites) ──────
-- Clients' websites POST here. Each row tagged with client_slug
-- so the admin can filter by client in the dashboard.
create table if not exists form_submissions (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references auth.users(id) on delete cascade,
  client_slug text not null,  -- matches client id in agency_db
  type        text default 'lead',  -- 'lead' | 'contact' | 'quote'
  name        text,
  email       text,
  phone       text,
  message     text,
  source      text,
  data        jsonb default '{}',  -- any extra fields
  created_at  timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

-- profiles: users can read their own profile only
alter table profiles enable row level security;
create policy "Own profile only" on profiles
  for all using (auth.uid() = id);

-- agency_db: admin can only read/write their own data
alter table agency_db enable row level security;
create policy "Admin owns their data" on agency_db
  for all using (auth.uid() = admin_id);

-- form_submissions: admin can read submissions for their clients
alter table form_submissions enable row level security;
create policy "Admin reads own submissions" on form_submissions
  for select using (auth.uid() = admin_id);

-- Allow anonymous inserts so client websites can submit forms
-- without requiring the visitor to be logged in
create policy "Anyone can submit a form" on form_submissions
  for insert with check (true);


-- ═══════════════════════════════════════════════════════════
--  INITIAL ADMIN USER
-- ═══════════════════════════════════════════════════════════
-- After running this schema, create your admin account in:
--   Supabase Dashboard → Authentication → Users → Add User
-- Then run:
--   insert into profiles (id, role, name, initials)
--   values ('<your-user-uuid>', 'admin', 'Luis Ballen', 'LB');
