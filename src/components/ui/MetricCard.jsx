import { Card } from "./Card.jsx";

export function MetricCard({ label, value, detail, tone = "green" }) {
  return (
    <Card className={`metric-card metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </Card>
  );
}
