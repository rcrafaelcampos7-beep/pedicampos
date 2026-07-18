import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  getStoreBySlug: vi.fn(), getStoreSettings: vi.fn(), getPaymentMethodsByStore: vi.fn(),
  getCategoriesByStore: vi.fn(), getProductsByStore: vi.fn(), getAdditionalGroupsByStore: vi.fn(),
  getStoreEntitlements: vi.fn(),
}));
vi.mock("../services/database.js", () => db);
vi.mock("../hooks/useCart.js", () => ({ useCart: () => ({ items: [], addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(), totals: {} }) }));
vi.mock("../routes/router.jsx", () => ({ Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a> }));
vi.mock("../components/store/CategoryTabs.jsx", () => ({ CategoryTabs: () => null }));
vi.mock("../components/store/ProductModal.jsx", () => ({ ProductModal: () => null }));
vi.mock("../components/store/CartDrawer.jsx", () => ({ CartDrawer: () => null }));

import { StorePage } from "./StorePage.jsx";

const store = { id: "store-remote", slug: "loja-demo", name: "Loja Demo", active: true, open: true, logo: "https://invalid/logo.png", banner: "banner.jpg", primaryColor: "#000", segment: "Demo", whatsapp: "", plan: "pro" };

describe("StorePage", () => {
  beforeEach(() => {
    db.getStoreBySlug.mockResolvedValue(store);
    db.getStoreSettings.mockResolvedValue({ fallbackInitials: "LD" });
    db.getPaymentMethodsByStore.mockResolvedValue({ pix: true });
    db.getCategoriesByStore.mockResolvedValue([]);
    db.getProductsByStore.mockResolvedValue([]);
    db.getAdditionalGroupsByStore.mockResolvedValue([]);
    db.getStoreEntitlements.mockResolvedValue({ planKey: "pro", features: ["saved_orders"] });
  });

  it("mostra loading enquanto consulta", () => {
    db.getStoreBySlug.mockReturnValue(new Promise(() => {}));
    render(<StorePage slug="loja-demo" />);
    expect(screen.getByText(/Carregando loja/)).toBeInTheDocument();
  });
  it("mostra loja inexistente sem carregar mocks", async () => {
    db.getStoreBySlug.mockResolvedValue(null);
    render(<StorePage slug="loja-demo" />);
    expect(await screen.findByText(/Loja n.o encontrada/)).toBeInTheDocument();
    expect(db.getProductsByStore).not.toHaveBeenCalled();
  });
  it("bloqueia loja inativa retornada em contexto autorizado", async () => {
    db.getStoreBySlug.mockResolvedValue({ ...store, active: false });
    render(<StorePage slug="loja-demo" />);
    expect(await screen.findByText(/temporariamente indispon.vel/)).toBeInTheDocument();
    expect(screen.queryByText(/Nenhum produto dispon/)).not.toBeInTheDocument();
  });
  it("mantem catalogo remoto vazio", async () => {
    render(<StorePage slug="loja-demo" />);
    expect(await screen.findByText(/Nenhum produto dispon/)).toBeInTheDocument();
  });
  it("renderiza categoria e produto ativos remotos", async () => {
    db.getCategoriesByStore.mockResolvedValue([{ id: "cat", name: "Categoria", active: true }]);
    db.getProductsByStore.mockResolvedValue([{ id: "p", categoryId: "cat", name: "Produto remoto", description: "", price: 10, image: "p.jpg", active: true }]);
    render(<StorePage slug="loja-demo" />);
    expect(await screen.findByText("Produto remoto")).toBeInTheDocument();
    expect(db.getStoreBySlug).toHaveBeenCalledWith("loja-demo", { allowLocalFallback: false });
  });
  it("filtra produtos pela busca e permite limpar o termo", async () => {
    db.getProductsByStore.mockResolvedValue([
      { id: "p1", categoryId: null, name: "Açaí tradicional", description: "Com banana", price: 18, image: "", active: true },
      { id: "p2", categoryId: null, name: "Suco natural", description: "Laranja", price: 10, image: "", active: true },
    ]);
    render(<StorePage slug="loja-demo" />);
    expect(await screen.findByText("Açaí tradicional")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar produtos" }), { target: { value: "acai" } });
    expect(screen.getByText("Açaí tradicional")).toBeInTheDocument();
    expect(screen.queryByText("Suco natural")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(screen.getByText("Suco natural")).toBeInTheDocument();
  });
  it("oculta produto de categoria inativa mas preserva produto sem categoria", async () => {
    db.getCategoriesByStore.mockResolvedValue([{ id: "cat-inativa", name: "Inativa", active: false }]);
    db.getProductsByStore.mockResolvedValue([
      { id: "p1", categoryId: "cat-inativa", name: "Produto oculto", description: "", price: 10, image: "", active: true },
      { id: "p2", categoryId: null, name: "Produto sem categoria", description: "", price: 10, image: "", active: true },
    ]);
    render(<StorePage slug="loja-demo" />);
    expect(await screen.findByText("Produto sem categoria")).toBeInTheDocument();
    expect(screen.queryByText("Produto oculto")).not.toBeInTheDocument();
  });
  it("usa iniciais quando a logo falha", async () => {
    render(<StorePage slug="loja-demo" />);
    const logo = await screen.findByAltText("Logo Loja Demo");
    fireEvent.error(logo);
    expect(screen.getByLabelText("Iniciais LD")).toBeInTheDocument();
  });
  it("falha parcial nao vira loja inexistente", async () => {
    db.getProductsByStore.mockRejectedValue(new Error("RLS"));
    render(<StorePage slug="loja-demo" />);
    expect(await screen.findByText(/N.o foi poss.vel carregar a loja/)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Loja n.o encontrada/)).not.toBeInTheDocument());
  });
});
