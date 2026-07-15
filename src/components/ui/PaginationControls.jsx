import { Button } from "./Button.jsx";

export function PaginationControls({ page, totalPages, total, loading, onPageChange }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  return (
    <nav className="pagination-controls" aria-label="Navegacao da lista">
      <Button
        variant="secondary"
        size="sm"
        disabled={loading || safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
      >
        Anterior
      </Button>
      <span>Pagina {safePage} de {safeTotalPages} · {Number(total) || 0} registro(s)</span>
      <Button
        variant="secondary"
        size="sm"
        disabled={loading || safePage >= safeTotalPages}
        onClick={() => onPageChange(safePage + 1)}
      >
        Proxima
      </Button>
    </nav>
  );
}
