'use client';

import { useState } from 'react';
import { useWishlist } from './WishlistProvider';

export function WishlistButton({
  productSlug,
  size = 'sm',
}: {
  productSlug: string;
  size?: 'sm' | 'md';
}) {
  const { toggleItem, isInWishlist } = useWishlist();
  const active = isInWishlist(productSlug);
  const [bounce, setBounce] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(productSlug);
    setBounce(true);
    setTimeout(() => setBounce(false), 300);
  };

  const dim = size === 'md' ? 'w-9 h-9' : 'w-7 h-7';
  const iconSize = size === 'md' ? 18 : 14;

  return (
    <button
      onClick={handleClick}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`${dim} rounded-full flex items-center justify-center transition-all duration-200 ${
        active
          ? 'bg-bcs-gold/20 text-bcs-gold'
          : 'bg-bcs-black/60 text-bcs-muted hover:text-bcs-gold hover:bg-bcs-black/80'
      } ${bounce ? 'scale-125' : 'scale-100'}`}
      style={{ transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s, background-color 0.2s' }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  );
}
