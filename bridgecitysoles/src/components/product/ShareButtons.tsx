'use client';

import { useState } from 'react';

const BASE_URL = 'https://bridge-city-soles.pages.dev';

export function ShareButtons({
  productName,
  productSlug,
}: {
  productName: string;
  productSlug: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${BASE_URL}/product/${productSlug}`;
  const text = `Check out ${productName} on Bridge City Soles`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const btnClass =
    'w-9 h-9 rounded-full border border-bcs-gold/30 flex items-center justify-center text-bcs-muted hover:text-bcs-gold hover:border-bcs-gold transition-all duration-200';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-bcs-muted uppercase tracking-wider font-semibold">Share</span>

      {/* Copy link */}
      <button onClick={handleCopy} className={btnClass} aria-label="Copy link" title="Copy link">
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D9A5F" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
      {copied && (
        <span className="text-xs text-green-400 font-medium animate-pulse">Copied!</span>
      )}

      {/* Twitter / X */}
      <button onClick={shareTwitter} className={btnClass} aria-label="Share on X" title="Share on X">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Facebook */}
      <button onClick={shareFacebook} className={btnClass} aria-label="Share on Facebook" title="Share on Facebook">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>
    </div>
  );
}
