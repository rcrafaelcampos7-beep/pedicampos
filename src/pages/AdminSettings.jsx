import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Textarea } from "../components/ui/Input.jsx";
import { updateStore } from "../services/storage.js";
import { slugify } from "../utils/slug.js";

export function AdminSettings({ activePath, store }) {
  const [form, setForm] = useState(store);

  useEffect(() => {
    setForm(store);
  }, [store]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePayment(field, checked) {
    setForm((current) => ({
      ...current,
      paymentMethods: {
        ...current.paymentMethods,
        [field]: checked,
      },
    }));
  }

  function saveSettings(event) {
    event.preventDefault();
    updateStore(store.id, {
      ...form,
      slug: slugify(form.slug),
      deliveryFee: Number(form.deliveryFee) || 0,
    });
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <Card className="form-section settings-card">
        <span className="eyebrow">Configurações</span>
        <h2>Dados da loja</h2>
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
            <Input
              label="Taxa de entrega"
              type="number"
              min="0"
              step="0.01"
              value={form.deliveryFee}
              onChange={(event) => updateForm("deliveryFee", event.target.value)}
            />
            <Input
              label="Horário de funcionamento"
              value={form.openingHours}
              onChange={(event) => updateForm("openingHours", event.target.value)}
            />
          </div>
          <Textarea label="Endereço" value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
          <div className="settings-switches">
            <Checkbox label="Loja aberta" checked={form.open} onChange={(checked) => updateForm("open", checked)} />
            <Checkbox label="Loja ativa" checked={form.active} onChange={(checked) => updateForm("active", checked)} />
          </div>
          <div className="settings-switches">
            <Checkbox label="Pix online" checked={form.paymentMethods.pixOnline} onChange={(checked) => updatePayment("pixOnline", checked)} />
            <Checkbox label="Pix na entrega" checked={form.paymentMethods.pixDelivery} onChange={(checked) => updatePayment("pixDelivery", checked)} />
            <Checkbox label="Dinheiro" checked={form.paymentMethods.cash} onChange={(checked) => updatePayment("cash", checked)} />
            <Checkbox label="Cartão na entrega" checked={form.paymentMethods.cardDelivery} onChange={(checked) => updatePayment("cardDelivery", checked)} />
          </div>
          <Button type="submit" variant="primary" size="lg">
            Salvar configurações
          </Button>
        </form>
      </Card>
    </AdminLayout>
  );
}
