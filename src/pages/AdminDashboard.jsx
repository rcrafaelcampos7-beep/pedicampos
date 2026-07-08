import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Card } from "../components/ui/Card.jsx";
import { MetricCard } from "../components/ui/MetricCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { formatCurrency } from "../utils/formatCurrency.js";

export function AdminDashboard({ activePath, store }) {
  const { orders } = usePediData();
  const storeOrders = orders.filter((order) => order.storeId === store.id);
  const today = new Date().toDateString();
  const todaysOrders = storeOrders.filter((order) => new Date(order.createdAt).toDateString() === today);
  const revenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
  const preparing = storeOrders.filter((order) => order.orderStatus === "Em preparo").length;
  const activeProducts = store.products.filter((product) => product.active).length;
  const averageTicket = todaysOrders.length ? revenue / todaysOrders.length : 0;

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="metrics-grid">
        <MetricCard label="Pedidos de hoje" value={todaysOrders.length} detail="mock/localStorage" />
        <MetricCard label="Faturamento de hoje" value={formatCurrency(revenue)} tone="blue" />
        <MetricCard label="Em preparo" value={preparing} tone="orange" />
        <MetricCard label="Produtos ativos" value={activeProducts} tone="purple" />
        <MetricCard label="Ticket médio" value={formatCurrency(averageTicket)} tone="green" />
      </section>

      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Operação</span>
            <h2>Últimos pedidos</h2>
          </div>
        </div>
        <Card className="table-card">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {storeOrders.slice(0, 6).map((order) => (
                <tr key={order.id}>
                  <td>#{order.number}</td>
                  <td>{order.customer.name}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <StatusBadge status={order.paymentStatus} />
                  </td>
                  <td>
                    <StatusBadge status={order.orderStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </AdminLayout>
  );
}
