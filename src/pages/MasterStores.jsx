import { useEffect, useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Link } from "../routes/router.jsx";
import {
  deactivateStore,
  getAllOrdersForMaster,
  getAllStoresForMaster,
  getPlansForMaster,
  updateStore,
} from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getPlanName, getPlanPriceLabel, PLAN_KEYS } from "../utils/plans.js";
import { uniqueSlug } from "../utils/slug.js";

export function MasterStores({ activePath }) {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [platform, setPlatform] = useState({ plans: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingStoreId, setPendingStoreId] = useState("");
  const [editingId, setEditingId] = useState("");
  const selectedStore = stores.find((store) => store.id === editingId);
  const [form, setForm] = useState(null);

  useEffect(() => {
    setForm(selectedStore ? { ...selectedStore } : null);
  }, [selectedStore]);

  async function loadStores() {
    setLoading(true);
    setError("");
    try {
      const [remoteStores, remoteOrders, remotePlans] = await Promise.all([
        getAllStoresForMaster(),
        getAllOrdersForMaster(),
        getPlansForMaster(),
      ]);
      setStores(remoteStores);
      setOrders(remoteOrders);
      setPlatform({ plans: Object.fromEntries(remotePlans.map((plan) => [plan.key, plan])) });
    } catch {
      setError("Não foi possível carregar as lojas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  async function toggleActive(store) {
    if (pendingStoreId) return;
    setPendingStoreId(store.id);
    setError("");
    try {
      if (store.active) await deactivateStore(store.id);
      else await updateStore(store.id, { active: true });
      await loadStores();
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
      });
      setEditingId("");
      await loadStores();
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
          <Link className="btn btn-primary btn-md" to="/master/criar-loja">
            Criar loja
          </Link>
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        <div className="store-admin-grid">
          {loading ? <Card><p>Carregando lojas...</p></Card> : null}
          {!loading && !stores.length ? <Card><p>Nenhuma loja cadastrada.</p></Card> : null}
          {!loading && stores.map((store) => {
            const storeOrders = orders.filter((order) => order.storeId === store.id);
            const revenue = storeOrders.reduce((sum, order) => sum + order.total, 0);
            return (
              <Card key={store.id} className="master-store-card">
                <img src={store.banner} alt={store.name} />
                <div>
                  <Badge tone={store.active ? "success" : "danger"}>{store.active ? "Ativa" : "Inativa"}</Badge>
                  <h3>{store.name}</h3>
                  <p>/{store.slug}</p>
                  <span>{store.segment}</span>
                </div>
                <div className="store-card-metrics">
                  <span>{getPlanName(platform, store.plan)}</span>
                  <strong>{storeOrders.length} pedidos</strong>
                  <strong>{formatCurrency(revenue)}</strong>
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
            </div>
            <Textarea label="Endereço" value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
            <div className="settings-switches">
              <Checkbox label="Ativa" checked={form.active} onChange={(checked) => updateForm("active", checked)} />
              <Checkbox label="Aberta" checked={form.open} onChange={(checked) => updateForm("open", checked)} />
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
