"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrder, updateOrder } from "@/app/[storeId]/actions/commerce-actions";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-orange",
  confirmed: "badge-blue",
  processing: "badge-blue",
  shipped: "badge-green",
  delivered: "badge-green",
  cancelled: "badge-gray",
  refunded: "badge-red",
};

interface OrderItem {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  price: number;
  image_url: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: { line1: string; line2?: string; city: string; state: string; zip: string } | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  payment_provider: string;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getOrder(storeId, orderId).then((data) => {
      setOrder(data);
      setStatus(data.status);
      setTrackingNumber(data.tracking_number || "");
      setTrackingUrl(data.tracking_url || "");
      setNotes(data.notes || "");
    });
  }, [storeId, orderId]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await updateOrder(storeId, orderId, {
        status,
        tracking_number: trackingNumber || null,
        tracking_url: trackingUrl || null,
        notes: notes || null,
      });
      setMessage("Order updated");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  if (!order) {
    return (
      <div className="fade-in" style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>
        Loading order...
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center gap-4" style={{ marginBottom: "28px" }}>
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: "13px", gap: "4px", display: "flex", alignItems: "center" }}
        >
          <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-3">
            <h1 className="heading-lg">{order.order_number}</h1>
            <span className={`badge ${STATUS_BADGE[order.status] || "badge-gray"}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: "2px" }}>
            Placed {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: order details */}
        <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Items */}
          <div className="card-section">
            <div className="card-section-header">
              <h2 className="heading-sm">Items</h2>
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
            </div>
            <div>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4"
                  style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: "44px", height: "44px", borderRadius: "var(--radius-sm)",
                      background: "var(--bg-grouped)", overflow: "hidden",
                    }}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt="" style={{ width: "44px", height: "44px", objectFit: "cover" }} />
                    ) : (
                      <svg style={{ width: "20px", height: "20px", color: "var(--text-quaternary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{item.product_name}</div>
                    {item.variant_name && (
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "1px" }}>{item.variant_name}</div>
                    )}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>x{item.quantity}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                    {formatCents(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 20px", background: "var(--bg-grouped)", borderTop: "1px solid var(--border)" }}>
              <div className="flex justify-between" style={{ fontSize: "13px", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Subtotal</span>
                <span style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{formatCents(order.subtotal)}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: "13px", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Shipping</span>
                <span style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{formatCents(order.shipping)}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: "13px", marginBottom: "10px" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Tax</span>
                <span style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{formatCents(order.tax)}</span>
              </div>
              <div className="flex justify-between" style={{ paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Total</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{formatCents(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="card-section">
            <div className="card-section-header">
              <h2 className="heading-sm">Customer</h2>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div className="label-caps" style={{ marginBottom: "4px" }}>Name</div>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>{order.customer_name || "—"}</div>
                </div>
                <div>
                  <div className="label-caps" style={{ marginBottom: "4px" }}>Email</div>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>{order.customer_email}</div>
                </div>
                {order.customer_phone && (
                  <div>
                    <div className="label-caps" style={{ marginBottom: "4px" }}>Phone</div>
                    <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>{order.customer_phone}</div>
                  </div>
                )}
                {order.shipping_address && (
                  <div style={{ gridColumn: order.customer_phone ? undefined : "1 / -1" }}>
                    <div className="label-caps" style={{ marginBottom: "4px" }}>Shipping Address</div>
                    <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {order.shipping_address.line1}
                      {order.shipping_address.line2 && <><br />{order.shipping_address.line2}</>}
                      <br />{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Update form */}
          <div className="card-section">
            <div className="card-section-header">
              <h2 className="heading-sm">Update Order</h2>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {message && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "16px",
                    background: message === "Order updated" ? "var(--green-light)" : "var(--red-light)",
                    color: message === "Order updated" ? "var(--green)" : "var(--red)",
                  }}
                >
                  {message}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label>Tracking Number</label>
                  <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. 1Z999AA10123456784" />
                </div>

                <div>
                  <label>Tracking URL</label>
                  <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://..." />
                </div>

                <div>
                  <label>Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes..." />
                </div>

                <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: "100%" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Refund section */}
          {order.status !== "refunded" && order.status !== "cancelled" && (
            <div className="card-section">
              <div className="card-section-header">
                <h2 className="heading-sm">Refund</h2>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "14px", lineHeight: 1.5 }}>
                  Process a full refund of {formatCents(order.total)} to the customer. This will restore inventory and refund the payment.
                </p>
                <button
                  onClick={async () => {
                    if (!confirm(`Process a full refund of ${formatCents(order.total)} for order ${order.order_number}? This cannot be undone.`)) return;
                    setSaving(true);
                    try {
                      await updateOrder(storeId, orderId, { status: "refunded" });
                      setStatus("refunded");
                      setMessage("Refund processed");
                      setTimeout(() => setMessage(""), 3000);
                    } catch (err) {
                      setMessage((err as Error).message);
                    }
                    setSaving(false);
                  }}
                  disabled={saving}
                  className="btn btn-danger"
                  style={{ width: "100%" }}
                >
                  Process Full Refund
                </button>
              </div>
            </div>
          )}

          {order.status === "refunded" && (
            <div style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              background: "var(--red-light)",
              border: "1px solid var(--border-subtle)",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--red)" }}>Refunded</div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                {formatCents(order.total)} has been refunded to the customer.
              </div>
            </div>
          )}

          {/* Meta info */}
          <div className="card-section">
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="flex justify-between">
                <span className="label-caps">Payment</span>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{order.payment_provider || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="label-caps">Created</span>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                  {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
