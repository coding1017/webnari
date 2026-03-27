'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { getNewDrops, getFeaturedProducts } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';

export function NewDropsSection() {
  const drops = getNewDrops();
  const featured = getFeaturedProducts();
  const shown = [...drops, ...featured.filter(f => !drops.find(d => d.id === f.id))].slice(0, 8);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal-card').forEach((card, i) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0)';
              }, i * 80);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 sm:py-20 diagonal-lines" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl sm:text-4xl font-black uppercase tracking-tight accent-line">
              Fresh <span className="text-bcs-rust">Drops</span>
            </h2>
            <p className="text-sm text-bcs-text mt-4">Hand-picked heat from our collection</p>
          </div>
          <Link
            href="/shop?sort=newest"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-bcs-rust hover:text-bcs-rust2 transition-colors font-medium"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {shown.map((product, i) => (
            <div key={product.id} className="reveal-card transition-all duration-500 ease-out" style={{ transitionDelay: `${i * 0.05}s`, opacity: 0, transform: 'translateY(24px)' }}>
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center gap-1 text-sm text-bcs-rust hover:text-bcs-rust2 transition-colors font-medium"
          >
            View All Products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
