import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bridge City Soles',
  description: 'Learn how Bridge City Soles collects, uses, and protects your personal information when you shop with us.',
};

export default function PrivacyPage() {
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
          Privacy <span className="text-bcs-rust">Policy</span>
        </h1>
        <p className="text-sm text-bcs-muted">Last Updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Introduction */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <p className="text-bcs-text leading-relaxed">
            Bridge City Soles (&quot;BCS,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at bridgecitysoles.com or make a purchase from us. By using our website, you consent to the practices described in this policy.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Information We <span className="text-bcs-rust">Collect</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-bcs-white">Personal Information:</strong> Name, email address, phone number, and shipping address when you place an order or create an account.</li>
              <li><strong className="text-bcs-white">Payment Information:</strong> Payment details are processed securely through Stripe. We do not store your full credit card number, CVV, or other sensitive payment data on our servers.</li>
              <li><strong className="text-bcs-white">Communication Data:</strong> Any messages, inquiries, or feedback you send to us via email or contact forms.</li>
              <li><strong className="text-bcs-white">Account Information:</strong> Username, password, order history, and saved preferences if you create an account.</li>
            </ul>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            How We Use Your <span className="text-bcs-rust">Information</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Process and fulfill your orders, including shipping and delivery</li>
              <li>Communicate with you about your orders, inquiries, and customer service requests</li>
              <li>Send promotional emails and marketing communications (only with your consent; you may opt out at any time)</li>
              <li>Improve our website, products, and customer experience</li>
              <li>Detect and prevent fraud or unauthorized activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </section>

        {/* Cookies and Tracking */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Cookies &amp; <span className="text-bcs-rust">Tracking</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We use cookies and similar tracking technologies to enhance your browsing experience:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-bcs-white">Essential Cookies:</strong> Required for basic site functionality such as maintaining your shopping cart and session.</li>
              <li><strong className="text-bcs-white">Analytics Cookies:</strong> We use Google Analytics to understand how visitors interact with our website. This data is aggregated and anonymized.</li>
              <li><strong className="text-bcs-white">Session Cookies:</strong> Temporary cookies that expire when you close your browser, used to maintain your browsing session.</li>
            </ul>
            <p>You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of our website.</p>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Third-Party <span className="text-bcs-rust">Services</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We work with trusted third-party service providers to operate our business:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-bcs-white">Stripe:</strong> Handles all payment processing. Stripe&apos;s privacy policy governs their use of your payment information.</li>
              <li><strong className="text-bcs-white">Cloudflare:</strong> Provides website hosting, performance optimization, and security services.</li>
              <li><strong className="text-bcs-white">Google Analytics:</strong> Provides website traffic analysis and usage insights.</li>
              <li><strong className="text-bcs-white">Shipping Carriers:</strong> USPS, UPS, and FedEx receive your shipping address to deliver your orders.</li>
            </ul>
            <p>We do not sell, trade, or rent your personal information to third parties for their marketing purposes.</p>
          </div>
        </section>

        {/* Data Retention and Deletion */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Data Retention &amp; <span className="text-bcs-rust">Deletion</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We retain your personal information for as long as necessary to fulfill the purposes described in this policy, including maintaining your account, processing transactions, and complying with legal obligations.</p>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of any inaccurate information</li>
              <li>Request deletion of your personal data, subject to legal retention requirements</li>
              <li>Opt out of marketing communications at any time</li>
            </ul>
            <p>To exercise any of these rights, please contact us at <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a>.</p>
          </div>
        </section>

        {/* California/Oregon Privacy Rights */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            California &amp; Oregon <span className="text-bcs-rust">Privacy Rights</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p><strong className="text-bcs-white">California Residents:</strong> Under the California Consumer Privacy Act (CCPA), you have the right to know what personal information we collect, request its deletion, and opt out of its sale. We do not sell personal information.</p>
            <p><strong className="text-bcs-white">Oregon Residents:</strong> Under the Oregon Consumer Privacy Act (OCPA), you have the right to access, correct, and delete your personal data, as well as the right to opt out of targeted advertising and data sales. We honor all such requests.</p>
            <p>To submit a privacy rights request, email us at <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a> with the subject line &quot;Privacy Rights Request.&quot;</p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Contact <span className="text-bcs-rust">Us</span>
          </h2>
          <div className="space-y-3 text-bcs-text leading-relaxed">
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="space-y-1">
              <p><strong className="text-bcs-white">Bridge City Soles</strong></p>
              <p>Portland, OR</p>
              <p>Email: <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a></p>
              <p>Phone: <a href="tel:5039498643" className="text-bcs-rust hover:text-bcs-rust2 underline">(503) 949-8643</a></p>
              <p>Instagram: <a href="https://www.instagram.com/bridgecitysolesportland/" target="_blank" rel="noopener noreferrer" className="text-bcs-rust hover:text-bcs-rust2 underline">@bridgecitysolesportland</a></p>
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Related <span className="text-bcs-rust">Policies</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/terms" className="px-4 py-2 border border-bcs-border rounded-lg text-sm text-bcs-text hover:border-bcs-rust hover:text-bcs-rust transition-colors">
              Terms of Service
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
