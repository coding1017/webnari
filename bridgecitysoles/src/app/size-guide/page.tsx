import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Size Guide',
  description:
    'Find your perfect sneaker fit with our comprehensive size guide. Men\'s, women\'s, and youth size charts plus brand-specific fit tips for Nike, Jordan, Adidas, Yeezy, New Balance, and more.',
};

/* ── Size Data ────────────────────────────────────────────── */

const mensSizes = [
  { us: '6', uk: '5.5', eu: '38.5', cm: '24' },
  { us: '6.5', uk: '6', eu: '39', cm: '24.5' },
  { us: '7', uk: '6', eu: '40', cm: '25' },
  { us: '7.5', uk: '6.5', eu: '40.5', cm: '25.5' },
  { us: '8', uk: '7', eu: '41', cm: '26' },
  { us: '8.5', uk: '7.5', eu: '42', cm: '26.5' },
  { us: '9', uk: '8', eu: '42.5', cm: '27' },
  { us: '9.5', uk: '8.5', eu: '43', cm: '27.5' },
  { us: '10', uk: '9', eu: '44', cm: '28' },
  { us: '10.5', uk: '9.5', eu: '44.5', cm: '28.5' },
  { us: '11', uk: '10', eu: '45', cm: '29' },
  { us: '11.5', uk: '10.5', eu: '45.5', cm: '29.5' },
  { us: '12', uk: '11', eu: '46', cm: '30' },
  { us: '13', uk: '12', eu: '47.5', cm: '31' },
  { us: '14', uk: '13', eu: '48.5', cm: '32' },
  { us: '15', uk: '14', eu: '49.5', cm: '33' },
];

const womensSizes = [
  { us: '5', uk: '2.5', eu: '35.5', cm: '22' },
  { us: '5.5', uk: '3', eu: '36', cm: '22.5' },
  { us: '6', uk: '3.5', eu: '36.5', cm: '23' },
  { us: '6.5', uk: '4', eu: '37.5', cm: '23.5' },
  { us: '7', uk: '4.5', eu: '38', cm: '24' },
  { us: '7.5', uk: '5', eu: '38.5', cm: '24.5' },
  { us: '8', uk: '5.5', eu: '39', cm: '25' },
  { us: '8.5', uk: '6', eu: '40', cm: '25.5' },
  { us: '9', uk: '6.5', eu: '40.5', cm: '26' },
  { us: '9.5', uk: '7', eu: '41', cm: '26.5' },
  { us: '10', uk: '7.5', eu: '42', cm: '27' },
  { us: '10.5', uk: '8', eu: '42.5', cm: '27.5' },
  { us: '11', uk: '8.5', eu: '43', cm: '28' },
  { us: '12', uk: '9.5', eu: '44', cm: '29' },
];

const youthSizes = [
  { us: '3.5Y', uk: '3', eu: '35.5', cm: '22.5' },
  { us: '4Y', uk: '3.5', eu: '36', cm: '23' },
  { us: '4.5Y', uk: '4', eu: '36.5', cm: '23.5' },
  { us: '5Y', uk: '4.5', eu: '37.5', cm: '23.5' },
  { us: '5.5Y', uk: '5', eu: '38', cm: '24' },
  { us: '6Y', uk: '5.5', eu: '38.5', cm: '24' },
  { us: '6.5Y', uk: '6', eu: '39', cm: '24.5' },
  { us: '7Y', uk: '6', eu: '40', cm: '25' },
];

const brandTips = [
  {
    brand: 'Nike',
    fit: 'Runs slightly narrow',
    tip: 'Go half a size up from your usual size for a comfortable fit, especially on models like the Air Max 90, Air Max 97, and Vapormax. Nike Dunks tend to run more true to size.',
  },
  {
    brand: 'Jordan',
    fit: 'Varies by model',
    tip: 'Jordan 1s are generally true to size. For Jordan 4s, 5s, and 11s, consider going half a size up as the toe box can feel snug. Jordan 3s and 6s tend to run true to size.',
  },
  {
    brand: 'Adidas / Yeezy',
    fit: 'Runs small',
    tip: 'Yeezy 350 V2s are notoriously tight — go at least half a size up. Yeezy Slides run very small, go a full size up. Adidas Ultraboost runs true to size with a stretchy Primeknit upper.',
  },
  {
    brand: 'New Balance',
    fit: 'True to size',
    tip: 'Most New Balance models like the 550 and 2002R run true to size. Wide width options are available on many styles, making them ideal for wider feet. The 990 series fits slightly roomy.',
  },
  {
    brand: 'Nike SB Dunk',
    fit: 'True to size',
    tip: 'SB Dunks feature a padded tongue and collar for skateboarding, so they run true to size but may feel snug at first. Allow a short break-in period for the padding to conform to your foot.',
  },
];

