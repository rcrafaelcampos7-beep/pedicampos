import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Card } from "../components/ui/Card.jsx";
import { MetricCard } from "../components/ui/MetricCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getPlanName } from "../utils/plans.js";

export function MasterDashboard({ activePath }) {
  const { stores, orders, platform } = usePediData();
  const activeStores = stores.filter((store) => store.active).length;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const planCounts = stores.reduce((acc, store) => {
    acc[store.plan] = (acc[store.plan] || 0) + 1;
    return acc;
  }, {});
  const topPlan = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "start";

  return (
    <MasterLayout activePath={activePath}>
      <section className="metrics-grid">
        <MetricCard label="Total de lojas" value={stores.length} />
        <MetricCard label="Lojas ativas" value={activeStores} tone="green" />
        <MetricCard label="Lojas inativas" value={stores.length - activeStores} tone="orange" />
        <MetricCard label="Pedidos totais" value={orders.length} tone="blue" />
        <MetricCard label="Faturamento simulado" value={formatCurrency(revenue)} tone="purple" />
        <MetricCard label="Plano mais usado" value={getPlanName(platform, topPlan)} tone="green" />
      </section>

      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Visão geral</span>
            <h2>Pedidos recentes de todas as lojas</h2>
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((order) => (
                <tr key={order.id}>
                  <td>#{order.number}</td>
                  <td>{order.storeName}</td>
                  <td>{order.customer.name}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <StatusBadge status={order.orderStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </MasterLayout>
  );
}
