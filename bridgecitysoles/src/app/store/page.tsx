import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Store Location',
  description: "Bridge City Soles PDX - Portland's trusted source for authentic sneakers and streetwear. Now online.",
};

export default function StorePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
          Visit Our <span className="text-bcs-teal">Store</span>
        </h1>
        <p className="text-lg text-bcs-text">Come see 500+ styles in person</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map */}
        <div className="aspect-square lg:aspect-auto lg:min-h-[400px] bg-bcs-surface rounded-xl border border-bcs-border overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.4!2d-122.6368!3d45.5122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDMwJzQ0LjAiTiAxMjLCsDM4JzEyLjUiVw!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 400 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bridge City Soles Location"
          />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Location
            </h2>
            <p className="text-bcs-text mb-3">Portland, OR<br />Now Shopping Online</p>
            <a
              href="https://instagram.com/bridgecitysolesportland"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-bcs-teal hover:text-bcs-teal2 transition-colors"
            >
              Open in Google Maps
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          </div>

          <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Hours
            </h2>
            <div className="space-y-2 text-sm">
              {[
                { day: 'Monday', hours: '10:00 AM – 8:00 PM' },
                { day: 'Tuesday', hours: '10:00 AM – 8:00 PM' },
                { day: 'Wednesday', hours: '10:00 AM – 8:00 PM' },
                { day: 'Thursday', hours: '10:00 AM – 8:00 PM' },
                { day: 'Friday', hours: '10:00 AM – 8:00 PM' },
                { day: 'Saturday', hours: '10:00 AM – 8:00 PM' },
                { day: 'Sunday', hours: '11:00 AM – 6:00 PM' },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between">
                  <span className="text-bcs-text">{day}</span>
                  <span className="text-bcs-white font-medium">{hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 013.12 4.18 2 2 0 015.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              Contact
            </h2>
            <div className="space-y-2">
              <a href="tel:5039498643" className="block text-sm text-bcs-text hover:text-bcs-teal transition-colors">(503) 949-8643</a>
              <a href="https://www.instagram.com/bridgecitysolesportland/" target="_blank" rel="noopener noreferrer" className="block text-sm text-bcs-text hover:text-bcs-teal transition-colors">@bridgecitysolesportland</a>
            </div>
          </div>

          {/* Services */}
          <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase mb-4">Services</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Buy', 'Sell', 'Trade', 'Consign'].map(service => (
                <div key={service} className="flex items-center gap-2 text-sm text-bcs-text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
