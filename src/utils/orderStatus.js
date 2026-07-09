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

export function statusTone(status) {
  if ([ORDER_STATUS.FINISHED, PAYMENT_STATUS.APPROVED].includes(status)) return "success";
  if ([ORDER_STATUS.CANCELED, PAYMENT_STATUS.REFUSED].includes(status)) return "danger";
  if ([ORDER_STATUS.PREPARING, ORDER_STATUS.OUT_FOR_DELIVERY].includes(status)) return "warning";
  return "neutral";
}

export function isOrderStepDone(currentStatus, step) {
  if (currentStatus === ORDER_STATUS.CANCELED) return false;
  return ORDER_TIMELINE.indexOf(step) <= ORDER_TIMELINE.indexOf(currentStatus);
}
