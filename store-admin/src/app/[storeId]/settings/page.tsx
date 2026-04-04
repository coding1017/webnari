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

      // Load tax rates via admin endpoint
      // For now we'll calculate from a known set
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
    return <div className="p-8 text-center" style={{ color: "var(--text-tertiary)" }}>Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Settings</h1>

      {message && (
        <div className="p-3 rounded-lg text-sm mb-6" style={{ background: message.includes("saved") || message.includes("added") ? "#22c55e20" : "#ef444420", color: message.includes("saved") || message.includes("added") ? "var(--green)" : "var(--red)" }}>
          {message}
        </div>
      )}

      {/* Store Info */}
      <section className="rounded-xl p-6 space-y-4 mb-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Store Info</h2>
        <div>
          <label>Store Name</label>
          <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Currency</label>
            <input value={config.currency.toUpperCase()} disabled className="opacity-50" />
          </div>
          <div>
            <label>Payment Provider</label>
            <input value={config.paymentProvider} disabled className="opacity-50" />
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Payment keys and currency are managed by Webnari. Contact support to update.
        </p>
      </section>

      {/* Shipping Rules */}
      <section className="rounded-xl p-6 space-y-4 mb-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Shipping Rules</h2>
          <button onClick={addShippingRule} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-grouped)", color: "var(--gold)", border: "1px solid var(--border)" }}>
            + Add Rule
          </button>
        </div>

        {shippingRules.map((rule, i) => (
          <div key={i} className="grid grid-cols-5 gap-3 items-end">
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
            <div>
              <button onClick={() => removeShippingRule(i)} className="text-xs py-2.5" style={{ color: "var(--red)" }}>Remove</button>
            </div>
          </div>
        ))}

        {shippingRules.length === 0 && (
          <p className="text-xs text-center py-3" style={{ color: "var(--text-tertiary)" }}>No shipping rules. Free shipping by default.</p>
        )}
      </section>

      {/* Tax Rates */}
      <section className="rounded-xl p-6 space-y-4 mb-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Tax Rates</h2>

        <div className="flex gap-3 items-end">
          <div className="w-20">
            <label>State</label>
            <input value={newState} onChange={(e) => setNewState(e.target.value)} placeholder="FL" maxLength={2} />
          </div>
          <div className="w-24">
            <label>Rate (%)</label>
            <input type="number" step="0.01" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="7.00" />
          </div>
          <button onClick={addTaxRate} className="px-4 py-2.5 rounded-lg text-sm font-medium shrink-0" style={{ background: "var(--bg-grouped)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
            Add
          </button>
        </div>

        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Tax is calculated based on the customer's shipping state.
        </p>
      </section>

      {/* Save */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="px-6 py-2.5 rounded-lg text-sm font-medium text-white"
        style={{ background: saving ? "var(--text-tertiary)" : "var(--blue)" }}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
