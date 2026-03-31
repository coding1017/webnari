import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping Policy | Bridge City Soles',
  description: 'Learn about Bridge City Soles shipping methods, rates, delivery times, and our double-boxed packaging for sneaker protection.',
};

export default function ShippingPage() {
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
          Shipping <span className="text-bcs-rust">Policy</span>
        </h1>
        <p className="text-sm text-bcs-muted">Last Updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Processing Time */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Processing <span className="text-bcs-rust">Time</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>All orders are processed within <strong className="text-bcs-white">1-2 business days</strong> after payment is confirmed. Orders placed on weekends or holidays will be processed on the next business day.</p>
            <p>During high-volume periods (new drops, promotions), processing times may be slightly longer. You will receive an email confirmation once your order has shipped.</p>
          </div>
        </section>

        {/* Shipping Methods */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Shipping <span className="text-bcs-rust">Methods</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We ship with the following carriers:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-bcs-surface2 rounded-lg border border-bcs-border p-4 text-center">
                <p className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase text-bcs-white mb-1">USPS Priority</p>
                <p className="text-sm">2-3 business days</p>
              </div>
              <div className="bg-bcs-surface2 rounded-lg border border-bcs-border p-4 text-center">
                <p className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase text-bcs-white mb-1">UPS Ground</p>
                <p className="text-sm">3-5 business days</p>
              </div>
              <div className="bg-bcs-surface2 rounded-lg border border-bcs-border p-4 text-center">
                <p className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase text-bcs-white mb-1">FedEx</p>
                <p className="text-sm">3-5 business days</p>
              </div>
            </div>
            <p className="text-sm">The shipping carrier is selected based on your location and package size. If you have a carrier preference, note it in your order and we will accommodate when possible.</p>
          </div>
        </section>

        {/* Shipping Rates */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Shipping <span className="text-bcs-rust">Rates</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-bcs-surface2 rounded-lg border border-bcs-border p-5">
                <p className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase text-bcs-rust text-lg mb-1">Free Shipping</p>
                <p className="text-sm">On all orders over <strong className="text-bcs-white">$300</strong></p>
              </div>
              <div className="bg-bcs-surface2 rounded-lg border border-bcs-border p-5">
                <p className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase text-bcs-white text-lg mb-1">$12.99 Flat Rate</p>
                <p className="text-sm">On orders under $300</p>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Estimates */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Delivery <span className="text-bcs-rust">Estimates</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>Estimated delivery times for domestic (U.S.) shipments:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-bcs-white">West Coast:</strong> 2-3 business days</li>
              <li><strong className="text-bcs-white">Midwest:</strong> 3-4 business days</li>
              <li><strong className="text-bcs-white">East Coast:</strong> 4-5 business days</li>
              <li><strong className="text-bcs-white">Alaska &amp; Hawaii:</strong> 5-7 business days</li>
            </ul>
            <p>Delivery estimates are calculated from the ship date, not the order date. Actual delivery times may vary based on carrier performance and weather conditions.</p>
          </div>
        </section>

        {/* Tracking */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Order <span className="text-bcs-rust">Tracking</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>You will receive a shipping confirmation email with a tracking number once your order has been dispatched. Tracking information typically updates within 24 hours of shipment.</p>
            <p>If you do not receive a tracking email within 3 business days of placing your order, please contact us at <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a>.</p>
          </div>
        </section>

        {/* Packaging */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Packaging &amp; <span className="text-bcs-rust">Protection</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We take great care in packaging every order to ensure your items arrive in perfect condition:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-bcs-white">Double-boxed:</strong> Every sneaker order is double-boxed for maximum protection during transit</li>
              <li><strong className="text-bcs-white">Discreet packaging:</strong> All shipments use plain outer boxes with no branding or product details visible</li>
              <li><strong className="text-bcs-white">Protective materials:</strong> Tissue paper, bubble wrap, and packing materials are used as needed to prevent movement and damage</li>
            </ul>
          </div>
        </section>

        {/* Insurance */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Shipping <span className="text-bcs-rust">Insurance</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>Shipping insurance is automatically included on all orders over <strong className="text-bcs-white">$200</strong> at no additional cost. This covers loss, theft, and damage during transit.</p>
            <p>For orders under $200, shipping insurance is available as an add-on at checkout. We strongly recommend insurance for all purchases.</p>
          </div>
        </section>

        {/* International Shipping */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            International <span className="text-bcs-rust">Shipping</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>At this time, Bridge City Soles ships to domestic U.S. addresses only. We do not currently offer international shipping.</p>
            <p>We are working on expanding our shipping options in the future. Follow us on Instagram <a href="https://www.instagram.com/bridgecitysolesportland/" target="_blank" rel="noopener noreferrer" className="text-bcs-rust hover:text-bcs-rust2 underline">@bridgecitysolesportland</a> for updates on when international shipping becomes available.</p>
          </div>
        </section>

        {/* P.O. Box */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            P.O. Box <span className="text-bcs-rust">Deliveries</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We accept P.O. Box addresses for shipments via <strong className="text-bcs-white">USPS only</strong>. UPS and FedEx cannot deliver to P.O. Box addresses.</p>
            <p>If you provide a P.O. Box address, your order will automatically be shipped via USPS Priority Mail. Please ensure your P.O. Box is large enough to accommodate a double-boxed sneaker package.</p>
          </div>
        </section>

        {/* Lost/Damaged Packages */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Lost &amp; Damaged <span className="text-bcs-rust">Packages</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>If your package is lost or arrives damaged:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-bcs-white">Lost packages:</strong> Contact us if tracking shows no updates for more than 5 business days after the estimated delivery date. We will work with the carrier to locate your package and file a claim if necessary.</li>
              <li><strong className="text-bcs-white">Damaged packages:</strong> Take photos of the packaging and item immediately upon receipt. Contact us at <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a> with photos and your order number. Do not discard any packaging.</li>
              <li>For insured orders, we will file a claim and issue a refund or replacement once the claim is approved.</li>
              <li>For uninsured orders, we will work with the carrier on your behalf but cannot guarantee a full refund.</li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Contact <span className="text-bcs-rust">Us</span>
          </h2>
          <div className="space-y-3 text-bcs-text leading-relaxed">
            <p>Questions about shipping? Reach out to us:</p>
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
            <Link href="/terms" className="px-4 py-2 border border-bcs-border rounded-lg text-sm text-bcs-text hover:border-bcs-rust hover:text-bcs-rust transition-colors">
              Terms of Service
            </Link>
            <Link href="/returns" className="px-4 py-2 border border-bcs-border rounded-lg text-sm text-bcs-text hover:border-bcs-rust hover:text-bcs-rust transition-colors">
              Return &amp; Refund Policy
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
