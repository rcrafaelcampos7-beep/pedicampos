export function RouteLoading({ label = "Carregando página..." }) {
  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <span className="route-loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </main>
  );
}
