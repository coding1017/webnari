import Link from 'next/link';

const CATS = [
  {
    name: 'Sneakers',
    slug: 'sneakers',
    description: 'Rare kicks & everyday classics',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 17l.5-2.5a2 2 0 011.8-1.5h1.4a1 1 0 00.9-.6L8 9a2 2 0 011.8-1h4.4a2 2 0 011.8 1l1.4 3.4a1 1 0 00.9.6h1.4a2 2 0 011.8 1.5L22 17" />
        <path d="M2 17h20v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Streetwear essentials',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2l-4 6 3 1.5V22h14V9.5L22 8l-4-6" />
        <path d="M6 2c0 3 2.5 5 6 5s6-2 6-5" />
      </svg>
    ),
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complete your look',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 7h-4a4 4 0 00-8 0H4a2 2 0 00-2 2v9a4 4 0 004 4h12a4 4 0 004-4V9a2 2 0 00-2-2z" />
        <path d="M8 7V5a4 4 0 018 0v2" />
      </svg>
    ),
  },
];

export function CategoryCards() {
  return (
    <section className="py-16 sm:py-20 relative grain-overlay">
      <div className="absolute inset-0 bg-gradient-to-b from-bcs-black/0 via-bcs-dark/30 to-bcs-black/0" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl sm:text-4xl font-black uppercase tracking-tight text-center mb-10 accent-line" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>Shop by <span className="text-bcs-rust">Category</span></span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {CATS.map(cat => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative flex flex-col items-center justify-center py-12 px-6 rounded-xl border-[3px] border-bcs-gold/50 hover:border-bcs-gold transition-all duration-300 hover:-translate-y-2 shadow-[0_2px_12px_rgba(184,137,42,0.1)] hover:shadow-[0_10px_40px_rgba(184,137,42,0.35),0_0_20px_rgba(184,137,42,0.15)] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(184,137,42,0.35), rgba(212,166,58,0.4), rgba(77,168,218,0.28))' }}
            >
              {/* Even richer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(184,137,42,0.5), rgba(212,166,58,0.55), rgba(77,168,218,0.4))' }} />
              <div className="relative w-16 h-16 rounded-full bg-white/60 flex items-center justify-center mb-4 text-bcs-rust group-hover:bg-white/80 transition-colors duration-300">
                {cat.icon}
              </div>
              <h3 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase tracking-wide mb-1">
                {cat.name}
              </h3>
              <p className="text-sm text-bcs-text">{cat.description}</p>
              <div className="mt-4 text-bcs-rust text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                Browse
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
