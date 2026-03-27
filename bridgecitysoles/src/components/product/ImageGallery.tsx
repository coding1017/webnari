'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/product';

export function ImageGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-bcs-surface2 rounded-xl flex items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="aspect-square bg-bcs-surface2 rounded-xl overflow-hidden relative group">
        <img
          src={images[activeIndex].url}
          alt={images[activeIndex].alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Auth badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-bcs-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-xs font-medium text-bcs-forest">Verified Authentic</span>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bcs-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bcs-black/80"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => setActiveIndex(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bcs-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bcs-black/80"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all',
                i === activeIndex
                  ? 'border-bcs-rust'
                  : 'border-bcs-border hover:border-bcs-border2'
              )}
            >
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
