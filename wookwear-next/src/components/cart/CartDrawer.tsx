"use client";

import { useCart } from "@/hooks/useCart";
import { cn, formatPrice } from "@/lib/utils";
import { products } from "@/data/products";

function getItemInfo(id: string) {
  for (const product of products) {
    if (product.id === id) {
      return { name: product.name, price: product.price, img: product.img, parentName: null };
    }
    if (product.variants) {
      for (const variant of product.variants) {
        if (variant.id === id) {
          return {
            name: variant.name,
            price: variant.price,
            img: variant.imgs[0] || product.img,
            parentName: product.name,
          };
        }
      }
    }
  }
  return null;
}

export function CartDrawer() {
  const { items, total, isOpen, closeCart, removeItem, updateQty } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-[rgba(8,6,14,0.6)] z-[2000] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 w-[min(400px,90vw)] h-screen bg-ww-dark border-l border-ww-border z-[2001] flex flex-col transition-[right] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen ? "right-0" : "-right-[420px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-ww-border">
          <span className="font-head font-black text-xl text-ww-white tracking-[0.04em]">YOUR CART</span>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center border border-ww-border rounded-[12px] text-ww-muted hover:border-ww-pink hover:text-ww-pink transition-all"
            aria-label="Close cart"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-ww-muted text-sm">
              <svg className="w-12 h-12 text-ww-border mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p>Your cart is empty</p>
              <p className="text-ww-muted text-[13px]">Go find something you love!</p>
            </div>
          ) : (
            items.map((item) => {
              const info = getItemInfo(item.id);
              if (!info) return null;
              return (
                <div key={item.id} className="flex gap-3.5 py-4 border-b border-[rgba(42,34,68,0.3)]">
                  <div className="w-16 h-16 rounded-[12px] overflow-hidden flex-shrink-0 bg-ww-surface">
                    {info.img && (
                      <img src={info.img} alt={info.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                  </div>
                  <div className="flex-1">
                    {info.parentName && (
                      <div className="text-[11px] text-ww-muted mb-0.5">{info.parentName}</div>
                    )}
                    <div className="font-head text-sm font-bold text-ww-white mb-0.5">{info.name}</div>
                    <div className="text-[13px] text-ww-purple2 mb-2">{formatPrice(info.price)}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-ww-surface border border-ww-border rounded-md text-ww-text text-sm hover:border-ww-purple hover:text-ww-white transition-all"
                      >
                        -
                      </button>
                      <span className="font-head text-sm font-bold text-ww-white min-w-[20px] text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-ww-surface border border-ww-border rounded-md text-ww-text text-sm hover:border-ww-purple hover:text-ww-white transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-ww-muted text-xs font-head tracking-[0.05em] hover:text-ww-pink transition-colors self-start"
                  >
                    REMOVE
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 px-6 border-t border-ww-border">
            <div className="flex justify-between mb-4 font-head text-base font-bold text-ww-white">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button className="w-full py-3.5 bg-[image:var(--gradient)] text-ww-white font-head text-sm font-extrabold tracking-[0.1em] uppercase rounded-[12px] border-none cursor-pointer hover:shadow-[0_0_32px_rgba(255,45,155,0.3)] transition-all">
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
