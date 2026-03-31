'use client';

import { useState, useEffect } from 'react';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full border-[3px] border-bcs-gold/50 hover:border-bcs-gold bg-white/90 backdrop-blur-sm shadow-[0_4px_20px_rgba(184,137,42,0.2)] hover:shadow-[0_6px_30px_rgba(184,137,42,0.35)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
      aria-label="Back to top"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2.5">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
