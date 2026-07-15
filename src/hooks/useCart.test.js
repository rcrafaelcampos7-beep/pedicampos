import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCart } from "./useCart.js";

describe("useCart", () => {
  it("adiciona item com storeId autorizado", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("cart-test");
    const { result } = renderHook(() => useCart("store-a"));
    act(() => result.current.addItem({ productId: "p1", quantity: 1, unitPrice: 10, total: 10 }));
    expect(result.current.items[0]).toMatchObject({ storeId: "store-a", cartId: "cart-test", productId: "p1" });
  });

  it("atualiza quantidade e soma adicionais gratis e pagos", () => {
    const { result } = renderHook(() => useCart("store-a"));
    act(() => result.current.addItem({
      productId: "p1", quantity: 1, unitPrice: 10, total: 15,
      selectedAdditionals: [{ price: 0 }, { price: 5 }],
    }));
    const id = result.current.items[0].cartId;
    act(() => result.current.updateQuantity(id, 2));
    expect(result.current.items[0].total).toBe(30);
    expect(result.current.totals).toEqual({ quantity: 2, subtotal: 30 });
  });

  it("mantem quantidade minima igual a um", () => {
    const { result } = renderHook(() => useCart("store-a"));
    act(() => result.current.addItem({ productId: "p1", quantity: 1, unitPrice: 8, total: 8 }));
    act(() => result.current.updateQuantity(result.current.items[0].cartId, 0));
    expect(result.current.items[0].quantity).toBe(1);
  });

  it("persiste formato com storeId e items", async () => {
    const { result } = renderHook(() => useCart("store-a"));
    act(() => result.current.addItem({ productId: "p1", quantity: 1, unitPrice: 10, total: 10 }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("pedicampos.cart.store-a"))).toMatchObject({ storeId: "store-a" }));
  });

  it("le formato legado em array", () => {
    localStorage.setItem("pedicampos.cart.store-a", JSON.stringify([{ cartId: "legacy", quantity: 1, total: 7 }]));
    const { result } = renderHook(() => useCart("store-a"));
    expect(result.current.items[0].cartId).toBe("legacy");
  });

  it("invalida carrinho com storeId divergente", () => {
    localStorage.setItem("pedicampos.cart.store-a", JSON.stringify({ storeId: "store-b", items: [{ cartId: "old" }] }));
    const { result } = renderHook(() => useCart("store-a"));
    // The hook clears the incompatible persisted payload during initialization.
    expect(result.current.mismatched).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(JSON.parse(localStorage.getItem("pedicampos.cart.store-a"))).toEqual({ storeId: "store-a", items: [] });
  });

  it("clearCart remove os itens sem reaproveitar outro storeId", () => {
    const { result } = renderHook(() => useCart("store-a"));
    act(() => result.current.addItem({ productId: "p1", quantity: 1, unitPrice: 10, total: 10 }));
    act(() => result.current.clearCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.storeId).toBe("store-a");
  });
});
