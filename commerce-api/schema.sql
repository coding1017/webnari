-- ═══════════════════════════════════════════════════════════
--  Webnari Commerce API — Supabase Schema Migrations
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════


-- ── 1. Stores (multi-tenant config) ─────────────────────────
create table if not exists stores (
  id                    text primary key,                -- 'wookwear', 'bridgecitysoles'
  name                  text not null,
  domain                text,                            -- 'wookwearshop.com'
  currency              text not null default 'usd',
  payment_provider      text not null default 'stripe',  -- 'stripe' | 'square' | 'both'
  stripe_publishable_key text,
  square_application_id  text,
  square_location_id     text,
  shipping_rules        jsonb not null default '[]',     -- [{min: 0, max: 99.99, cost: 15}, {min: 100, max: null, cost: 0}]
  settings              jsonb not null default '{}',     -- {email, logo, returnPolicy, etc.}
  created_at            timestamptz not null default now()
);


-- ── 2. Store Tax Rates ──────────────────────────────────────
create table if not exists store_tax_rates (
  id        uuid primary key default gen_random_uuid(),
  store_id  text not null references stores(id) on delete cascade,
  state     text not null,          -- 'FL', 'CA', etc.
  rate      numeric(5,4) not null,  -- 0.0700 = 7%
  label     text not null default 'Sales Tax',
  unique(store_id, state)
);


-- ── 3. Products ─────────────────────────────────────────────
-- Add multi-tenancy + inventory columns to existing products table.
-- If you already have a products table, run the ALTER statements instead.

create table if not exists products (
  id                 text primary key default gen_random_uuid()::text,
  store_id           text not null references stores(id) on delete cascade,
  name               text not null,
  slug               text,
  category           text,
  description        text,
  price              integer not null default 0,         -- cents
  compare_at_price   integer,                            -- cents, for "was $X" display
  badge              text,                               -- 'NEW', 'SOLD OUT', 'LIMITED'
  in_stock           boolean not null default true,
  track_inventory    boolean not null default true,
  stock_quantity     integer not null default 0,
  low_stock_threshold integer not null default 5,
  is_collection      boolean not null default false,
  rating             numeric(2,1),
  stripe_price_id    text,
  square_catalog_id  text,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_products_store on products(store_id);
create index if not exists idx_products_slug on products(store_id, slug);


-- ── 4. Product Images ───────────────────────────────────────
create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order integer not null default 0
);


-- ── 5. Variants ─────────────────────────────────────────────
create table if not exists variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     text not null references products(id) on delete cascade,
  name           text not null,
  sku            text,
  color          text,
  size           text,
  price          integer,              -- cents, overrides product price if set
  in_stock       boolean not null default true,
  stock_quantity integer not null default 0,
  sort_order     integer not null default 0
);

create index if not exists idx_variants_product on variants(product_id);


-- ── 6. Variant Images ───────────────────────────────────────
create table if not exists variant_images (
  id         uuid primary key default gen_random_uuid(),
  variant_id uuid not null references variants(id) on delete cascade,
  url        text not null,
  sort_order integer not null default 0
);


-- ── 7. Orders ───────────────────────────────────────────────
create table if not exists orders (
  id                     uuid primary key default gen_random_uuid(),
  store_id               text not null references stores(id),
  order_number           text not null,
  payment_provider       text,                            -- 'stripe' | 'square'
  stripe_session_id      text,
  stripe_payment_intent  text,
  square_payment_id      text,
  status                 text not null default 'pending',  -- pending | confirmed | processing | shipped | delivered | cancelled | refunded
  customer_email         text not null,
  customer_name          text,
  customer_phone         text,
  shipping_address       jsonb,                            -- {line1, line2, city, state, zip, country}
  subtotal               integer not null default 0,       -- cents
  shipping               integer not null default 0,       -- cents
  tax                    integer not null default 0,       -- cents
  total                  integer not null default 0,       -- cents
  tracking_number        text,
  tracking_url           text,
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_orders_store on orders(store_id);
create index if not exists idx_orders_email on orders(customer_email);
create index if not exists idx_orders_number on orders(store_id, order_number);


-- ── 8. Order Items ──────────────────────────────────────────
create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   text not null,
  variant_id   uuid,
  product_name text not null,
  variant_name text,
  sku          text,
  price        integer not null,     -- cents, price at time of purchase
  quantity     integer not null,
  image_url    text
);


