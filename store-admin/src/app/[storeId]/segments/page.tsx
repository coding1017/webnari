"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSegments, createSegment, deleteSegment, getCustomers } from "@/app/[storeId]/actions/commerce-actions";

interface Segment {
  id: string;
  name: string;
  color: string;
  member_count: number;
  created_at: string;
}

const COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#ef4444", label: "Red" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#64748b", label: "Slate" },
];

export default function SegmentsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => { load(); }, [storeId]);

  async function load() {
    try {
      const [segs, custs] = await Promise.all([
        getSegments(storeId),
        getCustomers(storeId),
      ]);
      setSegments(segs || []);
      setCustomerCount(Array.isArray(custs) ? custs.length : 0);
    } catch { /* empty */ }
    setLoading(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      await createSegment(storeId, { name: newName.trim(), color: newColor });
      setNewName("");
      setMessage("Segment created");
      setTimeout(() => setMessage(""), 3000);
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteSegment(storeId, id);
      load();
    } catch { /* empty */ }
  }

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>Loading...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Customer Segments</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Group your {customerCount} customers into segments for targeted marketing and insights
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes("created") ? "alert-success" : "alert-error"}`} style={{ marginBottom: "20px" }}>
          {message}
        </div>
      )}

      {/* Create Segment */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h2 className="heading-sm" style={{ marginBottom: "16px" }}>New Segment</h2>
        <div className="flex gap-3 items-end">
          <div style={{ flex: 1 }}>
            <label>Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. VIP, Wholesale, First-time" />
          </div>
          <div style={{ width: "140px" }}>
            <label>Color</label>
            <select value={newColor} onChange={(e) => setNewColor(e.target.value)} style={{ fontSize: "13px" }}>
              {COLORS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleCreate} disabled={saving || !newName.trim()} className="btn btn-primary btn-sm" style={{ minHeight: "44px" }}>
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Segments List */}
      {segments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
          <p style={{ fontSize: "14px" }}>No segments yet. Create one above to start grouping customers.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {segments.map((seg) => (
            <div key={seg.id} className="card" style={{ padding: "16px 20px" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{seg.name}</span>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                      {seg.member_count} {seg.member_count === 1 ? "customer" : "customers"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "var(--radius-sm)", background: seg.color + "18", color: seg.color, fontWeight: 600 }}>
                    {seg.member_count}
                  </span>
                  <button onClick={() => handleDelete(seg.id)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "18px" }}>&times;</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
