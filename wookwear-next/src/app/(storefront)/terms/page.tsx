import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Terms of Service | Wook Wear",
  description: "Wook Wear terms of service — the rules and guidelines for using our website and purchasing our products.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[720px] mx-auto px-10 max-md:px-5">
        <ScrollReveal>
          <h1 className="font-head font-black text-4xl text-ww-white mb-3">Terms of Service</h1>
          <p className="text-sm text-ww-muted mb-10">Last updated: March 2026</p>
        </ScrollReveal>

        <div className="prose-ww space-y-8 text-ww-text text-sm leading-relaxed">
          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Overview</h2>
            <p>This website is operated by Wook Wear. Throughout the site, the terms "we", "us" and "our" refer to Wook Wear. By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by these terms and conditions.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Products</h2>
            <p>All products are handmade and one-of-a-kind. Colors and details may vary slightly from photos. Certain products may be available exclusively online. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor&apos;s display of any color will be accurate.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Pricing</h2>
            <p>Prices for our products are subject to change without notice. We reserve the right to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Accuracy of Information</h2>
            <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Contact Information</h2>
            <p>Questions about the Terms of Service should be sent to <a href="mailto:hello@wookwear.com" className="text-ww-purple hover:text-ww-pink transition-colors">hello@wookwear.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
