"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount_amount: number;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  pending: { text: "#FF9500", bg: "rgba(255,149,0,0.12)" },
  confirmed: { text: "#007AFF", bg: "rgba(0,122,255,0.12)" },
  processing: { text: "#5856D6", bg: "rgba(88,86,214,0.12)" },
  shipped: { text: "#34C759", bg: "rgba(52,199,89,0.12)" },
  delivered: { text: "#34C759", bg: "rgba(52,199,89,0.12)" },
  cancelled: { text: "#8E8E93", bg: "rgba(142,142,147,0.12)" },
  refunded: { text: "#FF3B30", bg: "rgba(255,59,48,0.12)" },
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("ww_customer_token");
    if (!token) {
      router.push("/account/login");
      return;
    }
    loadOrders(token);
  }, [router]);

  async function loadOrders(token: string) {
    try {
      const res = await fetch(`${API_BASE}/api/account/orders`, {
        headers: { "X-Store-ID": STORE_ID, Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("ww_customer_token");
        localStorage.removeItem("ww_customer");
        router.push("/account/login");
        return;
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      // Failed to load
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-[120px] pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ww-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[680px] mx-auto px-10 max-md:px-5">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-10">
            <Link href="/account" className="text-sm text-ww-muted hover:text-ww-pink transition-colors mb-4 inline-block">
              &larr; Back to account
            </Link>
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-3">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Order History
            </div>
            <h1 className="font-head font-black text-[clamp(28px,4vw,40px)] leading-[1.05] text-ww-white">
              Your <span className="gradient-text">Orders</span>
            </h1>
          </div>
        </ScrollReveal>

        {orders.length === 0 ? (
          <ScrollReveal delay={1}>
            <div className="text-center p-12 bg-ww-surface border border-ww-border rounded-[20px]">
              <svg className="w-12 h-12 mx-auto mb-4 text-ww-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="font-head text-lg font-bold text-ww-white mb-2">No orders yet</h2>
              <p className="text-sm text-ww-muted mb-6">When you make a purchase, your orders will show up here.</p>
              <Link
                href="/shop"
                className="inline-block px-8 py-3 bg-[image:var(--gradient)] text-white font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[10px] hover:shadow-[0_0_24px_rgba(255,45,155,0.3)] transition-all"
              >
                Start Shopping
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              const isExpanded = expandedOrder === order.id;

              return (
                <ScrollReveal key={order.id} delay={i < 5 ? i + 1 : 5}>
                  <div className="bg-ww-surface border border-ww-border rounded-[16px] overflow-hidden">
                    {/* Order Header */}
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-ww-dark/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm font-medium text-ww-white font-mono">#{order.order_number}</div>
                          <div className="text-xs text-ww-muted mt-0.5">
                            {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-[10px] font-head font-bold tracking-wider uppercase px-3 py-1 rounded-full"
                          style={{ color: status.text, background: status.bg }}
                        >
                          {order.status}
                        </span>
                        <span className="text-sm font-semibold text-ww-purple2">{formatPrice(order.total / 100)}</span>
                        <svg
                          className={`w-4 h-4 text-ww-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-ww-border">
                        {/* Items */}
                        {order.items?.map((item, j) => (
                          <div key={j} className="flex items-center justify-between px-5 py-3 border-b border-ww-border/50 last:border-0">
                            <div>
                              <div className="text-sm text-ww-white">{item.product_name}</div>
                              {item.variant_name && <div className="text-xs text-ww-muted">{item.variant_name}</div>}
                              <div className="text-xs text-ww-muted">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-sm text-ww-text">{formatPrice((item.price / 100) * item.quantity)}</div>
                          </div>
                        ))}

                        {/* Totals */}
                        <div className="px-5 py-4 bg-ww-dark/20 space-y-1.5">
                          <div className="flex justify-between text-xs text-ww-muted">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal / 100)}</span>
                          </div>
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between text-xs text-[#39FF14]">
                              <span>Discount</span>
                              <span>-{formatPrice(order.discount_amount / 100)}</span>
                            </div>
                          )}
                          {order.shipping > 0 && (
                            <div className="flex justify-between text-xs text-ww-muted">
                              <span>Shipping</span>
                              <span>{formatPrice(order.shipping / 100)}</span>
                            </div>
                          )}
                          {order.tax > 0 && (
                            <div className="flex justify-between text-xs text-ww-muted">
                              <span>Tax</span>
                              <span>{formatPrice(order.tax / 100)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-bold text-ww-white pt-1.5 border-t border-ww-border">
                            <span>Total</span>
                            <span>{formatPrice(order.total / 100)}</span>
                          </div>
                        </div>

                        {/* Tracking */}
                        {order.tracking_number && (
                          <div className="px-5 py-4 border-t border-ww-border flex items-center justify-between">
                            <div className="text-xs text-ww-muted">
                              Tracking: <span className="font-mono text-ww-white">{order.tracking_number}</span>
                            </div>
                            {order.tracking_url && (
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-ww-purple hover:text-ww-pink transition-colors"
                              >
                                Track &rarr;
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
