import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOrderHandler, MAX_BODY_BYTES } from "./core.ts";

const origin = "https://pedicampos.com.br";
const payload = {
  p_store_id: "00000000-0000-4000-8000-000000000001",
  p_idempotency_key: "00000000-0000-4000-8000-000000000002",
  p_customer: { name: "Teste" }, p_fulfillment: "pickup", p_address: null,
  p_notes: "", p_payment_method: "pix", p_items: [],
};

function request(body = payload, options = {}) {
  return new Request("https://project.functions.supabase.co/create-order", {
    method: options.method || "POST",
    headers: { origin: options.origin ?? origin, "content-type": options.contentType || "application/json", ...(options.headers || {}) },
    body: ["GET", "OPTIONS"].includes(options.method) ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

function dependencies() {
  return {
    isOriginAllowed: vi.fn((value) => value === origin),
    identify: vi.fn(async () => ({ subjectHash: "a".repeat(64) })),
    checkRateLimit: vi.fn(async () => ({ allowed: true, attemptId: "attempt-1" })),
    completeAttempt: vi.fn(async () => {}),
    createOrder: vi.fn(async () => ({ id: "order-1", publicToken: "token", number: "100" })),
    log: vi.fn(),
  };
}

describe("create-order Edge core", () => {
  let deps;
  beforeEach(() => { deps = dependencies(); });
  it("permite chamada valida", async () => {
    const response = await createOrderHandler(deps)(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: "order-1" });
    expect(deps.completeAttempt).toHaveBeenCalledWith("attempt-1", true);
  });
  it("retorna 429 e Retry-After", async () => {
    deps.checkRateLimit.mockResolvedValue({ allowed: false, retryAfter: 42 });
    const response = await createOrderHandler(deps)(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("42");
    expect(await response.json()).toMatchObject({ code: "RATE_LIMITED", retryAfter: 42 });
  });
  it("retries com a mesma chave preservam resposta idempotente", async () => {
    const handler = createOrderHandler(deps);
    const first = await (await handler(request())).json();
    const second = await (await handler(request())).json();
    expect(first).toEqual(second);
    expect(deps.createOrder.mock.calls[0][0].p_idempotency_key).toBe(deps.createOrder.mock.calls[1][0].p_idempotency_key);
  });
  it("bloqueia payload acima do limite", async () => {
    const response = await createOrderHandler(deps)(request("x".repeat(MAX_BODY_BYTES + 1)));
    expect(response.status).toBe(413);
    expect(deps.checkRateLimit).not.toHaveBeenCalled();
  });
  it("bloqueia origem nao autorizada", async () => {
    const response = await createOrderHandler(deps)(request(payload, { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
  it("rejeita metodo invalido", async () => {
    const response = await createOrderHandler(deps)(request(null, { method: "GET" }));
    expect(response.status).toBe(405);
  });
  it("responde preflight autorizado", async () => {
    const response = await createOrderHandler(deps)(request(null, { method: "OPTIONS" }));
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(origin);
  });
  it("rejeita Content-Type incorreto", async () => {
    const response = await createOrderHandler(deps)(request("texto", { contentType: "text/plain" }));
    expect(response.status).toBe(415);
  });
  it("trata erro RPC sem expor payload", async () => {
    deps.createOrder.mockRejectedValue({ code: "23514", message: "internal details" });
    const response = await createOrderHandler(deps)(request());
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Não foi possível validar o pedido.");
    expect(JSON.stringify(body)).not.toContain("internal details");
    expect(deps.completeAttempt).toHaveBeenCalledWith("attempt-1", false);
  });
});
