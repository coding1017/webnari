"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getIntegrations,
  disconnectSquare,
  connectSquare,
  syncSquare,
  syncSquareImages,
  getSquareLocations,
  setSquareLocation,
  getProductMappings,
  deleteProductMapping,
  deleteAllProductMappings,
  getSyncLog,
  connectQuickBooks,
  disconnectQuickBooks,
  testQuickBooks,
  getQuickBooksSyncLog,
  connectStripe,
  disconnectStripe,
  testStripe,
  syncStripeProducts,
  getStripeStatus,
} from "@/app/[storeId]/actions/commerce-actions";

interface Integration {
  id: string;
  store_id: string;
  provider: string;
  merchant_id: string | null;
  location_id: string | null;
  realm_id: string | null;
  company_name: string | null;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
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

interface QBSyncLogEntry {
  id: string;
  event_type: string;
  direction: string;
  status: string;
  details: Record<string, string>;
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

  const [qbSyncLog, setQbSyncLog] = useState<QBSyncLogEntry[]>([]);
  const [qbConnecting, setQbConnecting] = useState(false);
  const [qbDisconnecting, setQbDisconnecting] = useState(false);
  const [qbTesting, setQbTesting] = useState(false);
  const [qbTab, setQbTab] = useState<"overview" | "activity">("overview");

  const [stripeConnecting, setStripeConnecting] = useState(false);
  const [stripeDisconnecting, setStripeDisconnecting] = useState(false);
  const [stripeTesting, setStripeTesting] = useState(false);
  const [stripeSyncing, setStripeSyncing] = useState(false);
  const [stripeSyncLog, setStripeSyncLog] = useState<SyncLogEntry[]>([]);
  const [stripeMappings, setStripeMappings] = useState<ProductMapping[]>([]);
  const [stripeTab, setStripeTab] = useState<"overview" | "mappings" | "activity">("overview");

  const squareIntegration = integrations.find((i) => i.provider === "square") || null;
  const qbIntegration = integrations.find((i) => i.provider === "quickbooks") || null;
  const stripeIntegration = integrations.find((i) => i.provider === "stripe") || null;

