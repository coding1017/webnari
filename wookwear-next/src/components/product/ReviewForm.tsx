"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { submitReview } from "@/app/(storefront)/_actions/reviews";

export function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(submitReview, {
    status: "idle",
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setRating(0);
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="bg-ww-surface border border-ww-border rounded-[16px] p-5 mt-6">
      <h4 className="font-head font-bold text-sm text-ww-white mb-4">Leave a Review</h4>

      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      {state.status !== "idle" && (
        <p className={`text-sm mb-3 ${state.status === "success" ? "text-green-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}

      {/* Star Rating */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-xl transition-colors"
          >
            <span className={star <= (hoverRating || rating) ? "text-yellow-400" : "text-ww-border"}>
              ★
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 mb-3">
        <input
          name="name"
          type="text"
          required
          placeholder="Your name or @handle"
          className="px-3 py-2 bg-ww-dark border border-ww-border rounded-lg text-sm text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors"
        />
        <textarea
          name="text"
          required
          rows={3}
          placeholder="Share your experience..."
          className="px-3 py-2 bg-ww-dark border border-ww-border rounded-lg text-sm text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="px-5 py-2 bg-ww-purple hover:bg-ww-purple/80 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-head font-bold tracking-[0.1em] uppercase rounded-lg transition-colors"
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
