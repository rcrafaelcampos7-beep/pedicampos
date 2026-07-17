import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  getOrdersByStore: vi.fn(), getProductsByStore: vi.fn(), getMasterDashboardMetrics: vi.fn(),
}));
vi.mock("../services/database.js", () => db);
vi.mock("../components/admin/AdminLayout.jsx", () => ({ AdminLayout: ({ children }) => <div>{children}</div> }));
vi.mock("../components/master/MasterLayout.jsx", () => ({ MasterLayout: ({ children }) => <div>{children}</div> }));

import { AdminDashboard } from "./AdminDashboard.jsx";
import { MasterDashboard } from "./MasterDashboard.jsx";

describe("dashboards remotos", () => {
  beforeEach(() => {
    db.getOrdersByStore.mockResolvedValue([{
      id: "o1", number: "1", createdAt: new Date().toISOString(), total: 20,
      orderStatus: "Em preparo", paymentStatus: "Pendente", fulfillment: "delivery", customer: { name: "Cliente" },
    }]);
    db.getProductsByStore.mockResolvedValue([{ id: "p1", active: true }, { id: "p2", active: false }]);
    db.getMasterDashboardMetrics.mockResolvedValue({
      totalStores: 2, activeStores: 1, todayOrders: 1, todayRevenue: 20, inProgressOrders: 1,
      topPlan: "pro", plans: [{ key: "pro", name: "Pro" }], recentOrders: [],
    });
  });

  it("AdminDashboard usa somente store.id autenticado e calcula dados remotos", async () => {
    render(<AdminDashboard activePath="/admin/dashboard" store={{ id: "store-a", name: "Loja A" }} />);
    expect(await screen.findByText("Últimos pedidos")).toBeInTheDocument();
    expect(db.getOrdersByStore).toHaveBeenCalledWith("store-a");
    expect(db.getProductsByStore).toHaveBeenCalledWith("store-a");
    expect(screen.getByText("Pedidos de hoje").parentElement).toHaveTextContent("1");
    expect(screen.getByText("Produtos ativos").parentElement).toHaveTextContent("1");
  });

  it("AdminDashboard mostra falha remota sem injetar pedido local", async () => {
    db.getOrdersByStore.mockRejectedValue(new Error("RLS"));
    render(<AdminDashboard activePath="/admin/dashboard" store={{ id: "store-a", name: "Loja A" }} />);
    expect(await screen.findByText(/Não foi possível carregar os dados/)).toBeInTheDocument();
    expect(screen.queryByText("#1")).not.toBeInTheDocument();
  });

  it("MasterDashboard consome agregacao global protegida pelo RLS", async () => {
    render(<MasterDashboard activePath="/master/dashboard" />);
    expect(await screen.findByText("Pedidos recentes de todas as lojas")).toBeInTheDocument();
    expect(db.getMasterDashboardMetrics).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Total de lojas").parentElement).toHaveTextContent("2");
    expect(screen.getByText("Plano mais usado").parentElement).toHaveTextContent("Pro");
  });
});
