const LIVE_ROLES = {
  error: "alert",
  warning: "alert",
  success: "status",
  info: "status",
};

export function Alert({ children, title, tone = "info", className = "", role, ...props }) {
  return (
    <div
      className={`alert alert-${tone} ${className}`.trim()}
      role={role || LIVE_ROLES[tone] || "status"}
      {...props}
    >
      <span className="alert-indicator" aria-hidden="true" />
      <div className="alert-content">
        {title ? <strong>{title}</strong> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
