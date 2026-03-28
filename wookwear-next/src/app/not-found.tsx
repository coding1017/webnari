import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ww-black p-4">
      <div className="text-center max-w-md">
        <div className="font-head font-black text-[120px] leading-none gradient-text mb-2">
          404
        </div>
        <h1 className="font-head font-bold text-2xl text-ww-white mb-3">
          Page Not Found
        </h1>
        <p className="text-ww-muted text-sm mb-8">
          Looks like this page wandered off to a festival and never came back.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[image:var(--gradient)] text-white font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] hover:shadow-[0_0_24px_rgba(255,45,155,0.2)] transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-ww-border text-ww-text font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] hover:border-ww-purple hover:text-ww-white transition-all"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
