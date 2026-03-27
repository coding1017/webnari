'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { CartItem } from '@/types/cart';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (inventoryId: string) => void;
  updateQty: (inventoryId: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toast: string | null;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'bcs_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.inventoryId === item.inventoryId);
      if (existing) {
        return prev.map(i =>
          i.inventoryId === item.inventoryId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
    showToast(`${item.productName} (Size ${item.size}) added to cart`);
  }, [showToast]);

  const removeItem = useCallback((inventoryId: string) => {
    setItems(prev => prev.filter(i => i.inventoryId !== inventoryId));
  }, []);

  const updateQty = useCallback((inventoryId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(inventoryId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.inventoryId === inventoryId ? { ...i, quantity: qty } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, isOpen, totalItems, totalPrice, addItem, removeItem, updateQty, clearCart, openCart, closeCart, toast }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