  const showMessage = useCallback((msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 10000);
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

      const qb = integ.find((i: Integration) => i.provider === "quickbooks");
      if (qb) {
        const qbLogs = await getQuickBooksSyncLog(storeId);
        setQbSyncLog(qbLogs);
      }

      const stripe = integ.find((i: Integration) => i.provider === "stripe");
      if (stripe) {
        const [mapData, logData] = await Promise.all([
          getProductMappings(storeId),
          getSyncLog(storeId),
        ]);
        setStripeMappings(mapData.filter((m: ProductMapping) => m.provider === "stripe"));
        setStripeSyncLog(logData.filter((l: SyncLogEntry) => l.provider === "stripe"));
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
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (connected === "stripe") {
      showMessage("Stripe connected successfully");
      loadData();
      window.history.replaceState({}, "", window.location.pathname);
    }
    const stripeReturn = urlParams.get("stripe_return");
    const stripeRefresh = urlParams.get("stripe_refresh");
    if (stripeReturn === "true") {
      // Returned from Stripe onboarding — check status
      (async () => {
        try {
          const status = await getStripeStatus(storeId);
          if (status.onboardingComplete) {
            showMessage(`Stripe connected — ${status.accountName || status.accountId}`);
          } else {
            showMessage("Stripe onboarding incomplete — click Connect Stripe to continue setup", "error");
          }
          loadData();
        } catch {
          showMessage("Checking Stripe status...");
          loadData();
        }
      })();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (stripeRefresh === "true") {
      // Onboarding link expired — need to generate a new one
      showMessage("Onboarding link expired. Click Connect Stripe to continue.", "error");
      window.history.replaceState({}, "", window.location.pathname);
    }
    const stripeError = urlParams.get("stripe_error");
    if (stripeError) {
      showMessage(`Stripe error: ${stripeError}`, "error");
      window.history.replaceState({}, "", window.location.pathname);
    }
    const qbConnected = urlParams.get("qb_connected");
    const qbError = urlParams.get("qb_error");
    if (qbConnected === "true") {
      showMessage("QuickBooks connected successfully");
      loadData();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (qbError) {
      showMessage(`QuickBooks error: ${qbError}`, "error");
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
      // Phase 1: Catalog sync (products, variants, inventory)
      const result = await syncSquare(storeId);
      const parts = [];
      if (result.matched) parts.push(`${result.matched} matched by SKU`);
      if (result.imported_from_square) parts.push(`${result.imported_from_square} imported from Square`);
      if (result.pushed_to_square) parts.push(`${result.pushed_to_square} pushed to Square`);
      if (result.inventory_updated) parts.push(`${result.inventory_updated} inventory counts synced`);
      showMessage(`Catalog synced: ${parts.join(', ') || 'up to date'}. Uploading images...`);

      // Phase 2: Image sync (5 products per batch)
      let totalUploaded = 0;
      let totalFailed = 0;
      let currentOffset = 0;
      let hasMore = true;
      let batchCount = 0;
      while (hasMore && batchCount < 20) {
        try {
          const imgResult = await syncSquareImages(storeId, currentOffset);
          totalUploaded += imgResult.uploaded || 0;
          totalFailed += imgResult.failed || 0;
          if (imgResult.next_offset != null && imgResult.remaining_products > 0) {
            currentOffset = imgResult.next_offset;
          } else {
            hasMore = false;
          }
        } catch {
          hasMore = false;
        }
        batchCount++;
      }

      if (totalUploaded > 0 || totalFailed > 0) {
        showMessage(`Sync complete: ${parts.join(', ')}. Images: ${totalUploaded} uploaded${totalFailed > 0 ? `, ${totalFailed} failed` : ''}`);
      } else {
        showMessage(`Sync complete: ${parts.join(', ') || 'everything up to date'}`);
      }
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

  // ── QuickBooks Handlers ──────────────────────────────
  async function handleQBConnect() {
    setQbConnecting(true);
    try {
      const { url } = await connectQuickBooks(storeId);
      if (url) window.location.href = url;
    } catch (err) {
      showMessage((err as Error).message, "error");
      setQbConnecting(false);
    }
  }

  async function handleQBDisconnect() {
    if (!confirm("Disconnect QuickBooks? Future orders will not sync.")) return;
    setQbDisconnecting(true);
    try {
      await disconnectQuickBooks(storeId);
      setIntegrations(integrations.filter((i) => i.provider !== "quickbooks"));
      setQbSyncLog([]);
      showMessage("QuickBooks disconnected");
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
    setQbDisconnecting(false);
  }

  async function handleQBTest() {
    setQbTesting(true);
    try {
      const result = await testQuickBooks(storeId);
      showMessage(`Connection OK — ${result.companyName}`);
    } catch (err) {
      showMessage(`Test failed: ${(err as Error).message}`, "error");
    }
    setQbTesting(false);
  }

  // ── Stripe Handlers ──────────────────────────────────
  async function handleStripeConnect() {
    setStripeConnecting(true);
    try {
      const { url } = await connectStripe(storeId);
      if (url) window.location.href = url;
    } catch (err) {
      showMessage((err as Error).message, "error");
      setStripeConnecting(false);
    }
  }

  async function handleStripeDisconnect() {
    if (!confirm("Disconnect Stripe? This will remove all product mappings and stop payment processing via Connect.")) return;
    setStripeDisconnecting(true);
    try {
      await disconnectStripe(storeId);
      setIntegrations(integrations.filter((i) => i.provider !== "stripe"));
      setStripeMappings([]);
      setStripeSyncLog([]);
      showMessage("Stripe disconnected");
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
    setStripeDisconnecting(false);
  }

  async function handleStripeTest() {
    setStripeTesting(true);
    try {
      const result = await testStripe(storeId);
      const parts = [result.accountName || result.accountId];
      if (result.chargesEnabled) parts.push("charges enabled");
      if (result.payoutsEnabled) parts.push("payouts enabled");
      showMessage(`Connection OK — ${parts.join(", ")}`);
    } catch (err) {
      showMessage(`Test failed: ${(err as Error).message}`, "error");
    }
    setStripeTesting(false);
  }

  async function handleStripeSync() {
    setStripeSyncing(true);
    try {
      const result = await syncStripeProducts(storeId);
      const parts = [];
      if (result.matchedBySku) parts.push(`${result.matchedBySku} matched by SKU`);
      if (result.pushedToStripe) parts.push(`${result.pushedToStripe} pushed to Stripe`);
      if (result.skippedExisting) parts.push(`${result.skippedExisting} already synced`);
      showMessage(`Sync complete: ${parts.join(", ") || "everything up to date"}`);
      loadData();
    } catch (err) {
      showMessage((err as Error).message, "error");
    }
    setStripeSyncing(false);
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
          style={{
            position: "sticky",
            top: "16px",
            zIndex: 50,
            marginBottom: "20px",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {message}
          <button
            onClick={() => setMessage("")}
            style={{
              float: "right",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
              color: "inherit",
              opacity: 0.6,
              padding: "0 4px",
            }}
          >
            &times;
          </button>
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

      {/* QuickBooks card is below the Square tabs section */}

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

      {/* QuickBooks Online Card */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: 0 }}>QuickBooks Online</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                {qbIntegration
                  ? `Connected to ${qbIntegration.company_name || qbIntegration.realm_id || "QuickBooks"}`
                  : "Auto-sync orders to your accounting software"}
              </p>
            </div>
          </div>

          {qbIntegration ? (
            <span className="badge badge-green">Connected</span>
          ) : (
            <span className="badge badge-gray">Not Connected</span>
          )}
        </div>

        {!qbIntegration ? (
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>
              Connect your QuickBooks account
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "420px", margin: "0 auto 20px" }}>
              When an order is placed, it automatically creates a Sales Receipt in QuickBooks with customer, line items, tax, and shipping.
            </p>
            <button onClick={handleQBConnect} disabled={qbConnecting} className="btn btn-primary" style={{ fontSize: "14px" }}>
              {qbConnecting ? "Redirecting to Intuit..." : "Connect QuickBooks"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3" style={{ marginBottom: "20px", flexWrap: "wrap" }}>
              <button onClick={handleQBTest} disabled={qbTesting} className="btn btn-secondary btn-sm" style={{ fontSize: "13px" }}>
                {qbTesting ? "Testing..." : "Test Connection"}
              </button>
              <button onClick={handleQBDisconnect} disabled={qbDisconnecting} className="btn btn-danger btn-sm" style={{ fontSize: "13px" }}>
                {qbDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>

            {/* QB Tabs */}
            <div className="flex gap-1" style={{ borderBottom: "1px solid var(--border)", marginBottom: "20px" }}>
              {(["overview", "activity"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setQbTab(t)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: qbTab === t ? 600 : 500,
                    color: qbTab === t ? "var(--gold)" : "var(--text-tertiary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: `2px solid ${qbTab === t ? "var(--gold)" : "transparent"}`,
                    marginBottom: "-1px",
                  }}
                >
                  {t === "overview" ? "Overview" : "Sync Activity"}
                </button>
              ))}
            </div>

            {qbTab === "overview" && (
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  When an order is placed, it automatically syncs to QuickBooks as a Sales Receipt. Customer records are created or matched by email.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { step: "1", title: "Order Placed", desc: "Customer completes checkout via Stripe or Square" },
                    { step: "2", title: "Customer Matched", desc: "Email lookup in QB — created if new" },
                    { step: "3", title: "Sales Receipt Created", desc: "Line items, tax, shipping auto-posted" },
                  ].map((s) => (
                    <div
                      key={s.step}
                      style={{ padding: "16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", textAlign: "center" }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "999px",
                          background: "var(--gold-light)",
                          color: "var(--gold)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          marginBottom: "8px",
                        }}
                      >
                        {s.step}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "20px", padding: "12px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-tertiary)" }}>
                  <strong style={{ color: "var(--text-secondary)" }}>Connection details:</strong>{" "}
                  Company ID: {qbIntegration.realm_id || "—"} · Connected {timeAgo(qbIntegration.connected_at)}
                </div>
              </div>
            )}

            {qbTab === "activity" && (
              <div>
                {qbSyncLog.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-tertiary)", textAlign: "center", padding: "32px 0" }}>
                    No sync activity yet. Orders will appear here once placed.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {qbSyncLog.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between"
                        style={{ padding: "10px 14px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "999px",
                              background: log.status === "success" ? "#22c55e" : "#ef4444",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                              {log.event_type === "order_synced"
                                ? `Order #${log.details?.order_number || "—"} synced`
                                : log.event_type === "customer_created"
                                  ? `Customer created: ${log.details?.customer_email || "—"}`
                                  : log.event_type}
                            </div>
                            {log.status === "error" && log.details?.error && (
                              <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "2px" }}>
                                {log.details.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "999px",
                              background: log.status === "success" ? "#dcfce7" : "#fee2e2",
                              color: log.status === "success" ? "#15803d" : "#dc2626",
                              textTransform: "uppercase",
                            }}
                          >
                            {log.status}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-quaternary)", whiteSpace: "nowrap" }}>
                            {timeAgo(log.created_at)}
                          </span>
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

      {/* Stripe Connect Card */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                background: "#635BFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: 0 }}>Stripe</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                {stripeIntegration
                  ? `Connected to ${stripeIntegration.company_name || stripeIntegration.merchant_id || "Stripe"}`
                  : "Accept payments and sync your product catalog"}
              </p>
            </div>
          </div>

          {stripeIntegration ? (
            stripeIntegration.metadata?.onboarding_complete ? (
              <span className="badge badge-green">Connected</span>
            ) : (
              <span className="badge badge-orange">Pending Setup</span>
            )
          ) : (
            <span className="badge badge-gray">Not Connected</span>
          )}
        </div>

        {!stripeIntegration || !stripeIntegration.metadata?.onboarding_complete ? (
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>
              {stripeIntegration ? "Finish Stripe setup" : "Connect your Stripe account"}
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "420px", margin: "0 auto 20px" }}>
              {stripeIntegration
                ? "Your Stripe account was created but onboarding isn't complete. Click below to finish setup."
                : "Accept online payments via Stripe Checkout. Products sync automatically and payments route directly to your Stripe account."}
            </p>
            <button onClick={handleStripeConnect} disabled={stripeConnecting} className="btn btn-primary" style={{ fontSize: "14px" }}>
              {stripeConnecting ? "Redirecting to Stripe..." : stripeIntegration ? "Continue Setup" : "Connect Stripe"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3" style={{ marginBottom: "20px", flexWrap: "wrap" }}>
              <button onClick={handleStripeTest} disabled={stripeTesting} className="btn btn-secondary btn-sm" style={{ fontSize: "13px" }}>
                {stripeTesting ? "Testing..." : "Test Connection"}
              </button>
              <button onClick={handleStripeSync} disabled={stripeSyncing} className="btn btn-secondary btn-sm" style={{ fontSize: "13px" }}>
                {stripeSyncing ? "Syncing..." : "Sync Products"}
              </button>
              <button onClick={handleStripeDisconnect} disabled={stripeDisconnecting} className="btn btn-danger btn-sm" style={{ fontSize: "13px" }}>
                {stripeDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>

            {/* Stripe Tabs */}
            <div className="flex gap-1" style={{ borderBottom: "1px solid var(--border)", marginBottom: "20px" }}>
              {(["overview", "mappings", "activity"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setStripeTab(t)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: stripeTab === t ? 600 : 500,
                    color: stripeTab === t ? "var(--gold)" : "var(--text-tertiary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: `2px solid ${stripeTab === t ? "var(--gold)" : "transparent"}`,
                    marginBottom: "-1px",
                  }}
                >
                  {t === "overview" ? "Overview" : t === "mappings" ? `Mappings (${stripeMappings.length})` : "Activity"}
                </button>
              ))}
            </div>

            {stripeTab === "overview" && (
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  Payments process through your connected Stripe account. Products are synced to Stripe for catalog management and Checkout sessions.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { step: "1", title: "Products Synced", desc: "Webnari products pushed to your Stripe catalog with prices" },
                    { step: "2", title: "Checkout Created", desc: "Customer clicks buy — Stripe Checkout session opens" },
                    { step: "3", title: "Payment Received", desc: "Funds go directly to your Stripe account" },
                  ].map((s) => (
                    <div
                      key={s.step}
                      style={{ padding: "16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", textAlign: "center" }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "999px",
                          background: "var(--gold-light)",
                          color: "var(--gold)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          marginBottom: "8px",
                        }}
                      >
                        {s.step}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "20px", padding: "12px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-tertiary)" }}>
                  <strong style={{ color: "var(--text-secondary)" }}>Connection details:</strong>{" "}
                  Account: {stripeIntegration.merchant_id || "—"} · Connected {timeAgo(stripeIntegration.connected_at)}
                </div>
              </div>
            )}

            {stripeTab === "mappings" && (
              <div className="card-section">
                <div className="card-section-header">
                  <span className="heading-sm">Product Mappings</span>
                  {stripeMappings.length > 0 && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete all ${stripeMappings.length} Stripe product mappings?`)) return;
                        try {
                          await deleteAllProductMappings(storeId);
                          setStripeMappings([]);
                          showMessage("All Stripe mappings deleted");
                        } catch (err) {
                          showMessage((err as Error).message, "error");
                        }
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--red)", fontSize: "12px" }}
                    >
                      Delete All
                    </button>
                  )}
                </div>
                {stripeMappings.length === 0 ? (
                  <div style={{ padding: "40px 24px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
                      No product mappings yet. Click &quot;Sync Products&quot; to match your catalog.
                    </p>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px" }}>
                          Webnari Product
                        </th>
                        <th className="hide-mobile" style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px" }}>
                          SKU
                        </th>
                        <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px" }}>
                          Stripe Product
                        </th>
                        <th style={{ padding: "10px 8px", width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stripeMappings.map((m) => (
                        <tr key={m.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                              {m.webnari_product_name}
                            </div>
                          </td>
                          <td className="hide-mobile">
                            <code style={{ fontSize: "12px", padding: "2px 6px", background: "var(--bg-grouped)", borderRadius: "4px", color: "var(--text-tertiary)" }}>
                              {m.webnari_sku || "\u2014"}
                            </code>
                          </td>
                          <td>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                              {m.external_name || m.external_id.slice(0, 20) + "..."}
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={async () => {
                                try {
                                  await deleteProductMapping(storeId, m.id);
                                  setStripeMappings(stripeMappings.filter((x) => x.id !== m.id));
                                  showMessage("Mapping removed");
                                } catch (err) {
                                  showMessage((err as Error).message, "error");
                                }
                              }}
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

            {stripeTab === "activity" && (
              <div>
                {stripeSyncLog.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-tertiary)", textAlign: "center", padding: "32px 0" }}>
                    No sync activity yet. Connect and sync to see events here.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {stripeSyncLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between"
                        style={{ padding: "10px 14px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)" }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "999px",
                              background: entry.status === "success" ? "#22c55e" : "#ef4444",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                              {entry.event_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </div>
                            {entry.details && (
                              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                                {typeof entry.details === "string" ? entry.details : JSON.stringify(entry.details)}
                              </div>
                            )}
                            {entry.error && (
                              <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "2px" }}>
                                {entry.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "999px",
                              background: entry.status === "success" ? "#dcfce7" : "#fee2e2",
                              color: entry.status === "success" ? "#15803d" : "#dc2626",
                              textTransform: "uppercase",
                            }}
                          >
                            {entry.status}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-quaternary)", whiteSpace: "nowrap" }}>
                            {timeAgo(entry.created_at)}
                          </span>
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
    </div>
  );
}
