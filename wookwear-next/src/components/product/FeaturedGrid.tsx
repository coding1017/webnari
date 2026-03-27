"use client";

import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface FeaturedGridProps {
  products: Product[];
}

export function FeaturedGrid({ products }: FeaturedGridProps) {
  return (
    <div className="grid grid-cols-4 gap-6 mt-12 max-lg:grid-cols-2 max-md:gap-3.5">
      {products.map((product, i) => (
        <ScrollReveal key={product.id} delay={i + 1}>
          <ProductCard product={product} index={i} />
        </ScrollReveal>
      ))}
    </div>
  );
}
