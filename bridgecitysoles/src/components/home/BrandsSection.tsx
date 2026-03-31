'use client';

import Link from 'next/link';
import { brands } from '@/data/brands';

export function BrandsSection() {
  const doubled = [...brands, ...brands];

  return (
    <section className="py-10 border-y border-bcs-gold/20 bg-bcs-dark/50 overflow-hidden">
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bcs-dark/50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bcs-dark/50 to-transparent z-10" />

        {/* Marquee track */}
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((brand, i) => (
            <Link
              key={`${brand.id}-${i}`}
              href={`/shop?brand=${brand.slug}`}
              className="mx-8 sm:mx-12 flex-shrink-0 font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-black uppercase tracking-wider transition-all duration-300 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #B8892A, #4DA8DA)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: `brand-glow ${2.5 + (i % 3) * 0.5}s ease-in-out infinite`,
                animationDelay: `${(i * 0.4) % 3}s`,
              }}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
