"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStoreConfig, updateStore, calculateTax } from "@/app/[storeId]/actions/commerce-actions";

interface StoreConfig {
  id: string;
  name: string;
  currency: string;
  paymentProvider: string;
  settings: Record<string, unknown>;
}

export default function SettingsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [storeName, setStoreName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Tax Rate Lookup
  const [lookupZip, setLookupZip] = useState("");
  const [lookupAmount, setLookupAmount] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState<{
    taxAmount: number;
    rate: number;
    stateRate: number;
    countyRate: number;
    cityRate: number;
    specialRate: number;
    label: string;
    state: string;
    zip: string;
  } | null>(null);

  useEffect(() => {
    load();
  }, [storeId]);

  async function load() {
    try {
      const cfg = await getStoreConfig(storeId);
      setConfig(cfg);
      setStoreName(cfg.name);
    } catch {
      // empty
    }
  }

  async function lookUpTax() {
    if (!lookupZip || lookupZip.length !== 5) {
      setLookupError("Enter a valid 5-digit zip code");
      return;
    }
    setLookupLoading(true);
    setLookupError("");
    setLookupResult(null);
    try {
      const amountDollars = parseFloat(lookupAmount || "100");
      const subtotalCents = Math.round(amountDollars * 100);
      const result = await calculateTax(storeId, subtotalCents, lookupZip);
      if (!result || typeof result.rate === "undefined") {
        setLookupError("No tax data found for this zip code. Make sure tax rates are seeded.");
        return;
      }
      setLookupResult(result);
    } catch {
      setLookupError("Tax lookup failed. The tax rate database may not be configured for this store.");
    }
    setLookupLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    try {
      await updateStore(storeId, {
        name: storeName,
      });
      setMessage("Settings saved");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  if (!config) {
    return <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>Loading...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Settings</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Configure your store details and taxes
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes("saved") ? "alert-success" : "alert-error"}`} style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}>
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

      {/* Tax Rate Lookup */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "#cffafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="#06b6d4" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="heading-sm" style={{ marginBottom: 0 }}>Tax Rate Lookup</h2>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>Look up the exact tax rate for any US zip code</p>
          </div>
        </div>

        <div className="flex gap-3 items-end" style={{ marginBottom: lookupResult || lookupError ? "16px" : 0 }}>
          <div style={{ width: "120px" }}>
            <label>Zip Code</label>
            <input
              value={lookupZip}
              onChange={(e) => setLookupZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="33101"
              maxLength={5}
            />
          </div>
          <div style={{ width: "140px" }}>
            <label>Order Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={lookupAmount}
              onChange={(e) => setLookupAmount(e.target.value)}
              placeholder="100.00"
            />
          </div>
          <button
            onClick={lookUpTax}
            disabled={lookupLoading}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "12px", minHeight: "44px" }}
          >
            {lookupLoading ? "Looking up..." : "Look Up"}
          </button>
        </div>

        {lookupError && (
          <div className="alert alert-error" style={{ borderRadius: "var(--radius-sm)" }}>
            {lookupError}
          </div>
        )}

        {lookupResult && (
          <div style={{ padding: "16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}>
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "12px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "0 0 2px" }}>Total Tax Rate</p>
                <p style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#06b6d4" }}>
                  {(lookupResult.rate * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "0 0 2px" }}>Tax Amount</p>
                <p style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                  ${(lookupResult.taxAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {lookupResult.label && (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 12px" }}>
                {lookupResult.label}{lookupResult.state ? ` (${lookupResult.state})` : ""}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {lookupResult.stateRate > 0 && (
                <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                  State: {(lookupResult.stateRate * 100).toFixed(2)}%
                </span>
              )}
              {lookupResult.countyRate > 0 && (
                <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                  County: {(lookupResult.countyRate * 100).toFixed(2)}%
                </span>
              )}
              {lookupResult.cityRate > 0 && (
                <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                  City: {(lookupResult.cityRate * 100).toFixed(2)}%
                </span>
              )}
              {lookupResult.specialRate > 0 && (
                <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                  Special: {(lookupResult.specialRate * 100).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        )}
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
