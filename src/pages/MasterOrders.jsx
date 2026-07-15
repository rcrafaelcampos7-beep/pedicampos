import { useEffect, useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Select } from "../components/ui/Input.jsx";
import { PaginationControls } from "../components/ui/PaginationControls.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { DEFAULT_PAGE_SIZE, getMasterOrdersPaginated, getStoresPaginated } from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { ORDER_STATUS } from "../utils/orderStatus.js";

export function MasterOrders({ activePath }) {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeId, setStoreId] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [storeOptionsPage, setStoreOptionsPage] = useState(1);
  const [storeOptionsPagination, setStoreOptionsPagination] = useState({ total: 0, totalPages: 1 });
  const filtered = orders;

  async function loadOrders(targetPage = page) {
    setLoading(true);
    setError("");
    try {
      const result = await getMasterOrdersPaginated({
        page: targetPage,
        pageSize: DEFAULT_PAGE_SIZE,
        storeId,
        status,
      });
      setOrders(result.data);
      setPagination({ total: result.total, totalPages: result.totalPages });
      if (targetPage > result.totalPages) setPage(result.totalPages);
    } catch {
      setError("Nao foi possivel carregar os pedidos globais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getStoresPaginated({ page: storeOptionsPage, pageSize: DEFAULT_PAGE_SIZE })
      .then((result) => {
        setStores(result.data);
        setStoreOptionsPagination({ total: result.total, totalPages: result.totalPages });
        if (storeId !== "todos" && !result.data.some((store) => store.id === storeId)) {
          setStoreId("todos");
          setPage(1);
        }
      })
      .catch(() => setError("Nao foi possivel carregar as lojas para o filtro."));
  }, [storeOptionsPage]);

  useEffect(() => {
    loadOrders(page);
  }, [page, storeId, status]);

  return (
    <MasterLayout activePath={activePath}>
      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Pedidos gerais</span>
            <h2>Pedidos de todas as lojas</h2>
          </div>
          <div className="filters-row">
            <Select label="Loja" value={storeId} onChange={(event) => { setStoreId(event.target.value); setPage(1); }}>
              <option value="todos">Todas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </Select>
            <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="todos">Todos</option>
              {Object.values(ORDER_STATUS).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Button variant="secondary" size="sm" disabled={loading} onClick={() => loadOrders(page)}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>
        <PaginationControls
          page={storeOptionsPage}
          totalPages={storeOptionsPagination.totalPages}
          total={storeOptionsPagination.total}
          loading={loading}
          onPageChange={setStoreOptionsPage}
        />
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
        {!error ? <PaginationControls page={page} totalPages={pagination.totalPages} total={pagination.total} loading={loading} onPageChange={setPage} /> : null}
      </section>
    </MasterLayout>
  );
}
