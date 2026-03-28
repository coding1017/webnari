import Link from "next/link";
import { db } from "@/lib/db";
import { FeaturedGrid } from "@/components/product/FeaturedGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

const testimonials = [
  { quote: "Best bags, been running mine for years!!! Absolute fire quality and the designs are always next level.", name: "@hesh4hash", initial: "H" },
  { quote: "Those rounded edges go so hard. Beautifully done, you can really see the love in every stitch.", name: "@brookimats", initial: "B" },
  { quote: "Everything you make is wonderful! The display mats are really fun and funky. Can't wait to see where you take this style.", name: "@mooiamatree", initial: "M" },
];

const categories = [
  { href: "/shop?cat=pouches", name: "Pouches", sub: "Prized possessions", icon: <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2"/><circle cx="12" cy="13" r="2"/></svg>, color: "pink" },
  { href: "/shop?cat=bags", name: "Bags", sub: "Crossbody & backpacks", icon: <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, color: "cyan" },
  { href: "/shop?cat=mats", name: "Mats", sub: "Display & decoration", icon: <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8c0-2 2-4 4-3s3 2 5 1 3-2 5-1 3 3 3 5-2 4-4 5-4 0-6 1-3 3-5 2-4-3-4-5 0-3 2-5z"/></svg>, color: "orange" },
  { href: "/shop?cat=buddy", name: "Buddy Pouches", sub: "Lil friends", icon: <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/><path d="M9 16c1.5 1.5 4.5 1.5 6 0"/></svg>, color: "neon" },
];

const categoryColors: Record<string, { border: string; hoverBorder: string; hoverShadow: string; icon: string }> = {
  pink: { border: "border-t-2 border-t-ww-pink", hoverBorder: "hover:border-ww-pink", hoverShadow: "hover:shadow-[0_8px_32px_rgba(255,45,155,0.15)]", icon: "text-ww-pink2" },
  cyan: { border: "border-t-2 border-t-ww-cyan", hoverBorder: "hover:border-ww-cyan", hoverShadow: "hover:shadow-[0_8px_32px_rgba(0,240,255,0.15)]", icon: "text-ww-cyan" },
  orange: { border: "border-t-2 border-t-ww-orange", hoverBorder: "hover:border-ww-orange", hoverShadow: "hover:shadow-[0_8px_32px_rgba(255,107,43,0.15)]", icon: "text-ww-orange" },
  neon: { border: "border-t-2 border-t-ww-neon", hoverBorder: "hover:border-ww-neon", hoverShadow: "hover:shadow-[0_8px_32px_rgba(57,255,20,0.15)]", icon: "text-ww-neon" },
};

const igImages = [
  { src: "/images/pink-checker-1.jpg", alt: "Pink Checker Pouch Set" },
  { src: "/images/pouches-circle-1.jpg", alt: "Prized Possession Pouches Drop" },
  { src: "/images/backpack-1.jpg", alt: "Tie-Dye Canvas Backpack" },
  { src: "/images/display-mats-1.jpg", alt: "Psychedelic Display Mats" },
  { src: "/images/buddy-mats-1.jpg", alt: "Buddy Display Mats" },
  { src: "/images/denim-crossbody-1.jpg", alt: "Sashiko Denim Crossbody" },
];

export const revalidate = 60;

export default async function HomePage() {
  const featured = await db.getFeaturedProducts(4);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-10 pt-[120px] pb-20 overflow-hidden max-md:px-5 max-md:pt-[100px] max-md:pb-[60px] max-md:min-h-[90vh]">
        <div className="absolute inset-0 z-0 animate-[heroShift_12s_ease-in-out_infinite_alternate]" style={{
          background: `
            radial-gradient(ellipse at 15% 50%, rgba(255,45,155,0.45) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, rgba(57,255,20,0.3) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 85%, rgba(0,240,255,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 75% 55%, rgba(168,85,247,0.35) 0%, transparent 45%),
            radial-gradient(ellipse at 25% 25%, rgba(255,107,43,0.3) 0%, transparent 55%),
            var(--color-ww-black)
          `
        }} />
        <div className="relative z-[1] text-center max-w-[720px]">
          <div className="inline-flex items-center gap-2.5 font-head text-xs font-bold tracking-[0.2em] uppercase text-ww-cyan mb-6 py-2 px-5 bg-[linear-gradient(135deg,rgba(57,255,20,0.1),rgba(0,240,255,0.1),rgba(168,85,247,0.1),rgba(255,45,155,0.1))] border border-[rgba(0,240,255,0.25)] rounded-3xl animate-[eyebrowGlow_4s_ease-in-out_infinite_alternate]">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C7 2 3 5.5 3 9.5c0 2.5 1.5 4 3 4.5h1v6a1 1 0 001 1h8a1 1 0 001-1v-6h1c1.5-.5 3-2 3-4.5C21 5.5 17 2 12 2zm-1 17h2v-5h-2v5z"/></svg>
            Handmade With Love
          </div>
          <h1 className="font-head font-black text-[clamp(48px,8vw,88px)] leading-[0.95] text-ww-white mb-6 max-md:text-[clamp(40px,10vw,56px)]">
            ONE OF A KIND<br />
            <span className="gradient-trippy-text">WEARABLE ART</span>
          </h1>
          <p className="text-lg text-ww-text max-w-[480px] mx-auto mb-10 leading-relaxed max-md:text-base">
            Handcrafted pouches, bags, and accessories made by Meesh. Every piece is unique, every stitch intentional.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/shop" className="inline-flex items-center gap-2 py-3.5 px-7 font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] bg-[image:var(--gradient)] text-ww-white shadow-[0_0_24px_rgba(255,45,155,0.2)] hover:shadow-[0_0_40px_rgba(255,45,155,0.35)] hover:-translate-y-0.5 transition-all">
              Shop the Drop
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 py-3.5 px-7 font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] bg-transparent text-ww-white border border-ww-border hover:border-ww-purple hover:text-ww-purple2 transition-all">
              Meet the Maker
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="py-[18px] overflow-hidden bg-[linear-gradient(135deg,rgba(255,45,155,0.18),rgba(168,85,247,0.15),rgba(0,240,255,0.18),rgba(57,255,20,0.1))] border-t border-[rgba(255,45,155,0.25)] border-b border-b-[rgba(0,240,255,0.25)]">
        <div className="flex gap-12 w-max animate-[marqueeScroll_25s_linear_infinite]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12">
              {["#WOOKWEARWEDNESDAY", "NEW DROP EVERY WEEK", "HANDMADE IN THE PNW", "ONE OF ONE PIECES", "PRIZED POSSESSION POUCHES", "BAGS & ACCESSORIES"].map((text, j) => (
                <span key={j} className="flex items-center gap-3">
                  <span className="font-head text-[13px] font-bold tracking-[0.15em] uppercase text-ww-white whitespace-nowrap">{text}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[image:var(--gradient)] flex-shrink-0 shadow-[0_0_8px_rgba(255,45,155,0.4)]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-24 relative max-md:py-16">
        <div className="absolute -top-[100px] -right-[200px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.12)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5 relative z-[1]">
          <ScrollReveal>
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Fresh off the Table
            </div>
            <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
              Latest <span className="gradient-text">Creations</span>
            </h2>
          </ScrollReveal>
          <FeaturedGrid products={featured} />
          <ScrollReveal className="text-center mt-10">
            <Link href="/shop" className="inline-flex items-center gap-2 py-3.5 px-7 font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] bg-transparent text-ww-white border border-ww-border hover:border-ww-purple hover:text-ww-purple2 transition-all">
              View All Products
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 bg-ww-dark relative overflow-hidden max-md:py-16">
        <div className="absolute -bottom-20 -left-[150px] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(255,45,155,0.1)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5 relative z-[1]">
          <div className="grid grid-cols-[1.2fr_1fr] gap-16 items-center max-lg:grid-cols-1 max-lg:gap-10">
            <ScrollReveal>
              <div className="aspect-[4/5] rounded-[20px] overflow-hidden bg-[linear-gradient(135deg,var(--color-ww-surface),var(--color-ww-surface2))] border border-ww-border">
                <img src="/images/orange-buddy.jpg" alt="Meesh showing off an Orange Sherpa Buddy Pouch" className="w-full h-full object-cover rounded-[20px]" />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
                <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
                The Maker
              </div>
              <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
                Made by <span className="gradient-text">Meesh</span>
              </h2>
              <p className="text-ww-text text-base leading-[1.7] mb-6">
                Every Wook Wear piece starts as a vision and becomes something you can hold, wear, and treasure. From hand-cut patterns to carefully selected fabrics, each creation is a one-of-a-kind labor of love.
              </p>
              <p className="text-ww-text text-base leading-[1.7] mb-6">
                What started as a passion project has grown into a community of collectors, festival-goers, and fellow makers who appreciate the art of handmade goods.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 font-head text-[13px] font-bold tracking-[0.1em] uppercase text-ww-pink hover:gap-3.5 transition-[gap]">
                Read the full story
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 relative overflow-hidden max-md:py-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(168,85,247,0.08)_0%,transparent_60%)] pointer-events-none z-0" />
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5 relative z-[1]">
          <ScrollReveal className="text-center">
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Shop by Category
            </div>
            <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
              Find Your <span className="gradient-text">Vibe</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-4 gap-5 mt-12 max-lg:grid-cols-2 max-md:gap-3">
            {categories.map((cat, i) => {
              const colors = categoryColors[cat.color];
              return (
                <ScrollReveal key={cat.name} delay={i + 1}>
                  <Link href={cat.href} className={`block bg-ww-surface border border-ww-border ${colors.border} rounded-[20px] p-8 px-6 text-center transition-all duration-300 hover:-translate-y-1 ${colors.hoverBorder} ${colors.hoverShadow} max-md:p-6 max-md:px-4`}>
                    <div className={colors.icon}>{cat.icon}</div>
                    <div className="font-head font-extrabold text-lg text-ww-white uppercase tracking-[0.06em] mb-1">{cat.name}</div>
                    <div className="text-[13px] text-ww-muted">{cat.sub}</div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-ww-dark relative overflow-hidden max-md:py-16">
        <div className="absolute -top-[50px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(57,255,20,0.06)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute -bottom-20 -right-20 w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(255,107,43,0.08)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5 relative z-[1]">
          <ScrollReveal className="text-center">
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              The Wook Fam
            </div>
            <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
              What People <span className="gradient-text">Say</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-3 gap-6 mt-12 max-lg:grid-cols-1">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i + 1}>
                <div className="bg-ww-surface border border-transparent rounded-[20px] p-7 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(168,85,247,0.12)]" style={{ background: "linear-gradient(var(--color-ww-surface), var(--color-ww-surface)) padding-box, linear-gradient(135deg, rgba(255,45,155,0.3), rgba(168,85,247,0.3), rgba(0,240,255,0.3)) border-box" }}>
                  <p className="text-[15px] text-ww-text leading-[1.7] mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[image:var(--gradient)] flex items-center justify-center font-head text-sm font-extrabold text-ww-white">
                      {t.initial}
                    </div>
                    <div>
                      <div className="font-head text-[13px] font-bold text-ww-white">{t.name}</div>
                      <div className="text-xs text-ww-muted">Instagram</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 max-md:py-14">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal>
            <div className="bg-ww-dark border border-ww-border rounded-[24px] p-12 text-center max-md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[image:var(--checker)] opacity-10 pointer-events-none" />
              <div className="relative z-[1]">
                <div className="flex items-center justify-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-4">
                  <span className="w-6 h-0.5 bg-[image:var(--gradient)]" />
                  Never Miss a Drop
                  <span className="w-6 h-0.5 bg-[image:var(--gradient)]" />
                </div>
                <h2 className="font-head font-black text-[clamp(24px,3.5vw,36px)] leading-[1.1] text-ww-white mb-3">
                  Join the <span className="gradient-text">Wook Wear</span> Fam
                </h2>
                <p className="text-ww-muted text-sm max-w-md mx-auto mb-8">
                  Be the first to know about new drops, restocks, and exclusive behind-the-scenes content from Meesh.
                </p>
                <NewsletterForm variant="hero" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-24 text-center relative overflow-hidden max-md:py-16" style={{ background: "linear-gradient(180deg, var(--color-ww-black) 0%, var(--color-ww-dark) 50%, var(--color-ww-black) 100%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(255,45,155,0.1)_0%,rgba(168,85,247,0.06)_40%,transparent_70%)] pointer-events-none z-0" />
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5 relative z-[1]">
          <ScrollReveal>
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Follow the Journey
            </div>
            <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
              See What&apos;s <span className="gradient-text">Cooking</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid grid-cols-6 gap-2 my-10 max-w-[720px] mx-auto max-md:grid-cols-3">
              {igImages.map((img) => (
                <div key={img.alt} className="aspect-square rounded-[12px] overflow-hidden bg-ww-surface border border-transparent transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(var(--color-ww-surface), var(--color-ww-surface)) padding-box, linear-gradient(135deg, rgba(255,45,155,0.2), rgba(168,85,247,0.2)) border-box" }}>
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="font-head text-2xl font-black mb-6 gradient-text">@wook.wear</div>
            <a href="https://www.instagram.com/wook.wear" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-3.5 px-7 font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] bg-[image:var(--gradient)] text-ww-white shadow-[0_0_24px_rgba(255,45,155,0.2)] hover:shadow-[0_0_40px_rgba(255,45,155,0.35)] hover:-translate-y-0.5 transition-all">
              Follow on Instagram
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
