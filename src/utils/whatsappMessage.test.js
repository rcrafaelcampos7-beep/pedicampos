import { beforeEach, describe, expect, it } from "vitest";
import { generateWhatsAppMessage } from "./whatsappMessage.js";

const baseOrder = {
  id: "order-test", number: "42", storeSlug: "loja-demo", storeName: "Loja Demo",
  customer: { name: "Cliente Teste" }, paymentMethod: "Pix", pixKey: "pix-demo",
};

describe("mensagens WhatsApp", () => {
  beforeEach(() => window.history.replaceState({}, "", "/"));
  it("gera mensagem de entrega", () => expect(generateWhatsAppMessage(baseOrder, "Saiu para entrega")).toContain("saiu para entrega"));
  it("gera mensagem de retirada", () => expect(generateWhatsAppMessage(baseOrder, "Pronto para retirada")).toContain("pronto para retirada"));
  it("inclui Pix e link de acompanhamento", () => {
    const message = generateWhatsAppMessage(baseOrder, "Pedido recebido");
    expect(message).toContain("Chave Pix: pix-demo");
    expect(message).toContain("/loja-demo/pedido/order-test");
  });
  it("tolera opcionais ausentes", () => expect(() => generateWhatsAppMessage({}, "Em preparo")).not.toThrow());
  it("usa template generico para status desconhecido", () => expect(generateWhatsAppMessage(baseOrder, "Separando adicionais")).toContain("Separando adicionais"));
});
