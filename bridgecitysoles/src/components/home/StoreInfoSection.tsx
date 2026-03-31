import Link from 'next/link';

export function StoreInfoSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Google Maps embed — Portland, OR */}
          <div className="aspect-video rounded-xl border-[3px] border-bcs-gold/50 overflow-hidden relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d22400!2d-122.6765!3d45.5231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bridge City Soles - Portland, OR"
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border-[2px] border-bcs-gold/40 rounded-lg px-4 py-2 shadow-lg">
              <p className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold text-bcs-rust">500+</p>
              <p className="text-[10px] text-bcs-muted uppercase tracking-wider">Styles Online</p>
            </div>
          </div>

          {/* Info */}
          <div>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4 accent-line">
              The Bridge City <span className="text-bcs-rust">Experience</span>
            </h2>
            <p className="text-bcs-text leading-relaxed mb-6 mt-6">
              Step into our Portland store and explore hundreds of authentic sneakers and streetwear pieces. Our expert staff is here to help you find your perfect pair, trade in your collection, or discover your next grail.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>, text: 'Portland, OR - Now Online' },
                { icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>, text: 'Shop Online 24/7 - Bridgecitysoles.com' },
                { icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 013.12 4.18 2 2 0 015.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />, text: '(503) 949-8643', href: 'tel:5039498643' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-bcs-surface flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
                      {item.icon}
                    </svg>
                  </div>
                  <div>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-medium hover:text-bcs-rust transition-colors">{item.text}</a>
                    ) : (
                      <p className="text-sm font-medium">{item.text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="btn-rust inline-flex items-center gap-2 px-6 py-3 rounded-lg uppercase tracking-wide font-[family-name:var(--font-barlow-condensed)]"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-bcs-border text-bcs-white font-bold uppercase tracking-wide rounded-lg hover:bg-bcs-surface hover:border-bcs-rust/30 transition-all duration-300 font-[family-name:var(--font-barlow-condensed)]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
