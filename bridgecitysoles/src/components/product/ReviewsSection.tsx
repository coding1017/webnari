'use client';

import { useState, useRef } from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  size?: string;
}

// Sample reviews seeded per product (uses product ID hash to vary)
function getSampleReviews(productSlug: string): Review[] {
  const reviews: Review[][] = [
    [
      { id: 'r1', author: 'Marcus T.', rating: 5, date: '2025-12-15', title: 'Legit and fast shipping', body: 'Got these in hand within 3 days. Came double-boxed, 100% authentic. BCS is the real deal.', verified: true, size: '10' },
      { id: 'r2', author: 'Jordan P.', rating: 5, date: '2025-11-28', title: 'My go-to for heat', body: 'Third purchase from Bridge City Soles. Always authentic, always clean. The condition was exactly as described.', verified: true, size: '9.5' },
      { id: 'r3', author: 'Ashley R.', rating: 4, date: '2025-10-03', title: 'Great pair, minor box damage', body: 'Shoes were perfect, but the box had a small dent from shipping. Not a big deal for me since I rock my kicks, but heads up if you\'re a box collector.', verified: true, size: '8' },
    ],
    [
      { id: 'r4', author: 'DeShawn M.', rating: 5, date: '2025-12-20', title: 'Fire pickup', body: 'Copped these for under market. BCS stays with the fair prices. Authentication was on point too.', verified: true, size: '11' },
      { id: 'r5', author: 'Priya K.', rating: 5, date: '2025-11-10', title: 'Christmas gift W', body: 'Bought these as a gift and they were a huge hit. Packaging was clean and professional.', verified: true, size: '9' },
      { id: 'r6', author: 'Tyler B.', rating: 4, date: '2025-09-15', title: 'Solid cop', body: 'Condition was listed as "Excellent" and that was accurate. Very minor creasing that you can barely see. Would buy again.', verified: true, size: '10.5' },
    ],
    [
      { id: 'r7', author: 'Kai L.', rating: 5, date: '2025-12-01', title: 'PDX stand up!', body: 'Love supporting a local Black-owned business. The quality and service are unmatched. Portland\'s best sneaker shop.', verified: true, size: '10' },
      { id: 'r8', author: 'Brittany S.', rating: 5, date: '2025-11-22', title: 'Better than StockX', body: 'Faster shipping, better prices, and you know you\'re getting authentic product. No more waiting 2 weeks for verification.', verified: true },
      { id: 'r9', author: 'Chris W.', rating: 4, date: '2025-10-18', title: 'Clean pair', body: 'Exactly what I expected. True to size, well packaged. Only reason for 4 stars is I wish they had more sizes in stock.', verified: true, size: '12' },
    ],
  ];

  // Pick a review set based on slug hash
  const hash = productSlug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return reviews[hash % reviews.length];
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? '#B8892A' : 'none'} stroke="#B8892A" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function StarInput({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onRate(i)}
          className="transition-transform hover:scale-110"
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill={i <= (hover || rating) ? '#B8892A' : 'none'} stroke="#B8892A" strokeWidth="1.5" className="cursor-pointer">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>(() => getSampleReviews(productSlug));
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({ author: '', title: '', body: '', rating: 0, size: '' });
  const [submitted, setSubmitted] = useState(false);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({ rating: r, count: reviews.filter(rev => rev.rating === r).length }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author || !formData.body || formData.rating === 0) return;

    const newReview: Review = {
      id: `r-new-${Date.now()}`,
      author: formData.author,
      rating: formData.rating,
      date: new Date().toISOString().split('T')[0],
      title: formData.title || 'Great purchase!',
      body: formData.body,
      verified: false,
      size: formData.size || undefined,
    };

    setReviews(prev => [newReview, ...prev]);
    setFormData({ author: '', title: '', body: '', rating: 0, size: '' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="mt-12 pt-8 border-t border-bcs-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black uppercase tracking-tight">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={Math.round(avgRating)} size={18} />
            <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-bcs-muted">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
        </div>
        <button
          onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          className="btn-rust px-5 py-2.5 rounded-lg uppercase tracking-wide text-sm font-[family-name:var(--font-barlow-condensed)]"
        >
          Write a Review
        </button>
      </div>

      {/* Success message */}
      {submitted && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          Your review has been submitted! Thank you.
        </div>
      )}

      {/* Rating summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 mb-8">
        <div className="text-center sm:text-left">
          <div className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-black text-bcs-rust">{avgRating.toFixed(1)}</div>
          <StarRating rating={Math.round(avgRating)} size={16} />
          <p className="text-xs text-bcs-muted mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="space-y-1.5">
          {ratingCounts.map(({ rating, count }) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs text-bcs-muted w-3">{rating}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#B8892A" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <div className="flex-1 h-2 bg-bcs-surface2 rounded-full overflow-hidden">
                <div className="h-full bg-bcs-rust rounded-full transition-all" style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }} />
              </div>
              <span className="text-xs text-bcs-muted w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-6 mb-10">
        {reviews.map(review => (
          <div key={review.id} className="pb-6 border-b border-bcs-border last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={review.rating} />
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-bcs-forest bg-bcs-forest/10 px-2 py-0.5 rounded-full">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                      Verified Purchase
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-sm">{review.title}</h4>
              </div>
              <span className="text-xs text-bcs-muted whitespace-nowrap">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <p className="text-sm text-bcs-text mt-2 leading-relaxed">{review.body}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-bcs-muted">{review.author}</span>
              {review.size && <span className="text-xs text-bcs-muted">Size: {review.size}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Write review form — always visible at bottom */}
      <form ref={formRef} onSubmit={handleSubmit} className="p-5 rounded-xl bg-bcs-surface border-[3px] border-bcs-gold/50 space-y-4">
        <h3 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase">Write Your Review</h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-1.5">Rating *</label>
            <StarInput rating={formData.rating} onRate={(r) => setFormData(p => ({ ...p, rating: r }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-1.5">Your Name *</label>
              <input
                type="text"
                value={formData.author}
                onChange={e => setFormData(p => ({ ...p, author: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-bcs-surface2 border border-bcs-border text-sm focus:border-bcs-rust focus:outline-none transition-colors"
                placeholder="e.g. Marcus T."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-1.5">Size Purchased</label>
              <input
                type="text"
                value={formData.size}
                onChange={e => setFormData(p => ({ ...p, size: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-bcs-surface2 border border-bcs-border text-sm focus:border-bcs-rust focus:outline-none transition-colors"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-1.5">Review Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-bcs-surface2 border border-bcs-border text-sm focus:border-bcs-rust focus:outline-none transition-colors"
              placeholder="Summarize your experience"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-1.5">Your Review *</label>
            <textarea
              value={formData.body}
              onChange={e => setFormData(p => ({ ...p, body: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-bcs-surface2 border border-bcs-border text-sm focus:border-bcs-rust focus:outline-none transition-colors resize-none"
              placeholder="How was the condition? Shipping speed? Would you buy again?"
              required
            />
          </div>

          <button type="submit" className="btn-rust px-6 py-2.5 rounded-lg uppercase tracking-wide text-sm font-[family-name:var(--font-barlow-condensed)]">
            Submit Review
          </button>
        </form>
    </div>
  );
}
