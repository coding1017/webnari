"use client";

export function ShareButtons({ name, url }: { name: string; url: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`Check out ${name} by Wook Wear!`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-xs text-ww-muted font-head tracking-[0.1em] uppercase">Share:</span>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="w-8 h-8 rounded-full bg-ww-surface border border-ww-border flex items-center justify-center text-ww-muted hover:text-ww-white hover:border-ww-purple transition-all"
        aria-label="Copy link"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-6.06a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      </button>

      {/* Twitter/X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-ww-surface border border-ww-border flex items-center justify-center text-ww-muted hover:text-ww-white hover:border-ww-purple transition-all"
        aria-label="Share on X"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-ww-surface border border-ww-border flex items-center justify-center text-ww-muted hover:text-ww-white hover:border-ww-purple transition-all"
        aria-label="Share on Facebook"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Text/SMS */}
      <a
        href={`sms:?body=${encodedText}%20${encodedUrl}`}
        className="w-8 h-8 rounded-full bg-ww-surface border border-ww-border flex items-center justify-center text-ww-muted hover:text-ww-white hover:border-ww-purple transition-all"
        aria-label="Share via text"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </a>
    </div>
  );
}
