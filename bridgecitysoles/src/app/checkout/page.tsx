'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'confirm'>('info');
  const [form, setForm] = useState({ name: '', email: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '' });

  const tax = Math.round(totalPrice * 0.0);
  const shipping = totalPrice >= 200 ? 0 : 15;
  const total = totalPrice + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/shop" className="text-bcs-teal hover:text-bcs-teal2">Continue Shopping</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'info') {
      setStep('confirm');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black uppercase tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          {step === 'info' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase mb-4">Contact Info</h2>
                <div className="space-y-4">
                  <input
                    type="text" required placeholder="Full Name" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="email" required placeholder="Email" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                    />
                    <input
                      type="tel" placeholder="Phone (optional)" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <input
                    type="text" required placeholder="Street Address" value={form.line1}
                    onChange={e => setForm({ ...form, line1: e.target.value })}
                    className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                  />
                  <input
                    type="text" placeholder="Apt, Suite, etc. (optional)" value={form.line2}
                    onChange={e => setForm({ ...form, line2: e.target.value })}
                    className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text" required placeholder="City" value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                    />
                    <input
                      type="text" required placeholder="State" value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                      className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                    />
                    <input
                      type="text" required placeholder="ZIP" value={form.zip}
                      onChange={e => setForm({ ...form, zip: e.target.value })}
                      className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-bcs-teal text-bcs-black font-bold uppercase tracking-wide rounded-lg hover:bg-bcs-teal2 transition-colors font-[family-name:var(--font-barlow-condensed)] text-lg">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase mb-4">Payment</h2>
                <div className="bg-bcs-dark rounded-lg border border-bcs-gold/30 p-6 text-center">
                  <svg className="mx-auto mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <path d="M1 10h22" />
                  </svg>
                  <p className="text-sm text-bcs-gold font-medium mb-1">Stripe Payment Integration</p>
                  <p className="text-xs text-bcs-muted">Payment processing will be connected soon. For now, call us or visit the store to complete your purchase.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('info')}
                  className="flex-1 py-3 border border-bcs-border text-bcs-white font-bold uppercase rounded-lg hover:bg-bcs-surface transition-colors font-[family-name:var(--font-barlow-condensed)]"
                >
                  Back
                </button>
                <a
                  href="tel:5039498643"
                  className="flex-1 py-3 bg-bcs-teal text-bcs-black font-bold uppercase text-center rounded-lg hover:bg-bcs-teal2 transition-colors font-[family-name:var(--font-barlow-condensed)]"
                >
                  Call to Order
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6 sticky top-24">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.inventoryId} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-bcs-surface2 overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-bcs-muted">{item.brandName}</p>
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-bcs-text">Size {item.size} &bull; {item.condition} &bull; Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-bcs-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-bcs-text">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-bcs-text">Shipping</span>
                <span>{shipping === 0 ? <span className="text-bcs-green">Free</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-bcs-text">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-bcs-border">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            {totalPrice < 200 && (
              <p className="text-xs text-bcs-muted mt-3">
                Add {formatPrice(200 - totalPrice)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
