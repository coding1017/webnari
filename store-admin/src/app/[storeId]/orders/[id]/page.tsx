"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrder, updateOrder } from "@/app/[storeId]/actions/commerce-actions";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

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
    return <div className="p-8 text-center" style={{ color: "var(--text-tertiary)" }}>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-sm" style={{ color: "var(--text-tertiary)" }}>&larr; Back</button>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{order.order_number}</h1>
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "var(--bg-grouped)", color: "var(--text-primary)" }}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Items</h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs" style={{ background: "var(--bg-grouped)", color: "var(--text-tertiary)" }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : "IMG"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {item.product_name}
                    </div>
                    {item.variant_name && (
                      <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{item.variant_name}</div>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>x{item.quantity}</div>
                  <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {formatCents(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 space-y-2" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-grouped)" }}>
              <div className="flex justify-between text-sm"><span style={{ color: "var(--text-tertiary)" }}>Subtotal</span><span>{formatCents(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: "var(--text-tertiary)" }}>Shipping</span><span>{formatCents(order.shipping)}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: "var(--text-tertiary)" }}>Tax</span><span>{formatCents(order.tax)}</span></div>
              <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <span>Total</span><span>{formatCents(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-xl p-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Customer</h2>
            <div className="space-y-2 text-sm">
              <div><span style={{ color: "var(--text-tertiary)" }}>Name:</span> <span style={{ color: "var(--text-primary)" }}>{order.customer_name || "—"}</span></div>
              <div><span style={{ color: "var(--text-tertiary)" }}>Email:</span> <span style={{ color: "var(--text-primary)" }}>{order.customer_email}</span></div>
              {order.customer_phone && <div><span style={{ color: "var(--text-tertiary)" }}>Phone:</span> <span style={{ color: "var(--text-primary)" }}>{order.customer_phone}</span></div>}
              {order.shipping_address && (
                <div>
                  <span style={{ color: "var(--text-tertiary)" }}>Ship to:</span>{" "}
                  <span style={{ color: "var(--text-primary)" }}>
                    {order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="space-y-6">
          <div className="rounded-xl p-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Update Order</h2>

            {message && (
              <div className="p-3 rounded-lg text-xs mb-4" style={{ background: message === "Order updated" ? "#22c55e20" : "#ef444420", color: message === "Order updated" ? "var(--green)" : "var(--red)" }}>
                {message}
              </div>
            )}

            <div className="space-y-4">
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

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: saving ? "var(--text-tertiary)" : "var(--blue)" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div className="text-xs space-y-2" style={{ color: "var(--text-tertiary)" }}>
              <div>Payment: {order.payment_provider || "—"}</div>
              <div>Created: {new Date(order.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
