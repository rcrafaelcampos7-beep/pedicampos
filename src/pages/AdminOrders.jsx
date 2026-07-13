import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { getOrdersByStore, updateOrder } from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getOrderStatusActions, normalizeOrderStatusForFulfillment, ORDER_STATUS, PAYMENT_STATUS } from "../utils/orderStatus.js";
import { planHasFeature } from "../utils/plans.js";
import { generateWhatsAppMessage } from "../utils/whatsappMessage.js";

export function AdminOrders({ activePath, store }) {
  const { platform } = usePediData();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const filteredOrders = filter === "todos"
    ? orders
    : orders.filter((order) => normalizeOrderStatusForFulfillment(order.orderStatus, order.fulfillment) === filter);
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId), [orders, selectedOrderId]);

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      setOrders(await getOrdersByStore(store.id));
    } catch {
      setError("Não foi possível carregar os pedidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [store.id]);

  async function changeOrder(orderId, data) {
    if (pending) return;
    setPending(true);
    try {
      await updateOrder(orderId, data);
      await loadOrders();
    } catch {
      setError("Não foi possível atualizar o pedido.");
    } finally {
      setPending(false);
    }
  }

  const formatAdditional = (addon) =>
    `${addon.groupName ? `${addon.groupName}: ` : ""}${addon.optionName || addon.name} ${
      Number(addon.price) > 0 ? `+ ${formatCurrency(addon.price)}` : "Grátis"
    }`;

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="panel-section">
        <div className="panel-heading">
          <div><span className="eyebrow">Pedidos</span><h2>Pedidos da loja</h2></div>
          <div className="row-actions">
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="todos">Todos os status</option>
              {Object.values(ORDER_STATUS).map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <Button variant="secondary" size="sm" disabled={loading || pending} onClick={loadOrders}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>
        {error ? <div className="form-error">{error}</div> : null}
        {loading ? <Card><p>Carregando pedidos...</p></Card> : null}
        {!loading && filteredOrders.length ? (
          <Card className="table-card">
            <table>
              <thead><tr><th>Número</th><th>Cliente</th><th>Telefone</th><th>Total</th><th>Pagamento</th><th>Status</th><th>Horário</th><th /></tr></thead>
              <tbody>{filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.number}</td><td>{order.customer.name}</td><td>{order.customer.phone}</td>
                  <td>{formatCurrency(order.total)}</td><td><StatusBadge status={order.paymentStatus} /></td>
                  <td><StatusBadge status={order.orderStatus} fulfillment={order.fulfillment} /></td>
                  <td>{new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td><Button variant="secondary" size="sm" onClick={() => setSelectedOrderId(order.id)}>Ver</Button></td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
        ) : !loading && !error ? <EmptyState title="Nenhum pedido" description="Os pedidos finalizados no checkout aparecem aqui." /> : null}
      </section>

      <Modal open={Boolean(selectedOrder)} title={`Pedido #${selectedOrder?.number}`} onClose={() => setSelectedOrderId("")} size="lg">
        {selectedOrder ? (
          <div className="order-detail">
            <div className="detail-grid">
              <Card><h3>Cliente</h3><p>{selectedOrder.customer.name}</p><p>{selectedOrder.customer.phone}</p></Card>
              <Card><h3>Pagamento</h3><p>{selectedOrder.paymentMethod}</p><StatusBadge status={selectedOrder.paymentStatus} /></Card>
              <Card><h3>Status</h3><StatusBadge status={selectedOrder.orderStatus} fulfillment={selectedOrder.fulfillment} /></Card>
            </div>
            <Card>
              <h3>Itens</h3>
              {selectedOrder.items.map((item, index) => (
                <div className="order-item" key={`${item.productId}-${index}`}>
                  <div><strong>{item.quantity}x {item.name}</strong>
                    {(item.selectedAdditionals || []).length ? <small>{item.selectedAdditionals.map(formatAdditional).join(", ")}</small> : null}
                    {item.note ? <small>Obs: {item.note}</small> : null}
                  </div><strong>{formatCurrency(item.total)}</strong>
                </div>
              ))}
              <div className="summary-grand"><span>Total</span><strong>{formatCurrency(selectedOrder.total)}</strong></div>
            </Card>
            {selectedOrder.address ? <Card><h3>Endereço</h3><p>{selectedOrder.address.street}, {selectedOrder.address.number} - {selectedOrder.address.district}{selectedOrder.address.complement ? `, ${selectedOrder.address.complement}` : ""}</p>{selectedOrder.notes ? <p>Obs: {selectedOrder.notes}</p> : null}</Card> : null}
            <div className="action-grid">
              <Button variant="success" disabled={pending} onClick={() => changeOrder(selectedOrder.id, { paymentStatus: PAYMENT_STATUS.APPROVED, orderStatus: ORDER_STATUS.PAYMENT_CONFIRMED })}>Confirmar pagamento</Button>
              {getOrderStatusActions(selectedOrder.fulfillment).map((status) => <Button key={status} variant="secondary" disabled={pending} onClick={() => changeOrder(selectedOrder.id, { orderStatus: status })}>{status}</Button>)}
            </div>
            {planHasFeature(store.plan, "whatsappAutomation", platform) ? <Card className="whatsapp-preview"><span>Prévia da mensagem automática de WhatsApp</span><p>{generateWhatsAppMessage(selectedOrder, selectedOrder.orderStatus)}</p></Card> : null}
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
