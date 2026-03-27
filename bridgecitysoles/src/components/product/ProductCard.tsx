'use client';

import Link from 'next/link';
import { useRef, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';
import { getLowestPrice, getAvailableSizes } from '@/lib/data';
import { ConditionBadge } from './ConditionBadge';
import type { ProductWithDetails } from '@/types/product';

export function ProductCard({ product, index = 0 }: { product: ProductWithDetails; index?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    el.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 30px rgba(212, 98, 42, 0.12)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.boxShadow = 'none';
  }, []);

  const lowestPrice = getLowestPrice(product);
  const sizes = getAvailableSizes(product);
  const primaryImage = product.images.find(i => i.isPrimary) || product.images[0];
  const bestCondition = product.inventory.find(i => i.isActive && i.quantity > 0);

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="bg-bcs-surface rounded-xl overflow-hidden border border-bcs-border hover:border-bcs-border2 transition-all duration-300 will-change-transform"
        style={{ transitionProperty: 'border-color', animationDelay: `${index * 0.05}s` }}
      >
        {/* Image */}
        <div className="relative aspect-square bg-bcs-surface2 overflow-hidden">
          {primaryImage && (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt}
              className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNewDrop && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-bcs-rust text-bcs-black px-2 py-0.5 rounded-full">
                New Drop
              </span>
            )}
            {bestCondition && (
              <ConditionBadge conditionId={bestCondition.conditionId} />
            )}
          </div>

          {/* Auth badge */}
          <div className="absolute top-3 right-3">
            <div className="w-6 h-6 rounded-full bg-bcs-forest/20 flex items-center justify-center" title="Authenticated">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] text-bcs-muted uppercase tracking-wider mb-1">
            {product.brand.name}
          </p>
          <h3 className="text-sm font-semibold text-bcs-white leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Sizes available */}
          <div className="flex flex-wrap gap-1 mb-3">
            {sizes.slice(0, 5).map(s => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-bcs-surface2 text-bcs-text">
                {s}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bcs-surface2 text-bcs-muted">
                +{sizes.length - 5}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-bcs-muted">From </span>
              <span className="text-base font-bold text-bcs-white">{formatPrice(lowestPrice)}</span>
            </div>
            {product.retailPrice && lowestPrice < product.retailPrice && (
              <span className="text-xs text-bcs-muted line-through">{formatPrice(product.retailPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
