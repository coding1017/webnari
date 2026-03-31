import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  glossaryTerms,
  glossaryCategories,
  getTermBySlug,
} from '@/data/glossary';

export function generateStaticParams() {
  return glossaryTerms.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term: slug } = await params;
  const term = getTermBySlug(slug);
  return {
    title: term ? `${term.term} - Sneaker Glossary` : 'Glossary Term',
    description: term?.definition || 'Sneaker glossary term definition.',
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) notFound();

  const categoryLabel =
    glossaryCategories.find((c) => c.id === term.category)?.label ??
    term.category;

  const relatedTerms = glossaryTerms
    .filter((t) => t.category === term.category && t.slug !== term.slug)
    .slice(0, 6);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-bcs-muted mb-8">
        <Link href="/glossary" className="hover:text-bcs-gold transition-colors">Glossary</Link>
        <span>/</span>
        <Link href={`/glossary#${term.category}`} className="hover:text-bcs-gold transition-colors">{categoryLabel}</Link>
        <span>/</span>
        <span className="text-bcs-white">{term.term}</span>
      </nav>

      {/* Term heading */}
      <div className="mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-bcs-gold/10 text-bcs-gold text-xs uppercase tracking-widest font-semibold mb-4">
          {categoryLabel}
        </span>
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl sm:text-5xl font-black uppercase tracking-tight">
          {term.term}
        </h1>
      </div>

      {/* Definition card */}
      <div className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8 mb-8">
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold uppercase tracking-wider text-bcs-muted mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
          Definition
        </h2>
        <p className="text-bcs-text text-lg leading-relaxed">
          {term.definition}
        </p>
      </div>

      {/* In Context card */}
      {term.inContext && (
        <div className="rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8 mb-12" style={{ background: 'linear-gradient(135deg, rgba(184,137,42,0.08), rgba(212,166,58,0.1), rgba(77,168,218,0.06))' }}>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold uppercase tracking-wider text-bcs-gold mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            In Context
          </h2>
          <blockquote className="text-bcs-white text-lg leading-relaxed italic pl-4 border-l-[3px] border-bcs-gold/40">
            &ldquo;{term.inContext}&rdquo;
          </blockquote>
        </div>
      )}

      {/* Quick facts */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <div className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-bcs-muted mb-1">Category</p>
          <p className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold text-bcs-gold uppercase">{categoryLabel}</p>
        </div>
        <div className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-bcs-muted mb-1">First Letter</p>
          <p className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black text-bcs-gold">{term.term[0].toUpperCase()}</p>
        </div>
      </div>

      {/* Related terms */}
      {relatedTerms.length > 0 && (
        <section>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase mb-6 flex items-center gap-3">
            <span className="w-6 h-0.5 bg-bcs-gold" />
            More {categoryLabel} Terms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedTerms.map((rt) => (
              <Link
                key={rt.slug}
                href={`/glossary/${rt.slug}`}
                className="group block bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 hover:border-bcs-gold p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(184,137,42,0.2)]"
              >
                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-base font-bold uppercase tracking-tight text-bcs-white group-hover:text-bcs-gold transition-colors mb-1">
                  {rt.term}
                </h3>
                <p className="text-sm text-bcs-text leading-relaxed line-clamp-2">
                  {rt.definition}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-12 pt-8 border-t border-bcs-border">
        <Link
          href="/glossary"
          className="inline-flex items-center gap-2 text-sm text-bcs-gold hover:text-bcs-gold2 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Glossary
        </Link>
      </div>
    </div>
  );
}
