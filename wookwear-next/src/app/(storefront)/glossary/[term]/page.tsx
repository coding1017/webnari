import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { glossaryTerms, getTermBySlug, CATEGORY_LABELS } from "@/data/glossary";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateStaticParams() {
  return glossaryTerms.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term: termSlug } = await params;
  const term = getTermBySlug(termSlug);
  if (!term) return { title: "Term Not Found | Wook Wear" };

  return {
    title: `${term.term} - Craft Glossary | Wook Wear`,
    description: term.definition,
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: termSlug } = await params;
  const term = getTermBySlug(termSlug);
  if (!term) notFound();

  const related = glossaryTerms
    .filter((t) => t.category === term.category && t.slug !== term.slug)
    .slice(0, 6);

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[800px] mx-auto px-10 max-md:px-5">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="flex items-center gap-2 text-sm text-ww-muted mb-8 font-head tracking-wider uppercase">
            <Link href="/glossary" className="hover:text-ww-pink transition-colors">
              Glossary
            </Link>
            <span>/</span>
            <span className="text-ww-text">{term.term}</span>
          </nav>
        </ScrollReveal>

        {/* Term Header */}
        <ScrollReveal>
          <div className="mb-10">
            <span className="inline-block px-3 py-1 text-[10px] font-head font-bold tracking-[0.15em] uppercase rounded-full bg-[rgba(168,85,247,0.15)] text-ww-purple2 mb-4">
              {CATEGORY_LABELS[term.category] || term.category}
            </span>
            <h1 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white">
              {term.term}
            </h1>
          </div>
        </ScrollReveal>

        {/* Definition */}
        <ScrollReveal>
          <div className="p-8 bg-ww-surface rounded-[20px] border border-ww-border mb-12">
            <p className="text-ww-text text-lg leading-[1.8]">
              {term.definition}
            </p>
          </div>
        </ScrollReveal>

        {/* Related Terms */}
        {related.length > 0 && (
          <ScrollReveal>
            <div>
              <h2 className="font-head font-black text-2xl text-ww-white mb-6">
                More in {CATEGORY_LABELS[term.category]}
              </h2>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/glossary/${r.slug}`}
                    className="group block p-5 bg-ww-surface rounded-[16px] border border-ww-border transition-all hover:border-ww-purple hover:-translate-y-0.5"
                  >
                    <h3 className="font-head font-black text-base text-ww-white mb-1 group-hover:text-ww-pink transition-colors">
                      {r.term}
                    </h3>
                    <p className="text-xs text-ww-text leading-relaxed line-clamp-2">
                      {r.definition}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Back Link */}
        <ScrollReveal>
          <div className="mt-12">
            <Link
              href="/glossary"
              className="inline-flex items-center gap-2 font-head text-sm font-bold tracking-[0.1em] uppercase text-ww-pink hover:text-ww-pink2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Glossary
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
