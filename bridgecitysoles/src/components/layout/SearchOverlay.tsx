'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { getProducts, getLowestPrice } from '@/lib/data';
import { glossaryTerms } from '@/data/glossary';
import { blogPosts } from '@/data/blog';

interface SearchResult {
  type: 'product' | 'glossary' | 'blog' | 'page';
  title: string;
  subtitle: string;
  href: string;
  image?: string;
}

const STATIC_PAGES: SearchResult[] = [
  { type: 'page', title: 'Shop All', subtitle: 'Browse all products', href: '/shop' },
  { type: 'page', title: 'About Us', subtitle: 'Our story', href: '/about' },
  { type: 'page', title: 'Contact', subtitle: 'Get in touch', href: '/contact' },
  { type: 'page', title: 'Size Guide', subtitle: 'Find your perfect fit', href: '/size-guide' },
];

export function InlineSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const all: SearchResult[] = [];

    // Products first
    const products = getProducts();
    products
      .filter(p => p.isActive && (
        p.name.toLowerCase().includes(q) ||
        p.brand.name.toLowerCase().includes(q) ||
        (p.colorway || '').toLowerCase().includes(q) ||
        (p.styleCode || '').toLowerCase().includes(q)
      ))
      .slice(0, 5)
      .forEach(p => {
        const img = p.images.find(i => i.isPrimary) || p.images[0];
        all.push({
          type: 'product',
          title: p.name,
          subtitle: `${p.brand.name} · From $${getLowestPrice(p)}`,
          href: `/product/${p.slug}`,
          image: img?.url,
        });
      });

    // Glossary
    glossaryTerms
      .filter(t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(t => {
        all.push({
          type: 'glossary',
          title: t.term,
          subtitle: t.definition.slice(0, 60) + '...',
          href: `/glossary/${t.slug}`,
        });
      });

    // Blog
    blogPosts
      .filter(b => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(b => {
        all.push({
          type: 'blog',
          title: b.title,
          subtitle: `${b.category} · ${b.readTime}`,
          href: `/blog/${b.slug}`,
        });
      });

    // Pages
    STATIC_PAGES
      .filter(p => p.title.toLowerCase().includes(q))
      .forEach(p => all.push(p));

    return all;
  }, [query]);

  const showDropdown = focused && query.length >= 2;
  const productResults = results.filter(r => r.type === 'product');
  const otherResults = results.filter(r => r.type !== 'product');

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      {/* Search input */}
      <div className="flex items-center">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-bcs-muted pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search..."
            className="w-48 lg:w-64 pl-9 pr-3 py-1.5 rounded-lg bg-bcs-surface/80 border border-bcs-border text-sm text-bcs-white placeholder:text-bcs-muted focus:border-bcs-rust/50 focus:w-80 focus:bg-white transition-all duration-300 outline-none"
          />
        </div>
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-[420px] bg-white rounded-xl border-[3px] border-bcs-gold/50 shadow-[0_15px_50px_rgba(0,0,0,0.15)] overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-bcs-muted text-sm">No results for &ldquo;{query}&rdquo;</p>
              <Link
                href="/shop"
                onClick={() => { setFocused(false); setQuery(''); }}
                className="text-bcs-rust text-sm hover:underline mt-1 inline-block"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Products */}
              {productResults.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-bcs-muted">Products</p>
                  {productResults.map(r => (
                    <Link
                      key={r.href}
                      href={r.href}
                      onClick={() => { setFocused(false); setQuery(''); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-bcs-surface2 transition-colors"
                    >
                      {r.image && (
                        <img src={r.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-bcs-surface2 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{r.title}</p>
                        <p className="text-xs text-bcs-muted truncate">{r.subtitle}</p>
                      </div>
                    </Link>
                  ))}
                </>
              )}

              {/* Other results */}
              {otherResults.length > 0 && (
                <>
                  {productResults.length > 0 && <div className="border-t border-bcs-border my-1" />}
                  {otherResults.map(r => (
                    <Link
                      key={r.href}
                      href={r.href}
                      onClick={() => { setFocused(false); setQuery(''); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-bcs-surface2 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-bcs-gold/10 flex items-center justify-center flex-shrink-0">
                        {r.type === 'glossary' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                          </svg>
                        )}
                        {r.type === 'blog' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6" />
                          </svg>
                        )}
                        {r.type === 'page' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8F95" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {r.title}
                          <span className="text-[10px] text-bcs-muted ml-2 uppercase">{r.type}</span>
                        </p>
                        <p className="text-xs text-bcs-muted truncate">{r.subtitle}</p>
                      </div>
                    </Link>
                  ))}
                </>
              )}

              {/* View all link */}
              <Link
                href={`/shop?search=${encodeURIComponent(query)}`}
                onClick={() => { setFocused(false); setQuery(''); }}
                className="block px-4 py-3 text-center text-sm text-bcs-rust hover:bg-bcs-surface2 border-t border-bcs-border font-medium transition-colors"
              >
                View all results for &ldquo;{query}&rdquo;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
