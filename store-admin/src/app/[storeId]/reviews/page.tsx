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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reviews</h1>
          {pendingCount > 0 && (
            <p className="text-sm mt-1" style={{ color: "var(--orange)" }}>{pendingCount} pending approval</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === f ? "var(--blue)" : "var(--bg-elevated)",
              color: filter === f ? "white" : "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews */}
      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map((r) => (
          <div key={r.id} className="rounded-xl p-5" style={{ background: "var(--bg-elevated)", border: `1px solid ${r.approved ? "var(--border)" : "var(--orange)40"}` }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.name}</span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>on {r.productName}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{
                    background: r.approved ? "#22c55e20" : "#f59e0b20",
                    color: r.approved ? "var(--green)" : "var(--orange)",
                  }}>
                    {r.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4" fill={star <= r.rating ? "#f59e0b" : "var(--border)"} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{r.text}</p>
                <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>{new Date(r.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                {!r.approved && (
                  <button onClick={() => approve(r.id)} disabled={acting === r.id} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#22c55e20", color: "var(--green)" }}>
                    Approve
                  </button>
                )}
                {r.approved && (
                  <button onClick={() => reject(r.id)} disabled={acting === r.id} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--bg-grouped)", color: "var(--text-tertiary)" }}>
                    Reject
                  </button>
                )}
                <button onClick={() => remove(r.id)} disabled={acting === r.id} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: "var(--red)" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-12 text-center rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No reviews to show</p>
          </div>
        )}
      </div>
    </div>
  );
}
