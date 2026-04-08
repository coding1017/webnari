"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationStock,
  updateLocationStock,
  createTransfer,
  getTransfers,
  updateTransfer,
  getProducts,
} from "@/app/[storeId]/actions/commerce-actions";

interface Location {
  id: string;
  name: string;
  address: string;
  type: string;
  is_default: boolean;
  is_active: boolean;
  stock_total: number;
  product_count: number;
}

interface LocationStockItem {
  id: string;
  location_id: string;
  product_id: string;
  variant_id: string | null;
  stock_quantity: number;
  reorder_point: number;
  product_name?: string;
}

interface Transfer {
  id: string;
  from_location_id: string;
  to_location_id: string;
  product_id: string;
  quantity: number;
  status: string;
  notes: string;
  created_at: string;
  received_at: string | null;
  from_name?: string;
  to_name?: string;
  product_name?: string;
}

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
}

type Tab = "locations" | "stock" | "transfers";

export default function LocationsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [tab, setTab] = useState<Tab>("locations");
  const [locations, setLocations] = useState<Location[]>([]);
  const [stock, setStock] = useState<LocationStockItem[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Create location form
  const [showCreate, setShowCreate] = useState(false);
  const [locForm, setLocForm] = useState({ name: "", address: "", type: "warehouse" });
  const [saving, setSaving] = useState(false);

  // Stock update form
  const [stockForm, setStockForm] = useState({ location_id: "", product_id: "", stock_quantity: 0, reorder_point: 0 });
  const [showStockForm, setShowStockForm] = useState(false);

  // Transfer form
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferForm, setTransferForm] = useState({ from_location_id: "", to_location_id: "", product_id: "", quantity: 1, notes: "" });

  useEffect(() => { loadAll(); }, [storeId]);

  async function loadAll() {
    try {
      const [locs, prods] = await Promise.all([
        getLocations(storeId),
        getProducts(storeId),
      ]);
      setLocations(locs || []);
      setProducts(prods || []);
    } catch { /* empty */ }
    setLoading(false);
  }

  async function loadStock() {
    try {
      const s = await getLocationStock(storeId);
      setStock(s || []);
    } catch { /* empty */ }
  }

  async function loadTransfers() {
    try {
      const t = await getTransfers(storeId);
      setTransfers(t || []);
    } catch { /* empty */ }
  }

  useEffect(() => {
    if (tab === "stock") loadStock();
    if (tab === "transfers") loadTransfers();
  }, [tab]);

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleCreateLocation() {
    if (!locForm.name.trim()) return;
    setSaving(true);
    try {
      await createLocation(storeId, { name: locForm.name.trim(), address: locForm.address, type: locForm.type });
      setLocForm({ name: "", address: "", type: "warehouse" });
      setShowCreate(false);
      flash("Location created");
      loadAll();
    } catch (err) { flash((err as Error).message); }
    setSaving(false);
  }

  async function handleDeleteLocation(id: string) {
    try {
      await deleteLocation(storeId, id);
      flash("Location deleted");
      loadAll();
    } catch (err) { flash((err as Error).message); }
  }

  async function handleSetDefault(id: string) {
    try {
      await updateLocation(storeId, id, { is_default: true });
      flash("Default location updated");
      loadAll();
    } catch { /* empty */ }
  }

  async function handleUpdateStock() {
    if (!stockForm.location_id || !stockForm.product_id) return;
    setSaving(true);
    try {
      await updateLocationStock(storeId, stockForm);
      setShowStockForm(false);
      flash("Stock updated");
      loadStock();
    } catch (err) { flash((err as Error).message); }
    setSaving(false);
  }

  async function handleCreateTransfer() {
    if (!transferForm.from_location_id || !transferForm.to_location_id || !transferForm.product_id) return;
    setSaving(true);
    try {
      await createTransfer(storeId, {
        from_location_id: transferForm.from_location_id,
        to_location_id: transferForm.to_location_id,
        product_id: transferForm.product_id,
        quantity: transferForm.quantity,
        notes: transferForm.notes,
      });
      setShowTransferForm(false);
      setTransferForm({ from_location_id: "", to_location_id: "", product_id: "", quantity: 1, notes: "" });
      flash("Transfer created");
      loadTransfers();
    } catch (err) { flash((err as Error).message); }
    setSaving(false);
  }

  async function handleReceiveTransfer(id: string) {
    try {
      await updateTransfer(storeId, id, { status: "received" });
      flash("Transfer received — stock updated");
      loadTransfers();
    } catch (err) { flash((err as Error).message); }
  }

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>Loading...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: "960px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Inventory Locations</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Manage stock across multiple warehouses, stores, and fulfillment centers
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes("deleted") || message.includes("error") ? "alert-error" : "alert-success"}`} style={{ marginBottom: "20px" }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1" style={{ marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
        {(["locations", "stock", "transfers"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "var(--gold)" : "var(--text-secondary)",
              borderBottom: tab === t ? "2px solid var(--gold)" : "2px solid transparent",
              background: "none",
              border: "none",
              borderBottomWidth: "2px",
              borderBottomStyle: "solid",
              borderBottomColor: tab === t ? "var(--gold)" : "transparent",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─── LOCATIONS TAB ─── */}
      {tab === "locations" && (
        <>
          <div className="flex justify-end" style={{ marginBottom: "16px" }}>
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary btn-sm">
              {showCreate ? "Cancel" : "+ Add Location"}
            </button>
          </div>

          {showCreate && (
            <div className="card" style={{ marginBottom: "20px" }}>
              <h2 className="heading-sm" style={{ marginBottom: "16px" }}>New Location</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: "12px", alignItems: "end" }}>
                <div>
                  <label>Name</label>
                  <input value={locForm.name} onChange={(e) => setLocForm({ ...locForm, name: e.target.value })} placeholder="e.g. Main Warehouse" />
                </div>
                <div>
                  <label>Address</label>
                  <input value={locForm.address} onChange={(e) => setLocForm({ ...locForm, address: e.target.value })} placeholder="123 Main St, Miami FL" />
                </div>
                <div>
                  <label>Type</label>
                  <select value={locForm.type} onChange={(e) => setLocForm({ ...locForm, type: e.target.value })}>
                    <option value="warehouse">Warehouse</option>
                    <option value="store">Store</option>
                    <option value="fulfillment">Fulfillment</option>
                    <option value="dropship">Dropship</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end" style={{ marginTop: "12px" }}>
                <button onClick={handleCreateLocation} disabled={saving || !locForm.name.trim()} className="btn btn-primary btn-sm">
                  {saving ? "Creating..." : "Create Location"}
                </button>
              </div>
            </div>
          )}

          {locations.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
              <p style={{ fontSize: "14px" }}>No locations yet. Add one to start tracking multi-location inventory.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {locations.map((loc) => (
                <div key={loc.id} className="card" style={{ padding: "16px 20px" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{loc.name}</span>
                        {loc.is_default && (
                          <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "var(--radius-sm)", background: "var(--gold-light)", color: "var(--gold)", fontWeight: 600 }}>
                            DEFAULT
                          </span>
                        )}
                        <span style={{ fontSize: "11px", padding: "1px 8px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontWeight: 500, textTransform: "capitalize" }}>
                          {loc.type}
                        </span>
                      </div>
                      {loc.address && (
                        <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "4px 0 0" }}>{loc.address}</p>
                      )}
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                        {loc.stock_total || 0} units &middot; {loc.product_count || 0} products
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!loc.is_default && (
                        <button onClick={() => handleSetDefault(loc.id)} className="btn btn-sm" style={{ fontSize: "11px", padding: "3px 10px", background: "var(--bg-secondary)" }}>
                          Set Default
                        </button>
                      )}
                      {!loc.is_default && (
                        <button onClick={() => handleDeleteLocation(loc.id)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "18px" }}>
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── STOCK TAB ─── */}
      {tab === "stock" && (
        <>
          <div className="flex justify-end" style={{ marginBottom: "16px" }}>
            <button onClick={() => setShowStockForm(!showStockForm)} className="btn btn-primary btn-sm">
              {showStockForm ? "Cancel" : "+ Update Stock"}
            </button>
          </div>

          {showStockForm && (
            <div className="card" style={{ marginBottom: "20px" }}>
              <h2 className="heading-sm" style={{ marginBottom: "16px" }}>Set Stock Level</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 100px", gap: "12px", alignItems: "end" }}>
                <div>
                  <label>Location</label>
                  <select value={stockForm.location_id} onChange={(e) => setStockForm({ ...stockForm, location_id: e.target.value })}>
                    <option value="">Select...</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Product</label>
                  <select value={stockForm.product_id} onChange={(e) => setStockForm({ ...stockForm, product_id: e.target.value })}>
                    <option value="">Select...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Qty</label>
                  <input type="number" value={stockForm.stock_quantity} onChange={(e) => setStockForm({ ...stockForm, stock_quantity: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label>Reorder</label>
                  <input type="number" value={stockForm.reorder_point} onChange={(e) => setStockForm({ ...stockForm, reorder_point: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex justify-end" style={{ marginTop: "12px" }}>
                <button onClick={handleUpdateStock} disabled={saving || !stockForm.location_id || !stockForm.product_id} className="btn btn-primary btn-sm">
                  {saving ? "Saving..." : "Set Stock"}
                </button>
              </div>
            </div>
          )}

          {stock.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
              <p style={{ fontSize: "14px" }}>No location stock entries yet. Set stock levels for products at each location.</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ textAlign: "left", padding: "10px 16px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "12px" }}>Product</th>
                    <th style={{ textAlign: "left", padding: "10px 16px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "12px" }}>Location</th>
                    <th style={{ textAlign: "right", padding: "10px 16px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "12px" }}>Stock</th>
                    <th style={{ textAlign: "right", padding: "10px 16px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "12px" }}>Reorder At</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((s) => {
                    const loc = locations.find((l) => l.id === s.location_id);
                    const prod = products.find((p) => p.id === s.product_id);
                    const lowStock = s.stock_quantity <= s.reorder_point && s.reorder_point > 0;
                    return (
                      <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 16px", color: "var(--text-primary)", fontWeight: 500 }}>{prod?.name || s.product_id.slice(0, 8)}</td>
                        <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>{loc?.name || "Unknown"}</td>
                        <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: lowStock ? "#ef4444" : "var(--text-primary)" }}>
                          {s.stock_quantity}
                          {lowStock && <span style={{ fontSize: "10px", marginLeft: "6px", color: "#ef4444" }}>LOW</span>}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "right", color: "var(--text-tertiary)" }}>{s.reorder_point || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── TRANSFERS TAB ─── */}
      {tab === "transfers" && (
        <>
          <div className="flex justify-end" style={{ marginBottom: "16px" }}>
            <button onClick={() => setShowTransferForm(!showTransferForm)} className="btn btn-primary btn-sm">
              {showTransferForm ? "Cancel" : "+ New Transfer"}
            </button>
          </div>

          {showTransferForm && (
            <div className="card" style={{ marginBottom: "20px" }}>
              <h2 className="heading-sm" style={{ marginBottom: "16px" }}>Create Transfer</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label>From Location</label>
                  <select value={transferForm.from_location_id} onChange={(e) => setTransferForm({ ...transferForm, from_location_id: e.target.value })}>
                    <option value="">Select...</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>To Location</label>
                  <select value={transferForm.to_location_id} onChange={(e) => setTransferForm({ ...transferForm, to_location_id: e.target.value })}>
                    <option value="">Select...</option>
                    {locations.filter((l) => l.id !== transferForm.from_location_id).map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Product</label>
                  <select value={transferForm.product_id} onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })}>
                    <option value="">Select...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "12px", marginTop: "12px" }}>
                <div>
                  <label>Quantity</label>
                  <input type="number" min="1" value={transferForm.quantity} onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label>Notes (optional)</label>
                  <input value={transferForm.notes} onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })} placeholder="Reason for transfer" />
                </div>
              </div>
              <div className="flex justify-end" style={{ marginTop: "12px" }}>
                <button
                  onClick={handleCreateTransfer}
                  disabled={saving || !transferForm.from_location_id || !transferForm.to_location_id || !transferForm.product_id}
                  className="btn btn-primary btn-sm"
                >
                  {saving ? "Creating..." : "Create Transfer"}
                </button>
              </div>
            </div>
          )}

          {transfers.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
              <p style={{ fontSize: "14px" }}>No transfers yet. Create one to move stock between locations.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {transfers.map((tr) => {
                const fromLoc = locations.find((l) => l.id === tr.from_location_id);
                const toLoc = locations.find((l) => l.id === tr.to_location_id);
                const prod = products.find((p) => p.id === tr.product_id);
                const statusColor = tr.status === "received" ? "#10b981" : tr.status === "in_transit" ? "#f59e0b" : tr.status === "cancelled" ? "#ef4444" : "#6366f1";
                return (
                  <div key={tr.id} className="card" style={{ padding: "16px 20px" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: "11px", padding: "2px 10px", borderRadius: "var(--radius-sm)", background: statusColor + "18", color: statusColor, fontWeight: 600, textTransform: "capitalize" }}>
                            {tr.status.replace("_", " ")}
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {tr.quantity}x {prod?.name || tr.product_name || "Product"}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                          {fromLoc?.name || tr.from_name || "?"} &rarr; {toLoc?.name || tr.to_name || "?"}
                          {tr.notes && <span style={{ color: "var(--text-tertiary)" }}> &middot; {tr.notes}</span>}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                          {new Date(tr.created_at).toLocaleDateString()}
                          {tr.received_at && ` — Received ${new Date(tr.received_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      {(tr.status === "pending" || tr.status === "in_transit") && (
                        <button onClick={() => handleReceiveTransfer(tr.id)} className="btn btn-sm" style={{ fontSize: "12px", padding: "4px 12px", background: "#10b98118", color: "#10b981" }}>
                          Mark Received
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
