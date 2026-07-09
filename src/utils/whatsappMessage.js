function normalizePaymentMethodLabel(value) {
  const text = String(value || "");
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("pix")) return "Pix";
  if (normalized.includes("dinheiro")) return "Dinheiro";
  if (normalized.includes("cart")) return "Cartão";
  return text;
}

function getPaymentDetails(order) {
  const paymentMethod = normalizePaymentMethodLabel(order?.paymentMethod);
  if (!paymentMethod) return "";

  const pixKey = order?.pixKey || order?.chavePix || "";
  return [
    "",
    `Forma de pagamento: ${paymentMethod}`,
    paymentMethod === "Pix" && pixKey ? `Chave Pix: ${pixKey}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateWhatsAppMessage(order, status) {
  const customer = order?.customer?.name || "cliente";
  const storeName = order?.storeName || "loja";
  const number = order?.number || order?.id || "0000";
  const slug = order?.storeSlug || "";
  const link = `${window.location.origin}/${slug}/pedido/${order?.id || number}`;
  const paymentDetails = getPaymentDetails(order);
  const trackingDetails = `${paymentDetails ? `${paymentDetails}\n` : ""}Acompanhe pelo link: ${link}`;

  const templates = {
    "Pedido criado": `Olá, ${customer}! Seu pedido #${number} foi criado na ${storeName}.\n${trackingDetails}`,
    "Aguardando pagamento": `Olá, ${customer}! Seu pedido #${number} na ${storeName} está aguardando pagamento.\n${trackingDetails}`,
    "Pagamento confirmado": `Olá, ${customer}! O pagamento do pedido #${number} na ${storeName} foi confirmado.\n${trackingDetails}`,
    "Pedido recebido": `Olá, ${customer}! Seu pedido #${number} foi recebido pela ${storeName}.\n${trackingDetails}`,
    "Em preparo": `Olá, ${customer}! Seu pedido #${number} está em preparo na ${storeName}.\n${trackingDetails}`,
    "Saiu para entrega": `Olá, ${customer}! Seu pedido #${number} saiu para entrega.\n${trackingDetails}`,
    Finalizado: `Olá, ${customer}! Seu pedido #${number} foi finalizado. Obrigado por comprar na ${storeName}!`,
    Cancelado: `Olá, ${customer}! Seu pedido #${number} foi cancelado pela ${storeName}. Fale conosco pelo WhatsApp para mais detalhes.`,
  };

  return templates[status] || `Olá, ${customer}! Seu pedido #${number} na ${storeName} está agora com o status: ${status}.\n${trackingDetails}`;
}
