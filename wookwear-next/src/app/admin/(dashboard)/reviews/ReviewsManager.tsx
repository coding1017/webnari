"use client";

import { useTransition } from "react";
import { approveReview, rejectReview, deleteReview } from "@/app/admin/_actions/content";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export function ReviewsManager({ initialReviews }: { initialReviews: any[] }) {
  const [isPending, startTransition] = useTransition();

  if (initialReviews.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-head text-2xl font-bold text-ww-white">Reviews</h1>
        <EmptyState
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
          title="No reviews"
          description="Product reviews will appear here for moderation."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ww-white">Reviews</h1>
        <p className="text-sm text-ww-muted mt-0.5">{initialReviews.length} review{initialReviews.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="bg-ww-dark border border-ww-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ww-border">
              <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Product</th>
              <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Author</th>
              <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Rating</th>
              <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Review</th>
              <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-ww-muted uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialReviews.map((review) => (
              <tr key={review.id} className="border-b border-ww-border/50 last:border-0 hover:bg-ww-surface/30">
                <td className="px-4 py-3 text-sm text-ww-text">{review.products?.name || "—"}</td>
                <td className="px-4 py-3 text-sm font-medium text-ww-white">{review.name}</td>
                <td className="px-4 py-3 text-sm text-yellow-400">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</td>
                <td className="px-4 py-3 text-sm text-ww-muted max-w-xs truncate">{review.text}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${review.approved ? "text-green-400" : "text-yellow-400"}`}>
                    {review.approved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {!review.approved && (
                    <button disabled={isPending} onClick={() => startTransition(() => approveReview(review.id))}
                      className="text-xs text-green-400 hover:text-green-300 font-medium disabled:opacity-50">Approve</button>
                  )}
                  {review.approved && (
                    <button disabled={isPending} onClick={() => startTransition(() => rejectReview(review.id))}
                      className="text-xs text-yellow-400 hover:text-yellow-300 font-medium disabled:opacity-50">Reject</button>
                  )}
                  <button disabled={isPending} onClick={() => startTransition(() => deleteReview(review.id))}
                    className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
