import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ createOrder: vi.fn(), getStoreBySlug: vi.fn(), getStoreSettings: vi.fn(), getPaymentMethodsByStore: vi.fn(), getStoreEntitlements: vi.fn() }));
const router = vi.hoisted(() => ({ navigate: vi.fn() }));
const cartMock = vi.hoisted(() => ({ current: null }));
vi.mock("../services/database.js", () => db);
vi.mock("../routes/router.jsx", () => ({ Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>, navigate: router.navigate }));
vi.mock("../hooks/useCart.js", () => ({ useCart: () => cartMock.current }));
vi.mock("../components/store/CartDrawer.jsx", () => ({ CartDrawer: () => null }));

import { CheckoutPage } from "./CheckoutPage.jsx";

let sequence = 0;
let currentStore;

async function loadCheckout() {
  render(<CheckoutPage slug="loja-demo" />);
  await screen.findByText("Finalize seu pedido");
}

async function fillCustomer() {
  await userEvent.type(screen.getByLabelText("Nome"), "Cliente Teste");
  await userEvent.type(screen.getByLabelText(/Telefone/), "000000000");
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    sequence += 1;
    currentStore = { id: `store-${sequence}`, slug: "loja-demo", name: "Loja Demo", active: true, open: true, logo: "LD", primaryColor: "#000", plan: "pro", whatsapp: "" };
    cartMock.current = {
      items: [{ cartId: "cart-1", productId: "product-1", name: "Produto", quantity: 1, unitPrice: 10, total: 10, selectedAdditionals: [] }],
      storeId: currentStore.id, mismatched: false, totals: { quantity: 1, subtotal: 10 },
      clearCart: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(),
    };
    db.getStoreBySlug.mockImplementation(async () => currentStore);
    db.getStoreSettings.mockResolvedValue({ deliveryEnabled: true, pickupEnabled: true, deliveryFee: 5, minimumOrderValue: 0, address: "Rua Teste" });
    db.getPaymentMethodsByStore.mockResolvedValue({ pix: true });
    db.getStoreEntitlements.mockResolvedValue({ planKey: "pro", features: ["saved_orders"] });
    db.createOrder.mockResolvedValue({ id: "order-1", publicToken: "token-publico" });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  it("mostra carrinho vazio e bloqueia envio", async () => {
    cartMock.current.items = [];
    cartMock.current.totals = { quantity: 0, subtotal: 0 };
    await loadCheckout();
    expect(screen.getByText("Carrinho vazio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finalizar pedido" })).toBeDisabled();
  });
  it("valida campos obrigatorios", async () => {
    await loadCheckout();
    await userEvent.click(screen.getByRole("button", { name: "Finalizar pedido" }));
    expect(screen.getByText("Informe seu nome.")).toBeInTheDocument();
    expect(db.createOrder).not.toHaveBeenCalled();
  });
  it("envia pedido delivery com endereco", async () => {
    await loadCheckout();
    await fillCustomer();
    await userEvent.type(screen.getByLabelText(/Endere/), "Rua A");
    await userEvent.type(screen.getByLabelText("Bairro"), "Centro");
    await userEvent.type(screen.getByLabelText(/N.mero/), "10");
    await userEvent.click(screen.getByRole("button", { name: "Finalizar pedido" }));
    await waitFor(() => expect(db.createOrder).toHaveBeenCalledWith(currentStore.id, expect.objectContaining({ fulfillment: "delivery", address: expect.objectContaining({ street: "Rua A" }) })));
  });
  it("envia retirada sem endereco", async () => {
    await loadCheckout();
    await fillCustomer();
    await userEvent.click(screen.getByRole("button", { name: "Retirada" }));
    await userEvent.click(screen.getByRole("button", { name: "Finalizar pedido" }));
    await waitFor(() => expect(db.createOrder).toHaveBeenCalledWith(currentStore.id, expect.objectContaining({ fulfillment: "pickup", address: null })));
  });
  it("mostra erro da RPC sem fallback", async () => {
    db.createOrder.mockRejectedValue(Object.assign(new Error("RLS"), { code: "42501" }));
    await loadCheckout();
    await fillCustomer();
    await userEvent.click(screen.getByRole("button", { name: "Retirada" }));
    await userEvent.click(screen.getByRole("button", { name: "Finalizar pedido" }));
    expect(await screen.findByText(/N.o foi poss.vel criar o pedido/)).toBeInTheDocument();
    expect(cartMock.current.clearCart).not.toHaveBeenCalled();
  });
  it("preserva idempotency key no retry e navega no sucesso", async () => {
    db.createOrder.mockRejectedValueOnce(new Error("network retry")).mockResolvedValueOnce({ publicToken: "token-publico" });
    await loadCheckout();
    await fillCustomer();
    await userEvent.click(screen.getByRole("button", { name: "Retirada" }));
    await userEvent.click(screen.getByRole("button", { name: "Finalizar pedido" }));
    await screen.findByText(/N.o foi poss.vel criar o pedido/);
    await userEvent.click(screen.getByRole("button", { name: "Finalizar pedido" }));
    await waitFor(() => expect(db.createOrder).toHaveBeenCalledTimes(2));
    expect(db.createOrder.mock.calls[0][1].idempotencyKey).toBe(db.createOrder.mock.calls[1][1].idempotencyKey);
    expect(router.navigate).toHaveBeenCalledWith("/loja-demo/pedido/token-publico");
  });
  it("inclui adicionais no pedido enviado por WhatsApp", async () => {
    cartMock.current.items[0].selectedAdditionals = [{ groupName: "Molhos", optionName: "Barbecue", price: 0 }];
    db.getStoreEntitlements.mockResolvedValue({ planKey: "start", features: ["whatsapp_orders"] });
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    await loadCheckout();
    await fillCustomer();
    await userEvent.click(screen.getByRole("button", { name: "Retirada" }));
    await userEvent.click(screen.getByRole("button", { name: "Enviar pedido no WhatsApp" }));
    expect(decodeURIComponent(open.mock.calls[0][0])).toContain("Molhos: Barbecue");
    expect(db.createOrder).not.toHaveBeenCalled();
  });
});