const widthGuide = [
  {
    width: 'Narrow (B)',
    description:
      'For feet that are slimmer than average. Common in women\'s sizing. If your foot slides around in standard-width shoes, a narrow option may provide a better fit.',
  },
  {
    width: 'Standard (D)',
    description:
      'The default width for most men\'s sneakers (D) and women\'s sneakers (B). This is what you get unless a shoe specifically says "Wide" or "Narrow."',
  },
  {
    width: 'Wide (2E / W)',
    description:
      'For feet that are wider than average. Brands like New Balance and ASICS offer dedicated wide options. If your pinky toe feels squeezed or your foot hangs over the sole edge, try a wide.',
  },
];

const proTips = [
  'Try shoes on in the evening when your feet are at their largest after a full day of activity.',
  'Wear the same type of socks you plan to wear with the sneakers when trying them on.',
  'Leave about a thumb\'s width of space between your longest toe and the front of the shoe.',
  'Walk around for at least a few minutes — a shoe that feels fine standing still can pinch while walking.',
  'If you\'re between sizes, go up rather than down. You can always add an insole for a snugger fit.',
  'Remember that leather and canvas will stretch over time, while knit and mesh uppers hold their shape.',
  'Your left and right feet may differ in size — always fit to the larger foot.',
];

/* ── Reusable Components ──────────────────────────────────── */

