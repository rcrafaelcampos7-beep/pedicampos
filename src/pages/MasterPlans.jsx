import { useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { PlanCard } from "../components/ui/PlanCard.jsx";
import { Select } from "../components/ui/Input.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { updateStore } from "../services/storage.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getActivePlans, getPlanName, getPlanPriceLabel, PLAN_KEYS } from "../utils/plans.js";

export function MasterPlans({ activePath }) {
  const { stores, platform } = usePediData();
  const [storeId, setStoreId] = useState(stores[0]?.id || "");
  const [plan, setPlan] = useState("pro");
  const activePlans = getActivePlans(platform).map((item) => ({
    ...item,
    price: item.priceLabel || `${formatCurrency(item.price)}/mês`,
  }));

  function assignPlan() {
    if (!storeId) return;
    updateStore(storeId, { plan });
  }

  return (
    <MasterLayout activePath={activePath}>
      <section className="panel-section">
        <div className="section-heading left">
          <span className="eyebrow">Planos</span>
          <h2>Planos comerciais</h2>
          <p>Implantação a partir de {formatCurrency(platform.implementationPrice)}.</p>
        </div>
        <div className="plans-grid">
          {activePlans.map((item) => (
            <PlanCard key={item.key} plan={item} featured={item.highlighted} />
          ))}
        </div>
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
        <Button variant="primary" onClick={assignPlan}>
          Salvar plano da loja
        </Button>
      </Card>
    </MasterLayout>
  );
}
