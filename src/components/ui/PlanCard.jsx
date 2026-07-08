import { Button } from "./Button.jsx";
import { Card } from "./Card.jsx";

export function PlanCard({ plan, featured = false, actionLabel, onAction }) {
  return (
    <Card className={`plan-card ${featured ? "plan-featured" : ""}`.trim()}>
      <div>
        <span className="plan-kicker">{plan.badge || plan.kicker}</span>
        <h3>{plan.name}</h3>
        <p>{plan.description}</p>
      </div>
      <strong className="plan-price">{plan.price}</strong>
      {plan.comparisonText ? <p className="plan-comparison">{plan.comparisonText}</p> : null}
      <ul>
        {(plan.features || []).map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {actionLabel ? (
        <Button variant={featured ? "primary" : "secondary"} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
