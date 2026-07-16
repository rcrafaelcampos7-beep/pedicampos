import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ storeResult: { data: null, error: null }, rpcResult: { data: null, error: null }, functionResult: { data: null, error: null } }));
const storage = vi.hoisted(() => ({
  createOrder: vi.fn(), getDatabase: vi.fn(() => ({ stores: [{ id: "local", slug: "local-store" }], orders: [], platform: {} })),
  migrateLegacyStoresForSupabase: vi.fn(), mutateDatabase: vi.fn(), subscribeDatabase: vi.fn(),
  updateOrder: vi.fn(), updatePlatform: vi.fn(), updateStore: vi.fn(),
}));
const orderQuery = vi.hoisted(() => ({
  eq: vi.fn(() => orderQuery), in: vi.fn(() => orderQuery), not: vi.fn(() => orderQuery),
  order: vi.fn(() => orderQuery), range: vi.fn(async () => ({ data: [], error: null, count: 0 })),
}));
const client = vi.hoisted(() => ({
  from: vi.fn((table) => table === "orders" ? { select: vi.fn(() => orderQuery) } : ({
    select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => state.storeResult) })) })),
  })),
  rpc: vi.fn(async () => state.rpcResult),
  functions: { invoke: vi.fn(async () => state.functionResult) },
}));

vi.mock("./supabaseClient.js", () => ({ supabase: client }));
vi.mock("./storage.js", () => storage);

import { createOrder, getMasterOrdersPaginated, getOrdersByStorePaginated, getStoreBySlug } from "./database.js";

describe("database Supabase-first", () => {
  beforeEach(() => {
    state.storeResult = { data: null, error: null };
    state.rpcResult = { data: null, error: null };
    state.functionResult = { data: null, error: null };
    orderQuery.eq.mockClear();
  });
  it("resposta remota vazia nao recebe mock", async () => {
    await expect(getStoreBySlug("local-store")).resolves.toBeNull();
  });
  it("erro de RLS nao aciona fallback local", async () => {
    state.storeResult = { data: null, error: { code: "42501", message: "permission denied" } };
    await expect(getStoreBySlug("local-store")).rejects.toMatchObject({ code: "42501" });
    expect(storage.migrateLegacyStoresForSupabase).not.toHaveBeenCalled();
  });
  it("erro de schema nao aciona fallback local", async () => {
    state.storeResult = { data: null, error: { code: "42703", message: "column does not exist" } };
    await expect(getStoreBySlug("local-store")).rejects.toMatchObject({ code: "42703" });
  });
  it("falha real de rede permite fallback tecnico", async () => {
    state.storeResult = { data: null, error: new TypeError("Failed to fetch") };
    await expect(getStoreBySlug("local-store")).resolves.toMatchObject({ id: "local" });
  });
  it("erro RPC/RLS nunca cria pedido local", async () => {
    state.functionResult = { data: null, error: { code: "42501", message: "permission denied" } };
    await expect(createOrder("store-authorized", {
      idempotencyKey: "00000000-0000-4000-8000-000000000001", customer: {}, fulfillment: "pickup",
      paymentMethodKey: "pix", items: [],
    })).rejects.toMatchObject({ code: "42501" });
    expect(storage.createOrder).not.toHaveBeenCalled();
  });
  it("propaga HTTP 429 com metadados seguros", async () => {
    const response = new Response(JSON.stringify({ code: "RATE_LIMITED", retryAfter: 30, requestId: "request-test" }), {
      status: 429, headers: { "content-type": "application/json", "retry-after": "30" },
    });
    state.functionResult = { data: null, error: { context: response } };
    await expect(createOrder("store-authorized", {
      idempotencyKey: "00000000-0000-4000-8000-000000000001", customer: {}, fulfillment: "pickup",
      paymentMethodKey: "pix", items: [],
    })).rejects.toMatchObject({ code: "RATE_LIMITED", status: 429, retryAfter: 30, requestId: "request-test" });
  });
  it("Admin filtra pela loja autorizada e Master usa consulta global distinta", async () => {
    await getOrdersByStorePaginated("store-authorized", { page: 1 });
    expect(orderQuery.eq).toHaveBeenCalledWith("store_id", "store-authorized");
    orderQuery.eq.mockClear();
    await getMasterOrdersPaginated({ page: 1 });
    expect(orderQuery.eq).not.toHaveBeenCalledWith("store_id", expect.anything());
  });
});
