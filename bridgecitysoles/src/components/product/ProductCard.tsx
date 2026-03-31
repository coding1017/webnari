'use client';

import Link from 'next/link';
// Clean hover lift + gold glow (no 3D tilt)
import { formatPrice } from '@/lib/utils';
import { getLowestPrice, getAvailableSizes } from '@/lib/data';
import { ConditionBadge } from './ConditionBadge';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import type { ProductWithDetails } from '@/types/product';

export function ProductCard({ product, index = 0 }: { product: ProductWithDetails; index?: number }) {

  const lowestPrice = getLowestPrice(product);
  const sizes = getAvailableSizes(product);
  const primaryImage = product.images.find(i => i.isPrimary) || product.images[0];
  const bestCondition = product.inventory.find(i => i.isActive && i.quantity > 0);
  const totalStock = product.inventory.filter(i => i.isActive).reduce((sum, i) => sum + i.quantity, 0);
  const isSoldOut = totalStock === 0;

  return (
    <Link href={`/product/${product.slug}`} className={`block ${isSoldOut ? 'pointer-events-none' : ''}`}>
      <div
        className={`bg-bcs-surface rounded-xl overflow-hidden border-[3px] transition-all duration-300 shadow-[0_2px_12px_rgba(184,137,42,0.1)] ${
          isSoldOut
            ? 'border-bcs-border opacity-60 grayscale'
            : 'border-bcs-gold/50 hover:border-bcs-gold hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(184,137,42,0.35),0_0_20px_rgba(184,137,42,0.15)]'
        }`}
        style={{ animationDelay: `${index * 0.05}s` }}
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

          {/* Stock indicator */}
          {isSoldOut ? (
            <div className="absolute bottom-3 left-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                Sold Out
              </span>
            </div>
          ) : totalStock <= 2 ? (
            <div className="absolute bottom-3 left-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-bcs-black px-2 py-0.5 rounded-full">
                Only {totalStock} left
              </span>
            </div>
          ) : null}

          {/* Wishlist + Auth badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-center">
            <WishlistButton productSlug={product.slug} size="sm" />
            <div className="w-6 h-6 rounded-full bg-bcs-forest/20 flex items-center justify-center" title="Authenticated">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3D9A5F" strokeWidth="3">
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
