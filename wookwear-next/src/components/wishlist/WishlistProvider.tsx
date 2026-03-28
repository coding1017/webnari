"use client";

import { createContext, useState, useCallback, useEffect, ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface WishlistItem {
  productId: string;
  variantId?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  count: number;
  isWishlisted: (productId: string, variantId?: string) => boolean;
  toggleWishlist: (productId: string, variantId?: string) => void;
}

export const WishlistContext = createContext<WishlistContextType | null>(null);

const SESSION_KEY = "ww_wishlist_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [sessionId, setSessionId] = useState("");

  // Load wishlist from Supabase on mount
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    if (!sid) return;

    const supabase = getSupabase();
    supabase
      .from("wishlist_items")
      .select("product_id, variant_id")
      .eq("session_id", sid)
      .then(({ data }) => {
        if (data) {
          setItems(
            data.map((row: any) => ({
              productId: row.product_id,
              variantId: row.variant_id || undefined,
            }))
          );
        }
      });
  }, []);

  const isWishlisted = useCallback(
    (productId: string, variantId?: string) => {
      return items.some(
        (item) =>
          item.productId === productId &&
          (variantId ? item.variantId === variantId : !item.variantId)
      );
    },
    [items]
  );

  const toggleWishlist = useCallback(
    (productId: string, variantId?: string) => {
      const exists = isWishlisted(productId, variantId);

      if (exists) {
        // Optimistic remove
        setItems((prev) =>
          prev.filter(
            (item) =>
              !(
                item.productId === productId &&
                (variantId ? item.variantId === variantId : !item.variantId)
              )
          )
        );

        // Sync to Supabase
        const supabase = getSupabase();
        const query = supabase
          .from("wishlist_items")
          .delete()
          .eq("session_id", sessionId)
          .eq("product_id", productId);

        if (variantId) {
          query.eq("variant_id", variantId);
        } else {
          query.is("variant_id", null);
        }
        query.then(() => {});
      } else {
        // Optimistic add
        setItems((prev) => [...prev, { productId, variantId }]);

        // Sync to Supabase
        const supabase = getSupabase();
        supabase
          .from("wishlist_items")
          .insert({
            session_id: sessionId,
            product_id: productId,
            variant_id: variantId || null,
          })
          .then(() => {});
      }
    },
    [isWishlisted, sessionId]
  );

  return (
    <WishlistContext.Provider
      value={{ items, count: items.length, isWishlisted, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
