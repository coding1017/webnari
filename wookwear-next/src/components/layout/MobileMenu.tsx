"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <div
      className={cn(
        "fixed top-[68px] w-[min(360px,85vw)] h-[calc(100vh-68px)] bg-[rgba(14,11,24,0.97)] backdrop-blur-[20px] border-l border-ww-border z-[999] p-8 px-7 overflow-y-auto transition-[right] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]",
        open ? "right-0" : "-right-full"
      )}
    >
      <div className="mb-7">
        <div className="font-head text-[10px] font-bold tracking-[0.2em] uppercase text-ww-muted mb-3 pb-2 border-b border-ww-border">
          Menu
        </div>
        {[
          { href: "/shop", label: "Shop" },
          { href: "/about", label: "About" },
          { href: "/gallery", label: "Gallery" },
          { href: "/contact", label: "Contact" },
          { href: "/blog", label: "Blog" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block py-3 text-base text-ww-text border-b border-[rgba(42,34,68,0.3)] hover:text-ww-pink2 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="mb-7">
        <div className="font-head text-[10px] font-bold tracking-[0.2em] uppercase text-ww-muted mb-3 pb-2 border-b border-ww-border">
          Follow
        </div>
        <a
          href="https://www.instagram.com/wook.wear"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="block py-3 text-base text-ww-text hover:text-ww-pink2 transition-colors"
        >
          Instagram @wook.wear
        </a>
      </div>

      <Link
        href="/shop"
        onClick={onClose}
        className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[image:var(--gradient)] text-ww-white font-head text-sm font-extrabold tracking-[0.08em] uppercase rounded-[12px] mt-4"
      >
        Shop the Drop
      </Link>
    </div>
  );
}
