import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Shipping & Returns | Wook Wear",
  description: "Wook Wear shipping information and return policy for handmade pouches, bags, and accessories.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[720px] mx-auto px-10 max-md:px-5">
        <ScrollReveal>
          <h1 className="font-head font-black text-4xl text-ww-white mb-3">Shipping & Returns</h1>
          <p className="text-sm text-ww-muted mb-10">Last updated: March 2026</p>
        </ScrollReveal>

        <div className="prose-ww space-y-8 text-ww-text text-sm leading-relaxed">
          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Shipping</h2>
            <p>All orders ship from the Pacific Northwest (PNW). Orders are typically processed within 1-3 business days. Since every item is handmade, please allow additional time during drop weeks when demand is high.</p>

            <div className="mt-4 bg-ww-surface border border-ww-border rounded-[16px] p-5 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-ww-white">Domestic (US)</span>
                <span>3-7 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-ww-white">International</span>
                <span>Contact us for availability</span>
              </div>
            </div>

            <p className="mt-4">Tracking information will be provided via email once your order ships. Please ensure your shipping address is correct at checkout — we are not responsible for packages delivered to incorrect addresses.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Returns & Exchanges</h2>
            <p>Because every Wook Wear piece is handmade and one-of-a-kind, <strong className="text-ww-white">all sales are final</strong>. We do not accept returns or exchanges.</p>
            <p className="mt-3">If your item arrives damaged or is significantly different from what was described, please contact us within 48 hours of delivery with photos and we will work with you to make it right.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Damaged Items</h2>
            <p>If your item arrives damaged during shipping, please email us at <a href="mailto:hello@wookwear.com" className="text-ww-purple hover:text-ww-pink transition-colors">hello@wookwear.com</a> within 48 hours of delivery with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your order number</li>
              <li>Photos of the damaged item</li>
              <li>Photos of the packaging</li>
            </ul>
            <p className="mt-3">We will review your claim and respond within 2 business days.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Questions?</h2>
            <p>Reach out anytime at <a href="mailto:hello@wookwear.com" className="text-ww-purple hover:text-ww-pink transition-colors">hello@wookwear.com</a> or DM us on <a href="https://www.instagram.com/wook.wear" target="_blank" rel="noopener noreferrer" className="text-ww-purple hover:text-ww-pink transition-colors">Instagram @wook.wear</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
