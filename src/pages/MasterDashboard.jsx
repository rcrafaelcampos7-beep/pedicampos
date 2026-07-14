import { useEffect, useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { MetricCard } from "../components/ui/MetricCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { getMasterDashboardMetrics } from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getPlanName } from "../utils/plans.js";

const EMPTY_METRICS = {
  totalStores: 0,
  activeStores: 0,
  todayOrders: 0,
  todayRevenue: 0,
  inProgressOrders: 0,
  topPlan: "start",
  plans: [],
  recentOrders: [],
};

function platformFromPlans(plans) {
  return { plans: Object.fromEntries(plans.map((plan) => [plan.key, plan])) };
}

export function MasterDashboard({ activePath }) {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      setMetrics(await getMasterDashboardMetrics());
    } catch {
      setError("Nao foi possivel carregar o dashboard master. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const platform = platformFromPlans(metrics.plans);

  return (
    <MasterLayout activePath={activePath}>
      {error ? <div className="form-error">{error}</div> : null}
      {loading ? <Card><p>Carregando dashboard...</p></Card> : null}

      <section className="metrics-grid">
        <MetricCard label="Total de lojas" value={metrics.totalStores} />
        <MetricCard label="Lojas ativas" value={metrics.activeStores} tone="green" />
        <MetricCard label="Pedidos de hoje" value={metrics.todayOrders} tone="blue" />
        <MetricCard label="Faturamento de hoje" value={formatCurrency(metrics.todayRevenue)} tone="purple" />
        <MetricCard label="Pedidos em andamento" value={metrics.inProgressOrders} tone="orange" />
        <MetricCard label="Plano mais usado" value={getPlanName(platform, metrics.topPlan)} tone="green" />
      </section>

      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Visao geral</span>
            <h2>Pedidos recentes de todas as lojas</h2>
          </div>
          <Button variant="secondary" size="sm" disabled={loading} onClick={loadDashboard}>
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
        {!loading && metrics.recentOrders.length ? (
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
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.number}</td>
                    <td>{order.storeName}</td>
                    <td>{order.customer.name}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td><StatusBadge status={order.orderStatus} fulfillment={order.fulfillment} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : null}
        {!loading && !error && !metrics.recentOrders.length ? (
          <EmptyState title="Nenhum pedido" description="Os pedidos das lojas aparecerao aqui." />
        ) : null}
      </section>
    </MasterLayout>
  );
}