-- ── 9. Inventory Reservations ───────────────────────────────
-- Hold stock during checkout (30 min TTL)
create table if not exists inventory_reservations (
  id          uuid primary key default gen_random_uuid(),
  store_id    text not null references stores(id),
  session_id  text not null,          -- Stripe/Square session ID
  product_id  text not null,
  variant_id  uuid,
  quantity    integer not null,
  status      text not null default 'held',  -- 'held' | 'completed' | 'expired'
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_reservations_session on inventory_reservations(session_id);
create index if not exists idx_reservations_expires on inventory_reservations(expires_at) where status = 'held';


-- ── 10. Reviews ─────────────────────────────────────────────
create table if not exists reviews (
  id         uuid primary key default gen_random_uuid(),
  store_id   text not null references stores(id),
  product_id text not null references products(id) on delete cascade,
  name       text not null,
  email      text,
  text       text not null,
  rating     integer not null check (rating between 1 and 5),
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product on reviews(product_id) where approved = true;


-- ── 11. Newsletter Subscribers ──────────────────────────────
create table if not exists newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  store_id        text not null references stores(id),
  email           text not null,
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unique(store_id, email)
);


-- ── 12. Wishlist ────────────────────────────────────────────
create table if not exists wishlist_items (
  id         uuid primary key default gen_random_uuid(),
  store_id   text not null references stores(id),
  session_id text not null,
  product_id text not null,
  variant_id uuid,
  created_at timestamptz not null default now(),
  unique(store_id, session_id, product_id, variant_id)
);


-- ── 13. Discounts ───────────────────────────────────────────
create table if not exists discounts (
  id                 text primary key default gen_random_uuid()::text,
  store_id           text not null references stores(id) on delete cascade,
  code               text not null,
  type               text not null default 'percentage',  -- 'percentage' | 'fixed' | 'free_shipping' | 'bxgy'
  value              numeric(10,2) not null default 0,    -- percent or cents
  min_order          integer default 0,                   -- cents
  max_uses           integer,
  used_count         integer not null default 0,
  is_active          boolean not null default true,
  starts_at          timestamptz,
  expires_at         timestamptz,
  created_at         timestamptz not null default now(),
  unique(store_id, code)
);

create index if not exists idx_discounts_store on discounts(store_id);


-- ── 14. Blog Posts (was 13) ──────────────────────────────────────────
create table if not exists blog_posts (
  id                 text primary key default gen_random_uuid()::text,
  store_id           text not null references stores(id) on delete cascade,
  title              text not null,
  slug               text,
  excerpt            text,
  content            text,
  category           text,
  read_time          integer,
  image_url          text,
  published          boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_blog_store on blog_posts(store_id);
create index if not exists idx_blog_slug on blog_posts(store_id, slug);


-- ── 14. Gift Cards ──────────────────────────────────────────
create table if not exists gift_cards (
  id                 text primary key default gen_random_uuid()::text,
  store_id           text not null references stores(id) on delete cascade,
  code               text not null,
  initial_balance    integer not null default 0,   -- cents
  current_balance    integer not null default 0,   -- cents
  purchaser_email    text,
  recipient_email    text,
  recipient_name     text,
  message            text,
  is_active          boolean not null default true,
  expires_at         timestamptz,
  created_at         timestamptz not null default now(),
  unique(store_id, code)
);

create index if not exists idx_giftcards_store on gift_cards(store_id);
create index if not exists idx_giftcards_code on gift_cards(store_id, code);


-- ── 15. Glossary Terms ──────────────────────────────────────
create table if not exists glossary_terms (
  id                 text primary key default gen_random_uuid()::text,
  store_id           text not null references stores(id) on delete cascade,
  term               text not null,
  slug               text,
  definition         text not null,
  category           text,                    -- e.g. "materials", "techniques", "care"
  image_url          text,
  sort_order         integer not null default 0,
  is_published       boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_glossary_store on glossary_terms(store_id);
create index if not exists idx_glossary_slug on glossary_terms(store_id, slug);


-- ── 16. Store Admins ────────────────────────────────────────
-- Maps Supabase Auth users to stores they can manage
create table if not exists store_admins (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null,
  store_id text not null references stores(id) on delete cascade,
  role     text not null default 'owner',  -- 'owner' | 'manager'
  created_at timestamptz not null default now(),
  unique(user_id, store_id)
);

create index if not exists idx_store_admins_user on store_admins(user_id);


-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

-- Stores: public read (for publishable keys, shipping rules display)
alter table stores enable row level security;
create policy "Public read stores" on stores for select using (true);

-- Tax rates: service role only (internal calculation)
alter table store_tax_rates enable row level security;

-- Products: public read
alter table products enable row level security;
create policy "Public read products" on products for select using (true);

-- Product images: public read
alter table product_images enable row level security;
create policy "Public read product_images" on product_images for select using (true);

-- Variants: public read
alter table variants enable row level security;
create policy "Public read variants" on variants for select using (true);

-- Variant images: public read
alter table variant_images enable row level security;
create policy "Public read variant_images" on variant_images for select using (true);

-- Orders: no public access (service role only)
alter table orders enable row level security;

-- Order items: no public access (service role only)
alter table order_items enable row level security;

-- Inventory reservations: no public access (service role only)
alter table inventory_reservations enable row level security;

-- Reviews: public read approved only
alter table reviews enable row level security;
create policy "Public read approved reviews" on reviews for select using (approved = true);
create policy "Anyone can submit review" on reviews for insert with check (true);

-- Newsletter: public insert only
alter table newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on newsletter_subscribers for insert with check (true);

-- Wishlist: read/write by session
alter table wishlist_items enable row level security;
create policy "Read own wishlist" on wishlist_items for select using (true);
create policy "Add to wishlist" on wishlist_items for insert with check (true);
create policy "Remove from wishlist" on wishlist_items for delete using (true);

-- Discounts: no public access (service role only)
alter table discounts enable row level security;

-- Blog posts: public read published posts
alter table blog_posts enable row level security;
create policy "Public read published blog" on blog_posts for select using (published = true);

-- Gift cards: no public access (service role only)
alter table gift_cards enable row level security;

-- Glossary: public read published terms
alter table glossary_terms enable row level security;
create policy "Public read published glossary" on glossary_terms for select using (is_published = true);

-- Store admins: users can read their own store assignments
alter table store_admins enable row level security;
create policy "Read own admin access" on store_admins for select using (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
--  HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Auto-update updated_at on orders
create or replace function touch_order_updated()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_order_updated
  before update on orders
  for each row execute procedure touch_order_updated();

-- Auto-update updated_at on products
create or replace function touch_product_updated()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_product_updated
  before update on products
  for each row execute procedure touch_product_updated();

-- Auto-update updated_at on blog_posts
create or replace function touch_blog_updated()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_blog_updated
  before update on blog_posts
  for each row execute procedure touch_blog_updated();

-- Auto-update updated_at on glossary_terms
create or replace function touch_glossary_updated()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_glossary_updated
  before update on glossary_terms
  for each row execute procedure touch_glossary_updated();

-- Generate order number (store prefix + timestamp-based)
create or replace function generate_order_number(p_store_id text)
returns text language plpgsql as $$
declare
  prefix text;
  seq int;
begin
  prefix := upper(left(p_store_id, 3));
  select count(*) + 1 into seq from orders where store_id = p_store_id;
  return prefix || '-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(seq::text, 4, '0');
end;
$$;


-- ═══════════════════════════════════════════════════════════
--  SEED: Wook Wear Store
-- ═══════════════════════════════════════════════════════════
insert into stores (id, name, domain, payment_provider, shipping_rules, settings)
values (
  'wookwear',
  'Wook Wear',
  'wookwearshop.com',
  'stripe',
  '[{"min_total": 0, "max_total": 9999, "cost": 800, "label": "Standard Shipping"}, {"min_total": 10000, "max_total": null, "cost": 0, "label": "Free Shipping"}]',
  '{"email": "wookwear@example.com", "instagram": "@wook.wear"}'
) on conflict (id) do nothing;

-- Florida 7% tax rate for Wook Wear
insert into store_tax_rates (store_id, state, rate, label)
values ('wookwear', 'FL', 0.0700, 'Florida Sales Tax')
on conflict (store_id, state) do nothing;


-- ═══════════════════════════════════════════════════════════
--  SEED: Latinas Be Like Design (LBLD)
-- ═══════════════════════════════════════════════════════════
insert into stores (id, name, domain, payment_provider, shipping_rules, settings)
values (
  'lbld',
  'Latinas Be Like Design',
  null,
  'stripe',
  '[{"min_total": 0, "max_total": 4999, "cost": 799, "label": "Standard Shipping"}, {"min_total": 5000, "max_total": null, "cost": 0, "label": "Free Shipping"}]',
  '{"email": "latinasbelikedesign@gmail.com", "categories": ["shirts","sweaters","hoodies","cups","mugs","glass-cans","hats","tumblers","3d-prints"], "custom_orders": true, "bilingual": true}'
) on conflict (id) do nothing;

-- Florida 7% tax for LBLD
insert into store_tax_rates (store_id, state, rate, label)
values ('lbld', 'FL', 0.0700, 'Florida Sales Tax')
on conflict (store_id, state) do nothing;


-- ═══════════════════════════════════════════════════════════
--  SEED: Bridge City Soles
-- ═══════════════════════════════════════════════════════════
insert into stores (id, name, domain, payment_provider, shipping_rules, settings)
values (
  'bridgecitysoles',
  'Bridge City Soles',
  null,
  'stripe',
  '[{"min_total": 0, "max_total": 19999, "cost": 1500, "label": "Standard Shipping"}, {"min_total": 20000, "max_total": null, "cost": 0, "label": "Free Shipping"}]',
  '{"email": "bridgecitysoles@gmail.com", "categories": ["sneakers"]}'
) on conflict (id) do nothing;

-- Oregon has no sales tax
insert into store_tax_rates (store_id, state, rate, label)
values ('bridgecitysoles', 'OR', 0.0000, 'No Sales Tax')
on conflict (store_id, state) do nothing;
