"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getIntegrations,
  disconnectSquare,
  connectSquare,
  syncSquare,
  getSquareLocations,
  setSquareLocation,
  getProductMappings,
  deleteProductMapping,
  deleteAllProductMappings,
  getSyncLog,
} from "@/app/[storeId]/actions/commerce-actions";

interface Integration {
  id: string;
  store_id: string;
  provider: string;
  merchant_id: string | null;
  location_id: string | null;
  settings: Record<string, unknown>;
  connected_at: string;
  updated_at: string;
  token_expires_at: string | null;
  mapping_count: number;
}

interface SquareLocation {
  id: string;
  name: string;
  status: string;
  address?: { address_line_1?: string; locality?: string; administrative_district_level_1?: string };
}

interface ProductMapping {
  id: string;
  store_id: string;
  provider: string;
  webnari_product_id: string;
  webnari_variant_id: string | null;
  external_id: string;
  external_name: string | null;
  external_sku: string | null;
  webnari_product_name: string;
  webnari_variant_name: string | null;
  webnari_sku: string | null;
  auto_sync: boolean;
  created_at: string;
}

interface SyncLogEntry {
  id: string;
  provider: string;
  direction: string;
  event_type: string;
  details: string | null;
  status: string;
  error: string | null;
  created_at: string;
}

type Tab = "overview" | "mappings" | "log";

