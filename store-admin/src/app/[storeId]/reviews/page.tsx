"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getReviews, updateReview, deleteReview } from "@/app/[storeId]/actions/commerce-actions";

interface Review {
  id: string;
  product_id: string;
  productName: string;
  name: string;
  email: string;
  text: string;
  rating: number;
  approved: boolean;
  created_at: string;
}

export default function ReviewsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [acting, setActing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, [storeId]);

  async function load() {
    try {
      const data = await getReviews(storeId);
      setReviews(data);
    } catch {
      // empty
    }
  }

  async function approve(id: string) {
    setActing(id);
    await updateReview(storeId, id, { approved: true });
    await load();
    setActing(null);
    setMessage("Review approved");
    setTimeout(() => setMessage(""), 3000);
  }

  async function reject(id: string) {
    setActing(id);
    await updateReview(storeId, id, { approved: false });
    await load();
    setActing(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    setActing(id);
    await deleteReview(storeId, id);
    await load();
    setActing(null);
  }

  const filtered = reviews.filter(r => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Reviews</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Manage customer feedback and ratings
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}>
          {message}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: "24px" }}>
        {[
          { label: "TOTAL REVIEWS", value: reviews.length, accent: "#5856d6" },
          { label: "AVG RATING", value: avgRating, accent: "#B8892A" },
          { label: "PENDING", value: pendingCount, accent: "#ff9500" },
          { label: "APPROVED", value: approvedCount, accent: "#34c759" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white relative overflow-hidden" style={{ borderRadius: "var(--radius-lg)", padding: "20px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
            <div className="absolute top-0 left-0 right-0" style={{ height: "3px", background: kpi.accent }} />
            <div className="label-caps" style={{ marginBottom: "8px" }}>{kpi.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filter:</span>
        {([
          { key: "all", label: "All" },
          { key: "pending", label: `Pending (${pendingCount})` },
          { key: "approved", label: "Approved" },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`badge ${filter === f.key ? "badge-gold" : "badge-gray"}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="card-section">
        {filtered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((r, i) => (
              <div key={r.id} style={{ padding: "20px 24px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="flex items-start justify-between gap-4">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{r.name}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>on {r.productName}</span>
                      <span className={`badge ${r.approved ? "badge-green" : "badge-orange"}`}>
                        {r.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <div className="flex gap-0.5" style={{ marginBottom: "8px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} style={{ width: "16px", height: "16px" }} fill={star <= r.rating ? "#f59e0b" : "var(--border)"} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: "1.5" }}>{r.text}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "8px" }}>{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    {!r.approved && (
                      <button onClick={() => approve(r.id)} disabled={acting === r.id} className="btn btn-sm" style={{ background: "var(--green-light, #dcfce7)", color: "var(--green)", fontSize: "12px", minHeight: "32px" }}>
                        Approve
                      </button>
                    )}
                    {r.approved && (
                      <button onClick={() => reject(r.id)} disabled={acting === r.id} className="btn btn-secondary btn-sm" style={{ fontSize: "12px", minHeight: "32px" }}>
                        Reject
                      </button>
                    )}
                    <button onClick={() => remove(r.id)} disabled={acting === r.id} className="btn btn-danger btn-sm" style={{ fontSize: "12px", minHeight: "32px" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>No reviews yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>Reviews will appear here when customers leave feedback</p>
          </div>
        )}
      </div>
    </div>
  );
}
