'use client';

import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <svg className="mx-auto mb-4 w-20 h-20 text-bcs-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold uppercase mb-4">Your Cart is Empty</h1>
        <p className="text-bcs-text mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="px-8 py-3 bg-bcs-teal text-bcs-black font-bold uppercase rounded-lg hover:bg-bcs-teal2 transition-colors font-[family-name:var(--font-barlow-condensed)]">
          Start Shopping
        </Link>
      </div>
    );
  }

  const tax = Math.round(totalPrice * 0.0);
  const shipping = totalPrice >= 200 ? 0 : 15;
  const total = totalPrice + tax + shipping;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl sm:text-4xl font-black uppercase tracking-tight mb-8">
        Your <span className="text-bcs-teal">Cart</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.inventoryId} className="flex gap-4 bg-bcs-surface rounded-xl border border-bcs-border p-4">
              <div className="w-24 h-24 rounded-lg bg-bcs-surface2 overflow-hidden flex-shrink-0">
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-bcs-muted uppercase">{item.brandName}</p>
                    <Link href={`/product/${item.productSlug}`} className="text-sm font-semibold hover:text-bcs-teal transition-colors line-clamp-1">
                      {item.productName}
                    </Link>
                    <div className="flex gap-2 mt-1 text-xs text-bcs-text">
                      <span>Size {item.size}</span>
                      <span className="text-bcs-border">|</span>
                      <span>{item.condition}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.inventoryId)} className="text-bcs-muted hover:text-bcs-red transition-colors p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.inventoryId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded bg-bcs-surface2 hover:bg-bcs-border transition-colors text-sm">-</button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.inventoryId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded bg-bcs-surface2 hover:bg-bcs-border transition-colors text-sm">+</button>
                  </div>
                  <span className="font-bold text-bcs-teal">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6 h-fit sticky top-24">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-bcs-text">Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bcs-text">Shipping</span>
              <span>{shipping === 0 ? <span className="text-bcs-green">Free</span> : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-bcs-muted">Free shipping on orders over $200</p>
            )}
            <div className="pt-3 border-t border-bcs-border flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full mt-6 py-3.5 bg-bcs-teal text-bcs-black font-bold text-center rounded-lg hover:bg-bcs-teal2 transition-colors uppercase tracking-wide font-[family-name:var(--font-barlow-condensed)] text-lg"
          >
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="block w-full mt-3 py-2 text-center text-sm text-bcs-muted hover:text-bcs-white transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
