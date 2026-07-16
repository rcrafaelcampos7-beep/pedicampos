import { describe, expect, it, vi } from "vitest";
import { createLogger, sanitizeError } from "./logger.js";

describe("logger", () => {
  it("remove contexto sensivel", () => {
    const result = sanitizeError({ code: "42501", message: "falha" }, {
      area: "checkout", operation: "create", storeId: "store-test",
      phone: "22999999999", customer: "Pessoa", payload: { address: "Rua" }, token: "secret",
    }, { detailed: false });
    expect(result).toEqual(expect.objectContaining({ area: "checkout", operation: "create", storeId: "store-test", code: "42501" }));
    expect(JSON.stringify(result)).not.toMatch(/229999|Pessoa|Rua|secret/);
  });
  it("producao nao inclui mensagem, details ou payload", () => {
    const target = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const logger = createLogger({ isDev: false, consoleTarget: target });
    const event = logger.error({ area: "database", operation: "rpc", payload: { phone: "123" } }, { code: "500", message: "telefone 123", details: "payload" });
    expect(event).not.toHaveProperty("message");
    expect(event).not.toHaveProperty("details");
    expect(target.error).toHaveBeenCalled();
  });
  it("info de producao nao imprime", () => {
    const target = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const event = createLogger({ isDev: false, consoleTarget: target }).info({ area: "app", operation: "ready" });
    expect(target.info).not.toHaveBeenCalled();
    expect(event).not.toHaveProperty("code");
    expect(event).not.toHaveProperty("message");
  });
  it("info de desenvolvimento nao inventa erro", () => {
    const target = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const event = createLogger({ isDev: true, consoleTarget: target }).info({
      area: "checkout", operation: "cart_loaded", storeId: "store-test", phone: "22999999999",
    });
    expect(event).toEqual(expect.objectContaining({ area: "checkout", operation: "cart_loaded", storeId: "store-test" }));
    expect(event).not.toHaveProperty("code");
    expect(event).not.toHaveProperty("message");
    expect(JSON.stringify(event)).not.toContain("22999999999");
    expect(target.info).toHaveBeenCalledWith("[PediCampos]", event);
  });
  it("desenvolvimento mantem diagnostico limitado", () => {
    const target = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const event = createLogger({ isDev: true, consoleTarget: target }).error({ area: "auth", operation: "login" }, { code: "AUTH", message: "falha controlada" });
    expect(event.message).toBe("falha controlada");
  });
});
