"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_COMMERCE_API_URL || "https://webnari.io/commerce";
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "wookwear";

interface OrderItem {
  product_name: string;
  variant_name: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  shipping_address: { line1: string; line2?: string; city: string; state: string; zip: string } | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount_code: string | null;
  discount_amount: number;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: "Pending", color: "#FF9500", bg: "rgba(255,149,0,0.12)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  confirmed: { label: "Confirmed", color: "#007AFF", bg: "rgba(0,122,255,0.12)", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  processing: { label: "Processing", color: "#5856D6", bg: "rgba(88,86,214,0.12)", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  shipped: { label: "Shipped", color: "#34C759", bg: "rgba(52,199,89,0.12)", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
  delivered: { label: "Delivered", color: "#34C759", bg: "rgba(52,199,89,0.12)", icon: "M5 13l4 4L19 7" },
  cancelled: { label: "Cancelled", color: "#8E8E93", bg: "rgba(142,142,147,0.12)", icon: "M6 18L18 6M6 6l12 12" },
  refunded: { label: "Refunded", color: "#FF3B30", bg: "rgba(255,59,48,0.12)", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" },
};

const STEPS = ["confirmed", "processing", "shipped", "delivered"];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // Search orders by email first
      const res = await fetch(`${API_BASE}/api/orders?email=${encodeURIComponent(email.trim())}`, {
        headers: { "X-Store-ID": STORE_ID },
      });
      const orders = await res.json();

      if (!Array.isArray(orders) || orders.length === 0) {
        setError("No orders found for this email address.");
        setLoading(false);
        return;
      }

      // Find matching order number
      const match = orders.find((o: Order) =>
        o.order_number.toLowerCase() === orderNumber.trim().toLowerCase()
      );

      if (!match) {
        setError("Order number not found. Please check and try again.");
        setLoading(false);
        return;
      }

