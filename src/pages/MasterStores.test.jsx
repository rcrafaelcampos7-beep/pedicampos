import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  getStoresPaginated: vi.fn(), getPlansPaginated: vi.fn(), getMasterStoreMetrics: vi.fn(),
  updateStore: vi.fn(), deactivateStore: vi.fn(),
}));
vi.mock("../services/database.js", () => ({ ...db, DEFAULT_PAGE_SIZE: 20 }));
vi.mock("../components/master/MasterLayout.jsx", () => ({ MasterLayout: ({ children }) => <div>{children}</div> }));
vi.mock("../routes/router.jsx", () => ({ Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a> }));

import { MasterStores } from "./MasterStores.jsx";

const store = { id: "store-1", name: "Loja Remota", slug: "loja-remota", segment: "Demo", plan: "pro", active: true, open: true, primaryColor: "#000000", whatsapp: "", logo: "", banner: "banner.jpg", deliveryFee: 0, deliveryTime: "30 min", address: "", isDemo: true, demoFeatured: true, demoOrder: 1, demoLabel: "Exemplo" };

describe("MasterStores", () => {
  beforeEach(() => {
    db.getStoresPaginated.mockResolvedValue({ data: [store], total: 1, totalPages: 1 });
    db.getPlansPaginated.mockResolvedValue({ data: [{ key: "pro", name: "Pro", price: 1 }], total: 1, totalPages: 1 });
    db.getMasterStoreMetrics.mockResolvedValue({ "store-1": { orders: 2, revenue: 20 } });
    db.updateStore.mockResolvedValue(store);
  });
  it("mostra loading", () => {
    db.getStoresPaginated.mockReturnValue(new Promise(() => {}));
    render(<MasterStores activePath="/master/lojas" />);
    expect(screen.getByText(/Carregando lojas/)).toBeInTheDocument();
  });
  it("lista dados remotos com badges demo", async () => {
    render(<MasterStores activePath="/master/lojas" />);
    expect(await screen.findByText("Loja Remota")).toBeInTheDocument();
    expect(screen.getAllByText("Demo").length).toBeGreaterThan(0);
    expect(screen.getByText("Destacada")).toBeInTheDocument();
  });
  it("nao renderiza src vazio para loja sem banner", async () => {
    db.getStoresPaginated.mockResolvedValue({ data: [{ ...store, banner: "" }], total: 1, totalPages: 1 });
    render(<MasterStores activePath="/master/lojas" />);
    expect(await screen.findByText("Loja Remota")).toBeInTheDocument();
    expect(document.querySelector('img[src=""]')).not.toBeInTheDocument();
  });
  it("mostra erro sem misturar mocks", async () => {
    db.getStoresPaginated.mockRejectedValue(new Error("schema"));
    render(<MasterStores activePath="/master/lojas" />);
    expect(await screen.findByText(/N.o foi poss.vel carregar as lojas/)).toBeInTheDocument();
    expect(screen.queryByText("Loja Remota")).not.toBeInTheDocument();
  });
  it("pagina remotamente", async () => {
    db.getStoresPaginated.mockResolvedValue({ data: [store], total: 21, totalPages: 2 });
    render(<MasterStores activePath="/master/lojas" />);
    await screen.findByText("Loja Remota");
    await userEvent.click(screen.getByRole("button", { name: "Proxima" }));
    await waitFor(() => expect(db.getStoresPaginated).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  });
  it("salva controles de demo e destaque", async () => {
    render(<MasterStores activePath="/master/lojas" />);
    await screen.findByText("Loja Remota");
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByRole("checkbox", { name: "Loja de demonstração" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Destacar na landing" })).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "Salvar loja" }));
    await waitFor(() => expect(db.updateStore).toHaveBeenCalledWith("store-1", expect.objectContaining({ isDemo: true, demoFeatured: true, demoOrder: 1 })));
  });
});
