"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Product, Category, CATEGORIES, CATEGORY_LABELS } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

function ShopGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") as Category | null;
  const [activeCategory, setActiveCategory] = useState<Category | "all">(initialCat || "all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");

  const filtered = useMemo(() => {
    let result = activeCategory === "all"
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [activeCategory, sortBy, products]);

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        <div>
          <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
            <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
            Browse the Collection
          </div>
          <h1 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
            All <span className="gradient-text">Products</span>
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-8 mb-10">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-4 py-2 font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] border transition-all",
              activeCategory === "all"
                ? "bg-[rgba(168,85,247,0.15)] border-ww-purple text-ww-white"
                : "bg-transparent border-ww-border text-ww-text hover:border-ww-purple hover:text-ww-white"
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] border transition-all",
                activeCategory === cat
                  ? "bg-[rgba(168,85,247,0.15)] border-ww-purple text-ww-white"
                  : "bg-transparent border-ww-border text-ww-text hover:border-ww-purple hover:text-ww-white"
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="ml-auto px-4 py-2 bg-ww-surface border border-ww-border rounded-[12px] text-sm text-ww-text font-medium outline-none focus:border-ww-purple"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 max-md:gap-3.5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i % 4} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-ww-muted">
            <p className="text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ShopContent({ products }: { products: Product[] }) {
  return (
    <Suspense>
      <ShopGrid products={products} />
    </Suspense>
  );
}
