import { describe, expect, it } from "vitest";
import {
  getOrderStatusActions, getOrderTimeline, isOrderStepDone,
  normalizeOrderStatusForFulfillment, ORDER_STATUS,
} from "./orderStatus.js";

describe("orderStatus", () => {
  it("mantem o fluxo de entrega", () => {
    expect(getOrderTimeline("delivery")).toContain(ORDER_STATUS.OUT_FOR_DELIVERY);
    expect(getOrderTimeline("delivery")).not.toContain(ORDER_STATUS.READY_FOR_PICKUP);
  });
  it("usa pronto para retirada no fluxo pickup", () => {
    expect(getOrderTimeline("pickup")).toContain(ORDER_STATUS.READY_FOR_PICKUP);
    expect(getOrderTimeline("retirada")).not.toContain(ORDER_STATUS.OUT_FOR_DELIVERY);
  });
  it("normaliza status legado de retirada", () => {
    expect(normalizeOrderStatusForFulfillment("out_for_delivery", "pickup")).toBe(ORDER_STATUS.READY_FOR_PICKUP);
    expect(normalizeOrderStatusForFulfillment(ORDER_STATUS.OUT_FOR_DELIVERY, "retirada")).toBe(ORDER_STATUS.READY_FOR_PICKUP);
  });
  it("preserva saiu para entrega em delivery", () => {
    expect(normalizeOrderStatusForFulfillment("out_for_delivery", "delivery")).toBe(ORDER_STATUS.OUT_FOR_DELIVERY);
  });
  it("oferece somente a acao adequada ao fulfillment", () => {
    expect(getOrderStatusActions("pickup")).toContain(ORDER_STATUS.READY_FOR_PICKUP);
    expect(getOrderStatusActions("pickup")).not.toContain(ORDER_STATUS.OUT_FOR_DELIVERY);
  });
  it("calcula etapas concluidas", () => {
    expect(isOrderStepDone(ORDER_STATUS.PREPARING, ORDER_STATUS.RECEIVED, "delivery")).toBe(true);
    expect(isOrderStepDone(ORDER_STATUS.RECEIVED, ORDER_STATUS.FINISHED, "delivery")).toBe(false);
  });
  it("nao conclui etapas de pedido cancelado", () => {
    expect(isOrderStepDone(ORDER_STATUS.CANCELED, ORDER_STATUS.RECEIVED, "delivery")).toBe(false);
  });
});
