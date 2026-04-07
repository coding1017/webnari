-- ============================================================
-- Webnari Commerce — Enterprise SEO Migration
-- Adds SEO metadata columns to existing tables and creates
-- new tables for custom pages and FAQ schema markup.
-- ============================================================

-- ------------------------------------------------------------
-- 1. stores — homepage SEO + business structured data
-- ------------------------------------------------------------
ALTER TABLE stores ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS social_image_url text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_address jsonb;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_phone text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_hours jsonb;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS social_links jsonb;

-- ------------------------------------------------------------
-- 2. categories — per-category SEO metadata
-- ------------------------------------------------------------
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;

-- ------------------------------------------------------------
-- 3. blog_posts — per-post SEO overrides
-- ------------------------------------------------------------
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description text;

-- ------------------------------------------------------------
-- 4. store_pages — custom pages (About, Contact, etc.)
--    Each page gets its own SEO fields for full control over
--    title tags, meta descriptions, and OG images.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_pages (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  store_id text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text,
  meta_title text,
  meta_description text,
  image_url text,
  published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_store_pages_store_id ON store_pages(store_id);

-- ------------------------------------------------------------
-- 5. store_faqs — FAQ entries for FAQPage schema markup
--    Grouped by optional category, ordered by sort_order.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_faqs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  store_id text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_faqs_store_id ON store_faqs(store_id);

-- ------------------------------------------------------------
-- 6. RLS — public read access for published rows
-- ------------------------------------------------------------
ALTER TABLE store_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published pages" ON store_pages;
CREATE POLICY "Public can read published pages"
  ON store_pages FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Public can read published faqs" ON store_faqs;
CREATE POLICY "Public can read published faqs"
  ON store_faqs FOR SELECT
  USING (published = true);

-- ------------------------------------------------------------
-- 7. Trigger — auto-update updated_at on store_pages
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_store_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_store_pages_updated_at ON store_pages;
CREATE TRIGGER trg_store_pages_updated_at
  BEFORE UPDATE ON store_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_store_pages_updated_at();
