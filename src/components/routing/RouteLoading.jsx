import { LoadingState } from "../ui/LoadingState.jsx";

export function RouteLoading({ label = "Carregando página..." }) {
  return <LoadingState fullPage label={label} />;
}
