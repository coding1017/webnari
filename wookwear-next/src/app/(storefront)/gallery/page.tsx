import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Gallery | Wook Wear",
  description: "A visual journey through every stitch, every drop, every one-of-a-kind creation by Meesh.",
};

const entries = [
  { tag: "COLLAB", img: "/images/backpack-1.jpg", caption: "Put a ton of hours and all our superpowers into these collab bags. One backpack with removable large pouch, one waxed canvas crossbody, one zippered insulated pouch, and one prized possession pouch.", wide: true },
  { tag: "NEW DROP", img: "/images/pink-checker-1.jpg", caption: "Warped pink and white checkerboard with hot pink binding and those rounded edges that go so hard. Matching display mat and snap-closure wallet included." },
  { tag: "DROP", img: "/images/display-mats-1.jpg", caption: "Late night mat drop for the real ones. Donut circles, marbled swirls, geometric color blocks, and abstract waves. Navy and purple felt borders. Sold out in minutes." },
  { tag: "WOOKWEARWEDNESDAY", img: "/images/pouches-circle-1.jpg", caption: "Happy #wookwearwednesday! Prized possession pouches made with some of my favorite fabrics. All bright and beautiful. Stickers included with each pouch." },
  { tag: "DROP", img: "/images/buddy-mats-1.jpg", caption: "Here's some more fun mats I've made! Each one is a unique shape -- organic blobs in psychedelic fabrics with contrast-color felt binding.", wide: true },
  { tag: "HOLIDAY DROP", img: "/images/denim-crossbody-1.jpg", caption: "Happy holidays! Day 5 of the holiday drop. Cut & sew color-block crossbody with hand-stitched sashiko denim patchwork. So clean." },
  { tag: "COLLAB", img: "/images/collab-capsule-1.jpg", caption: "1/1 bag capsule with @trevymetal. Trevy t-shirts and screen prints from back pockets, cut, collaged and sewn into five functional pieces." },
  { tag: "THE BUDDIES", img: "/images/orange-buddy.jpg", caption: "Fuzzy orange sherpa front with psychedelic patchwork back panel. Button-snap eyes, periwinkle felt trim. Every buddy has its own personality." },
];

const tagColors: Record<string, string> = {
  COLLAB: "bg-[linear-gradient(135deg,#39FF14,#00F0FF)] text-[#0A0514]",
  "NEW DROP": "bg-[image:var(--gradient)] text-ww-white",
  DROP: "bg-[rgba(168,85,247,0.8)] text-ww-white",
  WOOKWEARWEDNESDAY: "bg-[linear-gradient(135deg,#A855F7,#FF2D9B)] text-ww-white",
  "HOLIDAY DROP": "bg-[linear-gradient(135deg,#FF6B2B,#FF2D9B)] text-ww-white",
  "THE BUDDIES": "bg-[linear-gradient(135deg,#FACC15,#FF6B2B)] text-[#0A0514]",
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen pt-[120px] pb-0 max-md:pt-[100px]">
      {/* Hero */}
      <section className="text-center pb-16 max-md:pb-10">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal>
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              The Lookbook
            </div>
            <h1 className="font-head font-black text-[clamp(42px,6vw,72px)] leading-[0.95] text-ww-white mb-6">
              Made With <span className="gradient-text">Love</span>
            </h1>
            <p className="text-lg text-ww-text max-w-[520px] mx-auto leading-relaxed">
              A visual journey through every stitch, every drop, every one-of-a-kind creation.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-24 max-md:pb-16">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
            {entries.map((entry, i) => (
              <ScrollReveal key={i} delay={Math.min((i % 4) + 1, 4)} className={entry.wide ? "col-span-2 max-md:col-span-1" : ""}>
                <div className="relative rounded-[20px] overflow-hidden bg-ww-surface border border-ww-border group">
                  <div className={entry.wide ? "aspect-[2/1] max-md:aspect-square" : "aspect-square"}>
                    <img src={entry.img} alt={entry.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <span className={`absolute top-4 left-4 px-3 py-1 font-head text-[10px] font-extrabold tracking-[0.12em] uppercase rounded-md ${tagColors[entry.tag] || "bg-ww-purple text-ww-white"}`}>
                    {entry.tag}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,5,20,0.9)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p className="p-6 text-sm text-ww-white leading-relaxed">{entry.caption}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-ww-dark max-md:py-16">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal>
            <h2 className="font-head font-black text-[clamp(28px,4vw,42px)] leading-[1.1] text-ww-white mb-4">
              Want to See More?
            </h2>
            <p className="text-ww-text text-base mb-8 max-w-[480px] mx-auto">
              Follow the journey on Instagram for behind-the-scenes, new drops, and one-of-a-kind pieces.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="https://www.instagram.com/wook.wear" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-3.5 px-7 font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] bg-[image:var(--gradient)] text-ww-white shadow-[0_0_24px_rgba(255,45,155,0.2)] hover:shadow-[0_0_40px_rgba(255,45,155,0.35)] hover:-translate-y-0.5 transition-all">
                Follow @wook.wear
              </a>
              <Link href="/shop" className="inline-flex items-center gap-2 py-3.5 px-7 font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] bg-transparent text-ww-white border border-ww-border hover:border-ww-purple hover:text-ww-purple2 transition-all">
                Shop the Drop
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
