import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { MetricCard } from "../components/ui/MetricCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { getOrdersByStore, getProductsByStore } from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";

export function AdminDashboard({ activePath, store }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const [remoteOrders, remoteProducts] = await Promise.all([
        getOrdersByStore(store.id),
        getProductsByStore(store.id),
      ]);
      setOrders(remoteOrders);
      setProducts(remoteProducts);
    } catch {
      setError("Não foi possível carregar os dados do dashboard. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [store.id]);

  const today = new Date().toDateString();
  const todaysOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today);
  const revenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
  const preparing = orders.filter((order) => order.orderStatus === "Em preparo").length;
  const activeProducts = products.filter((product) => product.active).length;
  const averageTicket = todaysOrders.length ? revenue / todaysOrders.length : 0;

  return (
    <AdminLayout activePath={activePath} store={store}>
      {error ? <div className="form-error">{error}</div> : null}
      {loading ? <Card><p>Carregando dashboard...</p></Card> : null}

      <section className="metrics-grid">
        <MetricCard label="Pedidos de hoje" value={todaysOrders.length} detail="dados da loja" />
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
          <Button variant="secondary" size="sm" disabled={loading} onClick={loadDashboard}>
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>

        {!loading && orders.length ? (
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
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id}>
                    <td>#{order.number}</td>
                    <td>{order.customer.name}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td><StatusBadge status={order.paymentStatus} /></td>
                    <td><StatusBadge status={order.orderStatus} fulfillment={order.fulfillment} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : null}

        {!loading && !error && !orders.length ? (
          <EmptyState title="Nenhum pedido" description="Os pedidos da loja aparecerão aqui." />
        ) : null}
      </section>
    </AdminLayout>
  );
}
