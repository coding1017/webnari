"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  getProducts,
  getCustomers,
} from "@/app/[storeId]/actions/commerce-actions";

interface Subscription {
  id: string;
  customer_id: string;
  product_id: string;
  status: string;
  billing_interval: string;
  price_cents: number;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  product_name?: string;
}

interface Product {
  id: string;
  name: string;
  price_cents: number;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  trialing: "#6366f1",
  paused: "#f59e0b",
  cancelled: "#ef4444",
  past_due: "#ef4444",
  expired: "#64748b",
};

const INTERVALS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "weekly", label: "Weekly" },
];

export default function SubscriptionsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    customer_id: "",
    product_id: "",
    billing_interval: "monthly",
    price_cents: 0,
    trial_days: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [storeId]);

  async function load() {
    try {
      const [s, p, c] = await Promise.all([
        getSubscriptions(storeId),
        getProducts(storeId),
        getCustomers(storeId),
      ]);
      setSubs(s || []);
      setProducts(p || []);
      setCustomers(c || []);
    } catch { /* empty */ }
    setLoading(false);
  }

  async function handleCreate() {
    if (!form.customer_id || !form.product_id) return;
    setSaving(true);
    setMessage("");
    try {
      await createSubscription(storeId, {
        customer_id: form.customer_id,
        product_id: form.product_id,
        billing_interval: form.billing_interval,
        price_cents: form.price_cents,
        trial_days: form.trial_days || undefined,
      });
      setShowCreate(false);
      setForm({ customer_id: "", product_id: "", billing_interval: "monthly", price_cents: 0, trial_days: 0 });
      setMessage("Subscription created");
      setTimeout(() => setMessage(""), 3000);
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  async function handleCancel(id: string) {
    try {
      await updateSubscription(storeId, id, { cancel_at_period_end: true });
      setMessage("Subscription set to cancel at period end");
      setTimeout(() => setMessage(""), 3000);
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function handlePause(id: string) {
    try {
      await updateSubscription(storeId, id, { status: "paused" });
      setMessage("Subscription paused");
      setTimeout(() => setMessage(""), 3000);
      load();
    } catch { /* empty */ }
  }

  async function handleResume(id: string) {
    try {
      await updateSubscription(storeId, id, { status: "active", cancel_at_period_end: false });
      setMessage("Subscription resumed");
      setTimeout(() => setMessage(""), 3000);
      load();
    } catch { /* empty */ }
  }

  const filtered = filter === "all" ? subs : subs.filter((s) => s.status === filter);

  const activeMRR = subs
    .filter((s) => s.status === "active" || s.status === "trialing")
    .reduce((sum, s) => {
      const monthly = s.billing_interval === "yearly" ? s.price_cents / 12
        : s.billing_interval === "quarterly" ? s.price_cents / 3
        : s.billing_interval === "weekly" ? s.price_cents * 4.33
        : s.price_cents;
      return sum + monthly;
    }, 0);

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>Loading...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: "960px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Subscriptions</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Manage recurring billing and subscription plans
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary btn-sm">
          {showCreate ? "Cancel" : "+ New Subscription"}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes("created") || message.includes("resumed") ? "alert-success" : message.includes("cancel") || message.includes("paused") ? "alert-warning" : "alert-error"}`} style={{ marginBottom: "20px" }}>
          {message}
        </div>
      )}

      {/* MRR Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>Active Subscriptions</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
            {subs.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>Monthly Recurring Revenue</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
            ${(activeMRR / 100).toFixed(2)}
          </p>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>Trialing</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#6366f1" }}>
            {subs.filter((s) => s.status === "trialing").length}
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <h2 className="heading-sm" style={{ marginBottom: "16px" }}>Create Subscription</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label>Customer</label>
              <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Product</label>
              <select
                value={form.product_id}
                onChange={(e) => {
                  const prod = products.find((p) => p.id === e.target.value);
                  setForm({ ...form, product_id: e.target.value, price_cents: prod?.price_cents || 0 });
                }}
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (${(p.price_cents / 100).toFixed(2)})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Billing Interval</label>
              <select value={form.billing_interval} onChange={(e) => setForm({ ...form, billing_interval: e.target.value })}>
                {INTERVALS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Price (cents)</label>
              <input type="number" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label>Trial Days (optional)</label>
              <input type="number" value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: parseInt(e.target.value) || 0 })} placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-3" style={{ marginTop: "16px" }}>
            <button onClick={() => setShowCreate(false)} className="btn btn-sm" style={{ background: "var(--bg-secondary)" }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.customer_id || !form.product_id} className="btn btn-primary btn-sm">
              {saving ? "Creating..." : "Create Subscription"}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2" style={{ marginBottom: "16px" }}>
        {["all", "active", "trialing", "paused", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="btn btn-sm"
            style={{
              fontSize: "12px",
              padding: "4px 12px",
              background: filter === s ? "var(--gold-light)" : "var(--bg-secondary)",
              color: filter === s ? "var(--gold)" : "var(--text-secondary)",
              fontWeight: filter === s ? 600 : 400,
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Subscriptions List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
          <p style={{ fontSize: "14px" }}>
            {filter === "all" ? "No subscriptions yet. Create one to start recurring billing." : `No ${filter} subscriptions.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {filtered.map((sub) => (
            <div key={sub.id} className="card" style={{ padding: "16px 20px" }}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 10px",
                        borderRadius: "var(--radius-sm)",
                        background: (STATUS_COLORS[sub.status] || "#64748b") + "18",
                        color: STATUS_COLORS[sub.status] || "#64748b",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {sub.status}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {sub.customer_name || sub.customer_email || sub.customer_id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4" style={{ marginTop: "6px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      {sub.product_name || "Product"} &middot; ${(sub.price_cents / 100).toFixed(2)}/{sub.billing_interval}
                    </span>
                    {sub.cancel_at_period_end && (
                      <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 500 }}>Cancels at period end</span>
                    )}
                    {sub.trial_ends_at && sub.status === "trialing" && (
                      <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: 500 }}>
                        Trial ends {new Date(sub.trial_ends_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {sub.status === "active" && !sub.cancel_at_period_end && (
                    <>
                      <button onClick={() => handlePause(sub.id)} className="btn btn-sm" style={{ fontSize: "12px", padding: "4px 10px", background: "var(--bg-secondary)" }}>
                        Pause
                      </button>
                      <button onClick={() => handleCancel(sub.id)} className="btn btn-sm" style={{ fontSize: "12px", padding: "4px 10px", background: "#ef444418", color: "#ef4444" }}>
                        Cancel
                      </button>
                    </>
                  )}
                  {sub.status === "paused" && (
                    <button onClick={() => handleResume(sub.id)} className="btn btn-sm" style={{ fontSize: "12px", padding: "4px 10px", background: "#10b98118", color: "#10b981" }}>
                      Resume
                    </button>
                  )}
                  {sub.cancel_at_period_end && sub.status === "active" && (
                    <button onClick={() => handleResume(sub.id)} className="btn btn-sm" style={{ fontSize: "12px", padding: "4px 10px", background: "#10b98118", color: "#10b981" }}>
                      Undo Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
