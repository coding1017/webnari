"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "How do drops work?", a: "New items drop every Wednesday on Instagram and the shop. Follow @wook.wear to get notified. Items are one-of-a-kind, so once they're sold, they're gone!" },
  { q: "Do you take custom orders?", a: "Sometimes! Reach out through the contact form with your idea and I'll let you know if it's something I can make." },
  { q: "What's your shipping policy?", a: "Orders ship within 3-5 business days via USPS. Tracking is provided for every order." },
  { q: "Can I return or exchange?", a: "Due to the handmade, one-of-a-kind nature of each piece, all sales are final. If there's an issue with your order, please reach out and I'll make it right." },
  { q: "Do you ship internationally?", a: "Not yet, but it's on the roadmap! Currently shipping within the US only." },
  { q: "Where can I see your work in person?", a: "Meesh sets up at festivals and markets throughout the year. Follow @wook.wear on Instagram for event announcements." },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen pt-[120px] pb-0 max-md:pt-[100px]">
      {/* Header */}
      <section className="text-center pb-16 max-md:pb-10">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <ScrollReveal>
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Get in Touch
            </div>
            <h1 className="font-head font-black text-[clamp(42px,6vw,72px)] leading-[0.95] text-ww-white mb-6">
              Let&apos;s <span className="gradient-text">Talk</span>
            </h1>
            <p className="text-lg text-ww-text max-w-[520px] mx-auto leading-relaxed">
              Have a question, a custom order idea, or just want to say hi? Drop a message and Meesh will get back to you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="pb-24 max-md:pb-16">
        <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
          <div className="grid grid-cols-[1.2fr_1fr] gap-16 max-lg:grid-cols-1 max-lg:gap-10">
            {/* Form */}
            <ScrollReveal>
              <div className="bg-ww-surface border border-ww-border rounded-[20px] p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(57,255,20,0.1)] border border-[rgba(57,255,20,0.3)] flex items-center justify-center">
                      <svg className="w-8 h-8 text-ww-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3 className="font-head font-black text-xl text-ww-white mb-2">Message Sent!</h3>
                    <p className="text-sm text-ww-text">Meesh will get back to you within 24-48 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                      <label className="block font-head text-xs font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Name</label>
                      <input type="text" required placeholder="Your name" className="w-full px-4 py-3 bg-ww-black border border-ww-border rounded-[12px] text-ww-white text-sm outline-none focus:border-ww-purple transition-colors placeholder:text-ww-muted/50" />
                    </div>
                    <div>
                      <label className="block font-head text-xs font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Email</label>
                      <input type="email" required placeholder="your@email.com" className="w-full px-4 py-3 bg-ww-black border border-ww-border rounded-[12px] text-ww-white text-sm outline-none focus:border-ww-purple transition-colors placeholder:text-ww-muted/50" />
                    </div>
                    <div>
                      <label className="block font-head text-xs font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Subject</label>
                      <select required className="w-full px-4 py-3 bg-ww-black border border-ww-border rounded-[12px] text-ww-white text-sm outline-none focus:border-ww-purple transition-colors">
                        <option value="">Select a topic</option>
                        <option>General Inquiry</option>
                        <option>Custom Order</option>
                        <option>Wholesale</option>
                        <option>Collaboration</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-head text-xs font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Message</label>
                      <textarea required rows={5} placeholder="Tell me what's on your mind..." className="w-full px-4 py-3 bg-ww-black border border-ww-border rounded-[12px] text-ww-white text-sm outline-none focus:border-ww-purple transition-colors resize-none placeholder:text-ww-muted/50" />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-[image:var(--gradient)] text-ww-white font-head text-sm font-extrabold tracking-[0.1em] uppercase rounded-[12px] border-none cursor-pointer hover:shadow-[0_0_32px_rgba(255,45,155,0.3)] transition-all mt-2">
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>

            {/* Info Card */}
            <ScrollReveal delay={1}>
              <div className="bg-ww-surface border border-ww-border rounded-[20px] p-8">
                <h3 className="font-head font-extrabold text-lg text-ww-white mb-6">Other Ways to Reach Me</h3>
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-ww-purple2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                    </div>
                    <div>
                      <div className="font-head text-sm font-bold text-ww-white mb-1">Instagram DM</div>
                      <a href="https://www.instagram.com/wook.wear" target="_blank" rel="noopener noreferrer" className="text-sm text-ww-pink hover:text-ww-pink2 transition-colors">@wook.wear</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-ww-purple2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div>
                      <div className="font-head text-sm font-bold text-ww-white mb-1">Email</div>
                      <a href="mailto:hello@wookwear.com" className="text-sm text-ww-pink hover:text-ww-pink2 transition-colors">hello@wookwear.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-ww-purple2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                      <div className="font-head text-sm font-bold text-ww-white mb-1">Response Time</div>
                      <p className="text-sm text-ww-text">Usually responds within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-ww-purple2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <div className="font-head text-sm font-bold text-ww-white mb-1">Location</div>
                      <p className="text-sm text-ww-text">Based in the Pacific Northwest, USA</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-ww-dark max-md:py-16" id="faq">
        <div className="max-w-[800px] mx-auto px-10 max-md:px-5">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Need Answers?
            </div>
            <h2 className="font-head font-black text-[clamp(36px,5vw,56px)] leading-[1.05] text-ww-white">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </ScrollReveal>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={Math.min(i + 1, 4)}>
                <div className="bg-ww-surface border border-ww-border rounded-[16px] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 px-6 text-left"
                  >
                    <span className="font-head text-sm font-bold text-ww-white pr-4">{faq.q}</span>
                    <svg className={cn("w-5 h-5 text-ww-muted flex-shrink-0 transition-transform", openFaq === i && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-sm text-ww-text leading-relaxed border-t border-ww-border pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
