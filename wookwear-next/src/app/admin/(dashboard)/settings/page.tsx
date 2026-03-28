import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-head text-2xl font-bold text-ww-white">Settings</h1>
        <p className="text-sm text-ww-muted mt-0.5">Manage your admin account and store settings</p>
      </div>

      {/* Account */}
      <div className="bg-ww-dark border border-ww-border rounded-lg p-5 space-y-4">
        <h2 className="font-head font-semibold text-ww-white">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-ww-surface border border-ww-border flex items-center justify-center">
            <span className="text-lg font-medium text-ww-purple">
              {user.email?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-ww-white">{user.email}</p>
            <p className="text-xs text-ww-muted">Admin</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-ww-dark border border-ww-border rounded-lg p-5 space-y-4">
        <h2 className="font-head font-semibold text-ww-white">Quick Links</h2>
        <div className="space-y-2">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-ww-surface transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor"><path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z" /></svg>
              </div>
              <div>
                <p className="text-sm text-ww-white">Supabase Dashboard</p>
                <p className="text-xs text-ww-muted">Manage database and storage</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-ww-muted group-hover:text-ww-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-ww-surface transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-ww-pink/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-ww-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-ww-white">View Storefront</p>
                <p className="text-xs text-ww-muted">See your live store</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-ww-muted group-hover:text-ww-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Version */}
      <div className="text-center">
        <p className="text-xs text-ww-muted/50">
          Wook Wear Admin v1.0 &middot; Built with Next.js + Supabase
        </p>
      </div>
    </div>
  );
}
