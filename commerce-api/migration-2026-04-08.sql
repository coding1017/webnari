-- ═══════════════════════════════════════════════════════════
--  MIGRATION: 2026-04-08
--  Closes all remaining Shopify feature gaps
-- ═══════════════════════════════════════════════════════════

-- ── ALTER existing tables (add columns if missing) ───────

-- Orders: manual orders, fulfillment type, partial refunds, shipping labels
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_manual boolean NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_type text NOT NULL DEFAULT 'shipping';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_location text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS label_url text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shippo_transaction_id text;

-- Order items: partial refund tracking
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS refunded_quantity integer NOT NULL DEFAULT 0;

-- Discounts: BXGY config, auto-apply, stackable
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}';
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS auto_apply boolean NOT NULL DEFAULT false;

-- Customers: email verification, OAuth
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS verification_token text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS verification_token_expires timestamptz;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS oauth_provider text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS oauth_provider_id text;

-- Store admins: RBAC permissions, API keys, contact info
ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS permissions text[];
ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS api_key_hash text;
ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS email text;

-- Products: digital product fields, dimensions, SEO
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'physical';
ALTER TABLE products ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_downloads integer DEFAULT 3;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_collection boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_oz numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_in numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS width_in numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height_in numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description text;


-- ── NEW tables ───────────────────────────────────────────

-- Product Tags
CREATE TABLE IF NOT EXISTS product_tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag        text NOT NULL,
  UNIQUE(product_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_product_tags_store_tag ON product_tags(store_id, tag);
CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id);

-- URL Redirects
CREATE TABLE IF NOT EXISTS redirects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  from_path   text NOT NULL,
  to_path     text NOT NULL,
  status_code integer NOT NULL DEFAULT 301,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, from_path)
);
CREATE INDEX IF NOT EXISTS idx_redirects_store ON redirects(store_id);
CREATE INDEX IF NOT EXISTS idx_redirects_lookup ON redirects(store_id, from_path) WHERE active = true;

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  template_key  text NOT NULL,
  subject       text NOT NULL,
  html_body     text NOT NULL,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, template_key)
);
CREATE INDEX IF NOT EXISTS idx_email_templates_store ON email_templates(store_id, template_key);

-- Customer Segments
CREATE TABLE IF NOT EXISTS customer_segments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        text NOT NULL,
  color       text NOT NULL DEFAULT '#6366f1',
  auto_rules  jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_segments_store ON customer_segments(store_id);

CREATE TABLE IF NOT EXISTS customer_segment_members (
  customer_id  uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  segment_id   uuid NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  added_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, segment_id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id               text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id            uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id             text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id             uuid REFERENCES variants(id),
  status                 text NOT NULL DEFAULT 'active',
  billing_interval       text NOT NULL DEFAULT 'monthly',
  price_cents            integer NOT NULL,
  quantity               integer NOT NULL DEFAULT 1,
  stripe_subscription_id text,
  stripe_price_id        text,
  trial_ends_at          timestamptz,
  current_period_start   timestamptz NOT NULL DEFAULT now(),
  current_period_end     timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  cancelled_at           timestamptz,
  cancel_at_period_end   boolean NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_store ON subscriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(store_id, status);

-- Inventory Locations
CREATE TABLE IF NOT EXISTS inventory_locations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        text NOT NULL,
  address     text,
  type        text NOT NULL DEFAULT 'warehouse',
  is_default  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_store ON inventory_locations(store_id);

-- Location Stock
CREATE TABLE IF NOT EXISTS location_stock (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     uuid NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
  product_id      text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id      uuid REFERENCES variants(id),
  stock_quantity  integer NOT NULL DEFAULT 0,
  reorder_point   integer NOT NULL DEFAULT 5,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(location_id, product_id, variant_id)
);
CREATE INDEX IF NOT EXISTS idx_location_stock_product ON location_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_location_stock_location ON location_stock(location_id);

-- Inventory Transfers
CREATE TABLE IF NOT EXISTS inventory_transfers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  from_location_id  uuid NOT NULL REFERENCES inventory_locations(id),
  to_location_id    uuid NOT NULL REFERENCES inventory_locations(id),
  product_id        text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id        uuid REFERENCES variants(id),
  quantity          integer NOT NULL,
  status            text NOT NULL DEFAULT 'pending',
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  received_at       timestamptz
);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_store ON inventory_transfers(store_id);


-- ═══════════════════════════════════════════════════════════
--  DONE. All tables and columns are now in sync.
-- ═══════════════════════════════════════════════════════════
