import { useEffect, useMemo, useState } from "react";
import { logInfo } from "../services/logger.js";

function cartKey(storeId) {
  return `pedicampos.cart.${storeId}`;
}

function readCart(storeId) {
  if (!storeId) return { storeId: "", items: [], mismatched: false };
  try {
    const saved = JSON.parse(window.localStorage.getItem(cartKey(storeId)));
    const savedStoreId = Array.isArray(saved) ? storeId : saved?.storeId;
    const items = Array.isArray(saved) ? saved : saved?.items || [];
    if (savedStoreId && savedStoreId !== storeId) {
      window.localStorage.removeItem(cartKey(storeId));
      return { storeId: savedStoreId, items: [], mismatched: true };
    }
    return { storeId, items, mismatched: false };
  } catch {
    return { storeId, items: [], mismatched: false };
  }
}

export function useCart(storeId) {
  const [cartState, setCartState] = useState(() => readCart(storeId));
  const items = cartState.items;

  useEffect(() => {
    setCartState(readCart(storeId));
  }, [storeId]);

  useEffect(() => {
    if (storeId && cartState.storeId === storeId) {
      window.localStorage.setItem(cartKey(storeId), JSON.stringify({ storeId, items }));
      logInfo({ area: "cart", operation: "persist", storeId });
    }
  }, [cartState.storeId, items, storeId]);

  const totals = useMemo(() => {
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    return { quantity, subtotal };
  }, [items]);

  function addItem(item) {
    logInfo({ area: "cart", operation: "add_item", storeId });
    setCartState((current) => ({
      storeId,
      mismatched: false,
      items: [
        ...current.items,
        { ...item, storeId, cartId: crypto.randomUUID() },
      ],
    }));
  }

  function updateQuantity(cartId, quantity) {
    setCartState((current) => ({
      ...current,
      items: current.items
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const nextQuantity = Math.max(1, Number(quantity) || 1);
          const additionals = item.selectedAdditionals || item.addons || [];
          const unitTotal = item.unitPrice + additionals.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
          return {
            ...item,
            quantity: nextQuantity,
            total: unitTotal * nextQuantity,
          };
        })
        .filter(Boolean),
    }));
  }

  function removeItem(cartId) {
    setCartState((current) => ({ ...current, items: current.items.filter((item) => item.cartId !== cartId) }));
  }

  function clearCart() {
    setCartState({ storeId, items: [], mismatched: false });
  }

  return {
    items,
    storeId: cartState.storeId || storeId || "",
    mismatched: cartState.mismatched,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
