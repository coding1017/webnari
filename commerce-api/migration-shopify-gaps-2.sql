-- ═══════════════════════════════════════════════════════════════
--  Migration 2: Close More Shopify Gaps
--  Date: 2026-04-07
--  Features: Local pickup, split fulfillment, digital products,
--            Google Merchant feed, Meta catalog feed
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Orders: local pickup support ────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_type text NOT NULL DEFAULT 'shipping';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_location text;

-- ── 2. Products: digital product support ───────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'physical';
ALTER TABLE products ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_downloads integer DEFAULT 3;

-- ── 3. Digital Download Tokens (new table) ─────────────────────
CREATE TABLE IF NOT EXISTS download_tokens (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id        uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id   uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  product_id      text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  token           text NOT NULL UNIQUE,
  downloads_used  integer NOT NULL DEFAULT 0,
  max_downloads   integer NOT NULL DEFAULT 3,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);

-- RLS
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'download_tokens' AND policyname = 'Public read download_tokens') THEN
    CREATE POLICY "Public read download_tokens" ON download_tokens FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'download_tokens' AND policyname = 'Service write download_tokens') THEN
    CREATE POLICY "Service write download_tokens" ON download_tokens FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 4. Fulfillments (split fulfillment — new tables) ──────────
CREATE TABLE IF NOT EXISTS fulfillments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  store_id         text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  tracking_number  text,
  tracking_url     text,
  carrier          text,
  label_url        text,
  status           text NOT NULL DEFAULT 'pending',
  shipped_at       timestamptz,
  delivered_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fulfillment_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id  uuid NOT NULL REFERENCES fulfillments(id) ON DELETE CASCADE,
  order_item_id   uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  quantity        integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_fulfillments_order ON fulfillments(order_id);

-- RLS for fulfillments
ALTER TABLE fulfillments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fulfillments' AND policyname = 'Service all fulfillments') THEN
    CREATE POLICY "Service all fulfillments" ON fulfillments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE fulfillment_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fulfillment_items' AND policyname = 'Service all fulfillment_items') THEN
    CREATE POLICY "Service all fulfillment_items" ON fulfillment_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
--  Done. Verify with:
--    SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'fulfillment_type';
--    SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_type';
--    SELECT * FROM download_tokens LIMIT 1;
--    SELECT * FROM fulfillments LIMIT 1;
-- ═══════════════════════════════════════════════════════════════
