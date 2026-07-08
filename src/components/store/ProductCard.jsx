import { formatCurrency } from "../../utils/formatCurrency.js";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";

export function ProductCard({ product, category, onOpen }) {
  return (
    <article className={`product-card ${!product.active ? "product-disabled" : ""}`.trim()}>
      <button className="product-image-button" type="button" onClick={() => onOpen(product)}>
        <img src={product.image} alt={product.name} />
      </button>
      <div className="product-card-body">
        <div>
          <span className="product-category">{category?.name || "Produto"}</span>
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
