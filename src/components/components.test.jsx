import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-easy-crop", () => ({
  default: ({ onCropComplete }) => (
    <button type="button" data-testid="cropper" onClick={() => onCropComplete({}, { x: 0, y: 0, width: 100, height: 100 })}>
      definir recorte
    </button>
  ),
}));
vi.mock("../services/storageImages.js", () => ({
  createCroppedImageFile: vi.fn(async () => new File(["crop"], "crop.webp", { type: "image/webp" })),
}));

import { PlanGuard } from "./admin/PlanGuard.jsx";
import { CartDrawer } from "./store/CartDrawer.jsx";
import { OrderTimeline } from "./store/OrderTimeline.jsx";
import { ProductCard } from "./store/ProductCard.jsx";
import { ImageCropModal } from "./ui/ImageCropModal.jsx";
import { PaginationControls } from "./ui/PaginationControls.jsx";
import { StatusBadge } from "./ui/StatusBadge.jsx";
import { ENTITLEMENT_FEATURES } from "../utils/plans.js";

describe("componentes criticos", () => {
  it("PaginationControls bloqueia anterior na primeira pagina", () => {
    render(<PaginationControls page={1} totalPages={3} total={50} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByText(/Pagina 1 de 3/)).toBeInTheDocument();
  });
  it("PaginationControls navega e respeita loading", async () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<PaginationControls page={2} totalPages={3} total={50} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Proxima" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    rerender(<PaginationControls page={2} totalPages={3} total={50} loading onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Proxima" })).toBeDisabled();
  });
  it("PlanGuard exibe conteudo liberado", () => {
    const store = { entitlements: { features: [ENTITLEMENT_FEATURES.SAVED_ORDERS] } };
    render(<PlanGuard store={store} feature={ENTITLEMENT_FEATURES.SAVED_ORDERS}><span>Permitido</span></PlanGuard>);
    expect(screen.getByText("Permitido")).toBeInTheDocument();
  });
  it("PlanGuard exibe upgrade no plano bloqueado", () => {
    render(<PlanGuard store={{ name: "Demo", plan: "start", entitlements: { features: [] } }} feature={ENTITLEMENT_FEATURES.SAVED_ORDERS}><span>Oculto</span></PlanGuard>);
    expect(screen.getByText(/Upgrade de plano/)).toBeInTheDocument();
    expect(screen.queryByText("Oculto")).not.toBeInTheDocument();
  });
  it("OrderTimeline diferencia entrega e retirada", () => {
    const { rerender } = render(<OrderTimeline status="Em preparo" fulfillment="delivery" />);
    expect(screen.getByText("Saiu para entrega")).toBeInTheDocument();
    rerender(<OrderTimeline status="Em preparo" fulfillment="pickup" />);
    expect(screen.getByText("Pronto para retirada")).toBeInTheDocument();
    expect(screen.queryByText("Saiu para entrega")).not.toBeInTheDocument();
  });
  it("StatusBadge converte status legado de retirada", () => {
    render(<StatusBadge status="out_for_delivery" fulfillment="pickup" />);
    expect(screen.getByText("Pronto para retirada")).toBeInTheDocument();
  });
  it("ProductCard abre produto ativo e fornece alt como fallback", async () => {
    const onOpen = vi.fn();
    render(<ProductCard product={{ name: "Produto", description: "Desc", price: 10, active: true, image: "invalid.jpg" }} category={{ name: "Categoria" }} onOpen={onOpen} />);
    expect(screen.getByAltText("Produto")).toHaveAttribute("src", "invalid.jpg");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(onOpen).toHaveBeenCalled();
  });
  it("ProductCard desabilitado nao oferece adicionar", () => {
    render(<ProductCard product={{ name: "Produto", description: "", price: 10, active: false, image: "" }} onOpen={vi.fn()} />);
    expect(screen.getByText(/Indispon/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Adicionar" })).not.toBeInTheDocument();
    expect(document.querySelector('img[src=""]')).not.toBeInTheDocument();
  });
  it("CartDrawer nao renderiza src vazio para produto sem imagem", () => {
    render(
      <CartDrawer
        open
        onClose={vi.fn()}
        store={{ slug: "demo", deliveryFee: 0 }}
        cart={{
          items: [{ cartId: "item-1", name: "Sem imagem", image: "", quantity: 1, total: 10 }],
          totals: { quantity: 1, subtotal: 10 },
        }}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    expect(screen.getByText("Sem imagem")).toBeInTheDocument();
    expect(document.querySelector('img[src=""]')).not.toBeInTheDocument();
  });
  it("ImageCropModal cancela sem processar", async () => {
    const onCancel = vi.fn();
    render(<ImageCropModal request={{ sourceUrl: "blob:test", file: new File(["a"], "a.jpg"), aspect: 1, output: {} }} onCancel={onCancel} onConfirm={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
  it("ImageCropModal confirma somente o arquivo recortado", async () => {
    const onConfirm = vi.fn();
    render(<ImageCropModal request={{ sourceUrl: "blob:test", file: new File(["a"], "a.jpg"), aspect: 1, output: {} }} onCancel={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId("cropper"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirmar recorte" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Confirmar recorte" }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ name: "crop.webp" })));
  });
});
