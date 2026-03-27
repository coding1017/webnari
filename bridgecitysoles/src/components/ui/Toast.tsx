'use client';

import { useCart } from '@/components/cart/CartProvider';

export function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
      <div className="bg-bcs-surface border border-bcs-rust/30 text-bcs-white px-5 py-3 rounded-lg shadow-lg shadow-bcs-rust/10 flex items-center gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4622A" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span className="text-sm">{toast}</span>
      </div>
    </div>
  );
}
