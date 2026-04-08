"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEmailTemplates, upsertEmailTemplate, deleteEmailTemplate } from "@/app/[storeId]/actions/commerce-actions";

const TEMPLATE_KEYS = [
  { key: "order_confirmation", label: "Order Confirmation", desc: "Sent after a successful purchase" },
  { key: "shipping_update", label: "Shipping Update", desc: "Sent when order ships with tracking info" },
  { key: "delivery", label: "Delivery Confirmation", desc: "Sent when order is marked delivered" },
  { key: "abandoned_cart", label: "Abandoned Cart", desc: "Sent to recover abandoned checkouts" },
  { key: "welcome", label: "Welcome Email", desc: "Sent after customer registration" },
  { key: "reset_password", label: "Password Reset", desc: "Sent when customer requests password reset" },
  { key: "verification", label: "Email Verification", desc: "Sent to verify customer email address" },
];

const VARS_BY_KEY: Record<string, string[]> = {
  order_confirmation: ["store_name", "order_number", "customer_name", "customer_email", "total", "items_table"],
  shipping_update: ["store_name", "order_number", "customer_name", "tracking_number", "tracking_url", "carrier"],
  delivery: ["store_name", "order_number", "customer_name"],
  abandoned_cart: ["store_name", "customer_name", "recovery_url", "items_summary"],
  welcome: ["store_name", "customer_name", "customer_email"],
  reset_password: ["store_name", "customer_name", "reset_url"],
  verification: ["store_name", "customer_name", "verify_url"],
};

interface EmailTemplate {
  id: string;
  template_key: string;
  subject: string;
  html_body: string;
  active: boolean;
}

export default function EmailTemplatesPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, [storeId]);

  async function load() {
    try {
      const data = await getEmailTemplates(storeId);
      setTemplates(data || []);
    } catch { /* empty */ }
    setLoading(false);
  }

  function startEdit(key: string) {
    const existing = templates.find((t) => t.template_key === key);
    setEditKey(key);
    setEditSubject(existing?.subject || "");
    setEditBody(existing?.html_body || "");
  }

  async function handleSave() {
    if (!editKey || !editSubject || !editBody) return;
    setSaving(true);
    setMessage("");
    try {
      await upsertEmailTemplate(storeId, { template_key: editKey, subject: editSubject, html_body: editBody });
      setEditKey(null);
      setMessage("Template saved");
      setTimeout(() => setMessage(""), 3000);
      load();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteEmailTemplate(storeId, id);
      load();
    } catch { /* empty */ }
  }

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>Loading...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Email Templates</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Customize the emails sent to your customers. Use {"{{variable}}"} placeholders for dynamic content.
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes("saved") ? "alert-success" : "alert-error"}`} style={{ marginBottom: "20px" }}>
          {message}
        </div>
      )}

      {/* Edit Modal */}
      {editKey && (
        <div className="card" style={{ marginBottom: "24px", border: "2px solid var(--gold)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
            <h2 className="heading-sm" style={{ margin: 0 }}>
              {TEMPLATE_KEYS.find((t) => t.key === editKey)?.label}
            </h2>
            <button onClick={() => setEditKey(null)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "18px" }}>&times;</button>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>Subject Line</label>
            <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} placeholder="e.g. Your order #{{order_number}} is confirmed!" />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>HTML Body</label>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={12}
              style={{ fontFamily: "monospace", fontSize: "12px" }}
              placeholder="<h2>Hi {{customer_name}},</h2>..."
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: "0 0 6px" }}>Available variables:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {(VARS_BY_KEY[editKey] || []).map((v) => (
                <span key={v} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !editSubject || !editBody} className="btn btn-primary btn-sm">
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      )}

      {/* Template List */}
      <div style={{ display: "grid", gap: "12px" }}>
        {TEMPLATE_KEYS.map((tk) => {
          const existing = templates.find((t) => t.template_key === tk.key);
          return (
            <div key={tk.key} className="card" style={{ padding: "16px 20px" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: "2px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{tk.label}</span>
                    {existing ? (
                      <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "var(--radius-sm)", background: "#d1fae5", color: "#059669", fontWeight: 600 }}>Custom</span>
                    ) : (
                      <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontWeight: 500 }}>Default</span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>{tk.desc}</p>
                  {existing && (
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "4px 0 0", fontFamily: "monospace" }}>
                      Subject: {existing.subject}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(tk.key)} className="btn btn-secondary btn-sm" style={{ fontSize: "12px" }}>
                    {existing ? "Edit" : "Customize"}
                  </button>
                  {existing && (
                    <button onClick={() => handleDelete(existing.id)} className="btn btn-sm" style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "1px solid #fecaca" }}>
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
