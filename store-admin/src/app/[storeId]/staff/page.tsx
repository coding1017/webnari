"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStaff, createStaff, updateStaff, deleteStaff } from "@/app/[storeId]/actions/commerce-actions";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
  api_key?: string;
}

const PERMISSION_LABELS: Record<string, string> = {
  "products:read": "View Products",
  "products:write": "Manage Products",
  "orders:read": "View Orders",
  "orders:write": "Manage Orders",
  "orders:refund": "Process Refunds",
  "discounts:write": "Manage Discounts",
  "customers:read": "View Customers",
  "settings:write": "Manage Settings",
  "integrations:write": "Manage Integrations",
  "analytics:read": "View Analytics",
  "blog:write": "Manage Blog",
  "labels:purchase": "Purchase Labels",
};

export default function StaffPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"manager" | "owner">("manager");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { load(); }, [storeId]);

  async function load() {
    try {
      const res = await getStaff(storeId);
      setStaff(res.staff || []);
      setAvailablePermissions(res.available_permissions || Object.keys(PERMISSION_LABELS));
    } catch { /* */ }
  }

  async function handleCreate() {
    if (!newName.trim() || !newEmail.trim()) return;
    setSaving(true);
    try {
      const res = await createStaff(storeId, {
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        permissions: newRole === "owner" ? ["*"] : newPermissions,
      });
      if (res.api_key) setNewApiKey(res.api_key);
      setShowForm(false);
      setNewName(""); setNewEmail(""); setNewRole("manager"); setNewPermissions([]);
      setMessage("Staff member created");
      setTimeout(() => setMessage(""), 5000);
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteStaff(storeId, id);
      await load();
      setMessage("Staff member removed");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function handleUpdatePermissions(id: string, permissions: string[]) {
    try {
      await updateStaff(storeId, id, { permissions });
      await load();
    } catch { /* */ }
  }

  function togglePermission(perm: string) {
    setNewPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  }

  const kpiStyle: React.CSSProperties = { padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12 };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-input)", color: "var(--text-primary)" };
  const btnPrimary: React.CSSProperties = { padding: "10px 20px", fontSize: 14, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" };
  const btnDanger: React.CSSProperties = { padding: "6px 12px", fontSize: 12, fontWeight: 600, background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Staff</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0" }}>Manage team access and permissions</p>
        </div>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 8, background: message.includes("error") ? "#fef2f2" : "#f0fdf4", color: message.includes("error") ? "#dc2626" : "#16a34a", fontSize: 14 }}>
          {message}
        </div>
      )}

      {newApiKey && (
        <div style={{ padding: 16, marginBottom: 16, borderRadius: 8, background: "#fffbeb", border: "1px solid #fbbf24" }}>
          <p style={{ margin: "0 0 8px", fontWeight: 600, color: "#92400e" }}>API Key (save this now - it won't be shown again):</p>
          <code style={{ display: "block", padding: 12, background: "#fff", borderRadius: 6, fontSize: 13, wordBreak: "break-all", color: "#1e293b" }}>{newApiKey}</code>
          <button style={{ ...btnPrimary, marginTop: 12, background: "#f59e0b" }} onClick={() => { navigator.clipboard.writeText(newApiKey); setNewApiKey(""); }}>
            Copy & Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <div style={{ ...kpiStyle, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>New Staff Member</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={labelStyle}>Name</div>
              <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <div style={labelStyle}>Email</div>
              <input style={inputStyle} value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Role</div>
            <select style={inputStyle} value={newRole} onChange={e => setNewRole(e.target.value as "manager" | "owner")}>
              <option value="manager">Manager (limited permissions)</option>
              <option value="owner">Owner (full access)</option>
            </select>
          </div>
          {newRole === "manager" && (
            <div style={{ marginBottom: 16 }}>
              <div style={labelStyle}>Permissions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {availablePermissions.map(p => (
                  <label key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}>
                    <input type="checkbox" checked={newPermissions.includes(p)} onChange={() => togglePermission(p)} />
                    {PERMISSION_LABELS[p] || p}
                  </label>
                ))}
              </div>
            </div>
          )}
          <button style={btnPrimary} onClick={handleCreate} disabled={saving}>
            {saving ? "Creating..." : "Create Staff Member"}
          </button>
        </div>
      )}

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <div style={kpiStyle}>
          <div style={labelStyle}>Total Staff</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{staff.length}</div>
        </div>
        <div style={kpiStyle}>
          <div style={labelStyle}>Owners</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{staff.filter(s => s.role === "owner").length}</div>
        </div>
        <div style={kpiStyle}>
          <div style={labelStyle}>Managers</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{staff.filter(s => s.role === "manager").length}</div>
        </div>
      </div>

      {/* Staff List */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {staff.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
            No staff members yet. Click "+ Add Staff" to invite your first team member.
          </div>
        ) : (
          staff.map((s, i) => (
            <div key={s.id} style={{ padding: "16px 20px", background: "var(--bg-card)", borderBottom: i < staff.length - 1 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                  {s.name || "Unnamed"}
                  <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: s.role === "owner" ? "#dbeafe" : "#f3f4f6", color: s.role === "owner" ? "#1d4ed8" : "#6b7280" }}>
                    {s.role}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{s.email}</div>
                {s.role === "manager" && s.permissions?.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {s.permissions.map(p => (
                      <span key={p} style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, background: "var(--bg-grouped)", color: "var(--text-secondary)" }}>
                        {PERMISSION_LABELS[p] || p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btnDanger} onClick={() => handleDelete(s.id)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