      // Fetch full order with items
      const detailRes = await fetch(`${API_BASE}/api/orders/${match.id}?email=${encodeURIComponent(email.trim())}`, {
        headers: { "X-Store-ID": STORE_ID },
      });
      const detail = await detailRes.json();
      setOrder(detail);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const statusConfig = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending) : null;
  const currentStepIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[640px] mx-auto px-10 max-md:px-5">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="flex items-center gap-3 justify-center font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Order Status
            </div>
            <h1 className="font-head font-black text-[clamp(32px,5vw,48px)] leading-[1.05] text-ww-white mb-4">
              Track Your <span className="gradient-text">Order</span>
            </h1>
            <p className="text-ww-text text-base max-w-md mx-auto">
              Enter your order number and email to check the status of your order.
            </p>
          </div>
        </ScrollReveal>

        {/* Lookup Form */}
        {!order && (
          <ScrollReveal delay={1}>
            <form onSubmit={handleLookup} className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">
                  Order Number
                </label>
                <input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. WOO-20260404-0001"
                  className="w-full px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors font-mono tracking-wider"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email you used at checkout"
                  className="w-full px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-[rgba(255,59,48,0.08)] border border-[rgba(255,59,48,0.2)] rounded-[12px] text-sm text-[#FF6B6B]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[image:var(--gradient)] text-ww-white font-head text-sm font-extrabold tracking-[0.1em] uppercase rounded-[12px] border-none cursor-pointer hover:shadow-[0_0_32px_rgba(255,45,155,0.3)] transition-all disabled:opacity-40"
              >
                {loading ? "Looking up..." : "Track Order"}
              </button>
            </form>
          </ScrollReveal>
        )}

        {/* Order Details */}
        {order && statusConfig && (
          <div className="space-y-6 fade-in">
            {/* Back button */}
            <button
              onClick={() => { setOrder(null); setOrderNumber(""); setEmail(""); }}
              className="text-sm text-ww-muted hover:text-ww-pink transition-colors"
            >
              &larr; Look up another order
            </button>

            {/* Status Card */}
            <div className="bg-ww-surface border border-ww-border rounded-[20px] p-8 text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: statusConfig.bg }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={statusConfig.color} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={statusConfig.icon} />
                </svg>
              </div>
              <div className="font-head text-xl font-bold text-ww-white mb-1">{statusConfig.label}</div>
              <div className="text-sm text-ww-muted">Order #{order.order_number}</div>
              <div className="text-xs text-ww-muted mt-1">
                Placed {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>

            {/* Progress Steps */}
            {!["cancelled", "refunded"].includes(order.status) && (
              <div className="bg-ww-surface border border-ww-border rounded-[16px] p-6">
                <div className="flex items-center justify-between">
                  {STEPS.map((step, i) => {
                    const isCompleted = currentStepIndex >= i;
                    const isCurrent = currentStepIndex === i;
                    return (
                      <div key={step} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : "none" }}>
                        <div className="flex flex-col items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            style={{
                              background: isCompleted ? "var(--gradient)" : "rgba(168,85,247,0.1)",
                              color: isCompleted ? "#fff" : "var(--color-ww-muted)",
                              boxShadow: isCurrent ? "0 0 12px rgba(168,85,247,0.4)" : "none",
                            }}
                          >
                            {isCompleted ? "✓" : i + 1}
                          </div>
                          <span className="text-[10px] font-head font-bold uppercase tracking-wider mt-2" style={{ color: isCompleted ? "var(--color-ww-purple2)" : "var(--color-ww-muted)" }}>
                            {step}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div
                            className="flex-1 h-0.5 mx-2"
                            style={{ background: currentStepIndex > i ? "var(--gradient)" : "rgba(168,85,247,0.15)" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tracking Info */}
            {order.tracking_number && (
              <div className="bg-ww-surface border border-ww-border rounded-[16px] p-6">
                <h3 className="font-head text-xs font-bold tracking-[0.15em] uppercase text-ww-muted mb-3">Tracking</h3>
                <div className="font-mono text-ww-white text-lg mb-3">{order.tracking_number}</div>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-[image:var(--gradient)] text-white font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[10px] hover:shadow-[0_0_24px_rgba(255,45,155,0.3)] transition-all"
                  >
                    Track Package &rarr;
                  </a>
                )}
              </div>
            )}

            {/* Items */}
            <div className="bg-ww-surface border border-ww-border rounded-[16px] overflow-hidden">
              <div className="p-5 border-b border-ww-border">
                <h3 className="font-head text-xs font-bold tracking-[0.15em] uppercase text-ww-muted">Order Items</h3>
              </div>
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-ww-border last:border-0">
                  <div>
                    <div className="text-sm font-medium text-ww-white">{item.product_name}</div>
                    {item.variant_name && <div className="text-xs text-ww-muted">{item.variant_name}</div>}
                    <div className="text-xs text-ww-muted">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold text-ww-purple2">
                    {formatPrice(item.price / 100 * item.quantity)}
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="px-5 py-4 bg-ww-dark/30 space-y-2">
                <div className="flex justify-between text-xs text-ww-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal / 100)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-xs text-[#39FF14]">
                    <span>Discount{order.discount_code ? ` (${order.discount_code})` : ""}</span>
                    <span>-{formatPrice(order.discount_amount / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-ww-muted">
                  <span>Shipping</span>
                  <span>{order.shipping > 0 ? formatPrice(order.shipping / 100) : "Free"}</span>
                </div>
                <div className="flex justify-between text-xs text-ww-muted">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax / 100)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-ww-white pt-2 border-t border-ww-border">
                  <span>Total</span>
                  <span>{formatPrice(order.total / 100)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-ww-surface border border-ww-border rounded-[16px] p-6">
                <h3 className="font-head text-xs font-bold tracking-[0.15em] uppercase text-ww-muted mb-3">Shipping Address</h3>
                <div className="text-sm text-ww-text leading-relaxed">
                  {order.customer_name && <div className="text-ww-white font-medium">{order.customer_name}</div>}
                  <div>{order.shipping_address.line1}</div>
                  {order.shipping_address.line2 && <div>{order.shipping_address.line2}</div>}
                  <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
