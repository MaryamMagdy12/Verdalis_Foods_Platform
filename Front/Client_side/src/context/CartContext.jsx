import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { resolveUnitPrice } from "../utils/checkout";
import { clampQuantity, minQuantity, maxQuantity } from "../utils/productQuantity";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "verdalis_cart_v1";

const CartContext = createContext(null);

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (_) {}
}

function normalizeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    description: product.description,
    SKU: product.SKU ?? product.sku,
    sku: product.sku ?? product.SKU,
    category: product.category,
    price: product.price != null ? Number(product.price) : null,
    wholesale_price: product.wholesale_price != null ? Number(product.wholesale_price) : null,
    stock: product.stock != null ? Number(product.stock) : null,
    min_quantity: product.min_quantity != null ? Number(product.min_quantity) : 1,
    wholesale_min_quantity: product.wholesale_min_quantity != null ? Number(product.wholesale_min_quantity) : 1,
    in_stock: product.in_stock !== false && (product.stock == null || Number(product.stock) > 0),
  };
}

function withUnitPrice(product, isRetailer) {
  const normalized = normalizeProduct(product);
  return {
    product: normalized,
    unitPrice: resolveUnitPrice(normalized, isRetailer),
  };
}

export function CartProvider({ children }) {
  const { isRetailer } = useAuth();
  const [items, setItems] = useState(loadStored);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    persist(items);
  }, [items]);

  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => {
        const normalized = normalizeProduct(item.product);
        return {
          ...item,
          product: normalized,
          unitPrice: resolveUnitPrice(normalized, isRetailer),
          qty: clampQuantity(item.qty, normalized, isRetailer),
        };
      })
    );
  }, [isRetailer]);

  const addItem = useCallback(
    (product, qty = 1) => {
      if (!product?.id) return { ok: false, error: "Invalid product." };
      const normalized = normalizeProduct(product);
      if (!normalized.in_stock || maxQuantity(normalized) <= 0) {
        const msg = `${normalized.name} is out of stock.`;
        setCartError(msg);
        return { ok: false, error: msg };
      }

      const id = String(product.id);
      const min = minQuantity(normalized, isRetailer);
      const { product: stored, unitPrice } = withUnitPrice(product, isRetailer);

      setItems((prev) => {
        const idx = prev.findIndex((i) => String(i.product.id) === id);
        const currentQty = idx >= 0 ? prev[idx].qty : 0;
        const requested = currentQty + qty;

        if (currentQty === 0 && requested < min) {
          setCartError(`Minimum order for ${normalized.name} is ${min}.`);
        } else {
          setCartError("");
        }

        const nextQty = clampQuantity(requested, normalized, isRetailer);

        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], product: stored, unitPrice, qty: nextQty };
          return next;
        }
        return [...prev, { product: stored, qty: clampQuantity(qty, normalized, isRetailer), unitPrice }];
      });

      return { ok: true };
    },
    [isRetailer]
  );

  const setQty = useCallback(
    (productId, qty) => {
      const id = String(productId);
      setCartError("");
      setItems((prev) => {
        if (qty < 1) return prev.filter((i) => String(i.product.id) !== id);
        return prev.map((i) => {
          if (String(i.product.id) !== id) return i;
          return { ...i, qty: clampQuantity(qty, i.product, isRetailer) };
        });
      });
    },
    [isRetailer]
  );

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => String(i.product.id) !== String(productId)));
    setCartError("");
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCartError("");
  }, []);

  const count = useMemo(() => items.reduce((n, i) => n + (i.qty || 1), 0), [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      cartError,
      isRetailerPricing: !!isRetailer,
      addItem,
      setQty,
      removeItem,
      clearCart,
    }),
    [items, count, cartError, isRetailer, addItem, setQty, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