export default function IntegrationsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [squareLocations, setSquareLocations] = useState<SquareLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [mappings, setMappings] = useState<ProductMapping[]>([]);
  const [syncLog, setSyncLog] = useState<SyncLogEntry[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const squareIntegration = integrations.find((i) => i.provider === "square") || null;

  const showMessage = useCallback((msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const integ = await getIntegrations(storeId);
      setIntegrations(integ);

      const square = integ.find((i: Integration) => i.provider === "square");
      if (square) {
        const [mapData, logData] = await Promise.all([
          getProductMappings(storeId),
          getSyncLog(storeId),
        ]);
        setMappings(mapData);
        setSyncLog(logData);
      }
    } catch {
      // empty
    }
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle redirect params from OAuth callback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get("connected");
    const error = urlParams.get("error");
    if (connected === "square") {
      showMessage("Square connected successfully");
      loadData();
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (error) {
      showMessage(`Connection failed: ${error}`, "error");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showMessage, loadData]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const result = await connectSquare(storeId);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      showMessage((err as Error).message, "error");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect Square? This will remove all product mappings and stop inventory sync.")) return;
    setDisconnecting(true);
    try {
      await disconnectSquare(storeId);
      showMessage("Square disconnected");
      setIntegrations([]);
      setMappings([]);
      setSyncLog([]);
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
    setDisconnecting(false);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await syncSquare(storeId);
      const parts = [];
      if (result.matched) parts.push(`${result.matched} matched by SKU`);
      if (result.imported_from_square) parts.push(`${result.imported_from_square} imported from Square`);
      if (result.pushed_to_square) parts.push(`${result.pushed_to_square} pushed to Square`);
      if (result.inventory_updated) parts.push(`${result.inventory_updated} inventory counts synced`);
      showMessage(`Sync complete: ${parts.join(', ') || 'everything up to date'}`);
      loadData();
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
    setSyncing(false);
  }

  async function handleLoadLocations() {
    try {
      const data = await getSquareLocations(storeId);
      setSquareLocations(data.locations || []);
      setCurrentLocation(data.current);
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
  }

  async function handleSetLocation(locationId: string) {
    try {
      await setSquareLocation(storeId, locationId);
      setCurrentLocation(locationId);
      showMessage("Location updated");
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
  }

  async function handleDeleteMapping(id: string) {
    try {
      await deleteProductMapping(storeId, id);
      setMappings(mappings.filter((m) => m.id !== id));
      showMessage("Mapping removed");
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
  }

  async function handleDeleteAllMappings() {
    if (!confirm(`Delete all ${mappings.length} product mappings? This will unlink all products from Square. You can re-sync after.`)) return;
    try {
      await deleteAllProductMappings(storeId);
      setMappings([]);
      showMessage("All mappings deleted");
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Integrations</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Connect external services to sync inventory and accounting
        </p>
      </div>

      {message && (
        <div
          className={`alert ${messageType === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}
        >
          {message}
        </div>
      )}

      {/* Square POS Card */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" />
                <rect x="7" y="7" width="10" height="10" rx="1.5" fill="#000" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: 0 }}>Square POS</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                Sync inventory between online store and in-person sales
              </p>
            </div>
          </div>

          {squareIntegration ? (
            <span className="badge badge-green">Connected</span>
          ) : (
            <span className="badge badge-gray">Not Connected</span>
          )}
        </div>

        {!squareIntegration ? (
          <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-grouped)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--text-quaternary)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>
              Connect your Square account
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "420px", margin: "0 auto 20px" }}>
              When someone buys at your physical store via Square POS, your online inventory updates automatically. No more overselling.
            </p>
            <button onClick={handleConnect} disabled={connecting} className="btn btn-primary" style={{ fontSize: "14px" }}>
              {connecting ? (
                "Redirecting to Square..."
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connect Square
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ padding: "14px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                  Merchant ID
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace" }}>
                  {squareIntegration.merchant_id || "\u2014"}
                </div>
              </div>
              <div style={{ padding: "14px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                  Location
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace" }}>
                  {squareIntegration.location_id?.slice(0, 12) || "\u2014"}...
                </div>
              </div>
              <div style={{ padding: "14px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                  Products Mapped
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {squareIntegration.mapping_count}
                </div>
              </div>
              <div style={{ padding: "14px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                  Connected
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {formatDate(squareIntegration.connected_at)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
              <button onClick={handleSync} disabled={syncing} className="btn btn-primary btn-sm" style={{ fontSize: "13px" }}>
                {syncing ? (
                  "Syncing..."
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Catalog
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  handleLoadLocations();
                  setTab("overview");
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "13px" }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Change Location
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="btn btn-danger btn-sm"
                style={{ fontSize: "13px", marginLeft: "auto" }}
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>

            {squareLocations.length > 0 && (
              <div style={{ marginTop: "16px", padding: "16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Select Location
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {squareLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSetLocation(loc.id)}
                      className="flex items-center justify-between"
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: `1.5px solid ${currentLocation === loc.id ? "var(--gold)" : "var(--border)"}`,
                        background: currentLocation === loc.id ? "var(--gold-light)" : "var(--bg-elevated)",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{loc.name}</div>
                        {loc.address && (
                          <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                            {loc.address.address_line_1}, {loc.address.locality}, {loc.address.administrative_district_level_1}
                          </div>
                        )}
                      </div>
                      {currentLocation === loc.id && (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* QuickBooks Card (coming soon) */}
      <div className="card" style={{ marginBottom: "32px", opacity: 0.6 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                background: "#2CA01C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-2 11.5c-1.93 0-3.5-1.57-3.5-3.5S8.07 8.5 10 8.5h.5v1.5H10c-1.1 0-2 .9-2 2s.9 2 2 2h1v-3h1.5v4.5H10zm6.5-3.5c0 1.93-1.57 3.5-3.5 3.5h-.5v-1.5h.5c1.1 0 2-.9 2-2s-.9-2-2-2h-1v3H10.5V8.5H14c1.93 0 3.5 1.57 3.5 3.5z" fill="white" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: 0 }}>QuickBooks Online</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                Auto-sync orders to your accounting books
              </p>
            </div>
          </div>
          <span className="badge badge-gray">Coming Soon</span>
        </div>
      </div>

      {/* Tabs: Mappings & Sync Log (only if Square connected) */}
      {squareIntegration && (
        <>
          <div className="flex items-center gap-2" style={{ marginBottom: "20px" }}>
            {(["overview", "mappings", "log"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  if (t === "mappings") getProductMappings(storeId).then(setMappings).catch(() => {});
                  if (t === "log") getSyncLog(storeId).then(setSyncLog).catch(() => {});
                }}
                className={`filter-pill ${tab === t ? "filter-pill-active" : ""}`}
              >
                {t === "overview" ? "Overview" : t === "mappings" ? `Product Mappings (${mappings.length})` : `Sync Log (${syncLog.length})`}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {tab === "overview" && (
            <div className="card-section">
              <div className="card-section-header">
                <span className="heading-sm">How It Works</span>
              </div>
              <div className="card-section-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { step: "1", title: "Catalog Sync", desc: "Click \"Sync Catalog\" to pull your Square items and auto-match them to Webnari products by SKU." },
                    { step: "2", title: "POS Sale Detected", desc: "When someone pays at your physical store, Square sends a webhook to Webnari in real-time." },
                    { step: "3", title: "Inventory Updates", desc: "Webnari automatically decrements the online stock so your website never oversells." },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "var(--radius-full)",
                          background: "var(--gradient-gold)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {item.step}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mappings Tab */}
          {tab === "mappings" && (
            <div className="card-section">
              <div className="card-section-header">
                <span className="heading-sm">Product Mappings</span>
                <button onClick={handleSync} disabled={syncing} className="btn btn-secondary btn-sm" style={{ fontSize: "12px" }}>
                  {syncing ? "Syncing..." : "Re-sync by SKU"}
                </button>
              </div>
              {mappings.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--bg-grouped)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--text-quaternary)" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    No product mappings yet
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "360px", margin: "0 auto" }}>
                    Click &quot;Sync Catalog&quot; to automatically match products by SKU, or create mappings manually.
                  </p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Webnari Product</th>
                      <th className="hide-mobile">SKU</th>
                      <th>Square Item</th>
                      <th className="hide-mobile">Auto-Sync</th>
                      <th style={{ width: "80px", textAlign: "right" }}>
                        <button
                          onClick={handleDeleteAllMappings}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: "11px", color: "var(--red)", padding: "2px 8px", minHeight: "24px" }}
                        >
                          Delete All
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "13px" }}>
                            {m.webnari_product_name}
                          </div>
                          {m.webnari_variant_name && (
                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                              {m.webnari_variant_name}
                            </div>
                          )}
                        </td>
                        <td className="hide-mobile">
                          <code style={{ fontSize: "12px", padding: "2px 6px", background: "var(--bg-grouped)", borderRadius: "4px", color: "var(--text-tertiary)" }}>
                            {m.webnari_sku || "\u2014"}
                          </code>
                        </td>
                        <td>
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                            {m.external_name || m.external_id.slice(0, 16) + "..."}
                          </div>
                          {m.external_sku && (
                            <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                              SKU: {m.external_sku}
                            </div>
                          )}
                        </td>
                        <td className="hide-mobile">
                          {m.auto_sync ? (
                            <span className="badge badge-green">Active</span>
                          ) : (
                            <span className="badge badge-gray">Paused</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteMapping(m.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--red)", padding: "4px 8px", minHeight: "28px" }}
                          >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Sync Log Tab */}
          {tab === "log" && (
            <div className="card-section">
              <div className="card-section-header">
                <span className="heading-sm">Sync Activity</span>
                <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Last 50 events</span>
              </div>
              {syncLog.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>No sync activity yet</p>
                </div>
              ) : (
                <div style={{ maxHeight: "480px", overflowY: "auto" }}>
                  {syncLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3"
                      style={{
                        padding: "12px 24px",
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          marginTop: "6px",
                          flexShrink: 0,
                          background:
                            entry.status === "success"
                              ? "var(--green)"
                              : entry.status === "error"
                              ? "var(--red)"
                              : "var(--orange)",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {entry.event_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <span
                            className="badge"
                            style={{
                              fontSize: "10px",
                              padding: "1px 7px",
                              background:
                                entry.direction === "inbound"
                                  ? "var(--blue-light)"
                                  : entry.direction === "outbound"
                                  ? "var(--purple-light)"
                                  : "var(--bg-grouped)",
                              color:
                                entry.direction === "inbound"
                                  ? "var(--blue)"
                                  : entry.direction === "outbound"
                                  ? "var(--purple)"
                                  : "var(--text-tertiary)",
                            }}
                          >
                            {entry.direction}
                          </span>
                        </div>
                        {entry.details && (
                          <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px", lineHeight: 1.4 }}>
                            {entry.details}
                          </div>
                        )}
                        {entry.error && (
                          <div style={{ fontSize: "12px", color: "var(--red)", marginTop: "2px" }}>
                            {entry.error}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-quaternary)", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {timeAgo(entry.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
