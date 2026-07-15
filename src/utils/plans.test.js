import { describe, expect, it } from "vitest";
import {
  ENTITLEMENT_FEATURES, getDefaultEntitlementsForPlan, getMinimumPlanForFeature,
  hasFeature, normalizeFeature, normalizePlan, planHasFeature,
} from "./plans.js";

describe("plans e entitlements", () => {
  it("Start libera somente pedido WhatsApp por padrao", () => {
    expect(getDefaultEntitlementsForPlan("start")).toEqual([ENTITLEMENT_FEATURES.WHATSAPP_ORDERS]);
  });
  it("Pro libera pedidos salvos e acompanhamento", () => {
    const features = getDefaultEntitlementsForPlan("pro");
    expect(features).toContain(ENTITLEMENT_FEATURES.SAVED_ORDERS);
    expect(features).toContain(ENTITLEMENT_FEATURES.ORDER_TRACKING);
  });
  it("Premium contem todas as features", () => {
    expect(getDefaultEntitlementsForPlan("premium")).toEqual(expect.arrayContaining(Object.values(ENTITLEMENT_FEATURES)));
  });
  it("plano invalido cai com seguranca em Start", () => {
    expect(normalizePlan("desconhecido")).toBe("start");
  });
  it("hasFeature aceita array e objeto", () => {
    expect(hasFeature([ENTITLEMENT_FEATURES.SAVED_ORDERS], "ordersPanel")).toBe(true);
    expect(hasFeature({ features: [ENTITLEMENT_FEATURES.ONLINE_PAYMENT] }, "onlinePayments")).toBe(true);
  });
  it("feature desconhecida nao e concedida", () => {
    expect(hasFeature(getDefaultEntitlementsForPlan("premium"), "feature_inexistente")).toBe(false);
    expect(getMinimumPlanForFeature("feature_inexistente")).toBe("start");
  });
  it("respeita feature flags remotas", () => {
    const platform = { plans: { start: { featureFlags: ["custom"] }, pro: {}, premium: {} } };
    expect(planHasFeature("start", "custom", platform)).toBe(true);
    expect(normalizeFeature("siteCheckout")).toBe(ENTITLEMENT_FEATURES.SAVED_ORDERS);
  });
});
