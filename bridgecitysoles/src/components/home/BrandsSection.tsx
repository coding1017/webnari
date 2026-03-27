import Link from 'next/link';
import { brands } from '@/data/brands';

export function BrandsSection() {
  // Double the brands for seamless loop
  const doubled = [...brands, ...brands];

  return (
    <section className="py-10 border-y border-bcs-border/50 bg-bcs-dark/50 overflow-hidden">
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
              className="mx-8 sm:mx-12 flex-shrink-0 text-bcs-muted hover:text-bcs-rust transition-colors duration-300 font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-black uppercase tracking-wider"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
