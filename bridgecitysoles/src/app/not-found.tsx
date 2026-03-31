import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-8xl font-black text-bcs-rust mb-2">404</h1>
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight mb-4">
          Page Not Found
        </h2>
        <p className="text-bcs-text mb-8">
          Looks like this page took an L. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-rust px-6 py-3 rounded-lg uppercase tracking-wide font-[family-name:var(--font-barlow-condensed)]">
            Back to Home
          </Link>
          <Link href="/shop" className="px-6 py-3 border-[3px] border-bcs-gold/50 hover:border-bcs-gold rounded-lg uppercase tracking-wide font-[family-name:var(--font-barlow-condensed)] font-bold transition-all">
            Shop All
          </Link>
        </div>
      </div>
    </div>
  );
}
