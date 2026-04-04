"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from "@/app/[storeId]/actions/commerce-actions";

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  min_subtotal: number | null;
  max_uses: number | null;
  max_uses_per_customer: number | null;
  uses_count: number;
  category_restriction: string | null;
  is_active: boolean;
  is_automatic: boolean;
  stackable: boolean;
  starts_at: string | null;
  expires_at: string | null;
  status: string;
  created_at: string;
}

const STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  active: { cls: "badge-green", label: "Active" },
  paused: { cls: "badge-gray", label: "Paused" },
  expired: { cls: "badge-red", label: "Expired" },
  scheduled: { cls: "badge-blue", label: "Scheduled" },
  exhausted: { cls: "badge-orange", label: "Fully Used" },
};

function formatValue(type: string, value: number) {
  if (type === "percentage") return `${value}% off`;
  if (type === "fixed") return `$${(value / 100).toFixed(2)} off`;
  return "Free shipping";
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function DiscountsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  // Create form state
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<string>("percentage");
  const [newValue, setNewValue] = useState("");
  const [newMinSubtotal, setNewMinSubtotal] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newMaxPerCustomer, setNewMaxPerCustomer] = useState("1");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [newIsAutomatic, setNewIsAutomatic] = useState(false);
  const [newStackable, setNewStackable] = useState(true);
  // Buy X Get Y fields
  const [newBuyMinQty, setNewBuyMinQty] = useState("");
  const [newBuyCategory, setNewBuyCategory] = useState("");
  const [newGetQty, setNewGetQty] = useState("1");
  const [newGetCategory, setNewGetCategory] = useState("");
  const [newGetDiscountPercent, setNewGetDiscountPercent] = useState("100");

  useEffect(() => { load(); }, [storeId]);

  async function load() {
    try {
      const data = await getDiscounts(storeId);
      setDiscounts(data);
    } catch {}
  }

  function resetForm() {
    setNewCode(""); setNewType("percentage"); setNewValue("");
    setNewMinSubtotal(""); setNewMaxUses(""); setNewMaxPerCustomer("1");
    setNewStartsAt(""); setNewExpiresAt(""); setNewIsAutomatic(false);
    setNewStackable(true); setNewBuyMinQty(""); setNewBuyCategory("");
    setNewGetQty("1"); setNewGetCategory(""); setNewGetDiscountPercent("100");
    setShowCreate(false);
  }

  async function handleCreate() {
    if (!newCode.trim() || !newValue.trim()) {
      setMessage("Code and value are required");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await createDiscount(storeId, {
        code: newIsAutomatic ? undefined : newCode.trim(),
        type: newType,
        value: newType === "fixed" ? Math.round(parseFloat(newValue || "0") * 100) : parseFloat(newValue || "0"),
        min_subtotal: newMinSubtotal ? Math.round(parseFloat(newMinSubtotal) * 100) : null,
        max_uses: newMaxUses ? parseInt(newMaxUses) : null,
        max_uses_per_customer: newMaxPerCustomer ? parseInt(newMaxPerCustomer) : null,
        starts_at: newStartsAt || null,
        expires_at: newExpiresAt || null,
        is_automatic: newIsAutomatic,
        stackable: newStackable,
        ...(newType === "buy_x_get_y" ? {
          buy_min_qty: parseInt(newBuyMinQty) || 2,
          buy_category: newBuyCategory || null,
          get_qty: parseInt(newGetQty) || 1,
          get_category: newGetCategory || null,
          get_discount_percent: parseFloat(newGetDiscountPercent) || 100,
        } : {}),
      });
      resetForm();
      await load();
      setMessage("Discount created");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  async function handleToggleActive(d: Discount) {
    setActing(d.id);
    try {
      await updateDiscount(storeId, d.id, { is_active: !d.is_active });
      await load();
    } catch {}
    setActing(null);
  }

  async function handleDelete(d: Discount) {
    if (!confirm(`Delete discount "${d.code}"?`)) return;
    setActing(d.id);
    try {
      await deleteDiscount(storeId, d.id);
      await load();
    } catch {}
    setActing(null);
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Discounts</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Create promo codes for your customers
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn btn-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Discount
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`alert ${message.includes("created") ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}
        >
          {message}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="card fade-in" style={{ marginBottom: "24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
            <h2 className="heading-sm">New Discount Code</h2>
            <button onClick={resetForm} style={{ color: "var(--text-tertiary)", fontSize: "13px", background: "none", border: "none", cursor: "pointer" }}>
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: "16px" }}>
            {/* Code (hidden for automatic) */}
            {!newIsAutomatic && (
              <div>
                <label>Discount Code</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20"
                    style={{ flex: 1, textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.05em" }}
                  />
                  <button
                    type="button"
                    onClick={() => setNewCode(generateCode())}
                    style={{
                      fontSize: "11px", fontWeight: 600, padding: "8px 12px",
                      background: "var(--bg-grouped)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Random
                  </button>
                </div>
              </div>
            )}

            {/* Type */}
            <div>
              <label>Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>

            {/* Value (hidden for BXGY and free shipping) */}
            {newType !== "buy_x_get_y" && (
              <div>
                <label>{newType === "percentage" ? "Percentage (%)" : newType === "fixed" ? "Amount ($)" : "Value"}</label>
                <input
                  type="number"
                  step={newType === "percentage" ? "1" : "0.01"}
                  min="0"
                  max={newType === "percentage" ? "100" : undefined}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={newType === "percentage" ? "e.g. 20" : newType === "fixed" ? "e.g. 10.00" : "0"}
                  disabled={newType === "free_shipping"}
                />
              </div>
            )}
          </div>

          {/* Buy X Get Y fields */}
          {newType === "buy_x_get_y" && (
            <div style={{ padding: "16px", background: "var(--bg-grouped)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>
                Buy X Get Y Configuration
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label>Buy Qty</label>
                  <input type="number" min="1" value={newBuyMinQty} onChange={(e) => setNewBuyMinQty(e.target.value)} placeholder="2" />
                </div>
                <div>
                  <label>Buy Category</label>
                  <input value={newBuyCategory} onChange={(e) => setNewBuyCategory(e.target.value)} placeholder="Any category" />
                </div>
                <div>
                  <label>Get Qty</label>
                  <input type="number" min="1" value={newGetQty} onChange={(e) => setNewGetQty(e.target.value)} placeholder="1" />
                </div>
                <div>
                  <label>Get Category</label>
                  <input value={newGetCategory} onChange={(e) => setNewGetCategory(e.target.value)} placeholder="Same as buy" />
                </div>
                <div>
                  <label>Discount (%)</label>
                  <input type="number" min="1" max="100" value={newGetDiscountPercent} onChange={(e) => setNewGetDiscountPercent(e.target.value)} placeholder="100 = free" />
                </div>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "8px" }}>
                Example: Buy 2 from &quot;pouches&quot;, get 1 from &quot;pouches&quot; at 100% off (free)
              </p>
            </div>
          )}

          {/* Toggles */}
          <div className="flex items-center gap-8" style={{ marginBottom: "16px" }}>
            <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
              <input type="checkbox" checked={newIsAutomatic} onChange={(e) => setNewIsAutomatic(e.target.checked)} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Automatic</span>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>(no code needed)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
              <input type="checkbox" checked={newStackable} onChange={(e) => setNewStackable(e.target.checked)} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Stackable</span>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>(can combine with others)</span>
            </label>
          </div>

          {/* Conditions */}
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>
            Conditions (optional)
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "20px" }}>
            <div>
              <label>Min Purchase ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newMinSubtotal}
                onChange={(e) => setNewMinSubtotal(e.target.value)}
                placeholder="No minimum"
              />
            </div>
            <div>
              <label>Max Total Uses</label>
              <input
                type="number"
                min="1"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label>Uses Per Customer</label>
              <input
                type="number"
                min="1"
                value={newMaxPerCustomer}
                onChange={(e) => setNewMaxPerCustomer(e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <label>Expires</label>
              <input
                type="datetime-local"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: "13px" }}
          >
            {saving ? "Creating..." : "Create Discount"}
          </button>
        </div>
      )}

      {/* Discounts Table */}
      <div className="card-section">
        {discounts.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th className="text-center">Uses</th>
                <th className="text-center">Status</th>
                <th className="hide-mobile">Expires</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => {
                const s = STATUS_BADGES[d.status] || STATUS_BADGES.active;
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                          {d.is_automatic ? "(Auto)" : d.code}
                        </span>
                        {d.is_automatic && <span className="badge badge-purple" style={{ fontSize: "9px", padding: "1px 6px" }}>Auto</span>}
                        {!d.stackable && <span className="badge badge-gray" style={{ fontSize: "9px", padding: "1px 6px" }}>Solo</span>}
                      </div>
                      {d.min_subtotal && (
                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                          Min ${(d.min_subtotal / 100).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: "13px" }}>{formatValue(d.type, d.value)}</td>
                    <td className="text-center" style={{ fontSize: "13px" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.uses_count}</span>
                      <span style={{ color: "var(--text-tertiary)" }}>{d.max_uses ? ` / ${d.max_uses}` : ""}</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="hide-mobile" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : "Never"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleToggleActive(d)}
                          disabled={acting === d.id}
                          className="text-link"
                          style={{ fontSize: "12px" }}
                        >
                          {d.is_active ? "Pause" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(d)}
                          disabled={acting === d.id}
                          style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>No discount codes yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px" }}>Create your first promo code to offer deals to customers</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ fontSize: "13px" }}>
              Create Discount
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
