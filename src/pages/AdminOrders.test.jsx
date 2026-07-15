import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ getOrdersByStorePaginated: vi.fn(), updateOrder: vi.fn() }));
vi.mock("../services/database.js", () => ({ ...db, DEFAULT_PAGE_SIZE: 20 }));
vi.mock("../components/admin/AdminLayout.jsx", () => ({ AdminLayout: ({ children }) => <div>{children}</div> }));

import { AdminOrders } from "./AdminOrders.jsx";

const order = {
  id: "order-1", number: "100", customer: { name: "Cliente Teste", phone: "000000000" },
  total: 25, paymentStatus: "Pendente", orderStatus: "Pedido recebido", fulfillment: "pickup",
  createdAt: "2026-01-01T12:00:00Z", paymentMethod: "Pix", items: [], address: null,
};
const store = { id: "store-authorized", name: "Loja", plan: "pro", entitlements: { features: ["saved_orders"] } };

describe("AdminOrders", () => {
  beforeEach(() => {
    db.getOrdersByStorePaginated.mockResolvedValue({ data: [order], total: 1, totalPages: 1 });
    db.updateOrder.mockResolvedValue(order);
  });
  it("exibe loading", () => {
    db.getOrdersByStorePaginated.mockReturnValue(new Promise(() => {}));
    render(<AdminOrders store={store} activePath="/admin/pedidos" />);
    expect(screen.getByText(/Carregando pedidos/)).toBeInTheDocument();
  });
  it("lista pedidos usando somente store.id", async () => {
    render(<AdminOrders store={store} activePath="/admin/pedidos" />);
    expect(await screen.findByText("Cliente Teste")).toBeInTheDocument();
    expect(db.getOrdersByStorePaginated).toHaveBeenCalledWith("store-authorized", expect.any(Object));
  });
  it("mostra lista vazia", async () => {
    db.getOrdersByStorePaginated.mockResolvedValue({ data: [], total: 0, totalPages: 1 });
    render(<AdminOrders store={store} activePath="/admin/pedidos" />);
    expect(await screen.findByText("Nenhum pedido")).toBeInTheDocument();
  });
  it("mostra erro remoto sem dados locais", async () => {
    db.getOrdersByStorePaginated.mockRejectedValue(new Error("RLS"));
    render(<AdminOrders store={store} activePath="/admin/pedidos" />);
    expect(await screen.findByText(/N.o foi poss.vel carregar os pedidos/)).toBeInTheDocument();
    expect(screen.queryByText("Cliente Teste")).not.toBeInTheDocument();
  });
  it("pagina remotamente", async () => {
    db.getOrdersByStorePaginated.mockResolvedValue({ data: [order], total: 21, totalPages: 2 });
    render(<AdminOrders store={store} activePath="/admin/pedidos" />);
    await screen.findByText("Cliente Teste");
    await userEvent.click(screen.getByRole("button", { name: "Proxima" }));
    await waitFor(() => expect(db.getOrdersByStorePaginated).toHaveBeenLastCalledWith("store-authorized", expect.objectContaining({ page: 2 })));
  });
  it("altera status de retirada e recarrega", async () => {
    render(<AdminOrders store={store} activePath="/admin/pedidos" />);
    await screen.findByText("Cliente Teste");
    await userEvent.click(screen.getByRole("button", { name: "Ver" }));
    await userEvent.click(screen.getByRole("button", { name: "Pronto para retirada" }));
    await waitFor(() => expect(db.updateOrder).toHaveBeenCalledWith("order-1", { orderStatus: "Pronto para retirada" }));
  });
});
