'use client';

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase mb-6">Orders</h1>

      <div className="bg-bcs-surface rounded-xl border border-bcs-border p-12 text-center">
        <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
        <h2 className="text-lg font-bold mb-2">No Orders Yet</h2>
        <p className="text-sm text-bcs-muted mb-4">
          Orders will appear here once Stripe checkout is connected.<br />
          Customers can currently call <a href="tel:5039498643" className="text-bcs-teal">(503) 949-8643</a> to place orders.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-bcs-surface2 rounded-lg text-sm text-bcs-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" />
          </svg>
          Stripe integration coming soon
        </div>
      </div>
    </div>
  );
}
