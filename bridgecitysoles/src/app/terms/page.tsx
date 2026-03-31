import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Bridge City Soles',
  description: 'Read the Terms of Service for Bridge City Soles. By using our website or purchasing from us, you agree to these terms.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-bcs-muted hover:text-bcs-rust transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl sm:text-5xl font-black uppercase tracking-tight mb-3">
          Terms of <span className="text-bcs-rust">Service</span>
        </h1>
        <p className="text-sm text-bcs-muted">Last Updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Acceptance */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Acceptance of <span className="text-bcs-rust">Terms</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>By accessing or using the Bridge City Soles website (bridgecitysoles.com) or purchasing any products from us, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.</p>
            <p>We reserve the right to update or modify these terms at any time. Continued use of our website after changes are posted constitutes acceptance of the revised terms.</p>
          </div>
        </section>

        {/* Products and Pricing */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Products &amp; <span className="text-bcs-rust">Pricing</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>Bridge City Soles specializes in buying, selling, and consigning sneakers and streetwear. Please note the following:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All products are pre-owned and authenticated unless explicitly stated as brand new or deadstock.</li>
              <li>Product conditions are described as accurately as possible. Each listing includes a condition grade and detailed photos.</li>
              <li>Prices are listed in U.S. dollars and are subject to change without notice.</li>
              <li>We reserve the right to limit quantities, refuse orders, or cancel transactions at our discretion.</li>
              <li>Product availability is not guaranteed until your order is confirmed and payment is processed.</li>
            </ul>
          </div>
        </section>

        {/* Authentication Guarantee */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Authentication <span className="text-bcs-rust">Guarantee</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>Every item sold by Bridge City Soles is 100% authenticated. We stand behind the authenticity of every product we sell. If you believe an item you purchased is not authentic, contact us within 48 hours of delivery with supporting evidence, and we will investigate the claim promptly.</p>
            <p>If an item is confirmed to be inauthentic, we will provide a full refund including return shipping costs.</p>
          </div>
        </section>

        {/* Account Responsibilities */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Account <span className="text-bcs-rust">Responsibilities</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>If you create an account on our website, you are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and up-to-date information</li>
              <li>Notifying us immediately of any unauthorized access or use of your account</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in suspicious activity.</p>
          </div>
        </section>

        {/* Prohibited Activities */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Prohibited <span className="text-bcs-rust">Activities</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>You agree not to engage in any of the following activities:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Using our website for any unlawful purpose</li>
              <li>Attempting to interfere with or disrupt the operation of our website</li>
              <li>Submitting false or misleading information</li>
              <li>Attempting to purchase items using fraudulent payment methods</li>
              <li>Reproducing, duplicating, or reselling any part of our website without written consent</li>
              <li>Using automated tools or bots to access or scrape our website</li>
              <li>Impersonating another person or entity</li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Intellectual <span className="text-bcs-rust">Property</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>All content on the Bridge City Soles website, including but not limited to text, graphics, logos, images, product descriptions, and website design, is the property of Bridge City Soles and is protected by applicable intellectual property laws.</p>
            <p>You may not use, reproduce, modify, or distribute any content from our website without our prior written consent. The Bridge City Soles name, logo, and branding are trademarks of Bridge City Soles.</p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Limitation of <span className="text-bcs-rust">Liability</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>To the fullest extent permitted by law, Bridge City Soles shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our website or the purchase of products from us.</p>
            <p>Our total liability for any claim arising from these terms or your use of our services shall not exceed the amount you paid for the specific product or service giving rise to the claim.</p>
            <p>We do not guarantee that our website will be available at all times or free from errors, viruses, or other harmful components.</p>
          </div>
        </section>

        {/* Dispute Resolution */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Dispute <span className="text-bcs-rust">Resolution</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>In the event of any dispute arising from these Terms of Service or your use of our website, you agree to first attempt to resolve the matter informally by contacting us at <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a>.</p>
            <p>If the dispute cannot be resolved informally within 30 days, it shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, conducted in Portland, Oregon.</p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Governing <span className="text-bcs-rust">Law</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>These Terms of Service and any disputes arising from them shall be governed by and construed in accordance with the laws of the State of Oregon, without regard to its conflict of law provisions. Any legal action or proceeding shall be brought exclusively in the state or federal courts located in Multnomah County, Oregon.</p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Changes to <span className="text-bcs-rust">Terms</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to our website. We will update the &quot;Last Updated&quot; date at the top of this page when changes are made.</p>
            <p>Your continued use of our website after changes are posted constitutes your acceptance of the revised terms. We encourage you to review these terms periodically.</p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Contact <span className="text-bcs-rust">Us</span>
          </h2>
          <div className="space-y-3 text-bcs-text leading-relaxed">
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <div className="space-y-1">
              <p><strong className="text-bcs-white">Bridge City Soles</strong></p>
              <p>Portland, OR</p>
              <p>Email: <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a></p>
              <p>Phone: <a href="tel:5039498643" className="text-bcs-rust hover:text-bcs-rust2 underline">(503) 949-8643</a></p>
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Related <span className="text-bcs-rust">Policies</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/privacy" className="px-4 py-2 border border-bcs-border rounded-lg text-sm text-bcs-text hover:border-bcs-rust hover:text-bcs-rust transition-colors">
              Privacy Policy
            </Link>
            <Link href="/returns" className="px-4 py-2 border border-bcs-border rounded-lg text-sm text-bcs-text hover:border-bcs-rust hover:text-bcs-rust transition-colors">
              Return &amp; Refund Policy
            </Link>
            <Link href="/shipping" className="px-4 py-2 border border-bcs-border rounded-lg text-sm text-bcs-text hover:border-bcs-rust hover:text-bcs-rust transition-colors">
              Shipping Policy
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
