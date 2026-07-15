import { describe, expect, it } from "vitest";
import { formatCurrency, parseCurrency } from "./formatCurrency.js";

describe("formatacao monetaria", () => {
  it("formata reais e centavos", () => expect(formatCurrency(99.99)).toMatch(/99,99/));
  it("formata zero para entrada invalida", () => expect(formatCurrency("invalido")).toMatch(/0,00/));
  it("aceita decimal numerico", () => expect(parseCurrency(12.5)).toBe(12.5));
  it("converte formato brasileiro", () => expect(parseCurrency("1.234,56")).toBe(1234.56));
  it("converte estado vazio em zero", () => expect(parseCurrency("")).toBe(0));
});
