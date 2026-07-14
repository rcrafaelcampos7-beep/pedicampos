import { useEffect, useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Select } from "../components/ui/Input.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { getAllOrdersForMaster, getAllStoresForMaster } from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { normalizeOrderStatusForFulfillment, ORDER_STATUS } from "../utils/orderStatus.js";

export function MasterOrders({ activePath }) {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeId, setStoreId] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const filtered = orders.filter((order) => {
    const storeMatch = storeId === "todos" || order.storeId === storeId;
    const normalizedStatus = normalizeOrderStatusForFulfillment(order.orderStatus, order.fulfillment);
    const statusMatch = status === "todos" || normalizedStatus === status;
    return storeMatch && statusMatch;
  });

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const [remoteStores, remoteOrders] = await Promise.all([
        getAllStoresForMaster(),
        getAllOrdersForMaster(),
      ]);
      setStores(remoteStores);
      setOrders(remoteOrders);
    } catch {
      setError("Nao foi possivel carregar os pedidos globais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <MasterLayout activePath={activePath}>
      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Pedidos gerais</span>
            <h2>Pedidos de todas as lojas</h2>
          </div>
          <div className="filters-row">
            <Select label="Loja" value={storeId} onChange={(event) => setStoreId(event.target.value)}>
              <option value="todos">Todas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </Select>
            <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="todos">Todos</option>
              {Object.values(ORDER_STATUS).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Button variant="secondary" size="sm" disabled={loading} onClick={loadOrders}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>
        {error ? <div className="form-error">{error}</div> : null}
        {loading ? <Card><p>Carregando pedidos...</p></Card> : null}
        {!loading && filtered.length ? (
          <Card className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Loja</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.number}</td>
                    <td>{order.storeName}</td>
                    <td>{order.customer.name}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td><StatusBadge status={order.paymentStatus} /></td>
                    <td><StatusBadge status={order.orderStatus} fulfillment={order.fulfillment} /></td>
                    <td>{new Date(order.createdAt).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : null}
        {!loading && !error && !filtered.length ? (
          <EmptyState title="Nenhum pedido" description="Nenhum pedido corresponde aos filtros selecionados." />
        ) : null}
      </section>
    </MasterLayout>
  );
}
