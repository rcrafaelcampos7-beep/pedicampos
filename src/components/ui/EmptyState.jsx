import { Button } from "./Button.jsx";

export function EmptyState({ title, description, actionLabel, onAction, icon, className = "" }) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      {icon ? <span className="empty-state-icon" aria-hidden="true">{icon}</span> : null}
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {actionLabel ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
