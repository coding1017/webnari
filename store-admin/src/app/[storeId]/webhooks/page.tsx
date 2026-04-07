"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookDeliveries,
  testWebhook,
  getWebhookEvents,
} from "@/app/[storeId]/actions/commerce-actions";

interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
  recentDeliveryStats?: { total: number; success: number; failed: number; retrying: number };
}

interface Delivery {
  id: string;
  event_type: string;
  status: string;
  response_status: number | null;
  response_ms: number | null;
  attempt: number;
  error: string | null;
  created_at: string;
}

interface EventType {
  type: string;
  description: string;
}

const EVENT_GROUPS: Record<string, string[]> = {
  "Order Events": ["order.created", "order.updated", "order.paid", "order.fulfilled", "order.cancelled", "order.refunded"],
  "Product Events": ["product.created", "product.updated", "product.deleted", "variant.created", "variant.updated", "variant.deleted"],
  "Customer Events": ["customer.created", "customer.updated"],
  "Other Events": ["review.created", "review.approved", "inventory.low", "discount.created"],
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function WebhooksPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [availableEvents, setAvailableEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState("");
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [testing, setTesting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const showMessage = useCallback((msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 10000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [whData, evData] = await Promise.all([
        getWebhooks(storeId),
        getWebhookEvents(storeId),
      ]);
      setWebhooks(Array.isArray(whData) ? whData : whData.endpoints || []);
      setAvailableEvents(evData.events || []);
    } catch (err) {
      showMessage(`Failed to load webhooks: ${(err as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [storeId, showMessage]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreate() {
    if (!newUrl.trim()) return showMessage("URL is required", "error");
    if (newEvents.length === 0) return showMessage("Select at least one event", "error");
    setCreating(true);
    try {
      const result = await createWebhook(storeId, {
        url: newUrl.trim(),
        events: newEvents,
        description: newDescription.trim() || undefined,
      });
      const endpoint = result.endpoint || result;
      setNewSecret(result.secret || endpoint.secret || "");
      setNewUrl("");
      setNewDescription("");
      setNewEvents([]);
      await loadData();
      showMessage("Webhook endpoint created", "success");
    } catch (err) {
      showMessage(`Create failed: ${(err as Error).message}`, "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleTest(id: string) {
    setTesting(id);
    try {
      const result = await testWebhook(storeId, id);
      if (result.success) {
        showMessage(`Test delivered — ${result.status} in ${result.latency_ms}ms`, "success");
      } else {
        showMessage(`Test failed — ${result.status || "no response"}`, "error");
      }
    } catch (err) {
      showMessage(`Test error: ${(err as Error).message}`, "error");
    } finally {
      setTesting(null);
    }
  }

  async function handleToggle(wh: Webhook) {
    try {
      await updateWebhook(storeId, wh.id, { is_active: !wh.is_active });
      await loadData();
      showMessage(`Endpoint ${wh.is_active ? "paused" : "activated"}`, "success");
    } catch (err) {
      showMessage(`Update failed: ${(err as Error).message}`, "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook endpoint? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteWebhook(storeId, id);
      if (selectedWebhook === id) { setSelectedWebhook(null); setDeliveries([]); }
      await loadData();
      showMessage("Endpoint deleted", "success");
    } catch (err) {
      showMessage(`Delete failed: ${(err as Error).message}`, "error");
    } finally {
      setDeleting(null);
    }
  }

  async function handleSelectEndpoint(id: string) {
    if (selectedWebhook === id) {
      setSelectedWebhook(null);
      setDeliveries([]);
      return;
    }
    setSelectedWebhook(id);
    setLoadingDeliveries(true);
    try {
      const data = await getWebhookDeliveries(storeId, id, { limit: 25 });
      setDeliveries(Array.isArray(data) ? data : data.deliveries || []);
    } catch {
      setDeliveries([]);
    } finally {
      setLoadingDeliveries(false);
    }
  }

  function toggleEvent(eventType: string) {
    setNewEvents((prev) =>
      prev.includes(eventType) ? prev.filter((e) => e !== eventType) : [...prev, eventType]
    );
  }

  function selectAllEvents() {
    const allTypes = availableEvents.map((e) => e.type);
    setNewEvents(allTypes);
  }

  function deselectAllEvents() {
    setNewEvents([]);
  }

  function copySecret() {
    navigator.clipboard.writeText(newSecret);
    showMessage("Secret copied to clipboard", "success");
  }

  // Compute KPI stats
  const totalEndpoints = webhooks.length;
  const totalSuccess = webhooks.reduce((s, w) => s + (w.recentDeliveryStats?.success || 0), 0);
  const totalFailed = webhooks.reduce((s, w) => s + (w.recentDeliveryStats?.failed || 0), 0);

  // Group available events for checkboxes
  function getGroupedEvents() {
    const grouped: Record<string, EventType[]> = {};
    for (const [groupName, prefixes] of Object.entries(EVENT_GROUPS)) {
      grouped[groupName] = availableEvents.filter((e) => prefixes.includes(e.type));
    }
    // Catch ungrouped events
    const allGrouped = Object.values(EVENT_GROUPS).flat();
    const ungrouped = availableEvents.filter((e) => !allGrouped.includes(e.type));
    if (ungrouped.length > 0) {
      grouped["Other Events"] = [...(grouped["Other Events"] || []), ...ungrouped];
    }
    return grouped;
  }

  if (loading) {
    return (
      <div style={{ padding: "60px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Loading webhooks...</div>
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
          <button onClick={() => setMessage("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "18px", lineHeight: 1 }}>
            x
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="heading-lg" style={{ marginBottom: "4px" }}>Webhooks</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", margin: 0 }}>
            Receive real-time notifications when events happen in your store
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowCreate(!showCreate); setNewSecret(""); }}
        >
          <svg style={{ width: "16px", height: "16px", marginRight: "6px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Endpoint
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total Endpoints", value: totalEndpoints, color: "var(--gold)" },
          { label: "Successful (24h)", value: totalSuccess, color: "#22c55e" },
          { label: "Failed (24h)", value: totalFailed, color: "#ef4444" },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: "20px 24px", borderTop: `3px solid ${kpi.color}` }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
          <h2 className="heading-sm" style={{ marginBottom: "20px" }}>New Webhook Endpoint</h2>

          {/* Secret reveal */}
          {newSecret && (
            <div style={{ marginBottom: "20px", padding: "16px 20px", borderRadius: "var(--radius-md)", background: "rgba(234, 179, 8, 0.08)", border: "1.5px solid rgba(234, 179, 8, 0.25)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Signing Secret
              </div>
              <div className="flex items-center" style={{ gap: "10px" }}>
                <code style={{ flex: 1, fontSize: "13px", color: "var(--text-primary)", background: "var(--bg-elevated)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", wordBreak: "break-all", fontFamily: "monospace" }}>
                  {newSecret}
                </code>
                <button className="btn btn-secondary btn-sm" onClick={copySecret}>Copy</button>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "8px", marginBottom: 0 }}>
                Save this secret now -- it will not be shown again. Use it to verify webhook signatures.
              </p>
            </div>
          )}

          {!newSecret && (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                  Description
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Order notifications for fulfillment system"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
                />
              </div>

              {/* Events */}
              <div style={{ marginBottom: "20px" }}>
                <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Events ({newEvents.length} selected)
                  </label>
                  <div className="flex" style={{ gap: "8px" }}>
                    <button className="btn btn-secondary btn-sm" onClick={selectAllEvents}>Select All</button>
                    <button className="btn btn-secondary btn-sm" onClick={deselectAllEvents}>Deselect All</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {Object.entries(getGroupedEvents()).map(([group, events]) =>
                    events.length > 0 ? (
                      <div key={group}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>{group}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {events.map((ev) => (
                            <label key={ev.type} className="flex items-center" style={{ gap: "8px", cursor: "pointer", fontSize: "13px", color: "var(--text-primary)" }}>
                              <input
                                type="checkbox"
                                checked={newEvents.includes(ev.type)}
                                onChange={() => toggleEvent(ev.type)}
                                style={{ accentColor: "var(--gold)" }}
                              />
                              <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{ev.type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              <div className="flex" style={{ gap: "10px" }}>
                <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating..." : "Create Endpoint"}
                </button>
                <button className="btn btn-secondary" onClick={() => { setShowCreate(false); setNewUrl(""); setNewDescription(""); setNewEvents([]); }}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {newSecret && (
            <div style={{ marginTop: "12px" }}>
              <button className="btn btn-secondary" onClick={() => { setShowCreate(false); setNewSecret(""); }}>Done</button>
            </div>
          )}
        </div>
      )}

      {/* Endpoints List */}
      {webhooks.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <svg style={{ width: "48px", height: "48px", margin: "0 auto 16px", color: "var(--text-quaternary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>No webhook endpoints</div>
          <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Create an endpoint to start receiving event notifications</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {webhooks.map((wh) => (
            <div key={wh.id}>
              <div
                className="card"
                style={{ padding: "20px 24px", cursor: "pointer", transition: "box-shadow 0.15s", ...(selectedWebhook === wh.id ? { boxShadow: "0 0 0 2px var(--gold)" } : {}) }}
                onClick={() => handleSelectEndpoint(wh.id)}
              >
                <div className="flex items-center" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center" style={{ gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "400px", fontFamily: "monospace" }}>
                        {wh.url}
                      </span>
                      <span className={`badge ${wh.is_active ? "badge-green" : "badge-gray"}`}>
                        {wh.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                    {wh.description && (
                      <div style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "6px" }}>{wh.description}</div>
                    )}
                    <div className="flex items-center" style={{ gap: "12px", flexWrap: "wrap" }}>
                      <span className="badge badge-gray">{wh.events.length} event{wh.events.length !== 1 ? "s" : ""}</span>
                      {wh.recentDeliveryStats && (
                        <>
                          <span style={{ fontSize: "12px", color: "#22c55e" }}>
                            {wh.recentDeliveryStats.success} delivered
                          </span>
                          {wh.recentDeliveryStats.failed > 0 && (
                            <span style={{ fontSize: "12px", color: "#ef4444" }}>
                              {wh.recentDeliveryStats.failed} failed
                            </span>
                          )}
                          {wh.recentDeliveryStats.retrying > 0 && (
                            <span style={{ fontSize: "12px", color: "#f59e0b" }}>
                              {wh.recentDeliveryStats.retrying} retrying
                            </span>
                          )}
                        </>
                      )}
                      <span style={{ fontSize: "12px", color: "var(--text-quaternary)" }}>
                        Created {timeAgo(wh.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center" style={{ gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleTest(wh.id)}
                      disabled={testing === wh.id}
                    >
                      {testing === wh.id ? "Sending..." : "Test"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggle(wh)}
                    >
                      {wh.is_active ? "Pause" : "Activate"}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(wh.id)}
                      disabled={deleting === wh.id}
                    >
                      {deleting === wh.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Log */}
              {selectedWebhook === wh.id && (
                <div className="card" style={{ marginTop: "2px", borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: "20px 24px" }}>
                  <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: "16px" }}>
                    <h3 className="heading-sm" style={{ margin: 0 }}>Recent Deliveries</h3>
                    <span style={{ fontSize: "12px", color: "var(--text-quaternary)" }}>{deliveries.length} entries</span>
                  </div>

                  {loadingDeliveries ? (
                    <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-tertiary)" }}>Loading deliveries...</div>
                  ) : deliveries.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-tertiary)" }}>No deliveries yet. Send a test event to get started.</div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                            {["Event", "Status", "Code", "Latency", "Attempt", "Time"].map((h) => (
                              <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {deliveries.map((d) => (
                            <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                              <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "var(--text-primary)" }}>
                                {d.event_type}
                              </td>
                              <td style={{ padding: "10px 12px" }}>
                                <span className={`badge ${d.status === "success" ? "badge-green" : d.status === "retrying" ? "badge-orange" : "badge-red"}`}>
                                  {d.status}
                                </span>
                              </td>
                              <td style={{ padding: "10px 12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                                {d.response_status ?? "--"}
                              </td>
                              <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>
                                {d.response_ms != null ? `${d.response_ms}ms` : "--"}
                              </td>
                              <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>
                                #{d.attempt}
                              </td>
                              <td style={{ padding: "10px 12px", color: "var(--text-quaternary)", whiteSpace: "nowrap" }}>
                                {timeAgo(d.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
