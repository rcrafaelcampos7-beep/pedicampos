import { useMemo, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { updateOrder } from "../services/storage.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../utils/orderStatus.js";
import { generateWhatsAppMessage } from "../utils/whatsappMessage.js";

const statusActions = [
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.FINISHED,
  ORDER_STATUS.CANCELED,
];

export function AdminOrders({ activePath, store }) {
  const { orders } = usePediData();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [filter, setFilter] = useState("todos");
  const storeOrders = orders.filter((order) => order.storeId === store.id);
  const filteredOrders = filter === "todos" ? storeOrders : storeOrders.filter((order) => order.orderStatus === filter);
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId),
    [orders, selectedOrderId]
  );
  const formatAdditional = (addon) =>
    `${addon.groupName ? `${addon.groupName}: ` : ""}${addon.optionName || addon.name} ${
      Number(addon.price) > 0 ? `+ ${formatCurrency(addon.price)}` : "Grátis"
    }`;

  function setStatus(order, status) {
    updateOrder(order.id, {
      orderStatus: status,
      updatedAt: new Date().toISOString(),
    });
    // Integração futura: chamar a WhatsApp Cloud API com generateWhatsAppMessage(order, status).
  }

  function confirmPayment(order) {
    updateOrder(order.id, {
      paymentStatus: PAYMENT_STATUS.APPROVED,
      orderStatus: ORDER_STATUS.PAYMENT_CONFIRMED,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Pedidos</span>
            <h2>Pedidos da loja</h2>
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="todos">Todos os status</option>
            {Object.values(ORDER_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {filteredOrders.length ? (
          <Card className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Horário</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.number}</td>
                    <td>{order.customer.name}</td>
                    <td>{order.customer.phone}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td>
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td>{new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td>
                      <Button variant="secondary" size="sm" onClick={() => setSelectedOrderId(order.id)}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <EmptyState title="Nenhum pedido" description="Os pedidos finalizados no checkout aparecem aqui." />
        )}
      </section>

      <Modal open={Boolean(selectedOrder)} title={`Pedido #${selectedOrder?.number}`} onClose={() => setSelectedOrderId("")} size="lg">
        {selectedOrder ? (
          <div className="order-detail">
            <div className="detail-grid">
              <Card>
                <h3>Cliente</h3>
                <p>{selectedOrder.customer.name}</p>
                <p>{selectedOrder.customer.phone}</p>
              </Card>
              <Card>
                <h3>Pagamento</h3>
                <p>{selectedOrder.paymentMethod}</p>
                <StatusBadge status={selectedOrder.paymentStatus} />
              </Card>
              <Card>
                <h3>Status</h3>
                <StatusBadge status={selectedOrder.orderStatus} />
              </Card>
            </div>

            <Card>
              <h3>Itens</h3>
              {selectedOrder.items.map((item, index) => (
                <div className="order-item" key={`${item.productId}-${index}`}>
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
              <div className="summary-grand">
                <span>Total</span>
                <strong>{formatCurrency(selectedOrder.total)}</strong>
              </div>
            </Card>

            {selectedOrder.address ? (
              <Card>
                <h3>Endereço</h3>
                <p>
                  {selectedOrder.address.street}, {selectedOrder.address.number} - {selectedOrder.address.district}
                  {selectedOrder.address.complement ? `, ${selectedOrder.address.complement}` : ""}
                </p>
                {selectedOrder.notes ? <p>Obs: {selectedOrder.notes}</p> : null}
              </Card>
            ) : null}

            <div className="action-grid">
              <Button variant="success" onClick={() => confirmPayment(selectedOrder)}>
                Confirmar pagamento
              </Button>
              {statusActions.map((status) => (
                <Button key={status} variant="secondary" onClick={() => setStatus(selectedOrder, status)}>
                  {status}
                </Button>
              ))}
            </div>

            <Card className="whatsapp-preview">
              <span>Prévia da mensagem automática de WhatsApp</span>
              <p>{generateWhatsAppMessage(selectedOrder, selectedOrder.orderStatus)}</p>
            </Card>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
