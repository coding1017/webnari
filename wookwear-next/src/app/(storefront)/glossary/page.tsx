import type { Metadata } from "next";
import Link from "next/link";
import { glossaryTerms, GLOSSARY_CATEGORIES, CATEGORY_LABELS } from "@/data/glossary";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Craft Glossary | Wook Wear",
  description: "A comprehensive glossary of sewing, textile, and craft terms. Learn the language of handmade goods, from sashiko to selvage.",
};

export default function GlossaryPage() {
  const grouped = GLOSSARY_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = glossaryTerms.filter((t) => t.category === cat);
      return acc;
    },
    {} as Record<string, typeof glossaryTerms>
  );

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
            <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
            Craft Glossary
          </div>
          <h1 className="font-head font-black text-[clamp(42px,6vw,72px)] leading-[0.95] text-ww-white mb-6">
            Know Your <span className="gradient-text">Craft</span>
          </h1>
          <p className="text-lg text-ww-text max-w-[560px] mx-auto leading-relaxed">
            From stitches to fabrics to tools, here is every term you need to
            know as a maker.
          </p>
        </ScrollReveal>

        {/* Category Sections */}
        {GLOSSARY_CATEGORIES.map((cat) => (
          <section key={cat} className="mb-16 last:mb-0">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-head font-black text-[clamp(28px,4vw,40px)] leading-[1.1] text-ww-white">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <span className="px-3 py-1 text-[11px] font-head font-bold tracking-[0.15em] uppercase rounded-full bg-[rgba(168,85,247,0.15)] text-ww-purple2">
                  {grouped[cat].length} terms
                </span>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              {grouped[cat].map((term, i) => (
                <ScrollReveal key={term.slug} delay={i % 2 === 0 ? 0 : 1}>
                  <Link
                    href={`/glossary/${term.slug}`}
                    className="group block p-5 bg-ww-surface rounded-[16px] border border-ww-border transition-all hover:border-ww-purple hover:-translate-y-0.5"
                  >
                    <h3 className="font-head font-black text-lg text-ww-white mb-2 group-hover:text-ww-pink transition-colors">
                      {term.term}
                    </h3>
                    <p className="text-sm text-ww-text leading-relaxed line-clamp-2">
                      {term.definition}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
