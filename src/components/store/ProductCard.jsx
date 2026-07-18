import { formatCurrency } from "../../utils/formatCurrency.js";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";

export function ProductCard({ product, category, onOpen }) {
  return (
    <article className={`product-card ${!product.active ? "product-disabled" : ""}`.trim()}>
      <div className="product-card-visual">
        <button
          className="product-image-button"
          type="button"
          onClick={() => onOpen(product)}
          aria-label={`Ver detalhes de ${product.name}`}
        >
          {typeof product.image === "string" && product.image.trim() ? (
            <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
          ) : <span className="product-image-placeholder" aria-hidden="true" />}
        </button>
        <span className="product-category">{category?.name || "Produto"}</span>
      </div>
      <div className="product-card-body">
        <div className="product-card-copy">
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <div className="product-card-footer">
          <strong>{formatCurrency(product.price)}</strong>
          {product.active ? (
            <Button variant="store" size="sm" onClick={() => onOpen(product)}>
              Adicionar
            </Button>
          ) : (
            <Badge tone="danger">Indisponível</Badge>
          )}
        </div>
      </div>
    </article>
  );
}
