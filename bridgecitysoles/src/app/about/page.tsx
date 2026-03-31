import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: "Learn about Bridge City Soles -- Portland's premier sneaker destination, founded by Angel Bibiano.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bcs-surface border border-bcs-border text-xs uppercase tracking-widest text-bcs-text mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-bcs-teal" />
          Our Story
        </div>
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
          More Than a <span className="text-bcs-teal">Store</span>
        </h1>
        <p className="text-lg text-bcs-text max-w-2xl mx-auto">
          Bridge City Soles is Portland&apos;s home for authentic sneakers, streetwear, and sneaker culture.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-12">
        {/* Founder Story */}
        <section className="bg-bcs-surface rounded-xl border border-bcs-border p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase mb-4">
            The <span className="text-bcs-teal">Vision</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>
              Bridge City Soles was born from a lifelong passion for sneaker culture. Founded by Angel Bibiano, a sneakerhead since the age of 12, the store represents everything he loves about the community — the hunt for rare pairs, the stories behind every shoe, and the connections made through shared passion.
            </p>
            <p>
              Located on SE Hawthorne Blvd in Portland, Oregon, Bridge City Soles has quickly become the city&apos;s go-to destination for authentic sneakers and streetwear. From rare grails to everyday classics, we curate a collection that speaks to every kind of sneaker lover.
            </p>
            <p>
              With over 2,200 pairs sold and counting, we&apos;re proud to serve everyone from local collectors to visiting artists, athletes, and celebrities — including members of the Portland Timbers.
            </p>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase mb-6 text-center">
            What We <span className="text-bcs-teal">Stand For</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Authenticity First', desc: 'Every single item is verified authentic before it hits our shelves or ships to your door. No exceptions.', icon: '🛡️' },
              { title: 'Community Driven', desc: 'We\'re more than a store — we\'re a hub for Portland\'s sneaker community. Come hang, trade, and connect.', icon: '🤝' },
              { title: 'Buy, Sell, Trade', desc: 'Whether you\'re buying your next grail, selling a pair, or looking to trade, we make it easy and fair.', icon: '🔄' },
              { title: 'Black Owned', desc: 'We\'re proud to be a Black-owned business contributing to Portland\'s vibrant Hawthorne district.', icon: '✊' },
            ].map(value => (
              <div key={value.title} className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-bcs-text leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-bcs-surface rounded-xl border border-bcs-border p-8 sm:p-12">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-bold uppercase mb-4">
            Come Visit <span className="text-bcs-teal">Us</span>
          </h2>
          <p className="text-bcs-text mb-6">
            Portland, OR &bull; Now Online<br />
            Shop Online 24/7 &bull; @bridgecitysolesportland
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/store"
              className="px-6 py-3 bg-bcs-teal text-bcs-black font-bold uppercase tracking-wide rounded-lg hover:bg-bcs-teal2 transition-colors font-[family-name:var(--font-barlow-condensed)]"
            >
              Get Directions
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 border border-bcs-border text-bcs-white font-bold uppercase tracking-wide rounded-lg hover:bg-bcs-surface2 transition-colors font-[family-name:var(--font-barlow-condensed)]"
            >
              Shop Online
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
