"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { cn, formatPrice } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";

const COMMERCE_API = process.env.NEXT_PUBLIC_COMMERCE_API_URL || "https://webnari.io/commerce";
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "wookwear";

interface ItemInfo {
  name: string;
  price: number;
  img: string;
  parentName: string | null;
  inStock: boolean;
}

const infoCache = new Map<string, ItemInfo>();

async function loadInfoCache() {
  if (infoCache.size > 0) return;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("products")
    .select("id, name, price, in_stock, product_images(url, sort_order), variants(id, name, price, in_stock, variant_images(url, sort_order))");
  if (!data) return;
  for (const p of data as any[]) {
    const pImg = p.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0]?.url || "";
    infoCache.set(p.id, { name: p.name, price: p.price / 100, img: pImg, parentName: null, inStock: p.in_stock });
    for (const v of p.variants || []) {
      const vImg = v.variant_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0]?.url || pImg;
      infoCache.set(v.id, { name: v.name, price: v.price / 100, img: vImg, parentName: p.name, inStock: v.in_stock });
    }
  }
}

function getItemInfo(id: string): ItemInfo | null {
  return infoCache.get(id) || null;
}

export function CartDrawer() {
  const { items, total, isOpen, closeCart, removeItem, updateQty } = useCart();
  const [cacheLoaded, setCacheLoaded] = useState(false);

  useEffect(() => {
    loadInfoCache().then(() => setCacheLoaded(true));
  }, []);

  // Refresh cache when cart opens
  useEffect(() => {
    if (isOpen) {
      infoCache.clear();
      loadInfoCache().then(() => setCacheLoaded((v) => !v));
    }
  }, [isOpen]);

  // ── Discount Code State ──────────────────────────────
  const [discountCode, setDiscountCode] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string; label: string; amount: number; type: string; id: string;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");

  // ── Gift Card State ────────────────────────────────
  const [giftCode, setGiftCode] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);
  const [appliedGift, setAppliedGift] = useState<{
    code: string; balance: number; applied: number;
  } | null>(null);
  const [giftError, setGiftError] = useState("");

  // Reset codes when cart closes
  useEffect(() => {
    if (!isOpen) {
      setDiscountError("");
      setGiftError("");
    }
  }, [isOpen]);

  const subtotalCents = Math.round(total * 100);

  const handleApplyDiscount = useCallback(async () => {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    setDiscountError("");
    try {
      const res = await fetch(`${COMMERCE_API}/api/discount/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Store-ID": STORE_ID },
        body: JSON.stringify({ code: discountCode.trim(), subtotal: subtotalCents }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDiscountError(data.error || "Invalid code");
        return;
      }
      setAppliedDiscount({
        code: data.code,
        label: data.label,
        amount: data.discountAmount, // in cents
        type: data.type,
        id: data.id,
      });
      setDiscountCode("");
    } catch {
      setDiscountError("Could not validate code");
    } finally {
      setDiscountLoading(false);
    }
  }, [discountCode, subtotalCents]);

  const handleApplyGift = useCallback(async () => {
    if (!giftCode.trim()) return;
    setGiftLoading(true);
    setGiftError("");
    try {
      const res = await fetch(`${COMMERCE_API}/api/gift-cards/check?code=${encodeURIComponent(giftCode.trim())}`, {
        headers: { "X-Store-ID": STORE_ID },
      });
      const data = await res.json();
      if (!res.ok) {
        setGiftError(data.error || "Invalid gift card");
        return;
      }
      const remaining = subtotalCents - (appliedDiscount?.amount || 0);
      const applied = Math.min(data.balance, Math.max(0, remaining));
      setAppliedGift({
        code: data.code,
        balance: data.balance, // in cents
        applied, // in cents
      });
      setGiftCode("");
    } catch {
      setGiftError("Could not check gift card");
    } finally {
      setGiftLoading(false);
    }
  }, [giftCode, subtotalCents, appliedDiscount]);

  const discountSavings = appliedDiscount?.amount || 0;
  const giftSavings = appliedGift?.applied || 0;
  const finalTotal = Math.max(0, subtotalCents - discountSavings - giftSavings) / 100;

  const hasUnavailable = items.some((item) => {
    const info = getItemInfo(item.id);
    return info && !info.inStock;
  });

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-[rgba(8,6,14,0.6)] z-[2000] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "fixed top-0 w-[min(400px,90vw)] h-screen bg-ww-dark border-l border-ww-border z-[2001] flex flex-col transition-[right] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen ? "right-0" : "-right-[420px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-ww-border">
          <span className="font-head font-black text-xl text-ww-white tracking-[0.04em]">YOUR CART</span>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center border border-ww-border rounded-[12px] text-ww-muted hover:border-ww-pink hover:text-ww-pink transition-all"
            aria-label="Close cart"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stock Warning */}
        {hasUnavailable && (
          <div className="px-6 py-3 bg-red-500/5 border-b border-red-500/20">
            <p className="text-xs text-red-400">
              Some items are no longer available.{" "}
              <button
                onClick={() => {
                  items.forEach((item) => {
                    const info = getItemInfo(item.id);
                    if (info && !info.inStock) removeItem(item.id);
                  });
                }}
                className="underline hover:text-red-300"
              >
                Remove unavailable items
              </button>
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-ww-muted text-sm">
              <svg className="w-12 h-12 text-ww-border mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p>Your cart is empty</p>
              <p className="text-ww-muted text-[13px]">Go find something you love!</p>
            </div>
          ) : (
            items.map((item) => {
              const info = getItemInfo(item.id);
              if (!info) return null;
              const outOfStock = !info.inStock;
              return (
                <div key={item.id} className={cn("flex gap-3.5 py-4 border-b border-[rgba(42,34,68,0.3)]", outOfStock && "opacity-50")}>
                  <div className="w-16 h-16 rounded-[12px] overflow-hidden flex-shrink-0 bg-ww-surface relative">
                    {info.img && (
                      <Image src={info.img} alt={info.name} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    {info.parentName && (
                      <div className="text-[11px] text-ww-muted mb-0.5">{info.parentName}</div>
                    )}
                    <div className={cn("font-head text-sm font-bold text-ww-white mb-0.5", outOfStock && "line-through")}>
                      {info.name}
                    </div>
                    {outOfStock ? (
                      <div className="text-[13px] text-red-400 mb-2">Sold out</div>
                    ) : (
                      <div className="text-[13px] text-ww-purple2 mb-2">{formatPrice(info.price)}</div>
                    )}
                    {!outOfStock && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-ww-surface border border-ww-border rounded-md text-ww-text text-sm hover:border-ww-purple hover:text-ww-white transition-all"
                        >
                          -
                        </button>
                        <span className="font-head text-sm font-bold text-ww-white min-w-[20px] text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-ww-surface border border-ww-border rounded-md text-ww-text text-sm hover:border-ww-purple hover:text-ww-white transition-all"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-ww-muted text-xs font-head tracking-[0.05em] hover:text-ww-pink transition-colors self-start"
                  >
                    REMOVE
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-ww-border">
            {/* Discount Code */}
            <div className="px-6 pt-4 pb-2">
              {appliedDiscount ? (
                <div className="flex items-center justify-between bg-ww-surface/60 border border-ww-neon/20 rounded-[10px] px-3.5 py-2.5">
                  <div>
                    <span className="text-[11px] font-head tracking-[0.06em] text-ww-neon uppercase">Discount</span>
                    <div className="text-[13px] text-ww-white font-head font-bold">{appliedDiscount.code} <span className="text-ww-muted font-normal text-[12px]">({appliedDiscount.label})</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-ww-neon font-head font-bold">-{formatPrice(discountSavings / 100)}</span>
                    <button
                      onClick={() => setAppliedDiscount(null)}
                      className="text-ww-muted hover:text-ww-pink transition-colors text-[11px] font-head tracking-[0.04em]"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                      placeholder="Discount code"
                      className="flex-1 bg-ww-surface border border-ww-border rounded-[10px] px-3.5 py-2.5 text-[13px] text-ww-white placeholder:text-ww-muted/50 outline-none focus:border-ww-purple transition-colors font-head tracking-[0.02em]"
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={discountLoading || !discountCode.trim()}
                      className="px-4 py-2.5 bg-ww-surface border border-ww-border rounded-[10px] text-[12px] font-head font-bold tracking-[0.08em] text-ww-purple2 uppercase hover:border-ww-purple hover:text-ww-white transition-all disabled:opacity-40"
                    >
                      {discountLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {discountError && <p className="text-[11px] text-red-400 mt-1.5 px-1">{discountError}</p>}
                </div>
              )}
            </div>

            {/* Gift Card */}
            <div className="px-6 pb-3">
              {appliedGift ? (
                <div className="flex items-center justify-between bg-ww-surface/60 border border-ww-purple/20 rounded-[10px] px-3.5 py-2.5">
                  <div>
                    <span className="text-[11px] font-head tracking-[0.06em] text-ww-purple2 uppercase">Gift Card</span>
                    <div className="text-[13px] text-ww-white font-head font-bold">{appliedGift.code} <span className="text-ww-muted font-normal text-[12px]">(bal: {formatPrice(appliedGift.balance / 100)})</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-ww-purple2 font-head font-bold">-{formatPrice(giftSavings / 100)}</span>
                    <button
                      onClick={() => setAppliedGift(null)}
                      className="text-ww-muted hover:text-ww-pink transition-colors text-[11px] font-head tracking-[0.04em]"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={giftCode}
                      onChange={(e) => { setGiftCode(e.target.value); setGiftError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyGift()}
                      placeholder="Gift card code"
                      className="flex-1 bg-ww-surface border border-ww-border rounded-[10px] px-3.5 py-2.5 text-[13px] text-ww-white placeholder:text-ww-muted/50 outline-none focus:border-ww-purple transition-colors font-head tracking-[0.02em]"
                    />
                    <button
                      onClick={handleApplyGift}
                      disabled={giftLoading || !giftCode.trim()}
                      className="px-4 py-2.5 bg-ww-surface border border-ww-border rounded-[10px] text-[12px] font-head font-bold tracking-[0.08em] text-ww-purple2 uppercase hover:border-ww-purple hover:text-ww-white transition-all disabled:opacity-40"
                    >
                      {giftLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {giftError && <p className="text-[11px] text-red-400 mt-1.5 px-1">{giftError}</p>}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="px-6 pb-5 pt-2">
              <div className="flex justify-between mb-1 text-[13px] text-ww-muted">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between mb-1 text-[13px] text-ww-neon">
                  <span>Discount ({appliedDiscount.label})</span>
                  <span>-{formatPrice(discountSavings / 100)}</span>
                </div>
              )}
              {appliedGift && (
                <div className="flex justify-between mb-1 text-[13px] text-ww-purple2">
                  <span>Gift Card</span>
                  <span>-{formatPrice(giftSavings / 100)}</span>
                </div>
              )}
              <div className="flex justify-between mt-2 pt-2 border-t border-ww-border/50 font-head text-base font-bold text-ww-white">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-5">
              <a
                href="https://www.instagram.com/wook.wear"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "block w-full py-3.5 text-center bg-[image:var(--gradient)] text-ww-white font-head text-sm font-extrabold tracking-[0.1em] uppercase rounded-[12px] border-none cursor-pointer hover:shadow-[0_0_32px_rgba(255,45,155,0.3)] transition-all",
                  hasUnavailable && "opacity-50 pointer-events-none"
                )}
              >
                DM to Order
              </a>
              <p className="text-center text-[11px] text-ww-muted mt-2">
                Orders placed via Instagram DM
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
