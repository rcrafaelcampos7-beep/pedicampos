import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  getProductsByStorePaginated: vi.fn(),
  getCategoriesByStorePaginated: vi.fn(),
  createProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn(),
}));
vi.mock("../services/database.js", () => ({ ...db, DEFAULT_PAGE_SIZE: 20 }));
vi.mock("../services/storageImages.js", () => ({
  deleteStoredImage: vi.fn(), uploadProductImage: vi.fn(), validateImageFile: vi.fn(),
}));
vi.mock("../components/admin/AdminLayout.jsx", () => ({ AdminLayout: ({ children }) => <div>{children}</div> }));
vi.mock("../components/ui/ImageCropModal.jsx", () => ({ ImageCropModal: () => null }));

import { AdminProducts } from "./AdminProducts.jsx";

describe("AdminProducts", () => {
  beforeEach(() => {
    db.getProductsByStorePaginated.mockResolvedValue({
      data: [{ id: "p1", storeId: "store-a", categoryId: null, name: "Produto sem imagem", description: "Teste", price: 10, image: "", active: true }],
      total: 1, totalPages: 1,
    });
    db.getCategoriesByStorePaginated.mockResolvedValue({ data: [], total: 0, totalPages: 1 });
  });

  it("usa somente a loja autenticada e nao injeta banner em produto sem imagem", async () => {
    const { container } = render(<AdminProducts activePath="/admin/produtos" store={{ id: "store-a", banner: "banner-da-loja.webp" }} />);
    expect(await screen.findByText("Produto sem imagem")).toBeInTheDocument();
    expect(db.getProductsByStorePaginated).toHaveBeenCalledWith("store-a", expect.any(Object));
    expect(container.querySelector('img[src="banner-da-loja.webp"]')).not.toBeInTheDocument();
    expect(screen.getByLabelText("Imagem ou banner URL")).toHaveValue("");
  });
});
