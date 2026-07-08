import { useEffect, useMemo, useState } from "react";

function cartKey(storeId) {
  return `pedicampos.cart.${storeId}`;
}

function readCart(storeId) {
  if (!storeId) return [];
  try {
    return JSON.parse(window.localStorage.getItem(cartKey(storeId))) || [];
  } catch {
    return [];
  }
}

export function useCart(storeId) {
  const [items, setItems] = useState(() => readCart(storeId));

  useEffect(() => {
    setItems(readCart(storeId));
  }, [storeId]);

  useEffect(() => {
    if (storeId) window.localStorage.setItem(cartKey(storeId), JSON.stringify(items));
  }, [items, storeId]);

  const totals = useMemo(() => {
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    return { quantity, subtotal };
  }, [items]);

  function addItem(item) {
    setItems((current) => [
      ...current,
      {
        ...item,
        cartId: crypto.randomUUID(),
      },
    ]);
  }

  function updateQuantity(cartId, quantity) {
    setItems((current) =>
      current
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
        .filter(Boolean)
    );
  }

  function removeItem(cartId) {
    setItems((current) => current.filter((item) => item.cartId !== cartId));
  }

  function clearCart() {
    setItems([]);
  }

  return {
    items,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
