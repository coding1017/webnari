"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();

  const links = [
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] h-[68px] bg-[rgba(10,5,20,0.88)] backdrop-blur-[14px] saturate-[180%] border-b border-[rgba(255,45,155,0.15)]">
        <div className="max-w-[1200px] mx-auto h-full flex items-center px-10 max-md:px-5">
          <Link href="/" className="font-head font-black text-[22px] text-ww-white tracking-[0.06em] flex items-center gap-2.5">
            WOOK <span className="gradient-text">WEAR</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 ml-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium text-ww-text rounded-[12px] transition-colors hover:text-ww-white hover:bg-[rgba(168,85,247,0.06)]",
                  pathname === link.href && "text-ww-pink"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative group">
              <Link
                href="/blog"
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium text-ww-text rounded-[12px] transition-colors hover:text-ww-white hover:bg-[rgba(168,85,247,0.06)]",
                  pathname.startsWith("/blog") && "text-ww-pink"
                )}
              >
                Blog
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 bg-ww-surface border border-ww-border rounded-lg p-1.5 min-w-[120px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all translate-y-1 group-hover:translate-y-0 shadow-[0_8px_24px_rgba(0,0,0,0.3)] z-[1001]">
                <Link href="/blog" className="block px-4 py-2 text-[13px] font-medium text-ww-text hover:text-ww-white hover:bg-[rgba(168,85,247,0.08)] rounded whitespace-nowrap">
                  All Posts
                </Link>
                <Link href="/glossary" className="block px-4 py-2 text-[13px] font-medium text-ww-text hover:text-ww-white hover:bg-[rgba(168,85,247,0.08)] rounded whitespace-nowrap">
                  Craft Glossary
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/wishlist"
            className="relative flex items-center justify-center w-[42px] h-[42px] ml-3 lg:ml-3 max-lg:ml-auto rounded-[12px] hover:bg-[rgba(168,85,247,0.08)] transition-colors"
            aria-label="Wishlist"
          >
            <svg className="w-[20px] h-[20px] text-ww-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <span
              className={cn(
                "absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-ww-pink text-ww-white font-head text-[10px] font-extrabold flex items-center justify-center rounded-full px-1 transition-all",
                wishlistCount > 0 ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )}
            >
              {wishlistCount}
            </span>
          </Link>

          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-[42px] h-[42px] ml-1 rounded-[12px] hover:bg-[rgba(168,85,247,0.08)] transition-colors"
            aria-label="Shopping cart"
          >
            <svg className="w-[22px] h-[22px] text-ww-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span
              className={cn(
                "absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-ww-pink text-ww-white font-head text-[10px] font-extrabold flex items-center justify-center rounded-full px-1 transition-all",
                count > 0 ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )}
            >
              {count}
            </span>
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "lg:hidden flex flex-col gap-[5px] bg-none border-none cursor-pointer p-1 z-[1001] ml-2",
              mobileOpen && "open"
            )}
            aria-label="Menu"
          >
            <span className={cn("block w-6 h-0.5 bg-ww-white transition-all duration-300", mobileOpen && "translate-y-[7px] rotate-45")} />
            <span className={cn("block w-6 h-0.5 bg-ww-white transition-all duration-300", mobileOpen && "opacity-0")} />
            <span className={cn("block w-6 h-0.5 bg-ww-white transition-all duration-300", mobileOpen && "-translate-y-[7px] -rotate-45")} />
          </button>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
