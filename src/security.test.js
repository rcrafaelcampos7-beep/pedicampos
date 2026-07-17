import { describe, expect, it } from "vitest";
import { initialStores } from "./data/mockStores.js";

describe("higiene de seguranca do bundle", () => {
  it("mocks preservados nao carregam campo de senha", () => {
    expect(initialStores.length).toBeGreaterThan(0);
    expect(initialStores.every((store) => !("password" in store))).toBe(true);
  });
});
