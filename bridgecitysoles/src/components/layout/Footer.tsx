import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-bcs-dark border-t border-bcs-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bcs-rust to-bcs-rust2 flex items-center justify-center text-bcs-black font-bold text-sm">
                B
              </div>
              <span className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase tracking-wider">
                Bridge City <span className="text-bcs-rust">Soles</span>
              </span>
            </div>
            <p className="text-sm text-bcs-text leading-relaxed mb-4">
              Portland&apos;s premier destination for authentic sneakers and streetwear. Every product is 100% authenticated.
            </p>
            <div className="flex items-center gap-1 text-xs text-bcs-muted">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D9A5F" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Authenticity Guaranteed</span>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.instagram.com/bridgecitysolesportland/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-bcs-surface flex items-center justify-center hover:bg-gradient-to-br from-bcs-rust to-bcs-rust2/20 transition-colors group"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:stroke-bcs-rust transition-colors">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase tracking-wider text-sm mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/shop" className="text-sm text-bcs-text hover:text-bcs-rust transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=sneakers" className="text-sm text-bcs-text hover:text-bcs-rust transition-colors">Sneakers</Link></li>
              <li><Link href="/shop?category=clothing" className="text-sm text-bcs-text hover:text-bcs-rust transition-colors">Clothing</Link></li>
              <li><Link href="/shop?category=accessories" className="text-sm text-bcs-text hover:text-bcs-rust transition-colors">Accessories</Link></li>
              <li><Link href="/shop?sort=newest" className="text-sm text-bcs-text hover:text-bcs-rust transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase tracking-wider text-sm mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm text-bcs-text hover:text-bcs-rust transition-colors">About Us</Link></li>
              <li><Link href="/store" className="text-sm text-bcs-text hover:text-bcs-rust transition-colors">Store Location</Link></li>
              <li><Link href="/contact" className="text-sm text-bcs-text hover:text-bcs-rust transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase tracking-wider text-sm mb-4">
              Visit Us
            </h3>
            <ul className="space-y-3 text-sm text-bcs-text">
              <li className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>3200 SE Hawthorne Blvd<br />Portland, OR 97214</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <a href="tel:5039498643" className="hover:text-bcs-rust transition-colors">(503) 949-8643</a>
              </li>
              <li className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>Mon–Sat: 10AM–8PM<br />Sun: 11AM–6PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-bcs-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-bcs-muted">
            &copy; {new Date().getFullYear()} Bridge City Soles. All rights reserved.
          </p>
          <p className="text-xs text-bcs-muted flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3D9A5F" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            All products are 100% authentic guaranteed
          </p>
        </div>
      </div>
    </footer>
  );
}
