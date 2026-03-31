'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-md mx-auto text-center mb-8">
      <h3 className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase tracking-wider text-lg mb-2">
        Stay in the <span className="text-bcs-rust">Loop</span>
      </h3>
      <p className="text-sm text-bcs-text mb-4">Get notified about new drops, exclusive deals, and sneaker news.</p>
      {submitted ? (
        <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          You&apos;re in! We&apos;ll keep you posted.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-2.5 rounded-lg bg-bcs-surface border-[3px] border-bcs-gold/50 text-sm focus:border-bcs-gold focus:outline-none transition-colors"
          />
          <button type="submit" className="btn-rust px-5 py-2.5 rounded-lg uppercase tracking-wide text-sm font-[family-name:var(--font-barlow-condensed)] whitespace-nowrap">
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
