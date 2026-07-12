import { useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { navigate } from "../routes/router.jsx";
import { createStore as createDatabaseStore, getStores } from "../services/database.js";
import { getPlanName, getPlanPriceLabel, PLAN_KEYS } from "../utils/plans.js";
import { slugify, uniqueSlug } from "../utils/slug.js";

export function MasterCreateStore({ activePath }) {
  const { platform } = usePediData();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    segment: "",
    whatsapp: "",
    address: "",
    primaryColor: "#16a34a",
    logo: "",
    banner: "",
    plan: "start",
    active: true,
  });

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "name" && !current.slug ? { slug: slugify(value) } : {}),
    }));
  }

  async function createStore(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const stores = await getStores();
      const slug = uniqueSlug(form.slug || form.name, stores);
      await createDatabaseStore({
      name: form.name,
      slug,
      segment: form.segment || "Delivery local",
      whatsapp: form.whatsapp || "559999000000",
      address: form.address || "Endereço da loja",
      primaryColor: form.primaryColor,
      logo: form.logo || form.name.slice(0, 2).toUpperCase(),
      banner: form.banner || stores[0]?.banner || "",
      plan: form.plan,
      active: form.active,
      categories: [],
      products: [],
    });

      navigate("/master/lojas");
    } catch {
      setError("Não foi possível criar a loja. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MasterLayout activePath={activePath}>
      <Card className="form-section settings-card">
        <span className="eyebrow">Nova loja</span>
        <h2>Criar loja multi-loja</h2>
        <p>Ao criar, a loja já funciona publicamente pelo slug e pode ser editada no admin.</p>
        {error ? <div className="form-error">{error}</div> : null}
        <form onSubmit={createStore}>
          <div className="form-grid">
            <Input label="Nome da loja" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required />
            <Input label="Slug" value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} required />
            <Input label="Segmento" value={form.segment} onChange={(event) => updateForm("segment", event.target.value)} />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(event) => updateForm("whatsapp", event.target.value)} />
            <Input label="Cor principal" type="color" value={form.primaryColor} onChange={(event) => updateForm("primaryColor", event.target.value)} />
            <Input label="Logo URL ou iniciais" value={form.logo} onChange={(event) => updateForm("logo", event.target.value)} />
            <Input label="Banner URL" value={form.banner} onChange={(event) => updateForm("banner", event.target.value)} />
            <Select label="Plano" value={form.plan} onChange={(event) => updateForm("plan", event.target.value)}>
              {PLAN_KEYS.map((key) => (
                <option key={key} value={key}>
                  {getPlanName(platform, key)} - {getPlanPriceLabel(platform, key)}
                </option>
              ))}
            </Select>
          </div>
          <Textarea label="Endereço" value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
          <Checkbox label="Criar ativa" checked={form.active} onChange={(checked) => updateForm("active", checked)} />
          <Button type="submit" variant="primary" size="lg" disabled={submitting}>
            {submitting ? "Criando..." : "Criar loja"}
          </Button>
        </form>
      </Card>
    </MasterLayout>
  );
}
