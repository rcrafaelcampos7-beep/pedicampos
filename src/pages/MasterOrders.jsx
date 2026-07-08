import { useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Select } from "../components/ui/Input.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { ORDER_STATUS } from "../utils/orderStatus.js";

export function MasterOrders({ activePath }) {
  const { stores, orders } = usePediData();
  const [storeId, setStoreId] = useState("todos");
  const [status, setStatus] = useState("todos");
  const filtered = orders.filter((order) => {
    const storeMatch = storeId === "todos" || order.storeId === storeId;
    const statusMatch = status === "todos" || order.orderStatus === status;
    return storeMatch && statusMatch;
  });

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
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
            <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="todos">Todos</option>
              {Object.values(ORDER_STATUS).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </div>
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
                  <td>
                    <StatusBadge status={order.paymentStatus} />
                  </td>
                  <td>
                    <StatusBadge status={order.orderStatus} />
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </MasterLayout>
  );
}
