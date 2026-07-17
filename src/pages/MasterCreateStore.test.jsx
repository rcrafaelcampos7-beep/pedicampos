import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ getStores: vi.fn(), createStore: vi.fn() }));
const router = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("../services/database.js", () => db);
vi.mock("../routes/router.jsx", () => ({ navigate: router.navigate }));
vi.mock("../hooks/usePediData.js", () => ({ usePediData: () => ({
  platform: { plans: {
    start: { name: "Start", price: 99.99 }, pro: { name: "Pro", price: 179.99 }, premium: { name: "Premium", price: 199.99 },
  } },
}) }));
vi.mock("../components/master/MasterLayout.jsx", () => ({ MasterLayout: ({ children }) => <div>{children}</div> }));

import { MasterCreateStore } from "./MasterCreateStore.jsx";

describe("MasterCreateStore", () => {
  beforeEach(() => {
    db.getStores.mockResolvedValue([{ id: "existing", slug: "existente", banner: "banner-de-outra-loja.webp" }]);
    db.createStore.mockResolvedValue({ id: "new-store", slug: "nova-loja" });
  });

  it("cria loja remota sem reutilizar logo ou banner de outra loja", async () => {
    render(<MasterCreateStore activePath="/master/criar-loja" />);
    await userEvent.type(screen.getByLabelText("Nome da loja"), "Nova Loja");
    await userEvent.click(screen.getByRole("button", { name: "Criar loja" }));
    await waitFor(() => expect(db.createStore).toHaveBeenCalledWith(expect.objectContaining({
      name: "Nova Loja", slug: "nova-loja", plan: "start", logo: "", banner: "",
    })));
    expect(router.navigate).toHaveBeenCalledWith("/master/lojas");
  });
});
