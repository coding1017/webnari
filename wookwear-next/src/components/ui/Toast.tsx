"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export function Toast() {
  const { toastMessage, clearToast } = useCart();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(clearToast, 2200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[10000] py-3.5 px-6 bg-ww-surface border border-ww-pink rounded-[12px] text-ww-white font-head text-[13px] font-bold tracking-[0.06em] shadow-[0_8px_32px_rgba(255,45,155,0.2)] transition-transform duration-300",
        toastMessage ? "translate-y-0" : "translate-y-[120%]"
      )}
    >
      {toastMessage}
    </div>
  );
}
