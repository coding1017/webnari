/**
 * Database abstraction layer
 *
 * Fetches from the Webnari Commerce API, falls back to local static data.
 * Prices from the API are in cents — convert to dollars for display.
 *
 * Usage in Server Components:
 *   import { db } from "@/lib/db";
 *   const products = await db.getProducts();
 */

import { products as localProducts, getProductById as localGetProductById } from "@/data/products";
import { posts as localPosts, getPostBySlug as localGetPostBySlug } from "@/data/blog";
import { glossaryTerms as localGlossary, getTermBySlug as localGetTermBySlug } from "@/data/glossary";
import type { Product, Variant, Review } from "@/types/product";

const COMMERCE_API = process.env.NEXT_PUBLIC_COMMERCE_API_URL || "https://webnari.io/commerce";
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "wookwear";

async function apiFetch(path: string) {
  const res = await fetch(`${COMMERCE_API}${path}`, {
    headers: { "X-Store-ID": STORE_ID, "Content-Type": "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function mapApiProduct(p: any): Product {
  const variants: Variant[] = (p.variants || []).map((v: any) => ({
    id: v.id,
    name: v.name,
    color: v.color || "",
    price: (v.price || p.price) / 100,
    inStock: v.inStock,
    imgs: v.imgs || [],
  }));

  const reviews: Review[] = (p.reviews || []).map((r: any) => ({
    name: r.name,
    text: r.text,
    rating: r.rating,
    date: r.date,
  }));

  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price / 100,
    badge: p.badge?.toLowerCase() || null,
    inStock: p.inStock,
    img: p.img || "",
    imgs: p.imgs || [],
    desc: p.desc || "",
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    reviews,
    isCollection: p.isCollection || false,
    variants: variants.length > 0 ? variants : undefined,
  };
}

// ─── DB interface ────────────────────────────────────────────────────────────

export const db = {
  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const data = await apiFetch("/api/products");
      return data.map(mapApiProduct);
    } catch (err) {
      console.error("Commerce API getProducts error:", err);
      return localProducts;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const data = await apiFetch(`/api/products/${id}`);
      return mapApiProduct(data);
    } catch {
      return localGetProductById(id);
    }
  },

  async getFeaturedProducts(count = 4): Promise<Product[]> {
    try {
      const data = await apiFetch(`/api/products/featured?limit=${count}`);
      return data.map(mapApiProduct);
    } catch {
      return localProducts.filter((p) => p.inStock).slice(0, count);
    }
  },

  // Blog (still uses local data — no commerce API for blog yet)
  async getPosts() {
    return localPosts;
  },

  async getPostBySlug(slug: string) {
    return localGetPostBySlug(slug);
  },

  // Glossary (still uses local data)
  async getGlossaryTerms() {
    return localGlossary;
  },

  async getTermBySlug(slug: string) {
    return localGetTermBySlug(slug);
  },
};
