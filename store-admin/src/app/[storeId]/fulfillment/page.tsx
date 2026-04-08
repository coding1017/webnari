"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getOrders,
  updateOrder,
  getStoreConfig,
  updateStore,
} from "@/app/[storeId]/actions/commerce-actions";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_email: string;
  customer_name: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface ShippingRule {
  min_total: number;
  max_total: number | null;
  cost: number;
  label: string;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FulfillmentPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingShipped, setMarkingShipped] = useState<string | null>(null);
  const [savingRules, setSavingRules] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const showMessage = useCallback((msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 8000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [ordersData, configData] = await Promise.all([
        getOrders(storeId, { limit: 100 }),
        getStoreConfig(storeId),
      ]);
      const orders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
      setAllOrders(orders);
      setShippingRules(configData?.shippingRules || configData?.shipping_rules || []);
    } catch (err) {
      showMessage(`Failed to load data: ${(err as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [storeId, showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleMarkShipped(orderId: string) {
    setMarkingShipped(orderId);
    try {
      await updateOrder(storeId, orderId, { status: "shipped" });
      await loadData();
      showMessage("Order marked as shipped", "success");
    } catch (err) {
      showMessage(`Failed to update order: ${(err as Error).message}`, "error");
    } finally {
      setMarkingShipped(null);
    }
  }

  // Filter orders by status client-side
  const unfulfilled = allOrders.filter(
    (o) => o.status === "confirmed" || o.status === "processing" || o.status === "paid"
  );
  const shipped = allOrders.filter((o) => o.status === "shipped");
  const delivered = allOrders.filter((o) => o.status === "delivered");

  if (loading) {
    return (
      <div style={{ padding: "60px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
          Loading fulfillment data...
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: "32px", maxWidth: "1100px" }}>
      {/* Message */}
      {message && (
        <div
          className={`alert ${messageType === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "20px" }}
        >
          {message}
          <button
            onClick={() => setMessage("")}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              fontSize: "18px",
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg" style={{ marginBottom: "4px" }}>
          Shipping &amp; Fulfillment
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", margin: 0 }}>
          Manage shipments and track deliveries
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "Awaiting Shipment", value: unfulfilled.length, color: "#f59e0b" },
          { label: "Shipped", value: shipped.length, color: "#3b82f6" },
          { label: "Delivered", value: delivered.length, color: "#22c55e" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="card"
            style={{ padding: "20px 24px", borderTop: `3px solid ${kpi.color}` }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "8px",
              }}
            >
              {kpi.label}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Fulfillment Queue ──────────────────────────────── */}
      <div className="card" style={{ marginBottom: "28px" }}>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1.5px solid var(--border)",
          }}
        >
          <h2 className="heading-sm" style={{ margin: 0 }}>Fulfillment Queue</h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-tertiary)",
              margin: "4px 0 0",
            }}
          >
            Orders that are paid or confirmed but not yet shipped
          </p>
        </div>

        {unfulfilled.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <svg
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px",
                color: "var(--text-quaternary)",
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              All orders fulfilled!
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              No pending shipments
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                  {["Order #", "Customer", "Items", "Total", "Date", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 16px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unfulfilled.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    >
                      #{order.order_number}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {order.customer_name || "--"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                        {order.customer_email}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatCurrency(order.total)}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text-tertiary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(order.created_at)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMarkShipped(order.id)}
                        disabled={markingShipped === order.id}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {markingShipped === order.id ? "Updating..." : "Mark Shipped"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recently Shipped ──────────────────────────────── */}
      <div className="card" style={{ marginBottom: "28px" }}>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1.5px solid var(--border)",
          }}
        >
          <h2 className="heading-sm" style={{ margin: 0 }}>Recently Shipped</h2>
        </div>

        {shipped.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <svg
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px",
                color: "var(--text-quaternary)",
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              No recently shipped orders
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Orders will appear here once marked as shipped
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                  {["Order #", "Customer", "Tracking", "Shipped Date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 16px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipped.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    >
                      #{order.order_number}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {order.customer_name || "--"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                        {order.customer_email}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {order.tracking_url ? (
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "var(--gold)",
                            fontWeight: 500,
                            textDecoration: "none",
                            fontSize: "12px",
                            fontFamily: "monospace",
                          }}
                        >
                          {order.tracking_number || "Track"}
                        </a>
                      ) : order.tracking_number ? (
                        <span
                          style={{
                            fontSize: "12px",
                            fontFamily: "monospace",
                            color: "var(--text-primary)",
                          }}
                        >
                          {order.tracking_number}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-quaternary)" }}>
                          No tracking
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text-tertiary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.updated_at ? timeAgo(order.updated_at) : formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Shipping Rules ────────────────────────────────── */}
      <div className="card">
        <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border)" }}>
          <div className="flex items-center" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 className="heading-sm" style={{ margin: 0 }}>Shipping Rules</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "4px 0 0" }}>Set cost tiers by order total</p>
            </div>
            <button
              onClick={() => setShippingRules([...shippingRules, { min_total: 0, max_total: null, cost: 0, label: "Shipping" }])}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "12px" }}
            >
              <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Rule
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {shippingRules.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              {shippingRules.map((rule, i) => (
                <div key={i} className="grid grid-cols-5 gap-3 items-end" style={{ padding: "12px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Min Total ($)</label>
                    <input type="number" step="0.01" value={(rule.min_total / 100).toFixed(2)} onChange={(e) => {
                      const updated = [...shippingRules];
                      updated[i] = { ...updated[i], min_total: Math.round(parseFloat(e.target.value || "0") * 100) };
                      setShippingRules(updated);
                    }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Max Total ($)</label>
                    <input type="number" step="0.01" value={rule.max_total !== null ? (rule.max_total / 100).toFixed(2) : ""} onChange={(e) => {
                      const updated = [...shippingRules];
                      updated[i] = { ...updated[i], max_total: e.target.value === "" ? null : Math.round(parseFloat(e.target.value || "0") * 100) };
                      setShippingRules(updated);
                    }} placeholder="No limit" />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Cost ($)</label>
                    <input type="number" step="0.01" value={(rule.cost / 100).toFixed(2)} onChange={(e) => {
                      const updated = [...shippingRules];
                      updated[i] = { ...updated[i], cost: Math.round(parseFloat(e.target.value || "0") * 100) };
                      setShippingRules(updated);
                    }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Label</label>
                    <input value={rule.label} onChange={(e) => {
                      const updated = [...shippingRules];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setShippingRules(updated);
                    }} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => setShippingRules(shippingRules.filter((_, idx) => idx !== i))} className="btn btn-danger btn-sm" style={{ fontSize: "12px", minHeight: "36px" }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", textAlign: "center", padding: "16px 0", marginBottom: "16px" }}>No shipping rules. Free shipping by default.</p>
          )}

          <button
            onClick={async () => {
              setSavingRules(true);
              try {
                await updateStore(storeId, { shipping_rules: shippingRules });
                showMessage("Shipping rules saved", "success");
              } catch (err) {
                showMessage(`Failed to save: ${(err as Error).message}`, "error");
              }
              setSavingRules(false);
            }}
            disabled={savingRules}
            className="btn btn-primary btn-sm"
            style={{ fontSize: "13px" }}
          >
            {savingRules ? "Saving..." : "Save Shipping Rules"}
          </button>
        </div>
      </div>
    </div>
  );
}
