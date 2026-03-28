"use client";

import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/_actions/auth";
import { useState } from "react";

const breadcrumbLabels: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  orders: "Orders",
  blog: "Blog",
  glossary: "Glossary",
  reviews: "Reviews",
  subscribers: "Subscribers",
  settings: "Settings",
  new: "New",
};

export function Topbar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  // Build breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: breadcrumbLabels[seg] || decodeURIComponent(seg),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="h-16 bg-ww-dark border-b border-ww-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-ww-border">/</span>}
            <span
              className={
                crumb.isLast ? "text-ww-white font-medium" : "text-ww-muted"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 text-sm text-ww-muted hover:text-ww-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-ww-surface border border-ww-border flex items-center justify-center">
            <span className="text-xs font-medium text-ww-purple">
              {userEmail[0].toUpperCase()}
            </span>
          </div>
          <span className="max-md:hidden">{userEmail}</span>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-ww-surface border border-ww-border rounded-lg shadow-xl z-50 py-1">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 text-sm text-ww-muted hover:text-ww-white hover:bg-ww-dark transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
