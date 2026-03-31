'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { glossaryTerms, glossaryCategories } from '@/data/glossary';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get which letters have terms
  const lettersWithTerms = useMemo(() => {
    const set = new Set<string>();
    glossaryTerms.forEach(t => set.add(t.term[0].toUpperCase()));
    return set;
  }, []);

  // Filter terms
  const filtered = useMemo(() => {
    let terms = glossaryTerms;
    if (search) {
      const q = search.toLowerCase();
      terms = terms.filter(t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
    }
    if (activeLetter) {
      terms = terms.filter(t => t.term[0].toUpperCase() === activeLetter);
    }
    if (activeCategory) {
      terms = terms.filter(t => t.category === activeCategory);
    }
    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [search, activeLetter, activeCategory]);

  // Group filtered by letter
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach(t => {
      const letter = t.term[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(t);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bcs-surface border-[3px] border-bcs-gold/50 text-xs uppercase tracking-widest text-bcs-text mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-bcs-gold" />
          {glossaryTerms.length} Terms
        </div>
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
          Sneaker <span className="text-bcs-gold">Glossary</span>
        </h1>
        <p className="text-lg text-bcs-text max-w-2xl mx-auto">
          Whether you&apos;re new to the sneaker world or a seasoned collector,
          this glossary covers the essential terms, slang, and lingo you need to know.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md mx-auto">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-bcs-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
          placeholder="Search terms..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-bcs-surface border-[3px] border-bcs-gold/50 text-sm focus:border-bcs-gold focus:outline-none transition-colors"
        />
      </div>

      {/* Alphabet bar */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-6">
        {ALPHABET.map(letter => {
          const hasTerm = lettersWithTerms.has(letter);
          const isActive = activeLetter === letter;
          return (
            <button
              key={letter}
              onClick={() => { setActiveLetter(isActive ? null : letter); setSearch(''); }}
              disabled={!hasTerm}
              className={`
                w-9 h-9 rounded-lg text-sm font-[family-name:var(--font-barlow-condensed)] font-bold
                transition-all duration-200 border
                ${isActive
                  ? 'bg-bcs-gold/15 border-bcs-gold text-bcs-gold'
                  : hasTerm
                    ? 'bg-bcs-surface border-bcs-border text-bcs-text hover:border-bcs-gold hover:text-bcs-gold cursor-pointer'
                    : 'bg-bcs-surface2 border-bcs-border text-bcs-muted/30 cursor-not-allowed'
                }
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all border ${!activeCategory ? 'bg-bcs-gold/15 border-bcs-gold text-bcs-gold' : 'bg-bcs-surface border-bcs-border text-bcs-text hover:border-bcs-gold'}`}
        >
          All
        </button>
        {glossaryCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all border ${activeCategory === cat.id ? 'bg-bcs-gold/15 border-bcs-gold text-bcs-gold' : 'bg-bcs-surface border-bcs-border text-bcs-text hover:border-bcs-gold'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Term count */}
      <p className="text-center text-sm text-bcs-muted mb-8 font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider">
        Showing <span className="text-bcs-gold font-bold">{filtered.length}</span> of {glossaryTerms.length} terms
      </p>

      {/* Terms grouped by letter */}
      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-bcs-muted text-lg">No terms found for &ldquo;{search || activeLetter}&rdquo;</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(([letter, terms]) => (
            <section key={letter} id={`letter-${letter}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black text-bcs-gold">
                  {letter}
                </span>
                <div className="flex-1 h-px bg-bcs-gold/20" />
                <span className="text-xs text-bcs-muted">{terms.length}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {terms.map(term => (
                  <Link
                    key={term.slug}
                    href={`/glossary/${term.slug}`}
                    className="group block bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 hover:border-bcs-gold p-5 transition-all duration-200 hover:-translate-y-1 shadow-[0_2px_12px_rgba(184,137,42,0.1)] hover:shadow-[0_8px_30px_rgba(184,137,42,0.25)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase tracking-tight text-bcs-white group-hover:text-bcs-gold transition-colors">
                        {term.term}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider text-bcs-muted bg-bcs-surface2 px-2 py-0.5 rounded-full flex-shrink-0">
                        {glossaryCategories.find(c => c.id === term.category)?.label}
                      </span>
                    </div>
                    <p className="text-sm text-bcs-text leading-relaxed line-clamp-2 mt-2">
                      {term.definition}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
