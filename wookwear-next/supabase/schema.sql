-- ============================================================================
-- Wook Wear Database Schema
-- Run this in the Supabase SQL Editor to create all tables
-- ============================================================================

-- Products
create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null, -- cents (4500 = $45.00)
  badge text, -- 'new', 'sold', 'oneofone', 'collection', or null
  in_stock boolean not null default true,
  description text not null default '',
  is_collection boolean not null default false,
  sort_order integer not null default 0,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Product images
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on product_images(product_id);

-- Variants
create table if not exists variants (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  name text not null,
  color text not null default '#A855F7',
  price integer not null, -- cents
  in_stock boolean not null default true,
  sort_order integer not null default 0
);
create index if not exists idx_variants_product on variants(product_id);

-- Variant images
create table if not exists variant_images (
  id uuid primary key default gen_random_uuid(),
  variant_id text not null references variants(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_variant_images_variant on variant_images(variant_id);

-- Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  name text not null,
  text text not null,
  rating integer not null check (rating between 1 and 5),
  date date not null default current_date,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_reviews_product on reviews(product_id);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text not null default 'pending',
  customer_email text not null,
  customer_name text not null default '',
  shipping_address jsonb not null default '{}',
  subtotal integer not null default 0,
  shipping integer not null default 0,
  total integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text not null,
  variant_id text,
  product_name text not null,
  variant_name text,
  price integer not null,
  quantity integer not null default 1,
  image_url text
);
create index if not exists idx_order_items_order on order_items(order_id);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- Wishlist items
create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  product_id text not null references products(id) on delete cascade,
  variant_id text,
  created_at timestamptz not null default now(),
  unique(session_id, product_id, variant_id)
);
create index if not exists idx_wishlist_session on wishlist_items(session_id);

-- Blog posts
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null,
  tags text[] not null default '{}',
  read_time text not null default '5 min',
  image_url text not null default '',
  published boolean not null default true,
  date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists idx_blog_posts_slug on blog_posts(slug);

-- Glossary terms
create table if not exists glossary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  slug text unique not null,
  definition text not null,
  category text not null
);
create index if not exists idx_glossary_slug on glossary_terms(slug);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

alter table products enable row level security;
alter table product_images enable row level security;
alter table variants enable row level security;
alter table variant_images enable row level security;
alter table reviews enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table newsletter_subscribers enable row level security;
alter table wishlist_items enable row level security;
alter table blog_posts enable row level security;
alter table glossary_terms enable row level security;

-- Public read access for storefront tables
create policy "Public read products" on products for select using (true);
create policy "Public read product_images" on product_images for select using (true);
create policy "Public read variants" on variants for select using (true);
create policy "Public read variant_images" on variant_images for select using (true);
create policy "Public read approved reviews" on reviews for select using (approved = true);
create policy "Public read published posts" on blog_posts for select using (published = true);
create policy "Public read glossary" on glossary_terms for select using (true);

-- Newsletter: public insert only
create policy "Public insert newsletter" on newsletter_subscribers for insert with check (true);

-- Wishlist: read/write by session_id (no auth required)
create policy "Wishlist read by session" on wishlist_items for select using (true);
create policy "Wishlist insert" on wishlist_items for insert with check (true);
create policy "Wishlist delete by session" on wishlist_items for delete using (true);

-- Orders: no public access (service role only via API routes)
-- (no policies = no public access when RLS is enabled)

-- ============================================================================
-- Auto-update updated_at timestamp
-- ============================================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- ============================================================================
-- Storage bucket for product images
-- Run this separately in Supabase Dashboard > Storage > New bucket
-- Name: product-images, Public: true
-- ============================================================================
