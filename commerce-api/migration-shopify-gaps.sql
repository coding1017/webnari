-- ═══════════════════════════════════════════════════════════════
--  Migration: Close Shopify Feature Gaps
--  Date: 2026-04-07
--  Features: BXGY discounts, product tags, draft orders,
--            email verification, partial refunds, shipping labels, RBAC
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Discounts: BXGY config + auto-apply ─────────────────────
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}';
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS auto_apply boolean NOT NULL DEFAULT false;

-- ── 2. Product Tags (new table) ────────────────────────────────
CREATE TABLE IF NOT EXISTS product_tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag        text NOT NULL,
  UNIQUE(product_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_product_tags_store_tag ON product_tags(store_id, tag);
CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id);

-- RLS: public read
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_tags' AND policyname = 'Public read product_tags') THEN
    CREATE POLICY "Public read product_tags" ON product_tags FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_tags' AND policyname = 'Service write product_tags') THEN
    CREATE POLICY "Service write product_tags" ON product_tags FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 3. Orders: draft support + shipping labels + partial refunds ──
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_manual boolean NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS label_url text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shippo_transaction_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount integer NOT NULL DEFAULT 0;

-- ── 4. Order Items: partial refund tracking ────────────────────
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS refunded_quantity integer NOT NULL DEFAULT 0;

-- ── 5. Customers: email verification ───────────────────────────
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS verification_token text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS verification_token_expires timestamptz;

-- Backfill: mark all existing customers as verified (they registered before this feature)
UPDATE customers SET email_verified = true WHERE email_verified = false;

-- ── 6. Store Admins: RBAC ──────────────────────────────────────
ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS permissions text[] NOT NULL DEFAULT '{}';
ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS api_key_hash text;
ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS email text;

-- Make user_id nullable (staff created via API won't have a Supabase Auth user)
ALTER TABLE store_admins ALTER COLUMN user_id DROP NOT NULL;

-- ═══════════════════════════════════════════════════════════════
--  Done. Verify with:
--    SELECT column_name FROM information_schema.columns WHERE table_name = 'discounts' AND column_name = 'config';
--    SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'refund_amount';
--    SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'email_verified';
--    SELECT * FROM product_tags LIMIT 1;
-- ═══════════════════════════════════════════════════════════════
