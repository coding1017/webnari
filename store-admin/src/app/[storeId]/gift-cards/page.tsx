"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGiftCards, createGiftCard, updateGiftCard } from "@/app/[storeId]/actions/commerce-actions";

function formatCents(cents: number) { return "$" + (cents / 100).toFixed(2); }

interface GiftCard {
  id: string;
  code: string;
  initial_balance: number;
  current_balance: number;
  purchaser_email: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function GiftCardsPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [amount, setAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  useEffect(() => { load(); }, [storeId]);
  async function load() { try { setCards(await getGiftCards(storeId)); } catch {} }

  function resetForm() { setAmount(""); setRecipientEmail(""); setRecipientName(""); setGiftMessage(""); setShowCreate(false); }

  async function handleCreate() {
    if (!amount) { setMessage("Amount required"); return; }
    setSaving(true); setMessage("");
    try {
      await createGiftCard(storeId, {
        amount: parseFloat(amount),
        recipient_email: recipientEmail || null,
        recipient_name: recipientName || null,
        message: giftMessage || null,
      });
      resetForm(); await load();
      setMessage("Gift card created" + (recipientEmail ? " and emailed to recipient" : ""));
      setTimeout(() => setMessage(""), 4000);
    } catch (err) { setMessage((err as Error).message); }
    setSaving(false);
  }

  async function handleToggle(card: GiftCard) {
    try { await updateGiftCard(storeId, card.id, { is_active: !card.is_active }); await load(); } catch {}
  }

  const totalIssued = cards.reduce((sum, c) => sum + c.initial_balance, 0);
  const totalOutstanding = cards.reduce((sum, c) => sum + c.current_balance, 0);
  const totalRedeemed = totalIssued - totalOutstanding;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Gift Cards</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Create and manage gift cards
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create Gift Card
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: "24px" }}>
        {[
          { label: "ISSUED", value: formatCents(totalIssued), accent: "#5856d6" },
          { label: "REDEEMED", value: formatCents(totalRedeemed), accent: "#34c759" },
          { label: "OUTSTANDING", value: formatCents(totalOutstanding), accent: "#B8892A" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white relative overflow-hidden" style={{ borderRadius: "var(--radius-lg)", padding: "20px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
            <div className="absolute top-0 left-0 right-0" style={{ height: "3px", background: kpi.accent }} />
            <div className="label-caps" style={{ marginBottom: "8px" }}>{kpi.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`alert ${message.includes("created") ? "alert-success" : "alert-error"}`} style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}>{message}</div>
      )}

      {/* Create */}
      {showCreate && (
        <div className="card fade-in" style={{ marginBottom: "24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
            <h2 className="heading-sm">New Gift Card</h2>
            <button onClick={resetForm} style={{ color: "var(--text-tertiary)", fontSize: "13px", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "16px" }}>
            <div>
              <label>Amount ($)</label>
              <input type="number" step="0.01" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25.00" />
            </div>
            <div>
              <label>Recipient Email</label>
              <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Optional — sends email" />
            </div>
            <div>
              <label>Recipient Name</label>
              <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label>Gift Message</label>
              <input value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <button onClick={handleCreate} disabled={saving} className="btn btn-primary" style={{ fontSize: "13px" }}>
            {saving ? "Creating..." : "Create Gift Card"}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card-section">
        {cards.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th className="hide-mobile">Recipient</th>
                <th className="text-right">Balance</th>
                <th className="text-center">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", letterSpacing: "0.04em" }}>{c.code}</span>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Initial: {formatCents(c.initial_balance)}</div>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: "13px" }}>
                    {c.recipient_email || c.recipient_name || "—"}
                  </td>
                  <td className="text-right" style={{ fontWeight: 600, color: c.current_balance > 0 ? "var(--text-primary)" : "var(--text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
                    {formatCents(c.current_balance)}
                  </td>
                  <td className="text-center">
                    <span className={`badge ${c.is_active && c.current_balance > 0 ? "badge-green" : c.current_balance === 0 ? "badge-gray" : "badge-red"}`}>
                      {!c.is_active ? "Disabled" : c.current_balance === 0 ? "Used" : "Active"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleToggle(c)} className="text-link" style={{ fontSize: "12px" }}>
                      {c.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>No gift cards yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px", marginBottom: "16px" }}>Create gift cards to let customers give your products as gifts</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ fontSize: "13px" }}>Create Gift Card</button>
          </div>
        )}
      </div>
    </div>
  );
}
