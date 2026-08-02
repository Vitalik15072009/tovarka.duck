"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { CartItem } from "@/types";

const STORAGE_KEY = "tovarkaduck_cart_v1";

interface PromoState {
  code: string;
  discountPct?: number;
  discountAmt?: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string | null, color?: string | null) => void;
  updateQuantity: (productId: string, size: string | null | undefined, color: string | null | undefined, quantity: number) => void;
  clear: () => void;
  promo: PromoState | null;
  applyPromo: (promo: PromoState) => void;
  removePromo: () => void;
  subtotal: number;
  discountTotal: number;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(productId: string, size?: string | null, color?: string | null) {
  return `${productId}::${size ?? ""}::${color ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<PromoState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items ?? []);
        setPromo(parsed.promo ?? null);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, promo }));
  }, [items, promo, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = itemKey(item.productId, item.size, item.color);
      const existingIdx = prev.findIndex(
        (i) => itemKey(i.productId, i.size, i.color) === key
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        const newQty = Math.min(next[existingIdx].quantity + item.quantity, item.maxQty);
        next[existingIdx] = { ...next[existingIdx], quantity: newQty };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string, size?: string | null, color?: string | null) => {
    setItems((prev) => prev.filter((i) => itemKey(i.productId, i.size, i.color) !== itemKey(productId, size, color)));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string | null | undefined, color: string | null | undefined, quantity: number) => {
      setItems((prev) =>
        prev.map((i) => {
          if (itemKey(i.productId, i.size, i.color) !== itemKey(productId, size, color)) return i;
          const clamped = Math.max(1, Math.min(quantity, i.maxQty));
          return { ...i, quantity: clamped };
        })
      );
    },
    []
  );

  const clear = useCallback(() => {
    setItems([]);
    setPromo(null);
  }, []);

  const applyPromo = useCallback((p: PromoState) => setPromo(p), []);
  const removePromo = useCallback(() => setPromo(null), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const discountTotal = useMemo(() => {
    if (!promo) return 0;
    if (promo.discountPct) return Math.round((subtotal * promo.discountPct) / 100);
    if (promo.discountAmt) return Math.min(promo.discountAmt, subtotal);
    return 0;
  }, [promo, subtotal]);

  const total = Math.max(0, subtotal - discountTotal);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    promo,
    applyPromo,
    removePromo,
    subtotal,
    discountTotal,
    total,
    count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
