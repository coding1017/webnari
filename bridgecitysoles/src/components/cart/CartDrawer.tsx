'use client';

import { useCart } from './CartProvider';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-bcs-dark border-l border-bcs-border z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-bcs-border">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase tracking-wide">
            Cart ({totalItems})
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bcs-surface transition-colors"
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto mb-4 w-16 h-16 text-bcs-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-bcs-muted mb-4">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-bcs-teal hover:text-bcs-teal2 transition-colors underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.inventoryId} className="flex gap-4 bg-bcs-surface rounded-lg p-3">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg bg-bcs-surface2 overflow-hidden flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-bcs-muted uppercase">{item.brandName}</p>
                  <p className="text-sm font-semibold truncate">{item.productName}</p>
                  <div className="flex gap-2 mt-1 text-xs text-bcs-text">
                    <span>Size {item.size}</span>
                    <span className="text-bcs-border">|</span>
                    <span>{item.condition}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.inventoryId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-bcs-surface2 hover:bg-bcs-border transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.inventoryId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-bcs-surface2 hover:bg-bcs-border transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-bcs-teal">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.inventoryId)}
                        className="text-bcs-muted hover:text-bcs-red transition-colors"
                        aria-label="Remove item"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-bcs-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-bcs-text">Subtotal</span>
              <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-bcs-muted">Shipping & taxes calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full py-3 px-6 bg-bcs-teal text-bcs-black font-bold text-center rounded-lg hover:bg-bcs-teal2 transition-colors uppercase tracking-wide font-[family-name:var(--font-barlow-condensed)]"
            >
              Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full py-2 text-center text-sm text-bcs-muted hover:text-bcs-white transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
