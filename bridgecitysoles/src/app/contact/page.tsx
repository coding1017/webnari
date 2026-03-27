'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="text-center mb-10">
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
          Get in <span className="text-bcs-teal">Touch</span>
        </h1>
        <p className="text-lg text-bcs-text">Questions about a product? Want to sell or trade? We&apos;re here to help.</p>
      </div>

      {submitted ? (
        <div className="text-center bg-bcs-surface rounded-xl border border-bcs-teal/30 p-12">
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B3FA0" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
          <p className="text-bcs-text">We&apos;ll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-bcs-surface rounded-xl border border-bcs-border p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-2">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-2">Subject</label>
            <select className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white focus:outline-none focus:border-bcs-teal">
              <option>General Inquiry</option>
              <option>Buying a Sneaker</option>
              <option>Selling / Trading</option>
              <option>Order Status</option>
              <option>Consignment</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bcs-muted mb-2">Message</label>
            <textarea
              required
              rows={5}
              className="w-full px-4 py-3 bg-bcs-dark border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal resize-none"
              placeholder="What can we help you with?"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-bcs-teal text-bcs-black font-bold uppercase tracking-wide rounded-lg hover:bg-bcs-teal2 transition-colors font-[family-name:var(--font-barlow-condensed)] text-lg"
          >
            Send Message
          </button>
        </form>
      )}

      {/* Quick contact */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center bg-bcs-surface rounded-xl border border-bcs-border p-5">
          <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B3FA0" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 013.12 4.18 2 2 0 015.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          <p className="text-sm font-medium">Call Us</p>
          <a href="tel:5039498643" className="text-sm text-bcs-teal">(503) 949-8643</a>
        </div>
        <div className="text-center bg-bcs-surface rounded-xl border border-bcs-border p-5">
          <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B3FA0" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.5" fill="#6B3FA0" stroke="none" />
          </svg>
          <p className="text-sm font-medium">DM Us</p>
          <a href="https://www.instagram.com/bridgecitysolesportland/" target="_blank" rel="noopener noreferrer" className="text-sm text-bcs-teal">@bridgecitysolesportland</a>
        </div>
        <div className="text-center bg-bcs-surface rounded-xl border border-bcs-border p-5">
          <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B3FA0" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-sm font-medium">Visit Us</p>
          <p className="text-sm text-bcs-teal">SE Hawthorne, PDX</p>
        </div>
      </div>
    </div>
  );
}
