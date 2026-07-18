import { useId } from "react";

function FieldMessage({ id, error, help }) {
  const message = error || help;
  if (!message) return null;

  return (
    <small id={id} className={error ? "field-error" : "field-help"}>
      {message}
    </small>
  );
}

export function Input({ label, help, error, className = "", id, ...props }) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const messageId = help || error ? `${controlId}-message` : undefined;

  return (
    <div className={`field ${error ? "field-invalid" : ""} ${className}`.trim()}>
      {label ? <label htmlFor={controlId}><span>{label}</span></label> : null}
      <input
        id={controlId}
        aria-describedby={messageId}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
      <FieldMessage id={messageId} error={error} help={help} />
    </div>
  );
}

export function Textarea({ label, help, error, className = "", id, ...props }) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const messageId = help || error ? `${controlId}-message` : undefined;

  return (
    <div className={`field ${error ? "field-invalid" : ""} ${className}`.trim()}>
      {label ? <label htmlFor={controlId}><span>{label}</span></label> : null}
      <textarea
        id={controlId}
        aria-describedby={messageId}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
      <FieldMessage id={messageId} error={error} help={help} />
    </div>
  );
}

export function Select({ label, help, error, children, className = "", id, ...props }) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const messageId = help || error ? `${controlId}-message` : undefined;

  return (
    <div className={`field ${error ? "field-invalid" : ""} ${className}`.trim()}>
      {label ? <label htmlFor={controlId}><span>{label}</span></label> : null}
      <select
        id={controlId}
        aria-describedby={messageId}
        aria-invalid={error ? "true" : undefined}
        {...props}
      >
        {children}
      </select>
      <FieldMessage id={messageId} error={error} help={help} />
    </div>
  );
}

export function Checkbox({ label, checked, onChange, className = "", ...props }) {
  return (
    <label className={`checkbox ${className}`.trim()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
