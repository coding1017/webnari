import Link from 'next/link';

export function InstagramSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-2xl border-[3px] border-bcs-gold/50" style={{ background: 'linear-gradient(135deg, rgba(184,137,42,0.12), rgba(212,166,58,0.15), rgba(77,168,218,0.08))' }}>
          {/* Instagram icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/60 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="#B8892A" stroke="none" />
            </svg>
          </div>

          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl sm:text-4xl font-black uppercase tracking-tight mb-3">
            Follow the <span className="text-bcs-rust">Culture</span>
          </h2>
          <p className="text-bcs-text text-lg mb-2">@bridgecitysolesportland</p>
          <p className="text-bcs-muted text-sm mb-8 max-w-md mx-auto">
            New drops, behind-the-scenes, authentication tips, and the latest heat. Join 6,700+ sneakerheads.
          </p>

          <a
            href="https://www.instagram.com/bridgecitysolesportland/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rust inline-flex items-center gap-2 px-8 py-3.5 rounded-lg uppercase tracking-wide font-[family-name:var(--font-barlow-condensed)] text-lg"
          >
            Follow on Instagram
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
