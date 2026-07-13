export const PAYMENT_STATUS = {
  WAITING: "Aguardando pagamento",
  APPROVED: "Pagamento confirmado",
  PENDING: "Pendente",
  REFUSED: "Recusado",
};

export const ORDER_STATUS = {
  WAITING_PAYMENT: "Aguardando pagamento",
  PAYMENT_CONFIRMED: "Pagamento confirmado",
  RECEIVED: "Pedido recebido",
  PREPARING: "Em preparo",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  READY_FOR_PICKUP: "Pronto para retirada",
  FINISHED: "Finalizado",
  CANCELED: "Cancelado",
};

export const ORDER_TIMELINE = [
  ORDER_STATUS.WAITING_PAYMENT,
  ORDER_STATUS.PAYMENT_CONFIRMED,
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.FINISHED,
];

export const PICKUP_ORDER_TIMELINE = [
  ORDER_STATUS.WAITING_PAYMENT,
  ORDER_STATUS.PAYMENT_CONFIRMED,
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.FINISHED,
];

export function isPickupFulfillment(fulfillment) {
  return ["pickup", "retirada"].includes(String(fulfillment || "").toLowerCase());
}

export function normalizeOrderStatusForFulfillment(status, fulfillment) {
  const legacyStatus = status === "out_for_delivery" ? ORDER_STATUS.OUT_FOR_DELIVERY : status;
  if (isPickupFulfillment(fulfillment) && legacyStatus === ORDER_STATUS.OUT_FOR_DELIVERY) {
    return ORDER_STATUS.READY_FOR_PICKUP;
  }
  return legacyStatus;
}

export function getOrderTimeline(fulfillment) {
  return isPickupFulfillment(fulfillment) ? PICKUP_ORDER_TIMELINE : ORDER_TIMELINE;
}

export function getOrderStatusActions(fulfillment) {
  return [
    ORDER_STATUS.RECEIVED,
    ORDER_STATUS.PREPARING,
    isPickupFulfillment(fulfillment) ? ORDER_STATUS.READY_FOR_PICKUP : ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.FINISHED,
    ORDER_STATUS.CANCELED,
  ];
}

export function statusTone(status) {
  if ([ORDER_STATUS.FINISHED, PAYMENT_STATUS.APPROVED].includes(status)) return "success";
  if ([ORDER_STATUS.CANCELED, PAYMENT_STATUS.REFUSED].includes(status)) return "danger";
  if ([ORDER_STATUS.PREPARING, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.READY_FOR_PICKUP].includes(status)) return "warning";
  return "neutral";
}

export function isOrderStepDone(currentStatus, step, fulfillment) {
  if (currentStatus === ORDER_STATUS.CANCELED) return false;
  const timeline = getOrderTimeline(fulfillment);
  const normalizedStatus = normalizeOrderStatusForFulfillment(currentStatus, fulfillment);
  return timeline.indexOf(step) <= timeline.indexOf(normalizedStatus);
}
