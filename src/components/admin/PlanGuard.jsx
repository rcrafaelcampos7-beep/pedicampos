import { Card } from "../ui/Card.jsx";
import { Link } from "../../routes/router.jsx";
import { getMinimumPlanForFeature, getPlanName, planHasFeature } from "../../utils/plans.js";
import { AdminLayout } from "./AdminLayout.jsx";

export function PlanGuard({ store, platform, feature, children, message, activePath }) {
  if (planHasFeature(store.plan, feature, platform)) return children;

  const requiredPlan = getMinimumPlanForFeature(feature);
  const blockedCard = (
    <Card className="plan-guard-card">
      <span className="eyebrow">Upgrade de plano</span>
      <h2>{message || `Recurso disponível no Plano ${getPlanName(platform, requiredPlan)}.`}</h2>
      <p>
        A loja {store.name} está no plano {getPlanName(platform, store.plan)}. Altere o plano no painel master
        para liberar este recurso.
      </p>
      <Link className="btn btn-primary btn-md" to="/master/planos">
        Fazer upgrade
      </Link>
    </Card>
  );

  return activePath ? <AdminLayout activePath={activePath} store={store}>{blockedCard}</AdminLayout> : blockedCard;
}
