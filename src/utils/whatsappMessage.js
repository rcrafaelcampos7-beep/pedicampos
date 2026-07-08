export function generateWhatsAppMessage(order, status) {
  const customer = order?.customer?.name || "cliente";
  const storeName = order?.storeName || "loja";
  const number = order?.number || order?.id || "0000";
  const slug = order?.storeSlug || "";
  const link = `${window.location.origin}/${slug}/pedido/${order?.id || number}`;

  const templates = {
    "Pedido criado": `Olá, ${customer}! Seu pedido #${number} foi criado na ${storeName}. Acompanhe pelo link: ${link}`,
    "Aguardando pagamento": `Olá, ${customer}! Seu pedido #${number} na ${storeName} está aguardando pagamento. Acompanhe pelo link: ${link}`,
    "Pagamento confirmado": `Olá, ${customer}! O pagamento do pedido #${number} na ${storeName} foi confirmado. Acompanhe pelo link: ${link}`,
    "Pedido recebido": `Olá, ${customer}! Seu pedido #${number} foi recebido pela ${storeName}. Acompanhe pelo link: ${link}`,
    "Em preparo": `Olá, ${customer}! Seu pedido #${number} está em preparo na ${storeName}. Acompanhe pelo link: ${link}`,
    "Saiu para entrega": `Olá, ${customer}! Seu pedido #${number} saiu para entrega. Acompanhe pelo link: ${link}`,
    Finalizado: `Olá, ${customer}! Seu pedido #${number} foi finalizado. Obrigado por comprar na ${storeName}!`,
    Cancelado: `Olá, ${customer}! Seu pedido #${number} foi cancelado pela ${storeName}. Fale conosco pelo WhatsApp para mais detalhes.`,
  };

  return templates[status] || `Olá, ${customer}! Seu pedido #${number} na ${storeName} está agora com o status: ${status}. Acompanhe pelo link: ${link}`;
}
