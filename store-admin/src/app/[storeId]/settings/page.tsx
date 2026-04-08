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

  // Local Pickup
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");

  // Google Social Login
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleLoginEnabled, setGoogleLoginEnabled] = useState(false);

  // Multi-Currency
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([]);
  const [newCurrency, setNewCurrency] = useState("");

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
      const s = cfg.settings || {};
      setPickupEnabled(s.pickup_enabled || false);
      setPickupAddress(s.pickup_address || "");
      setPickupInstructions(s.pickup_instructions || "");
      setGoogleClientId(s.google_client_id || "");
      setGoogleLoginEnabled(s.google_login_enabled || false);
      setSupportedCurrencies(s.supported_currencies || []);
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
        pickup_enabled: pickupEnabled,
        pickup_address: pickupAddress || null,
        pickup_instructions: pickupInstructions || null,
        google_client_id: googleClientId || null,
        google_login_enabled: googleLoginEnabled,
        supported_currencies: supportedCurrencies.length ? supportedCurrencies : null,
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

      {/* Local Pickup */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="heading-sm" style={{ marginBottom: 0 }}>Local Pickup</h2>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>Let customers pick up orders at your location</p>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
            <input type="checkbox" checked={pickupEnabled} onChange={(e) => setPickupEnabled(e.target.checked)} />
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Enable local pickup at checkout</span>
          </label>
        </div>

        {pickupEnabled && (
          <>
            <div style={{ marginBottom: "12px" }}>
              <label>Pickup Address</label>
              <input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="123 Main St, Miami, FL 33101" />
            </div>
            <div>
              <label>Pickup Instructions</label>
              <textarea value={pickupInstructions} onChange={(e) => setPickupInstructions(e.target.value)} rows={2} placeholder="e.g. Ring doorbell, pickup from front desk, available Mon-Fri 9am-5pm" />
            </div>
          </>
        )}
      </div>

      {/* Google Social Login */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <h2 className="heading-sm" style={{ marginBottom: 0 }}>Google Social Login</h2>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>Let customers sign in with their Google account</p>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
            <input type="checkbox" checked={googleLoginEnabled} onChange={(e) => setGoogleLoginEnabled(e.target.checked)} />
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Enable Google Sign-In on checkout and account pages</span>
          </label>
        </div>

        {googleLoginEnabled && (
          <div>
            <label>Google Client ID</label>
            <input
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="123456789.apps.googleusercontent.com"
              style={{ fontFamily: "monospace", fontSize: "12px" }}
            />
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "8px" }}>
              Create at console.cloud.google.com &rarr; APIs &amp; Services &rarr; Credentials &rarr; OAuth 2.0 Client IDs
            </p>
          </div>
        )}
      </div>

      {/* Multi-Currency */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="heading-sm" style={{ marginBottom: 0 }}>Multi-Currency</h2>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>Show prices in additional currencies for international customers</p>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Base currency: <strong>{config.currency?.toUpperCase() || "USD"}</strong>. Add currencies below to show converted prices on your storefront.
        </p>

        {supportedCurrencies.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {supportedCurrencies.map((c) => (
              <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-secondary)", fontWeight: 500 }}>
                {c.toUpperCase()}
                <button
                  onClick={() => setSupportedCurrencies(supportedCurrencies.filter((x) => x !== c))}
                  style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: 0, fontSize: "14px", lineHeight: 1 }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div style={{ flex: 1 }}>
            <label>Add Currency</label>
            <select
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value)}
              style={{ fontSize: "13px" }}
            >
              <option value="">Select currency...</option>
              {["EUR", "GBP", "CAD", "AUD", "JPY", "MXN", "BRL", "COP", "INR", "CNY", "KRW", "CHF", "SEK", "NOK", "DKK", "PLN", "NZD", "SGD", "HKD", "THB", "PHP", "TWD", "ZAR", "TRY"]
                .filter((c) => c !== config.currency?.toUpperCase() && !supportedCurrencies.includes(c.toLowerCase()))
                .map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
            </select>
          </div>
          <button
            onClick={() => {
              if (newCurrency && !supportedCurrencies.includes(newCurrency)) {
                setSupportedCurrencies([...supportedCurrencies, newCurrency]);
                setNewCurrency("");
              }
            }}
            disabled={!newCurrency}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "12px", minHeight: "44px" }}
          >
            Add
          </button>
        </div>

        <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "12px" }}>
          Exchange rates update automatically every hour. Checkout always processes in your base currency.
        </p>
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
