import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({
  upload: vi.fn(), getPublicUrl: vi.fn(), remove: vi.fn(), from: vi.fn(),
}));
vi.mock("./supabaseClient.js", () => ({
  supabase: { storage: { from: storage.from } },
}));

import {
  getStoragePathFromPublicUrl,
  IMAGE_MAX_BYTES,
  uploadProductImage,
  uploadStoreLogo,
  validateImageFile,
} from "./storageImages.js";

const storeId = "00000000-0000-4000-8000-000000000001";
const productId = "00000000-0000-4000-8000-000000000002";

describe("storageImages", () => {
  beforeEach(() => {
    storage.upload.mockResolvedValue({ error: null });
    storage.remove.mockResolvedValue({ error: null });
    storage.getPublicUrl.mockImplementation((path) => ({
      data: { publicUrl: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/current/${path}` },
    }));
    storage.from.mockImplementation((bucket) => {
      storage.getPublicUrl.mockImplementation((path) => ({
        data: { publicUrl: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}` },
      }));
      return storage;
    });
  });

  it("bloqueia tipo, extensao e tamanho invalidos sem upload", () => {
    expect(() => validateImageFile({ name: "foto.exe", type: "application/octet-stream", size: 10 })).toThrow(/JPG, PNG ou WEBP/);
    expect(() => validateImageFile({ name: "foto.png", type: "image/jpeg", size: 10 })).toThrow(/extensao/);
    expect(() => validateImageFile({ name: "foto.webp", type: "image/webp", size: IMAGE_MAX_BYTES + 1 })).toThrow(/5 MB/);
  });

  it("faz upload em path isolado pela loja e produto", async () => {
    const file = new File(["imagem"], "produto.webp", { type: "image/webp" });
    const result = await uploadProductImage(storeId, productId, file);
    expect(storage.from).toHaveBeenCalledWith("product-images");
    expect(storage.upload.mock.calls[0][0]).toMatch(new RegExp(`^${storeId}/${productId}/.+[.]webp$`));
    expect(result.publicUrl).toContain(`/product-images/${storeId}/${productId}/`);
  });

  it("faz upload de logo somente no escopo da loja", async () => {
    const file = new File(["imagem"], "logo.png", { type: "image/png" });
    await uploadStoreLogo(storeId, file);
    expect(storage.from).toHaveBeenCalledWith("store-assets");
    expect(storage.upload.mock.calls[0][0]).toMatch(new RegExp(`^${storeId}/logo/.+[.]png$`));
  });

  it("aceita somente URL publica do projeto e estrutura de bucket conhecida", () => {
    const valid = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${storeId}/${productId}/produto.webp`;
    expect(getStoragePathFromPublicUrl(valid)).toMatchObject({ bucket: "product-images", storeId });
    expect(getStoragePathFromPublicUrl(`https://outro.example/storage/v1/object/public/product-images/${storeId}/${productId}/produto.webp`)).toBeNull();
    expect(getStoragePathFromPublicUrl(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/outro/${storeId}/produto.webp`)).toBeNull();
  });
});
