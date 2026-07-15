import { useEffect, useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { PlanCard } from "../components/ui/PlanCard.jsx";
import { Select } from "../components/ui/Input.jsx";
import { PaginationControls } from "../components/ui/PaginationControls.jsx";
import {
  DEFAULT_PAGE_SIZE,
  getPlansPaginated,
  getPlatformSettingsForMaster,
  getStoresPaginated,
  updateStore,
} from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getActivePlans, getPlanName, getPlanPriceLabel, PLAN_KEYS } from "../utils/plans.js";

export function MasterPlans({ activePath }) {
  const [stores, setStores] = useState([]);
  const [remotePlans, setRemotePlans] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({ implementationPrice: 0 });
  const [storeId, setStoreId] = useState("");
  const [plan, setPlan] = useState("pro");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storesLoading, setStoresLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [page, setPage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [storePagination, setStorePagination] = useState({ total: 0, totalPages: 1 });
  const platform = {
    ...platformSettings,
    plans: Object.fromEntries(remotePlans.map((item) => [item.key, item])),
  };
  const activePlans = getActivePlans(platform).map((item) => ({
    ...item,
    price: item.priceLabel || `${formatCurrency(item.price)}/mes`,
  }));

  async function loadPlans(targetPage = page) {
    setLoading(true);
    setFeedback("");
    try {
      const [planResult, settings] = await Promise.all([
        getPlansPaginated({ page: targetPage, pageSize: DEFAULT_PAGE_SIZE }),
        getPlatformSettingsForMaster(),
      ]);
      setRemotePlans(planResult.data);
      setPlatformSettings(settings);
      setPagination({ total: planResult.total, totalPages: planResult.totalPages });
      if (targetPage > planResult.totalPages) setPage(planResult.totalPages);
    } catch {
      setFeedback("Nao foi possivel carregar os planos do Supabase.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStores(targetPage = storePage) {
    setStoresLoading(true);
    try {
      const result = await getStoresPaginated({ page: targetPage, pageSize: DEFAULT_PAGE_SIZE });
      setStores(result.data);
      setStorePagination({ total: result.total, totalPages: result.totalPages });
      if (targetPage > result.totalPages) setStorePage(result.totalPages);
    } catch {
      setFeedback("Nao foi possivel carregar as lojas do Supabase.");
    } finally {
      setStoresLoading(false);
    }
  }

  useEffect(() => { loadPlans(page); }, [page]);
  useEffect(() => { loadStores(storePage); }, [storePage]);

  useEffect(() => {
    if (!stores.some((store) => store.id === storeId)) setStoreId(stores[0]?.id || "");
  }, [storeId, stores]);

  async function assignPlan() {
    if (!storeId || saving) return;
    setSaving(true);
    setFeedback("");
    try {
      await updateStore(storeId, { plan });
      await loadStores(storePage);
      setFeedback("Plano atualizado com sucesso.");
    } catch {
      setFeedback("Nao foi possivel atualizar o plano da loja. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MasterLayout activePath={activePath}>
      <section className="panel-section">
        <div className="section-heading left">
          <span className="eyebrow">Planos</span>
          <h2>Planos comerciais</h2>
          <p>Implantacao a partir de {formatCurrency(platform.implementationPrice)}.</p>
          <Button variant="secondary" size="sm" disabled={loading} onClick={() => loadPlans(page)}>
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
        {feedback ? <p role="status">{feedback}</p> : null}
        {loading ? <Card><p>Carregando planos...</p></Card> : null}
        {!loading && !activePlans.length ? <Card><p>Nenhum plano cadastrado.</p></Card> : null}
        <div className="plans-grid">
          {activePlans.map((item) => (
            <PlanCard key={item.key} plan={item} featured={item.highlighted} />
          ))}
        </div>
        <PaginationControls page={page} totalPages={pagination.totalPages} total={pagination.total} loading={loading} onPageChange={setPage} />
      </section>

      <Card className="form-section">
        <h2>Associar plano a uma loja</h2>
        <div className="form-grid compact-grid">
          <Select label="Loja" value={storeId} onChange={(event) => setStoreId(event.target.value)}>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} - {getPlanName(platform, store.plan)}
              </option>
            ))}
          </Select>
          <Select label="Plano" value={plan} onChange={(event) => setPlan(event.target.value)}>
            {PLAN_KEYS.map((key) => (
              <option key={key} value={key}>
                {getPlanName(platform, key)} - {getPlanPriceLabel(platform, key)}
              </option>
            ))}
          </Select>
        </div>
        <PaginationControls
          page={storePage}
          totalPages={storePagination.totalPages}
          total={storePagination.total}
          loading={storesLoading || saving}
          onPageChange={setStorePage}
        />
        {!storesLoading && !stores.length ? <p>Nenhuma loja cadastrada.</p> : null}
        <Button variant="primary" onClick={assignPlan} disabled={!storeId || saving || storesLoading}>
          {saving ? "Salvando..." : "Salvar plano da loja"}
        </Button>
      </Card>
    </MasterLayout>
  );
}
