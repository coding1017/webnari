import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "About Meesh | Wook Wear",
  description: "Meet Meesh, the maker behind Wook Wear. Handmade pouches, bags, and accessories crafted with love from the PNW.",
};

const processSteps = [
  { num: "01", title: "Design", desc: "Every piece starts as a sketch or a vision. Meesh draws patterns and picks fabrics that speak to her.", icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg> },
  { num: "02", title: "Cut & Sew", desc: "Each piece is hand-cut and sewn on Meesh's trusty machine. No two cuts are ever the same.", icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
  { num: "03", title: "Details", desc: "Snaps, zippers, piping, and patches are added by hand. The details make it special.", icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { num: "04", title: "Ship with Love", desc: "Wrapped up with stickers and care, every order is packed like a gift.", icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
];

const collabs = [
  { name: "Power Pat", handle: "@_powerpat", link: "https://www.instagram.com/_powerpat", img: "/images/pat-profile.jpg", desc: "Creative partner and hype squad. Pat brings fresh ideas, feedback, and energy to every drop. A key part of the Wook Wear universe." },
  { name: "J Hudson", handle: "@jhudson_tiedye", link: "https://www.instagram.com/jhudson_tiedye", img: "/images/jhudson-profile.jpg", desc: "Tie-dye artist extraordinaire. J creates the vibrant, one-of-a-kind dyed fabrics that give many Wook Wear pieces their signature color and energy." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-[120px] pb-0 max-md:pt-[100px]">
      {/* Hero */}
      <section className="text-center pb-20 max-md:pb-12">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal>
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              The Story
            </div>
            <h1 className="font-head font-black text-[clamp(42px,6vw,72px)] leading-[0.95] text-ww-white mb-6">
              Meet the <span className="gradient-text">Maker</span>
            </h1>
            <p className="text-lg text-ww-text max-w-[560px] mx-auto leading-relaxed">
              Every stitch, every cut, every detail is done by hand. This is Wook Wear, and it all starts with Meesh.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-ww-dark relative overflow-hidden max-md:py-16">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <div className="grid grid-cols-[1.2fr_1fr] gap-16 items-center max-lg:grid-cols-1 max-lg:gap-10">
            <ScrollReveal>
              <div className="aspect-[4/5] rounded-[20px] overflow-hidden border border-ww-border">
                <img src="/images/orange-buddy.jpg" alt="Meesh showing off a handmade Orange Sherpa Buddy Pouch" className="w-full h-full object-cover" />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
                <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
                The Maker
              </div>
              <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
                How It All <span className="gradient-text">Started</span>
              </h2>
              <p className="text-ww-text text-base leading-[1.7] mb-5">
                Wook Wear started the way most good things do: with a sewing machine, a pile of fabric, and a late-night idea that just wouldn&apos;t quit. Meesh had always been drawn to pattern-making and the feel of working with her hands, but it wasn&apos;t until she started making pouches for friends heading to festivals that things really clicked.
              </p>
              <p className="text-ww-text text-base leading-[1.7] mb-5">
                What began as Instagram drops and word-of-mouth sales quickly grew into something bigger. Festival-goers, collectors, and fellow makers started reaching out, and Wook Wear found its community.
              </p>
              <p className="text-ww-text text-base leading-[1.7]">
                No two pieces are ever the same. That&apos;s not a limitation -- it&apos;s the whole point. Each creation carries its own personality, from the fabric selection to the final stitch. It&apos;s wearable art, made one piece at a time.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 relative overflow-hidden max-md:py-16">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal className="text-center">
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              From Sketch to Stitch
            </div>
            <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
              How It&apos;s <span className="gradient-text">Made</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-4 gap-6 mt-12 max-lg:grid-cols-2 max-md:gap-4">
            {processSteps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i + 1}>
                <div className="bg-ww-surface border border-ww-border rounded-[20px] p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-ww-purple/50 hover:shadow-[0_8px_32px_rgba(168,85,247,0.12)]">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center text-ww-purple2">
                    {step.icon}
                  </div>
                  <div className="font-head text-[10px] font-bold tracking-[0.2em] text-ww-pink mb-2">{step.num}</div>
                  <div className="font-head font-extrabold text-lg text-ww-white uppercase tracking-[0.06em] mb-2">{step.title}</div>
                  <p className="text-sm text-ww-text leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Collabs */}
      <section className="py-24 bg-ww-dark relative overflow-hidden max-md:py-16">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal>
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Better Together
            </div>
            <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-5">
              The Collab <span className="gradient-text">Crew</span>
            </h2>
            <p className="text-ww-text text-base leading-[1.7] max-w-[640px] mb-10">
              Wook Wear wouldn&apos;t be what it is without the incredible makers and creatives who inspire, collaborate, and push the craft forward.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
            {collabs.map((c, i) => (
              <ScrollReveal key={c.handle} delay={i + 1}>
                <a href={c.link} target="_blank" rel="noopener noreferrer" className="flex gap-5 bg-ww-surface border border-ww-border rounded-[20px] p-6 transition-all duration-300 hover:border-ww-purple/50 hover:shadow-[0_8px_32px_rgba(168,85,247,0.12)] max-md:flex-col max-md:items-center max-md:text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-ww-border">
                    <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-head font-extrabold text-lg text-ww-white">{c.name}</div>
                    <div className="text-sm text-ww-pink mb-2">{c.handle}</div>
                    <p className="text-sm text-ww-text leading-relaxed">{c.desc}</p>
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="py-24 relative overflow-hidden max-md:py-16">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal className="text-center">
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              In the Spotlight
            </div>
            <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white mb-10">
              As Seen <span className="gradient-text">In</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <div className="max-w-[640px] mx-auto bg-ww-surface border border-ww-border rounded-[20px] p-8 text-center">
              <div className="font-head text-[10px] font-bold tracking-[0.2em] uppercase text-ww-cyan mb-3">Featured In</div>
              <div className="font-head font-black text-2xl text-ww-white mb-3">Leafy Magazine</div>
              <p className="text-sm text-ww-text leading-relaxed">
                Wook Wear was featured in Leafy Magazine for pushing the boundaries of handmade festival accessories. From one-of-a-kind pouches to bold display mats, the feature highlighted Meesh&apos;s commitment to craft and community.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-ww-dark max-md:py-16">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal>
            <h2 className="font-head font-black text-[clamp(28px,4vw,42px)] leading-[1.1] text-ww-white mb-8">
              Want to collab or just say hi?
            </h2>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/contact" className="inline-flex items-center gap-2 py-3.5 px-7 font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] bg-[image:var(--gradient)] text-ww-white shadow-[0_0_24px_rgba(255,45,155,0.2)] hover:shadow-[0_0_40px_rgba(255,45,155,0.35)] hover:-translate-y-0.5 transition-all">
                Get in Touch
              </Link>
              <a href="https://www.instagram.com/wook.wear" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-3.5 px-7 font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] bg-transparent text-ww-white border border-ww-border hover:border-ww-purple hover:text-ww-purple2 transition-all">
                Follow on Instagram
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
