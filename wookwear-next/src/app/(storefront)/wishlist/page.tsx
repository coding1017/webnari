"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price / 100,
    badge: p.badge,
    inStock: p.in_stock,
    img: p.product_images?.[0]?.url || "",
    imgs: (p.product_images || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((i: any) => i.url),
    desc: p.description || "",
    rating: parseFloat(p.rating) || 0,
    reviewCount: p.review_count || 0,
    reviews: [],
    isCollection: p.is_collection,
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      color: v.color,
      imgs: (v.variant_images || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((i: any) => i.url),
      price: v.price / 100,
      inStock: v.in_stock,
    })),
  };
}

export default function WishlistPage() {
  const { items } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const productIds = items.map((i) => i.productId);

    supabase
      .from("products")
      .select("*, product_images(url, sort_order), variants(id, name, color, price, in_stock, sort_order, variant_images(url, sort_order))")
      .in("id", productIds)
      .then(({ data }) => {
        if (data) {
          setProducts(data.map(mapProduct));
        }
        setLoading(false);
      });
  }, [items]);

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
          <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
          Saved Items
        </div>
        <h1 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-10">
          Your <span className="gradient-text">Wishlist</span>
        </h1>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-ww-surface border border-ww-border rounded-[20px] overflow-hidden">
                <div className="aspect-square skeleton rounded-none" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-ww-surface flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-ww-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <h2 className="font-head font-bold text-xl text-ww-white mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-ww-muted text-sm mb-6">
                Tap the heart on any product to save it here.
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-[image:var(--gradient)] text-white font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] hover:shadow-[0_0_24px_rgba(255,45,155,0.2)] transition-all"
              >
                Browse Products
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 max-md:gap-3.5">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i % 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
