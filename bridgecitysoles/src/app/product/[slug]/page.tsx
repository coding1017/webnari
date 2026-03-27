'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { getProductBySlug, getConditionById, getLowestPrice } from '@/lib/data';
import { conditions, SNEAKER_SIZES, CLOTHING_SIZES } from '@/data/conditions';
import { ImageGallery } from '@/components/product/ImageGallery';
import { SizeSelector } from '@/components/product/SizeSelector';
import { ConditionBadge } from '@/components/product/ConditionBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice, cn } from '@/lib/utils';

export default function ProductPage() {
  const params = useParams();
  const product = getProductBySlug(params.slug as string);
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const allSizes = product?.category.slug === 'sneakers' ? SNEAKER_SIZES : CLOTHING_SIZES;

  // Get available conditions for selected size (or all)
  const availableConditions = useMemo(() => {
    if (!product) return [];
    const invItems = product.inventory.filter(i => i.isActive && i.quantity > 0 && (!selectedSize || i.size === selectedSize));
    const condIds = [...new Set(invItems.map(i => i.conditionId))];
    return condIds.map(id => getConditionById(id)!).filter(Boolean);
  }, [product, selectedSize]);

  // Find matching inventory item
  const selectedInventory = useMemo(() => {
    if (!product || !selectedSize) return null;
    return product.inventory.find(i =>
      i.isActive && i.quantity > 0 && i.size === selectedSize &&
      (!selectedCondition || i.conditionId === selectedCondition)
    ) || null;
  }, [product, selectedSize, selectedCondition]);

  // Current price to display
  const displayPrice = selectedInventory?.price ?? (product ? getLowestPrice(product) : 0);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/shop" className="text-bcs-teal hover:text-bcs-teal2">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedInventory || !selectedSize) return;
    const cond = getConditionById(selectedInventory.conditionId);
    const primaryImage = product.images.find(i => i.isPrimary) || product.images[0];

    addItem({
      inventoryId: selectedInventory.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      brandName: product.brand.name,
      size: selectedSize,
      condition: cond?.name || 'New',
      price: selectedInventory.price,
      quantity: 1,
      imageUrl: primaryImage?.url || '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-bcs-muted mb-6">
        <Link href="/shop" className="hover:text-bcs-white transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop?brand=${product.brand.slug}`} className="hover:text-bcs-white transition-colors">{product.brand.name}</Link>
        <span>/</span>
        <span className="text-bcs-text truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <ImageGallery images={product.images} />

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand */}
          <Link
            href={`/shop?brand=${product.brand.slug}`}
            className="text-sm text-bcs-teal uppercase tracking-wider font-medium hover:text-bcs-teal2 transition-colors"
          >
            {product.brand.name}
          </Link>

          {/* Name */}
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-black uppercase leading-tight">
            {product.name}
          </h1>

          {/* Style code & colorway */}
          <div className="flex flex-wrap gap-4 text-sm text-bcs-text">
            {product.styleCode && (
              <span>Style: <span className="text-bcs-white">{product.styleCode}</span></span>
            )}
            {product.colorway && (
              <span>Colorway: <span className="text-bcs-white">{product.colorway}</span></span>
            )}
          </div>

          {/* Price */}
          <PriceDisplay
            price={displayPrice}
            retailPrice={product.retailPrice}
            size="lg"
          />

          {/* Condition Selector */}
          {availableConditions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-bcs-muted mb-3">Condition</h3>
              <div className="flex flex-wrap gap-2">
                {availableConditions.map(cond => (
                  <button
                    key={cond.id}
                    onClick={() => setSelectedCondition(selectedCondition === cond.id ? null : cond.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all',
                      selectedCondition === cond.id
                        ? 'border-current'
                        : 'border-bcs-border hover:border-bcs-border2'
                    )}
                    style={{
                      color: cond.color,
                      backgroundColor: selectedCondition === cond.id ? cond.color + '22' : 'transparent',
                      borderColor: selectedCondition === cond.id ? cond.color : undefined,
                    }}
                  >
                    {cond.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-bcs-muted">
                Select Size {selectedSize && <span className="text-bcs-teal ml-1">— {selectedSize}</span>}
              </h3>
            </div>
            <SizeSelector
              inventory={product.inventory}
              allSizes={allSizes}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              selectedCondition={selectedCondition}
            />
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || !selectedInventory}
            className={cn(
              'w-full py-4 rounded-lg font-bold uppercase tracking-wide text-lg font-[family-name:var(--font-barlow-condensed)] transition-all',
              selectedSize && selectedInventory
                ? 'bg-bcs-teal text-bcs-black hover:bg-bcs-teal2 active:scale-[0.98]'
                : 'bg-bcs-surface text-bcs-muted cursor-not-allowed'
            )}
          >
            {!selectedSize ? 'Select a Size' : selectedInventory ? `Add to Cart — ${formatPrice(selectedInventory.price)}` : 'Unavailable in this size'}
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-bcs-surface rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-xs text-bcs-text">100% Authentic</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-bcs-surface rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4622A" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-xs text-bcs-text">Verified by BCS</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-bcs-surface rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4622A" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span className="text-xs text-bcs-text">Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-bcs-surface rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4622A" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
              <span className="text-xs text-bcs-text">In-Store Pickup</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-bcs-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-bcs-muted mb-3">Description</h3>
              <p className="text-sm text-bcs-text leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
