"use client";

import { createContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CartItem, Product, Variant } from "@/types/product";
import { products } from "@/data/products";

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

function findItemPrice(id: string): { name: string; price: number } | null {
  for (const product of products) {
    if (product.id === id) return { name: product.name, price: product.price };
    if (product.variants) {
      for (const variant of product.variants) {
        if (variant.id === id) return { name: variant.name, price: variant.price };
      }
    }
  }
  return null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getStoredCart());
    setMounted(true);
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