function SizeTable({
  title,
  data,
}: {
  title: string;
  data: { us: string; uk: string; eu: string; cm: string }[];
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
        {title}
      </h2>
      <div className="overflow-x-auto rounded-xl border-[3px] border-bcs-gold/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bcs-surface2">
              <th className="px-4 py-3 text-left font-[family-name:var(--font-barlow-condensed)] text-xs uppercase tracking-widest text-bcs-rust">
                US
              </th>
              <th className="px-4 py-3 text-left font-[family-name:var(--font-barlow-condensed)] text-xs uppercase tracking-widest text-bcs-rust">
                UK
              </th>
              <th className="px-4 py-3 text-left font-[family-name:var(--font-barlow-condensed)] text-xs uppercase tracking-widest text-bcs-rust">
                EU
              </th>
              <th className="px-4 py-3 text-left font-[family-name:var(--font-barlow-condensed)] text-xs uppercase tracking-widest text-bcs-rust">
                CM
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.us}
                className={i % 2 === 0 ? 'bg-bcs-surface' : 'bg-bcs-surface2/50'}
              >
                <td className="px-4 py-2.5 font-medium text-bcs-white">{row.us}</td>
                <td className="px-4 py-2.5 text-bcs-text">{row.uk}</td>
                <td className="px-4 py-2.5 text-bcs-text">{row.eu}</td>
                <td className="px-4 py-2.5 text-bcs-text">{row.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function SizeGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* ── Header ── */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bcs-surface border-[3px] border-bcs-gold/50 text-xs uppercase tracking-widest text-bcs-text mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-bcs-gold" />
          Find Your Fit
        </div>
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
          Size <span className="text-bcs-rust">Guide</span>
        </h1>
        <p className="text-lg text-bcs-text max-w-2xl mx-auto">
          Getting the right size is everything. Use our charts, brand-specific tips, and
          measuring guide to find your perfect fit before you buy.
        </p>
      </div>

      <div className="space-y-16">
        {/* ── Men's Chart ── */}
        <SizeTable title="Men's Size Chart" data={mensSizes} />

        {/* ── Women's Chart ── */}
        <SizeTable title="Women's Size Chart" data={womensSizes} />

        {/* ── Youth / GS Chart ── */}
        <SizeTable title="Youth / GS Size Chart" data={youthSizes} />

        {/* ── How to Measure ── */}
        <section>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
            How to Measure <span className="text-bcs-rust">Your Foot</span>
          </h2>
          <div className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
            <ol className="space-y-4">
              {[
                'Place a blank sheet of paper on a hard floor against a wall.',
                'Stand on the paper with your heel touching the wall. Keep your full weight on the foot.',
                'Using a pen or pencil, mark the tip of your longest toe on the paper.',
                'Measure the distance from the edge of the paper (where your heel was) to the mark in centimeters.',
                'Compare your measurement to the CM column in the size charts above.',
                'If you fall between two sizes, round up to the next half size for a comfortable fit.',
                'Repeat for both feet and use the larger measurement as your size.',
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-bcs-rust/15 flex items-center justify-center font-[family-name:var(--font-barlow-condensed)] font-bold text-bcs-rust text-sm">
                    {i + 1}
                  </span>
                  <p className="text-bcs-text leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Brand-Specific Fit Tips ── */}
        <section>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-black uppercase tracking-tight mb-6">
            Brand-Specific <span className="text-bcs-rust">Fit Tips</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandTips.map((item) => (
              <div
                key={item.brand}
                className="rounded-xl border-[3px] border-bcs-gold/50 bg-gradient-to-br from-bcs-surface via-bcs-surface2/60 to-bcs-surface overflow-hidden shadow-[0_2px_12px_rgba(184,137,42,0.08)]"
              >
                <div className="bg-bcs-rust/10 px-5 py-3 border-b border-bcs-gold/30">
                  <h3 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase tracking-tight text-bcs-white">
                    {item.brand}
                  </h3>
                  <span className="text-xs uppercase tracking-widest text-bcs-rust font-bold">
                    {item.fit}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm text-bcs-text leading-relaxed">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-bcs-muted mt-4 text-center">
            Not sure what{' '}
            <Link href="/glossary/true-to-size" className="text-bcs-rust underline underline-offset-2 hover:text-bcs-rust2 transition-colors">
              TTS
            </Link>
            {' '}or{' '}
            <Link href="/glossary/half-size-up" className="text-bcs-rust underline underline-offset-2 hover:text-bcs-rust2 transition-colors">
              half size up
            </Link>
            {' '}means? Check our{' '}
            <Link href="/glossary" className="text-bcs-rust underline underline-offset-2 hover:text-bcs-rust2 transition-colors">
              Sneaker Glossary
            </Link>
            .
          </p>
        </section>

        {/* ── Width Guide ── */}
        <section>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
            Width <span className="text-bcs-rust">Guide</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {widthGuide.map((item) => (
              <div
                key={item.width}
                className="rounded-xl border-[3px] border-bcs-gold/50 bg-bcs-surface p-5"
              >
                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase tracking-tight text-bcs-rust mb-2">
                  {item.width}
                </h3>
                <p className="text-sm text-bcs-text leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-bcs-muted mt-4 text-center">
            Learn more about{' '}
            <Link href="/glossary/wide-foot" className="text-bcs-rust underline underline-offset-2 hover:text-bcs-rust2 transition-colors">
              wide foot sizing
            </Link>
            {' '}in the glossary.
          </p>
        </section>

        {/* ── Pro Tips ── */}
        <section>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
            Pro <span className="text-bcs-rust">Tips</span>
          </h2>
          <div className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
            <ul className="space-y-3">
              {proTips.map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-bcs-rust mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-sm text-bcs-text leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Glossary CTA ── */}
        <section className="text-center bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-8 sm:p-12">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl sm:text-3xl font-bold uppercase mb-3">
            Need Help With <span className="text-bcs-rust">Sneaker Terms</span>?
          </h2>
          <p className="text-bcs-text mb-6 max-w-lg mx-auto">
            From{' '}
            <Link href="/glossary/true-to-size" className="text-bcs-rust underline underline-offset-2 hover:text-bcs-rust2 transition-colors">
              TTS
            </Link>
            {' '}to{' '}
            <Link href="/glossary/gs-grade-school" className="text-bcs-rust underline underline-offset-2 hover:text-bcs-rust2 transition-colors">
              GS
            </Link>
            , our glossary breaks down every term you need to know when buying sneakers.
          </p>
          <Link
            href="/glossary"
            className="inline-flex items-center gap-2 px-6 py-3 bg-bcs-rust text-white font-bold uppercase tracking-wide rounded-lg hover:bg-bcs-rust2 transition-colors font-[family-name:var(--font-barlow-condensed)]"
          >
            Browse the Glossary
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </section>
      </div>
    </div>
  );
}
