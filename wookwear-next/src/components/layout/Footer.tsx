import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

export function Footer() {
  return (
    <footer className="relative py-16 pb-8 border-t border-ww-border">
      <div className="absolute inset-0 bg-[image:var(--checker)] opacity-20 pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5 relative z-[1]">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 max-lg:grid-cols-2 max-lg:gap-8 max-md:grid-cols-1 max-md:gap-7">
          {/* Brand */}
          <div>
            <div className="font-head font-black text-xl text-ww-white mb-3 tracking-[0.04em]">
              WOOK <span className="gradient-text">WEAR</span>
            </div>
            <div className="text-sm text-ww-muted mb-5">
              Handmade pouches, bags, and accessories.<br />
              One of a kind, made with love by Meesh.
            </div>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/wook.wear"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-ww-surface border border-ww-border text-ww-muted hover:border-ww-pink hover:text-ww-pink transition-all"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <div className="font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-muted mb-4">Shop</div>
            <div className="flex flex-col">
              {[
                { href: "/shop?cat=pouches", label: "Pouches" },
                { href: "/shop?cat=bags", label: "Bags" },
                { href: "/shop?cat=mats", label: "Mats" },
                { href: "/shop?cat=buddy", label: "Buddy Pouches" },
                { href: "/shop", label: "All Products" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="py-[5px] text-sm text-ww-text hover:text-ww-pink2 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-muted mb-4">Company</div>
            <div className="flex flex-col">
              {[
                { href: "/about", label: "About Meesh" },
                { href: "/contact", label: "Contact" },
                { href: "/blog", label: "Blog" },
                { href: "/shipping", label: "Shipping & Returns" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="py-[5px] text-sm text-ww-text hover:text-ww-pink2 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <div className="font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-muted mb-4">Connect</div>
            <div className="flex flex-col">
              <a href="https://www.instagram.com/wook.wear" target="_blank" rel="noopener noreferrer" className="py-[5px] text-sm text-ww-text hover:text-ww-pink2 transition-colors">
                Instagram
              </a>
              <a href="mailto:hello@wookwear.com" className="py-[5px] text-sm text-ww-text hover:text-ww-pink2 transition-colors">
                hello@wookwear.com
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-ww-border">
          <div className="flex items-start justify-between gap-8 max-md:flex-col">
            <div className="max-w-sm">
              <h3 className="font-head font-bold text-base text-ww-white mb-1">Stay in the loop</h3>
              <p className="text-sm text-ww-muted">Get notified about new drops, restocks, and behind-the-scenes content.</p>
            </div>
            <div className="flex-1 max-w-md">
              <NewsletterForm variant="inline" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-ww-border text-[13px] text-ww-muted max-md:flex-col max-md:gap-2 max-md:text-center">
          <span>Handmade in the PNW with love</span>
          <span>&copy; 2026 Wook Wear. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
