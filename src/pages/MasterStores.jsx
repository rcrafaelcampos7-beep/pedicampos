import { useEffect, useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { PaginationControls } from "../components/ui/PaginationControls.jsx";
import { Link } from "../routes/router.jsx";
import {
  deactivateStore,
  DEFAULT_PAGE_SIZE,
  getMasterStoreMetrics,
  getPlansPaginated,
  getStoresPaginated,
  updateStore,
} from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getPlanName, getPlanPriceLabel, PLAN_KEYS } from "../utils/plans.js";
import { uniqueSlug } from "../utils/slug.js";

export function MasterStores({ activePath }) {
  const [stores, setStores] = useState([]);
  const [storeMetrics, setStoreMetrics] = useState({});
  const [platform, setPlatform] = useState({ plans: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingStoreId, setPendingStoreId] = useState("");
  const [editingId, setEditingId] = useState("");
  const selectedStore = stores.find((store) => store.id === editingId);
  const [form, setForm] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    setForm(selectedStore ? { ...selectedStore } : null);
  }, [selectedStore]);

  async function loadStores(targetPage = page) {
    setLoading(true);
    setError("");
    try {
      const [storeResult, planResult] = await Promise.all([
        getStoresPaginated({ page: targetPage, pageSize: DEFAULT_PAGE_SIZE }),
        Object.keys(platform.plans).length
          ? Promise.resolve(null)
          : getPlansPaginated({ page: 1, pageSize: DEFAULT_PAGE_SIZE }),
      ]);
      const metrics = await getMasterStoreMetrics(storeResult.data.map((store) => store.id));
      setStores(storeResult.data);
      setStoreMetrics(metrics);
      setPagination({ total: storeResult.total, totalPages: storeResult.totalPages });
      if (targetPage > storeResult.totalPages) setPage(storeResult.totalPages);
      if (planResult) setPlatform({ plans: Object.fromEntries(planResult.data.map((plan) => [plan.key, plan])) });
    } catch {
      setError("Não foi possível carregar as lojas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores(page);
  }, [page]);

  async function toggleActive(store) {
    if (pendingStoreId) return;
    setPendingStoreId(store.id);
    setError("");
    try {
      if (store.active) await deactivateStore(store.id);
      else await updateStore(store.id, { active: true });
      await loadStores(page);
    } catch {
      setError("Não foi possível alterar o status da loja. Tente novamente.");
    } finally {
      setPendingStoreId("");
    }
  }

  async function saveStore(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await updateStore(form.id, {
        ...form,
        slug: uniqueSlug(form.slug, stores, form.id),
        deliveryFee: Number(form.deliveryFee) || 0,
        demoOrder: form.demoOrder === "" ? null : Number(form.demoOrder),
      });
      setEditingId("");
      await loadStores(page);
    } catch {
      setError("Não foi possível salvar a loja. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <MasterLayout activePath={activePath}>
      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Lojas</span>
            <h2>Todas as lojas cadastradas</h2>
          </div>
          <div className="row-actions">
            <Link className="btn btn-primary btn-md" to="/master/criar-loja">
              Criar loja
            </Link>
            <Button variant="secondary" size="sm" disabled={loading || saving || Boolean(pendingStoreId)} onClick={() => loadStores(page)}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        <div className="store-admin-grid">
          {loading ? <Card><p>Carregando lojas...</p></Card> : null}
          {!loading && !stores.length ? <Card><p>Nenhuma loja cadastrada.</p></Card> : null}
          {!loading && stores.map((store) => {
            const metrics = storeMetrics[store.id] || { orders: 0, revenue: 0 };
            return (
              <Card key={store.id} className="master-store-card">
                {typeof store.banner === "string" && store.banner.trim() ? (
                  <img src={store.banner} alt={store.name} loading="lazy" decoding="async" />
                ) : null}
                <div>
                  <div className="row-actions">
                    <Badge tone={store.active ? "success" : "danger"}>{store.active ? "Ativa" : "Inativa"}</Badge>
                    {store.isDemo ? <Badge tone="warning">Demo</Badge> : null}
                    {store.demoFeatured ? <Badge tone="success">Destacada</Badge> : null}
                  </div>
                  <h3>{store.name}</h3>
                  <p>/{store.slug}</p>
                  <span>{store.segment}</span>
                </div>
                <div className="store-card-metrics">
                  <span>{getPlanName(platform, store.plan)}</span>
                  <strong>{metrics.orders} pedidos</strong>
                  <strong>{formatCurrency(metrics.revenue)}</strong>
                </div>
                <div className="row-actions">
                  <Button variant="secondary" size="sm" onClick={() => setEditingId(store.id)}>
                    Editar
                  </Button>
                  <Link className="btn btn-secondary btn-sm" to={`/${store.slug}`}>
                    Acessar
                  </Link>
                  <Button
                    variant={store.active ? "warning" : "success"}
                    size="sm"
                    disabled={pendingStoreId === store.id}
                    onClick={() => toggleActive(store)}
                  >
                    {pendingStoreId === store.id ? "Salvando..." : store.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        {!error ? <PaginationControls page={page} totalPages={pagination.totalPages} total={pagination.total} loading={loading} onPageChange={setPage} /> : null}
      </section>

      <Modal open={Boolean(form)} title={`Editar ${form?.name || "loja"}`} onClose={() => setEditingId("")} size="lg">
        {form ? (
          <form className="form-section" onSubmit={saveStore}>
            <div className="form-grid">
              <Input label="Nome" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              <Input label="Slug" value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} />
              <Input label="Segmento" value={form.segment} onChange={(event) => updateForm("segment", event.target.value)} />
              <Select label="Plano" value={form.plan} onChange={(event) => updateForm("plan", event.target.value)}>
                {PLAN_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {getPlanName(platform, key)} - {getPlanPriceLabel(platform, key)}
                  </option>
                ))}
              </Select>
              <Input label="WhatsApp" value={form.whatsapp} onChange={(event) => updateForm("whatsapp", event.target.value)} />
              <Input label="Cor principal" type="color" value={form.primaryColor} onChange={(event) => updateForm("primaryColor", event.target.value)} />
              <Input label="Logo" value={form.logo} onChange={(event) => updateForm("logo", event.target.value)} />
              <Input label="Banner URL" value={form.banner} onChange={(event) => updateForm("banner", event.target.value)} />
              <Input
                label="Taxa de entrega"
                type="number"
                min="0"
                step="0.01"
                value={form.deliveryFee}
                onChange={(event) => updateForm("deliveryFee", event.target.value)}
              />
              <Input label="Tempo médio" value={form.deliveryTime} onChange={(event) => updateForm("deliveryTime", event.target.value)} />
              <Input label="Ordem na landing" type="number" min="0" value={form.demoOrder ?? ""} onChange={(event) => updateForm("demoOrder", event.target.value)} />
              <Input label="Rótulo da demonstração" value={form.demoLabel || ""} maxLength="80" onChange={(event) => updateForm("demoLabel", event.target.value)} />
            </div>
            <Textarea label="Endereço" value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
            <div className="settings-switches">
              <Checkbox label="Ativa" checked={form.active} onChange={(checked) => updateForm("active", checked)} />
              <Checkbox label="Aberta" checked={form.open} onChange={(checked) => updateForm("open", checked)} />
              <Checkbox
                label="Loja de demonstração"
                checked={Boolean(form.isDemo)}
                onChange={(checked) => setForm((current) => ({ ...current, isDemo: checked, demoFeatured: checked ? current.demoFeatured : false }))}
              />
              <Checkbox
                label="Destacar na landing"
                checked={Boolean(form.demoFeatured)}
                onChange={(checked) => setForm((current) => ({ ...current, isDemo: checked ? true : current.isDemo, demoFeatured: checked }))}
              />
            </div>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar loja"}
            </Button>
          </form>
        ) : null}
      </Modal>
    </MasterLayout>
  );
}
