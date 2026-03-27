/**
 * Database abstraction layer
 *
 * Fetches from Supabase when configured, falls back to local static data.
 * All prices from Supabase are in cents — convert to dollars for display.
 *
 * Usage in Server Components:
 *   import { db } from "@/lib/db";
 *   const products = await db.getProducts();
 */

import { createClient as createServerClient } from "@/lib/supabase/server";
import { products as localProducts, getProductById as localGetProductById } from "@/data/products";
import { posts as localPosts, getPostBySlug as localGetPostBySlug } from "@/data/blog";
import { glossaryTerms as localGlossary, getTermBySlug as localGetTermBySlug } from "@/data/glossary";
import type { Product, Variant, Review } from "@/types/product";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

// ─── Product helpers ─────────────────────────────────────────────────────────

function mapSupabaseProduct(row: any): Product {
  const imgs = (row.product_images || [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((img: any) => img.url);

  const variants: Variant[] = (row.variants || [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((v: any) => ({
      id: v.id,
      name: v.name,
      color: v.color,
      price: v.price / 100,
      inStock: v.in_stock,
      imgs: (v.variant_images || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => img.url),
    }));

  const reviews: Review[] = (row.reviews || [])
    .map((r: any) => ({
      name: r.name,
      text: r.text,
      rating: r.rating,
      date: r.date,
    }));

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price / 100,
    badge: row.badge,
    inStock: row.in_stock,
    img: imgs[0] || "",
    imgs,
    desc: row.description,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    reviews,
    isCollection: row.is_collection,
    variants: variants.length > 0 ? variants : undefined,
  };
}

const PRODUCT_SELECT = `
  *,
  product_images ( url, sort_order ),
  variants (
    id, name, color, price, in_stock, sort_order,
    variant_images ( url, sort_order )
  ),
  reviews ( name, text, rating, date )
`;

// ─── DB interface ────────────────────────────────────────────────────────────

export const db = {
  // Products
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) return localProducts;

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("sort_order") as { data: any[] | null; error: any };

    if (error || !data) {
      console.error("Supabase getProducts error:", error?.message);
      return localProducts;
    }

    return data.map(mapSupabaseProduct);
  },

  async getProductById(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured) return localGetProductById(id);

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .single() as { data: any | null; error: any };

    if (error || !data) {
      // Try finding it as a variant parent
      const { data: variantData } = await supabase
        .from("variants")
        .select("product_id")
        .eq("id", id)
        .single() as { data: { product_id: string } | null };

      if (variantData) {
        return db.getProductById(variantData.product_id);
      }

      return localGetProductById(id);
    }

    return mapSupabaseProduct(data);
  },

  async getFeaturedProducts(count = 4): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return localProducts.filter((p) => p.inStock).slice(0, count);
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("in_stock", true)
      .order("sort_order")
      .limit(count) as { data: any[] | null; error: any };

    if (error || !data) return localProducts.filter((p) => p.inStock).slice(0, count);
    return data.map(mapSupabaseProduct);
  },

  // Blog
  async getPosts() {
    if (!isSupabaseConfigured) return localPosts;

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false }) as { data: any[] | null; error: any };

    if (error || !data) return localPosts;

    return data.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      category: row.category,
      tags: row.tags,
      readTime: row.read_time,
      image: row.image_url,
      date: row.date,
    }));
  },

  async getPostBySlug(slug: string) {
    if (!isSupabaseConfigured) return localGetPostBySlug(slug);

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .single() as { data: any | null; error: any };

    if (error || !data) return localGetPostBySlug(slug);

    return {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      tags: data.tags,
      readTime: data.read_time,
      image: data.image_url,
      date: data.date,
    };
  },

  // Glossary
  async getGlossaryTerms() {
    if (!isSupabaseConfigured) return localGlossary;

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("glossary_terms")
      .select("*")
      .order("term") as { data: any[] | null; error: any };

    if (error || !data) return localGlossary;

    return data.map((row: any) => ({
      term: row.term,
      slug: row.slug,
      definition: row.definition,
      category: row.category,
    }));
  },

  async getTermBySlug(slug: string) {
    if (!isSupabaseConfigured) return localGetTermBySlug(slug);

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("glossary_terms")
      .select("*")
      .eq("slug", slug)
      .single() as { data: any | null; error: any };

    if (error || !data) return localGetTermBySlug(slug);

    return {
      term: data.term,
      slug: data.slug,
      definition: data.definition,
      category: data.category,
    };
  },
};
