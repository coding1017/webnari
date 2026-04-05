"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStoreConfig, updateStore, upsertTaxRate } from "@/app/[storeId]/actions/commerce-actions";

interface ShippingRule {
  min_total: number;
  max_total: number | null;
  cost: number;
  label: string;
}

interface TaxRate {
  id: string;
  state: string;
  rate: number;
  label: string;
}

interface StoreConfig {
  id: string;
  name: string;
  currency: string;
  paymentProvider: string;
  shippingRules: ShippingRule[];
  settings: Record<string, unknown>;
}

export default function SettingsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [storeName, setStoreName] = useState("");
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [newState, setNewState] = useState("");
  const [newRate, setNewRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, [storeId]);

  async function load() {
    try {
      const cfg = await getStoreConfig(storeId);
      setConfig(cfg);
      setStoreName(cfg.name);
      setShippingRules(cfg.shippingRules || []);
    } catch {
      // empty
    }
  }

  function formatCents(cents: number) {
    return (cents / 100).toFixed(2);
  }

  function updateShippingRule(i: number, field: keyof ShippingRule, value: string) {
    const updated = [...shippingRules];
    if (field === "label") {
      updated[i].label = value;
    } else if (field === "max_total" && value === "") {
      updated[i].max_total = null;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated[i] as any)[field] = Math.round(parseFloat(value || "0") * 100);
    }
    setShippingRules(updated);
  }

  function addShippingRule() {
    setShippingRules([...shippingRules, { min_total: 0, max_total: null, cost: 0, label: "Shipping" }]);
  }

  function removeShippingRule(i: number) {
    setShippingRules(shippingRules.filter((_, idx) => idx !== i));
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    try {
      await updateStore(storeId, {
        name: storeName,
        shipping_rules: shippingRules,
      });
      setMessage("Settings saved");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  async function addTaxRate() {
    if (!newState || !newRate) return;
    try {
      await upsertTaxRate(storeId, { state: newState.toUpperCase(), rate: parseFloat(newRate) / 100 });
      setNewState("");
      setNewRate("");
      setMessage("Tax rate added");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  if (!config) {
    return <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>Loading...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Settings</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Configure your store details, shipping, and taxes
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes("saved") || message.includes("added") ? "alert-success" : "alert-error"}`} style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}>
          {message}
        </div>
      )}

      {/* Store Info */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="heading-sm" style={{ marginBottom: 0 }}>Store Info</h2>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>Basic details about your store</p>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Store Name</label>
          <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Currency</label>
            <input value={config.currency.toUpperCase()} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
          </div>
          <div>
            <label>Payment Provider</label>
            <input value={config.paymentProvider} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
          </div>
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "12px" }}>
          Payment keys and currency are managed by Webnari. Contact support to update.
        </p>
      </div>

      {/* Shipping Rules */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="var(--blue)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: 0 }}>Shipping Rules</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>Set cost tiers by order total</p>
            </div>
          </div>
          <button onClick={addShippingRule} className="btn btn-secondary btn-sm" style={{ fontSize: "12px" }}>
            <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Rule
          </button>
        </div>

        {shippingRules.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {shippingRules.map((rule, i) => (
              <div key={i} className="grid grid-cols-5 gap-3 items-end" style={{ padding: "12px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}>
                <div>
                  <label>Min Total ($)</label>
                  <input type="number" step="0.01" value={formatCents(rule.min_total)} onChange={(e) => updateShippingRule(i, "min_total", e.target.value)} />
                </div>
                <div>
                  <label>Max Total ($)</label>
                  <input type="number" step="0.01" value={rule.max_total !== null ? formatCents(rule.max_total) : ""} onChange={(e) => updateShippingRule(i, "max_total", e.target.value)} placeholder="No limit" />
                </div>
                <div>
                  <label>Cost ($)</label>
                  <input type="number" step="0.01" value={formatCents(rule.cost)} onChange={(e) => updateShippingRule(i, "cost", e.target.value)} />
                </div>
                <div>
                  <label>Label</label>
                  <input value={rule.label} onChange={(e) => updateShippingRule(i, "label", e.target.value)} />
                </div>
                <div className="flex items-end">
                  <button onClick={() => removeShippingRule(i)} className="btn btn-danger btn-sm" style={{ fontSize: "12px", minHeight: "36px" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", textAlign: "center", padding: "16px 0" }}>No shipping rules. Free shipping by default.</p>
        )}
      </div>

      {/* Tax Rates */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="var(--purple)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <div>
            <h2 className="heading-sm" style={{ marginBottom: 0 }}>Tax Rates</h2>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>Calculated by customer shipping state</p>
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div style={{ width: "80px" }}>
            <label>State</label>
            <input value={newState} onChange={(e) => setNewState(e.target.value)} placeholder="FL" maxLength={2} style={{ textTransform: "uppercase" }} />
          </div>
          <div style={{ width: "120px" }}>
            <label>Rate (%)</label>
            <input type="number" step="0.01" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="7.00" />
          </div>
          <button onClick={addTaxRate} className="btn btn-secondary btn-sm" style={{ fontSize: "12px", minHeight: "44px" }}>
            Add Rate
          </button>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="btn btn-primary"
        style={{ fontSize: "14px" }}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
