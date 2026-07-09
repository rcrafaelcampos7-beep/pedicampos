import { Card } from "../components/ui/Card.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { OrderTimeline } from "../components/store/OrderTimeline.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { Link } from "../routes/router.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

export function OrderTrackingPage({ slug, orderId }) {
  const { orders } = usePediData();
  const order = orders.find((item) => item.id === orderId && item.storeSlug === slug);
  const formatAdditional = (addon) =>
    `${addon.groupName ? `${addon.groupName}: ` : ""}${addon.optionName || addon.name} ${
      Number(addon.price) > 0 ? `+ ${formatCurrency(addon.price)}` : "Grátis"
    }`;

  if (!order) {
    return (
      <main className="not-found">
        <Card>
          <h1>Pedido não encontrado</h1>
          <p>Confira o número do pedido ou volte para a loja.</p>
          <Link className="btn btn-primary btn-md" to={`/${slug}`}>
            Voltar para loja
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <div className="order-page">
      <header className="checkout-header">
        <Link to={`/${order.storeSlug}`} className="logo-link">
          <span className="brand-mark">{order.storeName.slice(0, 2)}</span>
          <strong>{order.storeName}</strong>
        </Link>
        <StatusBadge status={order.orderStatus} />
      </header>

      <main className="order-grid">
        <section>
          <span className="eyebrow">Acompanhamento</span>
          <h1>Pedido #{order.number}</h1>
          <p>Acompanhe o andamento do seu pedido por aqui.</p>
          <Card className="order-card">
            <div className="order-card-header">
              <div>
                <span>Cliente</span>
                <strong>{order.customer.name}</strong>
              </div>
              <div>
                <span>Status do pagamento</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>
            <OrderTimeline status={order.orderStatus} />
          </Card>

          <Card className="whatsapp-preview">
            <span>Pagamento</span>
            <p>{order.paymentMethod}</p>
            <span>Status do pagamento</span>
            <p>{order.paymentStatus}</p>
          </Card>
        </section>

        <aside className="order-summary">
          <Card>
            <h2>Itens</h2>
            {order.items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="order-item">
                <div>
                  <strong>
                    {item.quantity}x {item.name}
                  </strong>
                  {(item.selectedAdditionals || item.addons || []).length ? (
                    <small>
                      {(item.selectedAdditionals || item.addons || [])
                        .map((addon) => formatAdditional(addon))
                        .join(", ")}
                    </small>
                  ) : null}
                  {item.note ? <small>Obs: {item.note}</small> : null}
                </div>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            ))}
            <div className="summary-total">
              <span>Subtotal</span>
              <strong>{formatCurrency(order.subtotal)}</strong>
            </div>
            <div className="summary-total">
              <span>Entrega</span>
              <strong>{formatCurrency(order.deliveryFee)}</strong>
            </div>
            <div className="summary-grand">
              <span>Total</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </Card>

          <Card>
            <h2>Dados do pedido</h2>
            <p>
              <strong>Pagamento:</strong> {order.paymentMethod}
            </p>
            <p>
              <strong>Status do pagamento:</strong> {order.paymentStatus}
            </p>
            <p>
              <strong>Tipo:</strong> {order.fulfillment === "delivery" ? "Entrega" : "Retirada"}
            </p>
            {order.address ? (
              <p>
                <strong>Endereço:</strong> {order.address.street}, {order.address.number} -{" "}
                {order.address.district} {order.address.complement}
              </p>
            ) : null}
            {order.notes ? (
              <p>
                <strong>Observação:</strong> {order.notes}
              </p>
            ) : null}
          </Card>
        </aside>
      </main>
    </div>
  );
}
