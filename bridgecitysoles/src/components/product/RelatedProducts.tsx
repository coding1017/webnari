'use client';

import { useMemo } from 'react';
import { getProducts, getLowestPrice } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import type { ProductWithDetails } from '@/types/product';

export function RelatedProducts({ currentProduct }: { currentProduct: ProductWithDetails }) {
  const related = useMemo(() => {
    const all = getProducts();

    // Priority: same brand + category, then same brand, then same category, then random
    const sameBrandAndCat = all.filter(p =>
      p.id !== currentProduct.id &&
      p.brandId === currentProduct.brandId &&
      p.categoryId === currentProduct.categoryId &&
      p.isActive
    );

    const sameBrand = all.filter(p =>
      p.id !== currentProduct.id &&
      p.brandId === currentProduct.brandId &&
      p.categoryId !== currentProduct.categoryId &&
      p.isActive
    );

    const sameCat = all.filter(p =>
      p.id !== currentProduct.id &&
      p.brandId !== currentProduct.brandId &&
      p.categoryId === currentProduct.categoryId &&
      p.isActive
    );

    // Combine and take first 4
    const pool = [...sameBrandAndCat, ...sameBrand, ...sameCat];

    // If not enough, add random products
    if (pool.length < 4) {
      const remaining = all.filter(p => p.id !== currentProduct.id && p.isActive && !pool.find(x => x.id === p.id));
      pool.push(...remaining);
    }

    return pool.slice(0, 4);
  }, [currentProduct]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-bcs-border">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black uppercase tracking-tight">
          You May Also <span className="text-bcs-rust">Like</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
