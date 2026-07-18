export function Skeleton({ className = "", width, height, ...props }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      aria-hidden="true"
      style={{ width, height }}
      {...props}
    />
  );
}

export function LoadingState({ label = "Carregando...", fullPage = false, className = "" }) {
  const Component = fullPage ? "main" : "div";

  return (
    <Component
      className={`${fullPage ? "route-loading" : "loading-state"} ${className}`.trim()}
      aria-live="polite"
      aria-busy="true"
    >
      <span className="loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </Component>
  );
}
