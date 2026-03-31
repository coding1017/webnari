import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Bridge City Soles',
  description: 'Learn about the Bridge City Soles return and refund policy, including our 3-day inspection window and authentication dispute process.',
};

export default function ReturnsPage() {
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
          Return &amp; Refund <span className="text-bcs-rust">Policy</span>
        </h1>
        <p className="text-sm text-bcs-muted">Last Updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Overview */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <p className="text-bcs-text leading-relaxed">
            At Bridge City Soles, we want you to be completely satisfied with your purchase. Because we deal in pre-owned and authenticated sneakers and streetwear, our return policy is designed to be fair to both buyers and sellers. Please read the following terms carefully before making a purchase.
          </p>
        </section>

        {/* Inspection Window */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            3-Day Inspection <span className="text-bcs-rust">Window</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>You have <strong className="text-bcs-white">3 calendar days</strong> from the date of delivery to inspect your item and initiate a return if needed. This window begins on the day the tracking information confirms delivery.</p>
            <p>During this period, please inspect your item carefully to ensure it matches the listing description, photos, and stated condition. If you identify any discrepancies, contact us immediately.</p>
          </div>
        </section>

        {/* Return Conditions */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Return <span className="text-bcs-rust">Conditions</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>To be eligible for a return, items must meet the following conditions:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>The item must be in the exact same condition as when it was received</li>
              <li>All original packaging, tags, and accessories must be included</li>
              <li>The item must not have been worn, washed, or altered in any way</li>
              <li>The return must be initiated within the 3-day inspection window</li>
            </ul>
            <p className="font-medium text-bcs-white">Items that have been worn, damaged by the buyer, or altered after delivery are not eligible for return under any circumstances.</p>
          </div>
        </section>

        {/* Authentication Disputes */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Authentication <span className="text-bcs-rust">Disputes</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We authenticate every item before it ships. However, if you have concerns about the authenticity of an item you received, we take these claims seriously.</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Contact us within <strong className="text-bcs-white">48 hours</strong> of delivery with your concern and any supporting evidence (photos, third-party authentication results, etc.)</li>
              <li>We will review the claim and respond within 48 hours</li>
              <li>If the item is confirmed inauthentic, you will receive a full refund including return shipping costs</li>
              <li>Third-party authentication services may be used to resolve disputes at our discretion</li>
            </ul>
          </div>
        </section>

        {/* Refund Process */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Refund <span className="text-bcs-rust">Process</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>Once your return is approved and we receive the item back:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We will inspect the returned item to confirm it meets the return conditions</li>
              <li>Approved refunds will be issued to your original payment method</li>
              <li>Please allow <strong className="text-bcs-white">5-7 business days</strong> for the refund to appear on your statement after processing</li>
              <li>Original shipping costs are non-refundable unless the return is due to our error or an authenticity issue</li>
              <li>Return shipping costs are the responsibility of the buyer unless otherwise specified</li>
            </ul>
          </div>
        </section>

        {/* Exchanges */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Exchanges &amp; <span className="text-bcs-rust">Size Swaps</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>We offer exchanges for different sizes when available. Because our inventory consists of unique, pre-owned items, exchanges are subject to availability.</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Contact us within the 3-day inspection window to request an exchange</li>
              <li>If the desired size is available, we will arrange the exchange at no additional shipping cost</li>
              <li>If the desired size is not available, you may opt for a refund instead</li>
              <li>Price differences between sizes may apply</li>
            </ul>
          </div>
        </section>

        {/* Consignment Items */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Consignment <span className="text-bcs-rust">Items</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>Items sold on consignment through Bridge City Soles are subject to the same return policy as all other products. Consignment items are fully authenticated and quality-checked before listing.</p>
            <p>Returns on consignment items follow the standard 3-day inspection window and condition requirements. Refunds for consignment items may take an additional 2-3 business days to process.</p>
          </div>
        </section>

        {/* Damaged/Wrong Item */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Damaged or Wrong <span className="text-bcs-rust">Item</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>If you receive a damaged item or an item that does not match your order:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Contact us immediately at <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a> with photos of the issue</li>
              <li>Do not discard any packaging materials until the issue is resolved</li>
              <li>We will provide a prepaid return shipping label at no cost to you</li>
              <li>You will receive a full refund or replacement (if available) once we receive the item back</li>
            </ul>
          </div>
        </section>

        {/* How to Initiate */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            How to Initiate a <span className="text-bcs-rust">Return</span>
          </h2>
          <div className="space-y-4 text-bcs-text leading-relaxed">
            <p>To start a return, please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Email us at <a href="mailto:info@bridgecitysoles.com" className="text-bcs-rust hover:text-bcs-rust2 underline">info@bridgecitysoles.com</a> with the subject line &quot;Return Request&quot;</li>
              <li>Include your order number, the item you wish to return, and the reason for the return</li>
              <li>Attach photos of the item in its current condition</li>
              <li>Wait for our team to review and approve the return (typically within 24 hours)</li>
              <li>Ship the item back using the instructions provided in our approval email</li>
            </ol>
            <p>Do not ship items back without prior authorization. Unauthorized returns may not be processed.</p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-bcs-surface rounded-xl border-[3px] border-bcs-gold/50 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4 text-bcs-white">
            Contact <span className="text-bcs-rust">Us</span>
          </h2>
          <div className="space-y-3 text-bcs-text leading-relaxed">
            <p>Questions about returns or refunds? Reach out to us:</p>
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
            <Link href="/shipping" className="px-4 py-2 border border-bcs-border rounded-lg text-sm text-bcs-text hover:border-bcs-rust hover:text-bcs-rust transition-colors">
              Shipping Policy
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
