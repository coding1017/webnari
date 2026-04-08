"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRedirects, createRedirect, deleteRedirect } from "@/app/[storeId]/actions/commerce-actions";

interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  active: boolean;
  created_at: string;
}

export default function RedirectsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState(301);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, [storeId]);

  async function load() {
    try {
      const data = await getRedirects(storeId);
      setRedirects(data || []);
    } catch { /* empty */ }
    setLoading(false);
  }

  async function handleCreate() {
    if (!fromPath || !toPath) return;
    setSaving(true);
    setMessage("");
    try {
      await createRedirect(storeId, { from_path: fromPath, to_path: toPath, status_code: statusCode });
      setFromPath("");
      setToPath("");
      setMessage("Redirect created");
      setTimeout(() => setMessage(""), 3000);
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteRedirect(storeId, id);
      load();
    } catch { /* empty */ }
  }

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>Loading...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">URL Redirects</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Redirect old URLs to new ones (301 permanent or 302 temporary)
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes("created") ? "alert-success" : "alert-error"}`} style={{ marginBottom: "20px" }}>
          {message}
        </div>
      )}

      {/* Add Redirect */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h2 className="heading-sm" style={{ marginBottom: "16px" }}>Add Redirect</h2>
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "12px" }}>
          <div>
            <label>From Path</label>
            <input value={fromPath} onChange={(e) => setFromPath(e.target.value)} placeholder="/old-product" />
          </div>
          <div>
            <label>To Path</label>
            <input value={toPath} onChange={(e) => setToPath(e.target.value)} placeholder="/new-product" />
          </div>
        </div>
        <div className="flex items-end gap-3">
          <div style={{ width: "160px" }}>
            <label>Type</label>
            <select value={statusCode} onChange={(e) => setStatusCode(Number(e.target.value))}>
              <option value={301}>301 Permanent</option>
              <option value={302}>302 Temporary</option>
            </select>
          </div>
          <button onClick={handleCreate} disabled={saving || !fromPath || !toPath} className="btn btn-primary btn-sm" style={{ minHeight: "44px" }}>
            {saving ? "Adding..." : "Add Redirect"}
          </button>
        </div>
      </div>

      {/* Redirect List */}
      {redirects.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
          <p style={{ fontSize: "14px" }}>No redirects yet. Add one above to get started.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-tertiary)" }}>From</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-tertiary)" }}>To</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-tertiary)" }}>Type</th>
                <th style={{ padding: "12px 16px", width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontFamily: "monospace", color: "var(--text-primary)" }}>{r.from_path}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontFamily: "monospace", color: "var(--text-secondary)" }}>{r.to_path}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "var(--radius-sm)", background: r.status_code === 301 ? "var(--gold-light)" : "#dbeafe", color: r.status_code === 301 ? "var(--gold)" : "#2563eb", fontWeight: 600 }}>
                      {r.status_code}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => handleDelete(r.id)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "18px" }}>&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
