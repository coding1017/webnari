import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Privacy Policy | Wook Wear",
  description: "Wook Wear privacy policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[720px] mx-auto px-10 max-md:px-5">
        <ScrollReveal>
          <h1 className="font-head font-black text-4xl text-ww-white mb-3">Privacy Policy</h1>
          <p className="text-sm text-ww-muted mb-10">Last updated: March 2026</p>
        </ScrollReveal>

        <div className="prose-ww space-y-8 text-ww-text text-sm leading-relaxed">
          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Information We Collect</h2>
            <p>When you visit our store, we automatically collect certain information about your device, including your web browser, IP address, time zone, and some of the cookies installed on your device. As you browse, we collect information about the individual web pages or products you view, what websites or search terms referred you, and how you interact with the site.</p>
            <p className="mt-3">When you make a purchase or attempt to make a purchase, we collect your name, billing address, shipping address, payment information, email address, and phone number. We refer to this information as "Order Information."</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">How We Use Your Information</h2>
            <p>We use the Order Information to fulfill orders placed through the site (including processing your payment, arranging for shipping, and providing you with invoices and/or order confirmations). We use Device Information to help us screen for potential risk and fraud, and to improve and optimize our site.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Sharing Your Information</h2>
            <p>We share your Personal Information with third parties to help us use your Personal Information as described above. We use Stripe to power our online store and payment processing. We may also share your Personal Information to comply with applicable laws and regulations or to respond to lawful requests for information we receive.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Your Rights</h2>
            <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Data Retention</h2>
            <p>When you place an order through the site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>
          </section>

          <section>
            <h2 className="font-head font-bold text-lg text-ww-white mb-3">Contact Us</h2>
            <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by email at <a href="mailto:hello@wookwear.com" className="text-ww-purple hover:text-ww-pink transition-colors">hello@wookwear.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
