import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Textarea } from "../components/ui/Input.jsx";
import {
  getPaymentMethodsByStore,
  getStoreSettings,
  updatePaymentMethods,
  updateStorePublicProfile,
  updateStoreSettings,
} from "../services/database.js";
import { slugify } from "../utils/slug.js";

function makeInitialForm(store) {
  return {
    ...store,
    address: "",
    openingHours: "",
    deliveryTime: "",
    deliveryFee: 0,
    minimumOrderValue: 0,
    deliveryEnabled: true,
    pickupEnabled: true,
    pixKey: "",
    paymentInstructions: "",
    paymentMethods: { pix: false, pixOnline: false, cash: false, card: false },
  };
}

export function AdminSettings({ activePath, store }) {
  const [form, setForm] = useState(() => makeInitialForm(store));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([getStoreSettings(store.id), getPaymentMethodsByStore(store.id)])
      .then(([settings, paymentMethods]) => {
        if (!active) return;
        setForm({
          ...makeInitialForm(store),
          ...(settings || {}),
          paymentMethods,
        });
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar as configurações. Tente novamente.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [store.id]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePayment(field, checked) {
    setForm((current) => ({
      ...current,
      paymentMethods: { ...current.paymentMethods, [field]: checked },
    }));
  }

  async function saveSettings(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await Promise.all([
        updateStorePublicProfile(store.id, {
          name: form.name,
          slug: slugify(form.slug),
          segment: form.segment,
          open: form.open,
          primaryColor: form.primaryColor,
          whatsapp: form.whatsapp,
          logo: form.logo,
          banner: form.banner,
        }),
        updateStoreSettings(store.id, {
          address: form.address,
          openingHours: form.openingHours,
          deliveryTime: form.deliveryTime,
          deliveryFee: Number(form.deliveryFee) || 0,
          minimumOrderValue: Number(form.minimumOrderValue) || 0,
          deliveryEnabled: form.deliveryEnabled,
          pickupEnabled: form.pickupEnabled,
          pixKey: form.pixKey,
          paymentInstructions: form.paymentInstructions,
        }),
        updatePaymentMethods(store.id, form.paymentMethods),
      ]);
      setSuccess("Configurações salvas com sucesso.");
    } catch {
      setError("Não foi possível salvar todas as configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <Card className="form-section settings-card">
        <span className="eyebrow">Configurações</span>
        <h2>Dados da loja</h2>
        {loading ? <p>Carregando configurações...</p> : null}
        {error ? <div className="form-error">{error}</div> : null}
        {success ? <div className="form-success">{success}</div> : null}
        {!loading ? (
          <form onSubmit={saveSettings}>
            <div className="form-grid">
              <Input label="Nome da loja" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              <Input label="Slug" value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} />
              <Input label="Segmento" value={form.segment} onChange={(event) => updateForm("segment", event.target.value)} />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(event) => updateForm("whatsapp", event.target.value)} />
              <Input label="Cor principal" type="color" value={form.primaryColor} onChange={(event) => updateForm("primaryColor", event.target.value)} />
              <Input label="Logo ou iniciais" value={form.logo} onChange={(event) => updateForm("logo", event.target.value)} />
              <Input label="Banner URL" value={form.banner} onChange={(event) => updateForm("banner", event.target.value)} />
              <Input label="Tempo médio" value={form.deliveryTime} onChange={(event) => updateForm("deliveryTime", event.target.value)} />
              <Input label="Taxa de entrega" type="number" min="0" step="0.01" value={form.deliveryFee} onChange={(event) => updateForm("deliveryFee", event.target.value)} />
              <Input label="Pedido mínimo" type="number" min="0" step="0.01" value={form.minimumOrderValue} onChange={(event) => updateForm("minimumOrderValue", event.target.value)} />
              <Input label="Horário de funcionamento" value={form.openingHours} onChange={(event) => updateForm("openingHours", event.target.value)} />
              <Input label="Chave Pix" value={form.pixKey} onChange={(event) => updateForm("pixKey", event.target.value)} />
            </div>
            <Textarea label="Endereço" value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
            <Textarea label="Instruções de pagamento" value={form.paymentInstructions} onChange={(event) => updateForm("paymentInstructions", event.target.value)} />
            <div className="settings-switches">
              <Checkbox label="Loja aberta" checked={form.open} onChange={(checked) => updateForm("open", checked)} />
              <Checkbox label="Entrega habilitada" checked={form.deliveryEnabled} onChange={(checked) => updateForm("deliveryEnabled", checked)} />
              <Checkbox label="Retirada habilitada" checked={form.pickupEnabled} onChange={(checked) => updateForm("pickupEnabled", checked)} />
            </div>
            <div className="settings-switches">
              <Checkbox label="Pix" checked={Boolean(form.paymentMethods.pix)} onChange={(checked) => updatePayment("pix", checked)} />
              <Checkbox label="Pix automático / QR Code" checked={Boolean(form.paymentMethods.pixOnline)} onChange={(checked) => updatePayment("pixOnline", checked)} />
              <Checkbox label="Dinheiro" checked={Boolean(form.paymentMethods.cash)} onChange={(checked) => updatePayment("cash", checked)} />
              <Checkbox label="Cartão" checked={Boolean(form.paymentMethods.card)} onChange={(checked) => updatePayment("card", checked)} />
            </div>
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {saving ? "Salvando..." : "Salvar configurações"}
            </Button>
          </form>
        ) : null}
      </Card>
    </AdminLayout>
  );
}
