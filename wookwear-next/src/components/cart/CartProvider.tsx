"use client";

import { createContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CartItem } from "@/types/product";
import { createBrowserClient } from "@supabase/ssr";

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  toastMessage: string | null;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clearToast: () => void;
}

export const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "ww_cart";

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

// Cache for product/variant lookups from Supabase
const itemCache = new Map<string, { name: string; price: number; inStock: boolean }>();

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function loadItemCache() {
  if (itemCache.size > 0) return;
  const supabase = getSupabase();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, in_stock, variants(id, name, price, in_stock)");
  if (!products) return;
  for (const p of products as any[]) {
    itemCache.set(p.id, { name: p.name, price: p.price / 100, inStock: p.in_stock });
    for (const v of p.variants || []) {
      itemCache.set(v.id, { name: v.name, price: v.price / 100, inStock: v.in_stock });
    }
  }
}

function findItemPrice(id: string): { name: string; price: number } | null {
  const item = itemCache.get(id);
  return item ? { name: item.name, price: item.price } : null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getStoredCart());
    setMounted(true);
    loadItemCache();
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const count = items.reduce((sum, item) => sum + item.qty, 0);

  const total = items.reduce((sum, item) => {
    const info = findItemPrice(item.id);
    return sum + (info ? info.price * item.qty : 0);
  }, 0);

  const addItem = useCallback((id: string) => {
    // Stock check
    const cached = itemCache.get(id);
    if (cached && !cached.inStock) {
      setToastMessage("This item is sold out");
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id, qty: 1 }];
    });
    const info = findItemPrice(id);
    setToastMessage(info ? `${info.name} added to cart` : "Added to cart");
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = item.qty + delta;
          return newQty <= 0 ? null : { ...item, qty: newQty };
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        isOpen,
        toastMessage,
        addItem,
        removeItem,
        updateQty,
        openCart,
        closeCart,
        clearToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
