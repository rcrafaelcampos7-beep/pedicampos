import { useEffect, useState } from "react";
import { MasterLayout } from "../components/master/MasterLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { PlanCard } from "../components/ui/PlanCard.jsx";
import { Select } from "../components/ui/Input.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { getAllStoresForMaster, getPlansForMaster, updateStore } from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getActivePlans, getPlanName, getPlanPriceLabel, PLAN_KEYS } from "../utils/plans.js";

export function MasterPlans({ activePath }) {
  const { platform: localPlatform } = usePediData();
  const [stores, setStores] = useState([]);
  const [remotePlans, setRemotePlans] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [plan, setPlan] = useState("pro");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const platform = {
    ...localPlatform,
    plans: Object.fromEntries(remotePlans.map((item) => [item.key, item])),
  };
  const activePlans = getActivePlans(platform).map((item) => ({
    ...item,
    price: item.priceLabel || `${formatCurrency(item.price)}/mês`,
  }));

  useEffect(() => {
    Promise.all([getAllStoresForMaster(), getPlansForMaster()])
      .then(([loadedStores, loadedPlans]) => {
        setStores(loadedStores);
        setRemotePlans(loadedPlans);
      })
      .catch(() => setFeedback("NÃ£o foi possÃ­vel carregar os planos do Supabase."));
  }, []);

  useEffect(() => {
    if (!storeId && stores[0]?.id) setStoreId(stores[0].id);
  }, [storeId, stores]);

  async function assignPlan() {
    if (!storeId || saving) return;
    setSaving(true);
    setFeedback("");
    try {
      await updateStore(storeId, { plan });
      setStores(await getAllStoresForMaster());
      setFeedback("Plano atualizado com sucesso.");
    } catch {
      setFeedback("Não foi possível atualizar o plano da loja. Tente novamente.");
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
        {feedback ? <p role="status">{feedback}</p> : null}
        <Button variant="primary" onClick={assignPlan} disabled={!storeId || saving}>
          {saving ? "Salvando..." : "Salvar plano da loja"}
        </Button>
      </Card>
    </MasterLayout>
  );
}
