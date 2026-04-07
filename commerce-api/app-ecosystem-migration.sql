-- ============================================================
-- App Ecosystem Migration
-- Webhook infrastructure + App marketplace foundation
-- ============================================================

-- ------------------------------------------------------------
-- 1. webhook_endpoints — registered webhook URLs per store
-- ------------------------------------------------------------
create table if not exists webhook_endpoints (
  id          text primary key default gen_random_uuid()::text,
  store_id    text not null references stores(id) on delete cascade,
  url         text not null,
  secret      text not null,
  events      text[] not null default '{}',
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_webhook_endpoints_store on webhook_endpoints(store_id);
create index if not exists idx_webhook_endpoints_active on webhook_endpoints(store_id) where is_active = true;

-- ------------------------------------------------------------
-- 2. webhook_deliveries — delivery log with retry tracking
-- ------------------------------------------------------------
create table if not exists webhook_deliveries (
  id              text primary key default gen_random_uuid()::text,
  webhook_id      text not null references webhook_endpoints(id) on delete cascade,
  store_id        text not null references stores(id) on delete cascade,
  event_type      text not null,
  payload         jsonb not null,
  response_status integer,
  response_body   text,
  response_ms     integer,
  attempt         integer not null default 1,
  status          text not null default 'pending',
  next_retry_at   timestamptz,
  error           text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_webhook_deliveries_store on webhook_deliveries(store_id);
create index if not exists idx_webhook_deliveries_webhook on webhook_deliveries(webhook_id);
create index if not exists idx_webhook_deliveries_retry on webhook_deliveries(next_retry_at) where status = 'retrying';
create index if not exists idx_webhook_deliveries_recent on webhook_deliveries(store_id, created_at desc);

-- ------------------------------------------------------------
-- 3. apps — marketplace registry of first- and third-party apps
-- ------------------------------------------------------------
create table if not exists apps (
  id              text primary key,
  name            text not null,
  description     text,
  icon_url        text,
  developer_name  text not null default 'Webnari',
  developer_url   text,
  category        text,
  required_scopes text[] not null default '{}',
  webhook_events  text[] not null default '{}',
  is_first_party  boolean not null default true,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. app_installations — per-store app install records
-- ------------------------------------------------------------
create table if not exists app_installations (
  id           text primary key default gen_random_uuid()::text,
  store_id     text not null references stores(id) on delete cascade,
  app_id       text not null references apps(id) on delete cascade,
  status       text not null default 'active',
  scopes       text[] not null default '{}',
  config       jsonb not null default '{}',
  installed_at timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(store_id, app_id)
);
create index if not exists idx_app_installations_store on app_installations(store_id);
create index if not exists idx_app_installations_app on app_installations(app_id);

-- ------------------------------------------------------------
-- 5. Row-Level Security — service role only (same as orders)
-- ------------------------------------------------------------
alter table webhook_endpoints enable row level security;
alter table webhook_deliveries enable row level security;
alter table apps enable row level security;
alter table app_installations enable row level security;

-- No public policies — only the service role can access these tables.

-- ------------------------------------------------------------
-- 6. Triggers — auto-update updated_at
-- ------------------------------------------------------------
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_webhook_endpoints_updated_at
  before update on webhook_endpoints
  for each row execute function update_updated_at();

create trigger trg_app_installations_updated_at
  before update on app_installations
  for each row execute function update_updated_at();

-- ------------------------------------------------------------
-- 7. Seed — first-party integrations
-- ------------------------------------------------------------
INSERT INTO apps (id, name, description, category, required_scopes, webhook_events, is_first_party, is_published) VALUES
  ('square',          'Square',                       'Sync products and inventory with Square POS',                                'point-of-sale',  ARRAY['products:read','products:write','inventory:read','inventory:write','orders:read'], ARRAY['product.updated','inventory.updated'],                          true, true),
  ('quickbooks',      'QuickBooks',                   'Sync orders and customers to QuickBooks Online for accounting',              'accounting',     ARRAY['orders:read','customers:read','products:read'],                                   ARRAY['order.created','customer.created'],                             true, true),
  ('stripe-connect',  'Stripe Connect',               'Accept payments through your own Stripe account',                            'payments',       ARRAY['orders:read','orders:write'],                                                     ARRAY['order.created'],                                                true, true),
  ('ga4',             'Google Analytics 4',            'Server-side e-commerce event tracking that bypasses ad blockers',            'analytics',      ARRAY['orders:read'],                                                                    ARRAY['order.created'],                                                true, true),
  ('twilio-sms',      'SMS & WhatsApp Notifications',  'Instant SMS/WhatsApp alerts for new orders, low stock, and reviews',        'communication',  ARRAY['orders:read','inventory:read','reviews:read'],                                    ARRAY['order.created','inventory.low_stock','review.submitted'],        true, true),
  ('google-business', 'Google Business Profile',       'Auto-post products to Google, pull Google reviews for centralized management', 'marketing',   ARRAY['products:read','reviews:read','reviews:write','blog:read'],                        ARRAY['product.created','blog.published','review.approved'],           true, true),
  ('mailchimp',       'Mailchimp',                     'Sync customers and purchase history for segmented email campaigns',          'marketing',      ARRAY['customers:read','orders:read'],                                                   ARRAY['customer.created','order.created','cart.abandoned'],            true, true),
  ('zapier',          'Zapier',                        'Connect to 7,000+ apps via Zapier — forward any event to your Zaps',        'automation',     ARRAY['*'],                                                                              ARRAY['*'],                                                            true, true)
ON CONFLICT (id) DO NOTHING;
