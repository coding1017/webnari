"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const RECENT_KEY = "ww_recent";
const MAX_RECENT = 6;

export function trackRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const recent: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const filtered = recent.filter((id) => id !== productId);
    filtered.unshift(productId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {}
}

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price / 100,
    badge: p.badge,
    inStock: p.in_stock,
    img: p.product_images?.[0]?.url || "",
    imgs: (p.product_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => i.url),
    desc: p.description || "",
    rating: parseFloat(p.rating) || 0,
    reviewCount: p.review_count || 0,
    reviews: [],
    isCollection: p.is_collection,
    variants: (p.variants || []).map((v: any) => ({
      id: v.id, name: v.name, color: v.color,
      imgs: (v.variant_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => i.url),
      price: v.price / 100, inStock: v.in_stock,
    })),
  };
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const recent: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const ids = recent.filter((id) => id !== excludeId).slice(0, 4);
    if (ids.length === 0) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("products")
      .select("*, product_images(url, sort_order), variants(id, name, color, price, in_stock, sort_order, variant_images(url, sort_order))")
      .in("id", ids)
      .then(({ data }) => {
        if (data) {
          // Maintain order from recently viewed
          const mapped = data.map(mapProduct);
          const ordered = ids
            .map((id) => mapped.find((p) => p.id === id))
            .filter(Boolean) as Product[];
          setProducts(ordered);
        }
      });
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-20">
      <ScrollReveal>
        <h2 className="font-head font-black text-2xl text-ww-white mb-8">
          Recently <span className="gradient-text">Viewed</span>
        </h2>
      </ScrollReveal>
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:gap-3.5">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
