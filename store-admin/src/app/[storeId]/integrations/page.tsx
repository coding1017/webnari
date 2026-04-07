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
  configureGA4,
  disconnectGA4,
  testGA4,
  configureTwilio,
  disconnectTwilio,
  testTwilio,
  updateTwilioSettings,
  getApps,
  getStoreSettings,
  updateStore,
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

  // GA4 state
  const [ga4Connected, setGa4Connected] = useState(false);
  const [ga4Config, setGa4Config] = useState<{ measurement_id: string; api_secret: string }>({ measurement_id: '', api_secret: '' });
  const [ga4Connecting, setGa4Connecting] = useState(false);
  const [ga4Disconnecting, setGa4Disconnecting] = useState(false);
  const [ga4Testing, setGa4Testing] = useState(false);
  const [ga4ShowForm, setGa4ShowForm] = useState(false);

  // Twilio state
  const [twilioConnected, setTwilioConnected] = useState(false);
  const [twilioConfig, setTwilioConfig] = useState<{ account_sid: string; auth_token: string; from_number: string; owner_phone: string }>({ account_sid: '', auth_token: '', from_number: '', owner_phone: '' });
  const [twilioNotifyEvents, setTwilioNotifyEvents] = useState<string[]>(['order.created', 'inventory.low_stock']);
  const [twilioConnecting, setTwilioConnecting] = useState(false);
  const [twilioDisconnecting, setTwilioDisconnecting] = useState(false);
  const [twilioTesting, setTwilioTesting] = useState(false);
  const [twilioShowForm, setTwilioShowForm] = useState(false);
  const [twilioSavingSettings, setTwilioSavingSettings] = useState(false);

  // Email Notifications state (persisted to store settings)
  const [emailToggles, setEmailToggles] = useState({
    orderConfirmation: true,
    shippingUpdate: true,
    deliveryConfirmation: true,
    abandonedCart: true,
    passwordReset: true,
  });
  const [emailToggleSaving, setEmailToggleSaving] = useState(false);

  // Shippo state
  const [shippoConnected, setShippoConnected] = useState(false);
  const [shippoApiKey, setShippoApiKey] = useState("");
  const [shippoShowKey, setShippoShowKey] = useState(false);
  const [shippoShowForm, setShippoShowForm] = useState(false);
  const [shippoSaving, setShippoSaving] = useState(false);
  const [shippoTesting, setShippoTesting] = useState(false);

  // PayPal state
  const [paypalConnected, setPaypalConnected] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [paypalShowSecret, setPaypalShowSecret] = useState(false);
  const [paypalShowForm, setPaypalShowForm] = useState(false);
  const [paypalSaving, setPaypalSaving] = useState(false);
  const [paypalTesting, setPaypalTesting] = useState(false);
  const [paypalMode, setPaypalMode] = useState<"sandbox" | "live">("sandbox");

  // Mailchimp state
  const [mailchimpConnected, setMailchimpConnected] = useState(false);
  const [mailchimpApiKey, setMailchimpApiKey] = useState("");
  const [mailchimpListId, setMailchimpListId] = useState("");
  const [mailchimpShowForm, setMailchimpShowForm] = useState(false);
  const [mailchimpSaving, setMailchimpSaving] = useState(false);
  const [mailchimpTesting, setMailchimpTesting] = useState(false);

  // Klaviyo state
  const [klaviyoConnected, setKlaviyoConnected] = useState(false);
  const [klaviyoApiKey, setKlaviyoApiKey] = useState("");
  const [klaviyoListId, setKlaviyoListId] = useState("");
  const [klaviyoShowForm, setKlaviyoShowForm] = useState(false);
  const [klaviyoSaving, setKlaviyoSaving] = useState(false);
  const [klaviyoTesting, setKlaviyoTesting] = useState(false);

  // Meta Commerce state
  const [metaConnected, setMetaConnected] = useState(false);
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaCatalogId, setMetaCatalogId] = useState("");
  const [metaShowForm, setMetaShowForm] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaTesting, setMetaTesting] = useState(false);

  // Google Merchant state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleMerchantId, setGoogleMerchantId] = useState("");
  const [googleServiceKey, setGoogleServiceKey] = useState("");
  const [googleShowForm, setGoogleShowForm] = useState(false);
  const [googleSaving, setGoogleSaving] = useState(false);
  const [googleTesting, setGoogleTesting] = useState(false);

  // Custom email provider state
  const [customResendKey, setCustomResendKey] = useState("");
  const [customFromEmail, setCustomFromEmail] = useState("");
  const [showResendKey, setShowResendKey] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [hasCustomEmail, setHasCustomEmail] = useState(false);

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

    // Load app installation status for GA4 and Twilio
    try {
      const apps = await getApps(storeId);
      const ga4App = apps.find((a: { id: string; installation?: { status: string; config?: Record<string, string> } }) => a.id === 'ga4');
      if (ga4App?.installation?.status === 'active') {
        setGa4Connected(true);
        if (ga4App.installation.config?.measurement_id) {
          setGa4Config({
            measurement_id: ga4App.installation.config.measurement_id,
            api_secret: '••••••••',
          });
        }
      } else {
        setGa4Connected(false);
      }

      const twilioApp = apps.find((a: { id: string; installation?: { status: string; config?: Record<string, string> } }) => a.id === 'twilio-sms');
      if (twilioApp?.installation?.status === 'active') {
        setTwilioConnected(true);
        if (twilioApp.installation.config) {
          const c = twilioApp.installation.config;
          setTwilioConfig({
            account_sid: c.account_sid ? c.account_sid.slice(0, 8) + '••••' : '',
            auth_token: '••••••••',
            from_number: c.from_number || '',
            owner_phone: c.owner_phone || '',
          });
          if (c.notify_events) {
            setTwilioNotifyEvents(c.notify_events as unknown as string[]);
          }
        }
      } else {
        setTwilioConnected(false);
      }
    } catch {
      // apps table might not exist yet
    }

    // Load custom email settings + email toggles + integration configs
    try {
      const storeData = await getStoreSettings(storeId);
      const s = storeData?.settings || {};
      if (s.resend_api_key) {
        setHasCustomEmail(true);
        setCustomResendKey('••••••••••••');
        setCustomFromEmail(s.from_email || '');
      }
      // Load persisted email notification toggles
      if (s.email_notifications) {
        setEmailToggles(prev => ({ ...prev, ...s.email_notifications }));
      }
      // Load Shippo config
      if (s.shippo_api_key) {
        setShippoConnected(true);
        setShippoApiKey(s.shippo_api_key.slice(0, 12) + '••••');
      }
      // Load PayPal config
      if (s.paypal_client_id) {
        setPaypalConnected(true);
        setPaypalClientId(s.paypal_client_id.slice(0, 12) + '••••');
        setPaypalClientSecret('••••••••');
        setPaypalMode(s.paypal_mode || 'sandbox');
      }
      // Load Mailchimp config
      if (s.mailchimp_api_key) {
        setMailchimpConnected(true);
        setMailchimpApiKey(s.mailchimp_api_key.slice(0, 12) + '••••');
        setMailchimpListId(s.mailchimp_list_id || '');
      }
      // Load Klaviyo config
      if (s.klaviyo_api_key) {
        setKlaviyoConnected(true);
        setKlaviyoApiKey(s.klaviyo_api_key.slice(0, 12) + '••••');
        setKlaviyoListId(s.klaviyo_list_id || '');
      }
      // Load Meta Commerce config
      if (s.meta_access_token) {
        setMetaConnected(true);
        setMetaAccessToken(s.meta_access_token.slice(0, 12) + '••••');
        setMetaCatalogId(s.meta_catalog_id || '');
      }
      // Load Google Merchant config
      if (s.google_merchant_id) {
        setGoogleConnected(true);
        setGoogleMerchantId(s.google_merchant_id);
        setGoogleServiceKey('••••••••');
      }
    } catch {}

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

  // ── GA4 Handlers ──────────────────────────────────────
  async function handleGA4Connect() {
    if (!ga4Config.measurement_id || !ga4Config.api_secret || ga4Config.api_secret === '••••••••') {
      showMessage('Enter your GA4 Measurement ID and API Secret', 'error');
      return;
    }
    setGa4Connecting(true);
    try {
      await configureGA4(storeId, ga4Config);
      setGa4Connected(true);
      setGa4ShowForm(false);
      showMessage('Google Analytics 4 connected successfully');
    } catch (err) {
      showMessage((err as Error).message, 'error');
    }
    setGa4Connecting(false);
  }

  async function handleGA4Disconnect() {
    if (!confirm('Disconnect Google Analytics 4? E-commerce events will stop being tracked.')) return;
    setGa4Disconnecting(true);
    try {
      await disconnectGA4(storeId);
      setGa4Connected(false);
      setGa4Config({ measurement_id: '', api_secret: '' });
      showMessage('GA4 disconnected');
    } catch (err) {
      showMessage((err as Error).message, 'error');
    }
    setGa4Disconnecting(false);
  }

  async function handleGA4Test() {
    setGa4Testing(true);
    try {
      const result = await testGA4(storeId);
      showMessage(result.message || 'Test event sent to GA4');
    } catch (err) {
      showMessage(`Test failed: ${(err as Error).message}`, 'error');
    }
    setGa4Testing(false);
  }

  // ── Twilio Handlers ───────────────────────────────────
  async function handleTwilioConnect() {
    if (!twilioConfig.account_sid || !twilioConfig.auth_token || twilioConfig.auth_token === '••••••••' || !twilioConfig.from_number || !twilioConfig.owner_phone) {
      showMessage('All Twilio fields are required', 'error');
      return;
    }
    setTwilioConnecting(true);
    try {
      await configureTwilio(storeId, { ...twilioConfig, notify_events: twilioNotifyEvents });
      setTwilioConnected(true);
      setTwilioShowForm(false);
      showMessage('Twilio SMS notifications connected');
    } catch (err) {
      showMessage((err as Error).message, 'error');
    }
    setTwilioConnecting(false);
  }

  async function handleTwilioDisconnect() {
    if (!confirm('Disconnect Twilio? You will stop receiving SMS notifications.')) return;
    setTwilioDisconnecting(true);
    try {
      await disconnectTwilio(storeId);
      setTwilioConnected(false);
      setTwilioConfig({ account_sid: '', auth_token: '', from_number: '', owner_phone: '' });
      showMessage('Twilio disconnected');
    } catch (err) {
      showMessage((err as Error).message, 'error');
    }
    setTwilioDisconnecting(false);
  }

  async function handleTwilioTest() {
    setTwilioTesting(true);
    try {
      const result = await testTwilio(storeId);
      if (result.success) {
        showMessage('Test SMS sent successfully');
      } else {
        showMessage(`SMS failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      showMessage(`Test failed: ${(err as Error).message}`, 'error');
    }
    setTwilioTesting(false);
  }

  async function handleTwilioSaveSettings() {
    setTwilioSavingSettings(true);
    try {
      await updateTwilioSettings(storeId, { notify_events: twilioNotifyEvents });
      showMessage('Notification preferences saved');
    } catch (err) {
      showMessage((err as Error).message, 'error');
    }
    setTwilioSavingSettings(false);
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

      {/* Google Analytics 4 Card */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                background: "#E37400",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M3 3v18h18V3H3zm3 15V10h3v8H6zm5 0V6h3v12h-3zm5 0v-5h3v5h-3z" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: 0 }}>Google Analytics 4</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                {ga4Connected
                  ? `Tracking e-commerce events · ${ga4Config.measurement_id}`
                  : "Server-side e-commerce event tracking"}
              </p>
            </div>
          </div>

          {ga4Connected ? (
            <span className="badge badge-green">Connected</span>
          ) : (
            <span className="badge badge-gray">Not Connected</span>
          )}
        </div>

        {!ga4Connected ? (
          <div>
            {!ga4ShowForm ? (
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18V3H3zm3 15V10h3v8H6zm5 0V6h3v12h-3zm5 0v-5h3v5h-3z" />
                  </svg>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>
                  Track e-commerce events
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "420px", margin: "0 auto 20px" }}>
                  Track purchases, revenue, and customer behavior with server-side events that bypass ad blockers. Events fire automatically when orders are placed.
                </p>
                <button onClick={() => setGa4ShowForm(true)} className="btn btn-primary" style={{ fontSize: "14px" }}>
                  Configure GA4
                </button>
              </div>
            ) : (
              <div style={{ padding: "4px 0 8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                      Measurement ID
                    </label>
                    <input
                      type="text"
                      placeholder="G-XXXXXXXXXX"
                      value={ga4Config.measurement_id}
                      onChange={(e) => setGa4Config({ ...ga4Config, measurement_id: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                      API Secret
                    </label>
                    <input
                      type="password"
                      placeholder="API Secret from GA4 Admin"
                      value={ga4Config.api_secret}
                      onChange={(e) => setGa4Config({ ...ga4Config, api_secret: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleGA4Connect} disabled={ga4Connecting} className="btn btn-primary" style={{ fontSize: "14px" }}>
                    {ga4Connecting ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setGa4ShowForm(false)} className="btn btn-secondary" style={{ fontSize: "14px" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3" style={{ marginBottom: "20px", flexWrap: "wrap" }}>
              <button onClick={handleGA4Test} disabled={ga4Testing} className="btn btn-secondary btn-sm" style={{ fontSize: "13px" }}>
                {ga4Testing ? "Sending..." : "Test Event"}
              </button>
              <button onClick={handleGA4Disconnect} disabled={ga4Disconnecting} className="btn btn-danger btn-sm" style={{ fontSize: "13px" }}>
                {ga4Disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>

            <div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Server-side e-commerce events fire automatically when orders are placed — no client-side scripts required.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Order Placed", desc: "Customer completes checkout" },
                  { step: "2", title: "Event Fired", desc: "Server-side event sent to GA4 — bypasses ad blockers" },
                  { step: "3", title: "GA4 Dashboard", desc: "Revenue, items, and conversions appear in real-time" },
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
                Measurement ID: {ga4Config.measurement_id || "—"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* SMS & WhatsApp Notifications Card (Twilio) */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                background: "#F22F46",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: 0 }}>SMS &amp; WhatsApp Notifications</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                {twilioConnected
                  ? `Sending to ${twilioConfig.owner_phone}`
                  : "Instant alerts for orders, low stock, and reviews"}
              </p>
            </div>
          </div>

          {twilioConnected ? (
            <span className="badge badge-green">Connected</span>
          ) : (
            <span className="badge badge-gray">Not Connected</span>
          )}
        </div>

        {!twilioConnected ? (
          <div>
            {!twilioShowForm ? (
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>
                  Get instant SMS alerts
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "420px", margin: "0 auto 20px" }}>
                  Get instant SMS alerts on your phone when orders come in, inventory runs low, or customers leave reviews.
                </p>
                <button onClick={() => setTwilioShowForm(true)} className="btn btn-primary" style={{ fontSize: "14px" }}>
                  Configure Twilio
                </button>
              </div>
            ) : (
              <div style={{ padding: "4px 0 8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                      Account SID
                    </label>
                    <input
                      type="text"
                      placeholder="ACxxxxxxxxxxxxxxxx"
                      value={twilioConfig.account_sid}
                      onChange={(e) => setTwilioConfig({ ...twilioConfig, account_sid: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                      Auth Token
                    </label>
                    <input
                      type="password"
                      placeholder="Auth Token"
                      value={twilioConfig.auth_token}
                      onChange={(e) => setTwilioConfig({ ...twilioConfig, auth_token: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                      From Number (Twilio)
                    </label>
                    <input
                      type="text"
                      placeholder="+1XXXXXXXXXX"
                      value={twilioConfig.from_number}
                      onChange={(e) => setTwilioConfig({ ...twilioConfig, from_number: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                      Your Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+1XXXXXXXXXX"
                      value={twilioConfig.owner_phone}
                      onChange={(e) => setTwilioConfig({ ...twilioConfig, owner_phone: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" }}>
                    Notify me when
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { value: "order.created", label: "New Orders" },
                      { value: "inventory.low_stock", label: "Low Stock Alerts" },
                      { value: "review.submitted", label: "New Reviews" },
                    ].map((evt) => (
                      <label key={evt.value} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={twilioNotifyEvents.includes(evt.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTwilioNotifyEvents([...twilioNotifyEvents, evt.value]);
                            } else {
                              setTwilioNotifyEvents(twilioNotifyEvents.filter((v) => v !== evt.value));
                            }
                          }}
                        />
                        {evt.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleTwilioConnect} disabled={twilioConnecting} className="btn btn-primary" style={{ fontSize: "14px" }}>
                    {twilioConnecting ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setTwilioShowForm(false)} className="btn btn-secondary" style={{ fontSize: "14px" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3" style={{ marginBottom: "20px", flexWrap: "wrap" }}>
              <button onClick={handleTwilioTest} disabled={twilioTesting} className="btn btn-secondary btn-sm" style={{ fontSize: "13px" }}>
                {twilioTesting ? "Sending..." : "Send Test SMS"}
              </button>
              <button
                onClick={() => setTwilioShowForm(!twilioShowForm)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "13px" }}
              >
                {twilioShowForm ? "Hide Settings" : "Settings"}
              </button>
              <button onClick={handleTwilioDisconnect} disabled={twilioDisconnecting} className="btn btn-danger btn-sm" style={{ fontSize: "13px" }}>
                {twilioDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>

            {twilioShowForm && (
              <div style={{ padding: "16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
                  Notification Preferences
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { value: "order.created", label: "New Orders" },
                    { value: "inventory.low_stock", label: "Low Stock Alerts" },
                    { value: "review.submitted", label: "New Reviews" },
                  ].map((evt) => (
                    <label key={evt.value} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={twilioNotifyEvents.includes(evt.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTwilioNotifyEvents([...twilioNotifyEvents, evt.value]);
                          } else {
                            setTwilioNotifyEvents(twilioNotifyEvents.filter((v) => v !== evt.value));
                          }
                        }}
                      />
                      {evt.label}
                    </label>
                  ))}
                </div>
                <button onClick={handleTwilioSaveSettings} disabled={twilioSavingSettings} className="btn btn-primary btn-sm" style={{ fontSize: "13px" }}>
                  {twilioSavingSettings ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            )}

            <div style={{ padding: "12px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-tertiary)" }}>
              <strong style={{ color: "var(--text-secondary)" }}>Connection details:</strong>{" "}
              From: {twilioConfig.from_number || "—"} · To: {twilioConfig.owner_phone || "—"}
            </div>
          </>
        )}
      </div>

      {/* Email Notifications Card (Resend) */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                background: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: 0 }}>Email Notifications</h2>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                Powered by Resend
              </p>
            </div>
          </div>
          {hasCustomEmail ? (
            <span className="badge badge-green">Custom</span>
          ) : (
            <span className="badge badge-gray">Webnari Default</span>
          )}
        </div>

        {/* Custom Email Provider Section */}
        <div style={{ padding: "16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>Custom Email Provider</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Resend API Key</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showResendKey ? "text" : "password"}
                  value={customResendKey}
                  onChange={(e) => { setCustomResendKey(e.target.value); }}
                  placeholder="re_xxxxxxxxxxxxxxxx"
                  className="input"
                  style={{ width: "100%", paddingRight: "40px", fontSize: "13px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowResendKey(!showResendKey)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-tertiary)" }}
                >
                  {showResendKey ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>From Email</label>
              <input
                type="text"
                value={customFromEmail}
                onChange={(e) => setCustomFromEmail(e.target.value)}
                placeholder='Store Name <orders@yourdomain.com>'
                className="input"
                style={{ width: "100%", fontSize: "13px" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              disabled={emailTesting || !customResendKey || customResendKey === '••••••••••••'}
              onClick={async () => {
                setEmailTesting(true);
                try {
                  await updateStore(storeId, { settings: { resend_api_key: customResendKey, from_email: customFromEmail } });
                  showMessage("Email configuration tested and saved successfully");
                  setHasCustomEmail(true);
                  setCustomResendKey('••••••••••••');
                } catch (err) {
                  showMessage((err as Error).message || "Test failed", "error");
                }
                setEmailTesting(false);
              }}
              style={{ fontSize: "12px" }}
            >
              {emailTesting ? "Testing..." : "Test"}
            </button>
            <button
              className="btn btn-primary"
              disabled={emailSaving || !customResendKey || customResendKey === '••••••••••••'}
              onClick={async () => {
                setEmailSaving(true);
                try {
                  await updateStore(storeId, { settings: { resend_api_key: customResendKey, from_email: customFromEmail } });
                  showMessage("Custom email settings saved");
                  setHasCustomEmail(true);
                  setCustomResendKey('••••••••••••');
                } catch (err) {
                  showMessage((err as Error).message || "Save failed", "error");
                }
                setEmailSaving(false);
              }}
              style={{ fontSize: "12px" }}
            >
              {emailSaving ? "Saving..." : "Save"}
            </button>
            {hasCustomEmail && (
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  if (!confirm("Remove custom email provider? Emails will be sent from noreply@webnari.io.")) return;
                  setEmailSaving(true);
                  try {
                    await updateStore(storeId, { settings: { resend_api_key: null, from_email: null } });
                    showMessage("Custom email provider removed");
                    setHasCustomEmail(false);
                    setCustomResendKey('');
                    setCustomFromEmail('');
                  } catch (err) {
                    showMessage((err as Error).message || "Remove failed", "error");
                  }
                  setEmailSaving(false);
                }}
                style={{ fontSize: "12px", color: "var(--text-tertiary)" }}
              >
                Remove
              </button>
            )}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-quaternary)", margin: "10px 0 0 0" }}>
            Leave blank to use Webnari&apos;s email service (noreply@webnari.io)
          </p>
        </div>

        <div className="flex items-center gap-2" style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>
            Transactional emails are sent automatically. Toggle which notifications your customers receive.
          </p>
          {emailToggleSaving && (
            <span style={{ fontSize: "11px", color: "var(--text-quaternary)", whiteSpace: "nowrap" }}>Saving...</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
          {([
            { key: "orderConfirmation" as const, label: "Order Confirmation" },
            { key: "shippingUpdate" as const, label: "Shipping Update" },
            { key: "deliveryConfirmation" as const, label: "Delivery Confirmation" },
            { key: "abandonedCart" as const, label: "Abandoned Cart Recovery" },
            { key: "passwordReset" as const, label: "Password Reset", disabled: true },
          ]).map((item) => (
            <label
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "var(--bg-grouped)",
                borderRadius: "var(--radius-sm)",
                cursor: item.disabled ? "default" : "pointer",
                opacity: item.disabled ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                {item.label}
                {item.disabled && (
                  <span style={{ fontSize: "11px", color: "var(--text-quaternary)", marginLeft: "8px", fontWeight: 400 }}>
                    Always on
                  </span>
                )}
              </span>
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "40px",
                  height: "22px",
                  borderRadius: "11px",
                  background: emailToggles[item.key] ? "#7C3AED" : "var(--border)",
                  transition: "background 0.2s",
                  cursor: item.disabled ? "default" : "pointer",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: emailToggles[item.key] ? "20px" : "2px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </span>
              <input
                type="checkbox"
                checked={emailToggles[item.key]}
                disabled={item.disabled}
                onChange={async () => {
                  if (!item.disabled) {
                    const newToggles = { ...emailToggles, [item.key]: !emailToggles[item.key] };
                    setEmailToggles(newToggles);
                    setEmailToggleSaving(true);
                    try {
                      const storeData = await getStoreSettings(storeId);
                      const currentSettings = storeData?.settings || {};
                      await updateStore(storeId, { settings: { ...currentSettings, email_notifications: newToggles } });
                    } catch (err) {
                      showMessage((err as Error).message || "Failed to save toggle", "error");
                      setEmailToggles((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                    }
                    setEmailToggleSaving(false);
                  }
                }}
                style={{ display: "none" }}
              />
            </label>
          ))}
        </div>

        <div style={{ padding: "12px 16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-tertiary)" }}>
          <strong style={{ color: "var(--text-secondary)" }}>From Email:</strong>{" "}
          {hasCustomEmail && customFromEmail ? customFromEmail : "noreply@webnari.io"}
          {!hasCustomEmail && (
            <span style={{ display: "block", marginTop: "4px", fontSize: "11px", color: "var(--text-quaternary)" }}>
              Add a custom Resend API key above to use your own domain
            </span>
          )}
        </div>
      </div>

      {/* More Integrations */}
      <div style={{ marginBottom: "16px", marginTop: "8px" }}>
        <h2 className="heading-sm" style={{ marginBottom: "4px" }}>More Integrations</h2>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>Connect additional services to expand your store&apos;s capabilities.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px", marginBottom: "24px" }}>

        {/* ── PayPal ── */}
        <div className="card" style={{ padding: "20px" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.23A.77.77 0 0 1 5.704 1.6h6.865c2.277 0 3.87.462 4.732 1.371.807.852 1.074 2.107.793 3.73-.03.174-.067.351-.11.533l-.018.09v.24l.186.108a3.2 3.2 0 0 1 .77.663c.396.477.636 1.092.716 1.828.082.755.002 1.65-.238 2.66-.275 1.156-.722 2.162-1.327 2.99a5.8 5.8 0 0 1-2.008 1.81c-.763.43-1.644.738-2.618.917-.948.174-2.008.261-3.151.261H9.87a.95.95 0 0 0-.938.803l-.02.11-.59 3.737-.014.083a.95.95 0 0 1-.938.803H7.076z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>PayPal</div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Payment Processing</div>
            </div>
            {paypalConnected ? (
              <span className="badge badge-green">Connected</span>
            ) : (
              <button className="btn btn-sm" onClick={() => setPaypalShowForm(!paypalShowForm)} style={{ fontSize: "12px" }}>
                {paypalShowForm ? "Cancel" : "Configure"}
              </button>
            )}
          </div>
          {!paypalConnected && !paypalShowForm && (
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>Accept PayPal, Venmo, and Pay Later as checkout payment methods.</p>
          )}
          {paypalConnected && !paypalShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Client ID: <span style={{ color: "var(--text-secondary)" }}>{paypalClientId}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Mode: <span className={`badge ${paypalMode === 'live' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: "10px" }}>{paypalMode}</span>
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-sm" onClick={() => setPaypalShowForm(true)} style={{ fontSize: "11px" }}>Update</button>
                <button
                  className="btn btn-sm"
                  disabled={paypalTesting}
                  onClick={async () => {
                    setPaypalTesting(true);
                    try {
                      const storeData = await getStoreSettings(storeId);
                      if (storeData?.settings?.paypal_client_id) showMessage("PayPal credentials verified");
                      else showMessage("PayPal not configured", "error");
                    } catch { showMessage("Test failed", "error"); }
                    setPaypalTesting(false);
                  }}
                  style={{ fontSize: "11px" }}
                >{paypalTesting ? "Testing..." : "Test"}</button>
                <button
                  className="btn btn-sm"
                  style={{ fontSize: "11px", color: "var(--red)" }}
                  onClick={async () => {
                    setPaypalSaving(true);
                    try {
                      const storeData = await getStoreSettings(storeId);
                      const cur = storeData?.settings || {};
                      const { paypal_client_id: _a, paypal_client_secret: _b, paypal_mode: _c, ...rest } = cur;
                      void _a; void _b; void _c;
                      await updateStore(storeId, { settings: rest });
                      setPaypalConnected(false);
                      setPaypalClientId("");
                      setPaypalClientSecret("");
                      showMessage("PayPal disconnected");
                    } catch { showMessage("Failed to disconnect", "error"); }
                    setPaypalSaving(false);
                  }}
                >Disconnect</button>
              </div>
            </div>
          )}
          {paypalShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Client ID</label>
                <input className="input" value={paypalClientId.includes("••••") ? "" : paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} placeholder="AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxB" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Client Secret</label>
                <div style={{ position: "relative" }}>
                  <input type={paypalShowSecret ? "text" : "password"} className="input" value={paypalClientSecret.includes("••••") ? "" : paypalClientSecret} onChange={(e) => setPaypalClientSecret(e.target.value)} placeholder="ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxD" style={{ width: "100%", fontSize: "13px", paddingRight: "36px" }} />
                  <button type="button" onClick={() => setPaypalShowSecret(!paypalShowSecret)} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--text-tertiary)" }}>{paypalShowSecret ? "Hide" : "Show"}</button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Mode</label>
                <div className="flex items-center gap-2">
                  {(["sandbox", "live"] as const).map((m) => (
                    <button key={m} className={`btn btn-sm ${paypalMode === m ? "btn-primary" : ""}`} onClick={() => setPaypalMode(m)} style={{ fontSize: "11px", textTransform: "capitalize" }}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={paypalSaving}
                  onClick={async () => {
                    if (!paypalClientId || paypalClientId.includes("••••") || !paypalClientSecret || paypalClientSecret.includes("••••")) {
                      showMessage("Client ID and Secret required", "error");
                      return;
                    }
                    setPaypalSaving(true);
                    try {
                      const storeData = await getStoreSettings(storeId);
                      const cur = storeData?.settings || {};
                      await updateStore(storeId, { settings: { ...cur, paypal_client_id: paypalClientId, paypal_client_secret: paypalClientSecret, paypal_mode: paypalMode } });
                      setPaypalConnected(true);
                      setPaypalShowForm(false);
                      setPaypalClientId(paypalClientId.slice(0, 12) + "••••");
                      setPaypalClientSecret("••••••••");
                      showMessage("PayPal connected successfully");
                    } catch (err) { showMessage((err as Error).message || "Save failed", "error"); }
                    setPaypalSaving(false);
                  }}
                  style={{ fontSize: "12px" }}
                >{paypalSaving ? "Saving..." : "Save & Connect"}</button>
                <button className="btn btn-sm" onClick={() => setPaypalShowForm(false)} style={{ fontSize: "12px" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Shippo ── */}
        <div className="card" style={{ padding: "20px" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "#2FB5D2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 5h-3v3h3v2h-3v3h-2v-3h-3v3H9v-3H6v-2h3V7H6V5h3v3h3V5h2v3h3v-1z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Shippo</div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Shipping Labels & Rates</div>
            </div>
            {shippoConnected ? (
              <span className="badge badge-green">Connected</span>
            ) : (
              <button className="btn btn-sm" onClick={() => setShippoShowForm(!shippoShowForm)} style={{ fontSize: "12px" }}>
                {shippoShowForm ? "Cancel" : "Configure"}
              </button>
            )}
          </div>
          {!shippoConnected && !shippoShowForm && (
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>Compare rates, print labels, and track shipments across USPS, UPS, and FedEx.</p>
          )}
          {shippoConnected && !shippoShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                API Key: <span style={{ color: "var(--text-secondary)" }}>{shippoApiKey}</span>
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-sm" onClick={() => setShippoShowForm(true)} style={{ fontSize: "11px" }}>Update</button>
                <button
                  className="btn btn-sm"
                  disabled={shippoTesting}
                  onClick={async () => {
                    setShippoTesting(true);
                    try {
                      const storeData = await getStoreSettings(storeId);
                      if (storeData?.settings?.shippo_api_key) showMessage("Shippo API key verified");
                      else showMessage("Shippo not configured", "error");
                    } catch { showMessage("Test failed", "error"); }
                    setShippoTesting(false);
                  }}
                  style={{ fontSize: "11px" }}
                >{shippoTesting ? "Testing..." : "Test"}</button>
                <button
                  className="btn btn-sm"
                  style={{ fontSize: "11px", color: "var(--red)" }}
                  onClick={async () => {
                    setShippoSaving(true);
                    try {
                      const storeData = await getStoreSettings(storeId);
                      const cur = storeData?.settings || {};
                      const { shippo_api_key: _, ...rest } = cur;
                      void _;
                      await updateStore(storeId, { settings: rest });
                      setShippoConnected(false);
                      setShippoApiKey("");
                      showMessage("Shippo disconnected");
                    } catch { showMessage("Failed to disconnect", "error"); }
                    setShippoSaving(false);
                  }}
                >Disconnect</button>
              </div>
            </div>
          )}
          {shippoShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Shippo API Key</label>
                <div style={{ position: "relative" }}>
                  <input type={shippoShowKey ? "text" : "password"} className="input" value={shippoApiKey.includes("••••") ? "" : shippoApiKey} onChange={(e) => setShippoApiKey(e.target.value)} placeholder="shippo_live_xxxxxxxxxxxxxxxx" style={{ width: "100%", fontSize: "13px", paddingRight: "36px" }} />
                  <button type="button" onClick={() => setShippoShowKey(!shippoShowKey)} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--text-tertiary)" }}>{shippoShowKey ? "Hide" : "Show"}</button>
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={shippoSaving}
                  onClick={async () => {
                    if (!shippoApiKey || shippoApiKey.includes("••••")) {
                      showMessage("API key required", "error");
                      return;
                    }
                    setShippoSaving(true);
                    try {
                      const storeData = await getStoreSettings(storeId);
                      const cur = storeData?.settings || {};
                      await updateStore(storeId, { settings: { ...cur, shippo_api_key: shippoApiKey } });
                      setShippoConnected(true);
                      setShippoShowForm(false);
                      setShippoApiKey(shippoApiKey.slice(0, 12) + "••••");
                      showMessage("Shippo connected — carrier-calculated rates enabled");
                    } catch (err) { showMessage((err as Error).message || "Save failed", "error"); }
                    setShippoSaving(false);
                  }}
                  style={{ fontSize: "12px" }}
                >{shippoSaving ? "Saving..." : "Save & Connect"}</button>
                <button className="btn btn-sm" onClick={() => setShippoShowForm(false)} style={{ fontSize: "12px" }}>Cancel</button>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-quaternary)", margin: 0 }}>
                Get your API key at goshippo.com/settings/api. Carrier rates will be used at checkout automatically.
              </p>
            </div>
          )}
        </div>

        {/* ── Mailchimp ── */}
        <div className="card" style={{ padding: "20px" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "#FFE01B", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#111"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Mailchimp</div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Email Marketing</div>
            </div>
            {mailchimpConnected ? (
              <span className="badge badge-green">Connected</span>
            ) : (
              <button className="btn btn-sm" onClick={() => setMailchimpShowForm(!mailchimpShowForm)} style={{ fontSize: "12px" }}>
                {mailchimpShowForm ? "Cancel" : "Configure"}
              </button>
            )}
          </div>
          {!mailchimpConnected && !mailchimpShowForm && (
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>Sync customers to Mailchimp audiences and trigger automated email campaigns.</p>
          )}
          {mailchimpConnected && !mailchimpShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                API Key: <span style={{ color: "var(--text-secondary)" }}>{mailchimpApiKey}</span>
              </div>
              {mailchimpListId && <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>List ID: <span style={{ color: "var(--text-secondary)" }}>{mailchimpListId}</span></div>}
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-sm" onClick={() => setMailchimpShowForm(true)} style={{ fontSize: "11px" }}>Update</button>
                <button className="btn btn-sm" disabled={mailchimpTesting} onClick={async () => { setMailchimpTesting(true); try { const s = await getStoreSettings(storeId); if (s?.settings?.mailchimp_api_key) showMessage("Mailchimp credentials verified"); else showMessage("Not configured", "error"); } catch { showMessage("Test failed", "error"); } setMailchimpTesting(false); }} style={{ fontSize: "11px" }}>{mailchimpTesting ? "Testing..." : "Test"}</button>
                <button className="btn btn-sm" style={{ fontSize: "11px", color: "var(--red)" }} onClick={async () => { setMailchimpSaving(true); try { const s = await getStoreSettings(storeId); const cur = s?.settings || {}; const { mailchimp_api_key: _a, mailchimp_list_id: _b, ...rest } = cur; void _a; void _b; await updateStore(storeId, { settings: rest }); setMailchimpConnected(false); setMailchimpApiKey(""); setMailchimpListId(""); showMessage("Mailchimp disconnected"); } catch { showMessage("Failed to disconnect", "error"); } setMailchimpSaving(false); }}>Disconnect</button>
              </div>
            </div>
          )}
          {mailchimpShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>API Key</label>
                <input className="input" type="password" value={mailchimpApiKey.includes("••••") ? "" : mailchimpApiKey} onChange={(e) => setMailchimpApiKey(e.target.value)} placeholder="xxxxxxxxxxxxxxxx-us14" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Audience/List ID (optional)</label>
                <input className="input" value={mailchimpListId} onChange={(e) => setMailchimpListId(e.target.value)} placeholder="abc1234def" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-primary btn-sm" disabled={mailchimpSaving} onClick={async () => { if (!mailchimpApiKey || mailchimpApiKey.includes("••••")) { showMessage("API key required", "error"); return; } setMailchimpSaving(true); try { const s = await getStoreSettings(storeId); const cur = s?.settings || {}; await updateStore(storeId, { settings: { ...cur, mailchimp_api_key: mailchimpApiKey, mailchimp_list_id: mailchimpListId } }); setMailchimpConnected(true); setMailchimpShowForm(false); setMailchimpApiKey(mailchimpApiKey.slice(0, 12) + "••••"); showMessage("Mailchimp connected — customer sync enabled"); } catch (err) { showMessage((err as Error).message || "Save failed", "error"); } setMailchimpSaving(false); }} style={{ fontSize: "12px" }}>{mailchimpSaving ? "Saving..." : "Save & Connect"}</button>
                <button className="btn btn-sm" onClick={() => setMailchimpShowForm(false)} style={{ fontSize: "12px" }}>Cancel</button>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-quaternary)", margin: 0 }}>New customers will auto-sync to your Mailchimp audience after purchase.</p>
            </div>
          )}
        </div>

        {/* ── Klaviyo ── */}
        <div className="card" style={{ padding: "20px" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: "18px" }}>K</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Klaviyo</div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>E-commerce Marketing</div>
            </div>
            {klaviyoConnected ? (
              <span className="badge badge-green">Connected</span>
            ) : (
              <button className="btn btn-sm" onClick={() => setKlaviyoShowForm(!klaviyoShowForm)} style={{ fontSize: "12px" }}>
                {klaviyoShowForm ? "Cancel" : "Configure"}
              </button>
            )}
          </div>
          {!klaviyoConnected && !klaviyoShowForm && (
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>Advanced email and SMS marketing with deep e-commerce analytics and segmentation.</p>
          )}
          {klaviyoConnected && !klaviyoShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>API Key: <span style={{ color: "var(--text-secondary)" }}>{klaviyoApiKey}</span></div>
              {klaviyoListId && <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>List ID: <span style={{ color: "var(--text-secondary)" }}>{klaviyoListId}</span></div>}
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-sm" onClick={() => setKlaviyoShowForm(true)} style={{ fontSize: "11px" }}>Update</button>
                <button className="btn btn-sm" disabled={klaviyoTesting} onClick={async () => { setKlaviyoTesting(true); try { const s = await getStoreSettings(storeId); if (s?.settings?.klaviyo_api_key) showMessage("Klaviyo credentials verified"); else showMessage("Not configured", "error"); } catch { showMessage("Test failed", "error"); } setKlaviyoTesting(false); }} style={{ fontSize: "11px" }}>{klaviyoTesting ? "Testing..." : "Test"}</button>
                <button className="btn btn-sm" style={{ fontSize: "11px", color: "var(--red)" }} onClick={async () => { setKlaviyoSaving(true); try { const s = await getStoreSettings(storeId); const cur = s?.settings || {}; const { klaviyo_api_key: _a, klaviyo_list_id: _b, ...rest } = cur; void _a; void _b; await updateStore(storeId, { settings: rest }); setKlaviyoConnected(false); setKlaviyoApiKey(""); setKlaviyoListId(""); showMessage("Klaviyo disconnected"); } catch { showMessage("Failed to disconnect", "error"); } setKlaviyoSaving(false); }}>Disconnect</button>
              </div>
            </div>
          )}
          {klaviyoShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Private API Key</label>
                <input className="input" type="password" value={klaviyoApiKey.includes("••••") ? "" : klaviyoApiKey} onChange={(e) => setKlaviyoApiKey(e.target.value)} placeholder="pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>List ID (optional)</label>
                <input className="input" value={klaviyoListId} onChange={(e) => setKlaviyoListId(e.target.value)} placeholder="AbCdEf" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-primary btn-sm" disabled={klaviyoSaving} onClick={async () => { if (!klaviyoApiKey || klaviyoApiKey.includes("••••")) { showMessage("API key required", "error"); return; } setKlaviyoSaving(true); try { const s = await getStoreSettings(storeId); const cur = s?.settings || {}; await updateStore(storeId, { settings: { ...cur, klaviyo_api_key: klaviyoApiKey, klaviyo_list_id: klaviyoListId } }); setKlaviyoConnected(true); setKlaviyoShowForm(false); setKlaviyoApiKey(klaviyoApiKey.slice(0, 12) + "••••"); showMessage("Klaviyo connected — e-commerce events enabled"); } catch (err) { showMessage((err as Error).message || "Save failed", "error"); } setKlaviyoSaving(false); }} style={{ fontSize: "12px" }}>{klaviyoSaving ? "Saving..." : "Save & Connect"}</button>
                <button className="btn btn-sm" onClick={() => setKlaviyoShowForm(false)} style={{ fontSize: "12px" }}>Cancel</button>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-quaternary)", margin: 0 }}>Tracks purchases, cart events, and browsing for targeted campaigns.</p>
            </div>
          )}
        </div>

        {/* ── Meta Commerce ── */}
        <div className="card" style={{ padding: "20px" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Meta Commerce</div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Facebook & Instagram Shop</div>
            </div>
            {metaConnected ? (
              <span className="badge badge-green">Connected</span>
            ) : (
              <button className="btn btn-sm" onClick={() => setMetaShowForm(!metaShowForm)} style={{ fontSize: "12px" }}>
                {metaShowForm ? "Cancel" : "Configure"}
              </button>
            )}
          </div>
          {!metaConnected && !metaShowForm && (
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>Sync your product catalog to sell directly on Facebook and Instagram.</p>
          )}
          {metaConnected && !metaShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Access Token: <span style={{ color: "var(--text-secondary)" }}>{metaAccessToken}</span></div>
              {metaCatalogId && <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Catalog ID: <span style={{ color: "var(--text-secondary)" }}>{metaCatalogId}</span></div>}
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-sm" onClick={() => setMetaShowForm(true)} style={{ fontSize: "11px" }}>Update</button>
                <button className="btn btn-sm" disabled={metaTesting} onClick={async () => { setMetaTesting(true); try { const s = await getStoreSettings(storeId); if (s?.settings?.meta_access_token) showMessage("Meta credentials verified"); else showMessage("Not configured", "error"); } catch { showMessage("Test failed", "error"); } setMetaTesting(false); }} style={{ fontSize: "11px" }}>{metaTesting ? "Testing..." : "Test"}</button>
                <button className="btn btn-sm" style={{ fontSize: "11px", color: "var(--red)" }} onClick={async () => { setMetaSaving(true); try { const s = await getStoreSettings(storeId); const cur = s?.settings || {}; const { meta_access_token: _a, meta_catalog_id: _b, ...rest } = cur; void _a; void _b; await updateStore(storeId, { settings: rest }); setMetaConnected(false); setMetaAccessToken(""); setMetaCatalogId(""); showMessage("Meta Commerce disconnected"); } catch { showMessage("Failed to disconnect", "error"); } setMetaSaving(false); }}>Disconnect</button>
              </div>
            </div>
          )}
          {metaShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Access Token</label>
                <input className="input" type="password" value={metaAccessToken.includes("••••") ? "" : metaAccessToken} onChange={(e) => setMetaAccessToken(e.target.value)} placeholder="EAAxxxxxxxxxxxxxxxx" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Catalog ID</label>
                <input className="input" value={metaCatalogId} onChange={(e) => setMetaCatalogId(e.target.value)} placeholder="123456789012345" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-primary btn-sm" disabled={metaSaving} onClick={async () => { if (!metaAccessToken || metaAccessToken.includes("••••")) { showMessage("Access token required", "error"); return; } setMetaSaving(true); try { const s = await getStoreSettings(storeId); const cur = s?.settings || {}; await updateStore(storeId, { settings: { ...cur, meta_access_token: metaAccessToken, meta_catalog_id: metaCatalogId } }); setMetaConnected(true); setMetaShowForm(false); setMetaAccessToken(metaAccessToken.slice(0, 12) + "••••"); showMessage("Meta Commerce connected — catalog sync enabled"); } catch (err) { showMessage((err as Error).message || "Save failed", "error"); } setMetaSaving(false); }} style={{ fontSize: "12px" }}>{metaSaving ? "Saving..." : "Save & Connect"}</button>
                <button className="btn btn-sm" onClick={() => setMetaShowForm(false)} style={{ fontSize: "12px" }}>Cancel</button>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-quaternary)", margin: 0 }}>Products sync to your Facebook/Instagram catalog on a daily schedule.</p>
            </div>
          )}
        </div>

        {/* ── Google Merchant ── */}
        <div className="card" style={{ padding: "20px" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "#4285F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Google Merchant</div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Google Shopping</div>
            </div>
            {googleConnected ? (
              <span className="badge badge-green">Connected</span>
            ) : (
              <button className="btn btn-sm" onClick={() => setGoogleShowForm(!googleShowForm)} style={{ fontSize: "12px" }}>
                {googleShowForm ? "Cancel" : "Configure"}
              </button>
            )}
          </div>
          {!googleConnected && !googleShowForm && (
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>List products on Google Shopping and run Performance Max campaigns.</p>
          )}
          {googleConnected && !googleShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Merchant ID: <span style={{ color: "var(--text-secondary)" }}>{googleMerchantId}</span></div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-sm" onClick={() => setGoogleShowForm(true)} style={{ fontSize: "11px" }}>Update</button>
                <button className="btn btn-sm" disabled={googleTesting} onClick={async () => { setGoogleTesting(true); try { const s = await getStoreSettings(storeId); if (s?.settings?.google_merchant_id) showMessage("Google Merchant verified"); else showMessage("Not configured", "error"); } catch { showMessage("Test failed", "error"); } setGoogleTesting(false); }} style={{ fontSize: "11px" }}>{googleTesting ? "Testing..." : "Test"}</button>
                <button className="btn btn-sm" style={{ fontSize: "11px", color: "var(--red)" }} onClick={async () => { setGoogleSaving(true); try { const s = await getStoreSettings(storeId); const cur = s?.settings || {}; const { google_merchant_id: _a, google_service_key: _b, ...rest } = cur; void _a; void _b; await updateStore(storeId, { settings: rest }); setGoogleConnected(false); setGoogleMerchantId(""); setGoogleServiceKey(""); showMessage("Google Merchant disconnected"); } catch { showMessage("Failed to disconnect", "error"); } setGoogleSaving(false); }}>Disconnect</button>
              </div>
            </div>
          )}
          {googleShowForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Merchant Center ID</label>
                <input className="input" value={googleMerchantId} onChange={(e) => setGoogleMerchantId(e.target.value)} placeholder="123456789" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>Service Account Key (JSON)</label>
                <input className="input" type="password" value={googleServiceKey.includes("••••") ? "" : googleServiceKey} onChange={(e) => setGoogleServiceKey(e.target.value)} placeholder="Paste JSON key contents" style={{ width: "100%", fontSize: "13px" }} />
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                <button className="btn btn-primary btn-sm" disabled={googleSaving} onClick={async () => { if (!googleMerchantId) { showMessage("Merchant ID required", "error"); return; } setGoogleSaving(true); try { const s = await getStoreSettings(storeId); const cur = s?.settings || {}; await updateStore(storeId, { settings: { ...cur, google_merchant_id: googleMerchantId, google_service_key: googleServiceKey || cur.google_service_key } }); setGoogleConnected(true); setGoogleShowForm(false); setGoogleServiceKey("••••••••"); showMessage("Google Merchant connected — product feed enabled"); } catch (err) { showMessage((err as Error).message || "Save failed", "error"); } setGoogleSaving(false); }} style={{ fontSize: "12px" }}>{googleSaving ? "Saving..." : "Save & Connect"}</button>
                <button className="btn btn-sm" onClick={() => setGoogleShowForm(false)} style={{ fontSize: "12px" }}>Cancel</button>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-quaternary)", margin: 0 }}>Products sync to Google Merchant Center for Shopping ads and free listings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Overview, Product Mappings & Sync Log */}
      {(squareIntegration || stripeIntegration || qbIntegration) && (
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
