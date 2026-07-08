import { useEffect, useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Textarea } from "../components/ui/Input.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { updatePlatform } from "../services/storage.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { PLAN_KEYS } from "../utils/plans.js";

function linesToArray(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function faqToText(faq = []) {
  return faq.map((item) => `${item.question} | ${item.answer}`).join("\n");
}

function textToFaq(value) {
  return linesToArray(value).map((line) => {
    const [question, ...answerParts] = line.split("|");
    return {
      question: question.trim(),
      answer: answerParts.join("|").trim() || "Resposta em edição.",
    };
  });
}

export function MasterSettings({ activePath }) {
  const { platform } = usePediData();
  const [form, setForm] = useState(platform);
  const [textAreas, setTextAreas] = useState({
    featureHighlights: "",
    features: "",
    howItWorksSteps: "",
    faq: "",
  });

  useEffect(() => {
    setForm(platform);
    setTextAreas({
      featureHighlights: (platform.featureHighlights || []).join("\n"),
      features: (platform.features || []).join("\n"),
      howItWorksSteps: (platform.howItWorksSteps || []).join("\n"),
      faq: faqToText(platform.faq || []),
    });
  }, [platform]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateSection(field, checked) {
    setForm((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [field]: checked,
      },
    }));
  }

  function updatePlan(planKey, field, value) {
    setForm((current) => ({
      ...current,
      plans: {
        ...current.plans,
        [planKey]: {
          ...current.plans[planKey],
          [field]: value,
          ...(field === "price" ? { priceLabel: `${formatCurrency(value)}/mês` } : {}),
        },
      },
    }));
  }

  function save(event) {
    event.preventDefault();
    const next = {
      ...form,
      implementationPrice: Number(form.implementationPrice) || 0,
      featureHighlights: linesToArray(textAreas.featureHighlights),
      features: linesToArray(textAreas.features),
      howItWorksSteps: linesToArray(textAreas.howItWorksSteps),
      faq: textToFaq(textAreas.faq),
      plans: Object.fromEntries(
        PLAN_KEYS.map((key) => [
          key,
          {
            ...form.plans[key],
            price: Number(form.plans[key].price) || 0,
            features: Array.isArray(form.plans[key].features)
              ? form.plans[key].features
              : linesToArray(form.plans[key].features),
          },
        ])
      ),
    };
    updatePlatform(next);
  }

  return (
    <MasterLayout activePath={activePath}>
      <form className="master-settings-grid" onSubmit={save}>
        <Card className="form-section settings-card">
          <span className="eyebrow">Configurações master</span>
          <h2>Identidade da plataforma</h2>
          <div className="form-grid">
            <Input label="Nome" value={form.name || ""} onChange={(event) => updateForm("name", event.target.value)} />
            <Input label="Logo / iniciais" value={form.logo || ""} onChange={(event) => updateForm("logo", event.target.value)} />
            <Input label="Cor principal" type="color" value={form.primaryColor} onChange={(event) => updateForm("primaryColor", event.target.value)} />
            <Input label="Cor secundária" type="color" value={form.secondaryColor} onChange={(event) => updateForm("secondaryColor", event.target.value)} />
            <Input label="WhatsApp comercial" value={form.whatsapp || ""} onChange={(event) => updateForm("whatsapp", event.target.value)} />
            <Input label="E-mail comercial" value={form.email || ""} onChange={(event) => updateForm("email", event.target.value)} />
            <Input label="Instagram" value={form.instagram || ""} onChange={(event) => updateForm("instagram", event.target.value)} />
            <Input
              label="Implantação"
              type="number"
              min="0"
              step="0.01"
              value={form.implementationPrice}
              onChange={(event) => updateForm("implementationPrice", event.target.value)}
              help={`Atual: ${formatCurrency(form.implementationPrice)}`}
            />
          </div>
        </Card>

        <Card className="form-section settings-card">
          <h2>Hero e textos principais</h2>
          <Input label="Slogan" value={form.slogan || ""} onChange={(event) => updateForm("slogan", event.target.value)} />
          <Textarea label="Frase secundária" value={form.subtitle || ""} onChange={(event) => updateForm("subtitle", event.target.value)} />
          <Input label="Título do banner" value={form.heroTitle || ""} onChange={(event) => updateForm("heroTitle", event.target.value)} />
          <Textarea label="Texto do banner" value={form.heroSubtitle || ""} onChange={(event) => updateForm("heroSubtitle", event.target.value)} />
          <div className="form-grid">
            <Input label="Botão principal" value={form.heroPrimaryButton || ""} onChange={(event) => updateForm("heroPrimaryButton", event.target.value)} />
            <Input label="Botão secundário" value={form.heroSecondaryButton || ""} onChange={(event) => updateForm("heroSecondaryButton", event.target.value)} />
          </div>
          <Textarea label="Texto do rodapé" value={form.footerText || ""} onChange={(event) => updateForm("footerText", event.target.value)} />
        </Card>

        <Card className="form-section settings-card">
          <h2>Seções da landing</h2>
          <div className="settings-switches">
            {Object.entries(form.sections || {}).map(([key, value]) => (
              <Checkbox key={key} label={key} checked={value} onChange={(checked) => updateSection(key, checked)} />
            ))}
          </div>
          <Textarea
            label="Cards de destaque, um por linha"
            value={textAreas.featureHighlights}
            onChange={(event) => setTextAreas((current) => ({ ...current, featureHighlights: event.target.value }))}
          />
          <Textarea
            label="Funcionalidades, uma por linha"
            value={textAreas.features}
            onChange={(event) => setTextAreas((current) => ({ ...current, features: event.target.value }))}
          />
          <Input label="Título Como funciona" value={form.howItWorksTitle || ""} onChange={(event) => updateForm("howItWorksTitle", event.target.value)} />
          <Textarea label="Texto Como funciona" value={form.howItWorksText || ""} onChange={(event) => updateForm("howItWorksText", event.target.value)} />
          <Textarea
            label="Passos Como funciona, um por linha"
            value={textAreas.howItWorksSteps}
            onChange={(event) => setTextAreas((current) => ({ ...current, howItWorksSteps: event.target.value }))}
          />
          <Textarea
            label="FAQ no formato Pergunta | Resposta"
            value={textAreas.faq}
            onChange={(event) => setTextAreas((current) => ({ ...current, faq: event.target.value }))}
          />
        </Card>

        <Card className="form-section settings-card">
          <h2>Planos exibidos na landing</h2>
          <div className="plans-editor-grid">
            {PLAN_KEYS.map((key) => {
              const plan = form.plans[key];
              return (
                <Card className="plan-editor-card" key={key}>
                  <h3>{plan.name}</h3>
                  <Input label="Nome" value={plan.name} onChange={(event) => updatePlan(key, "name", event.target.value)} />
                  <Input
                    label="Preço"
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.price}
                    onChange={(event) => updatePlan(key, "price", event.target.value)}
                  />
                  <Input label="Rótulo do preço" value={plan.priceLabel || ""} onChange={(event) => updatePlan(key, "priceLabel", event.target.value)} />
                  <Textarea label="Descrição" value={plan.description || ""} onChange={(event) => updatePlan(key, "description", event.target.value)} />
                  <Textarea
                    label="Recursos, um por linha"
                    value={Array.isArray(plan.features) ? plan.features.join("\n") : plan.features}
                    onChange={(event) => updatePlan(key, "features", event.target.value)}
                  />
                  <Input label="Selo" value={plan.badge || ""} onChange={(event) => updatePlan(key, "badge", event.target.value)} />
                  <Input
                    label="Texto comparativo"
                    value={plan.comparisonText || ""}
                    onChange={(event) => updatePlan(key, "comparisonText", event.target.value)}
                  />
                  <div className="settings-switches">
                    <Checkbox label="Ativo na landing" checked={plan.active !== false} onChange={(checked) => updatePlan(key, "active", checked)} />
                    <Checkbox label="Destaque visual" checked={Boolean(plan.highlighted)} onChange={(checked) => updatePlan(key, "highlighted", checked)} />
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        <Button type="submit" variant="primary" size="lg">
          Salvar configurações da plataforma
        </Button>
      </form>
    </MasterLayout>
  );
}
