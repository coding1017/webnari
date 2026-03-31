'use client';

import { useState } from 'react';
import Link from 'next/link';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative text-center py-2.5 px-4 text-sm" style={{ background: 'linear-gradient(135deg, #B8892A, #D4A63A, #4DA8DA)' }}>
      <Link href="/shop" className="text-white font-semibold hover:underline">
        Free Shipping on Orders Over $300
      </Link>
      <span className="text-white/70 mx-2">|</span>
      <span className="text-white/90">100% Authenticated</span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="Close announcement"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
