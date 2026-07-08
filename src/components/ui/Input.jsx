export function Input({ label, help, className = "", ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span>{label}</span> : null}
      <input {...props} />
      {help ? <small>{help}</small> : null}
    </label>
  );
}

export function Textarea({ label, help, className = "", ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span>{label}</span> : null}
      <textarea {...props} />
      {help ? <small>{help}</small> : null}
    </label>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span>{label}</span> : null}
      <select {...props}>{children}</select>
    </label>
  );
}

export function Checkbox({ label, checked, onChange, ...props }) {
  return (
    <label className="checkbox">
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
