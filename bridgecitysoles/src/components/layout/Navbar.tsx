'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/store', label: 'Store' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const { openCart, totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bounce cart icon when items change
  useEffect(() => {
    if (totalItems > 0) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(t);
    }
  }, [totalItems]);

  return (
    <header className={cn(
      'sticky top-0 z-30 transition-all duration-300',
      scrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-bcs-border shadow-sm'
        : 'bg-white/80 backdrop-blur-sm border-b border-bcs-border/50'
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bcs-rust to-bcs-rust2 flex items-center justify-center text-bcs-black font-bold text-sm shadow-md shadow-bcs-rust/20">
            B
          </div>
          <div className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase tracking-wider">
            <span className="text-bcs-white group-hover:text-bcs-rust transition-colors duration-300">Bridge City</span>{' '}
            <span className="text-bcs-rust">Soles</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm text-bcs-text hover:text-bcs-white transition-colors duration-300 uppercase tracking-wide font-medium group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-bcs-rust rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search (desktop) */}
          <Link
            href="/shop"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bcs-surface/80 border border-bcs-border text-bcs-muted text-sm hover:border-bcs-rust/30 hover:text-bcs-text transition-all duration-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Search
          </Link>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative p-2 hover:bg-bcs-surface rounded-lg transition-colors duration-300"
            aria-label="Open cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className={cn(
                'absolute -top-0.5 -right-0.5 w-5 h-5 bg-bcs-rust text-bcs-black text-xs font-bold rounded-full flex items-center justify-center',
                cartBounce && 'animate-cart-bounce'
              )}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-bcs-surface rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-bcs-dark border-t border-bcs-border/50',
          mobileOpen ? 'max-h-64' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm uppercase tracking-wide text-bcs-text hover:text-bcs-white hover:bg-bcs-surface rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
