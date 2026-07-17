import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ getOrderById: vi.fn() }));
vi.mock("../services/database.js", () => db);
vi.mock("../routes/router.jsx", () => ({ Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a> }));

import { OrderTrackingPage } from "./OrderTrackingPage.jsx";

const order = {
  id: "order-1", publicToken: "token-1", number: "100", storeSlug: "loja-a", storeName: "Loja A",
  orderStatus: "Em preparo", paymentStatus: "Pagamento confirmado", paymentMethod: "Pix", fulfillment: "pickup",
  customer: { name: "Cliente" }, subtotal: 15, deliveryFee: 0, total: 15, address: null, notes: "",
  items: [{ productId: "p1", name: "Produto", quantity: 1, total: 15, selectedAdditionals: [{ optionName: "Bacon", price: 5 }] }],
};

describe("OrderTrackingPage", () => {
  beforeEach(() => db.getOrderById.mockResolvedValue(order));

  it("consulta token e slug juntos e renderiza pedido correto", async () => {
    render(<OrderTrackingPage slug="loja-a" orderId="token-1" />);
    expect(await screen.findByText("Pedido #100")).toBeInTheDocument();
    expect(db.getOrderById).toHaveBeenCalledWith("token-1", "loja-a");
    expect(screen.getByText(/Bacon/)).toBeInTheDocument();
    expect(screen.getByText("Pronto para retirada")).toBeInTheDocument();
  });

  it("nao mistura pedido quando token e slug nao retornam resultado", async () => {
    db.getOrderById.mockResolvedValue(null);
    render(<OrderTrackingPage slug="loja-b" orderId="token-1" />);
    expect(await screen.findByText(/Pedido n.o encontrado/)).toBeInTheDocument();
  });
});
