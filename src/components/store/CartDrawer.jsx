import { Link } from "../../routes/router.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { Button } from "../ui/Button.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { Modal } from "../ui/Modal.jsx";

export function CartDrawer({
  open,
  onOpen,
  onClose,
  store,
  cart,
  onUpdateQuantity,
  onRemove,
  onClear,
}) {
  const deliveryTotal = cart.totals.subtotal + (store?.deliveryFee || 0);
  const formatAdditional = (addon) =>
    `${addon.groupName ? `${addon.groupName}: ` : ""}${addon.optionName || addon.name} ${
      Number(addon.price) > 0 ? `+ ${formatCurrency(addon.price)}` : "Grátis"
    }`;

  return (
    <>
      {cart.totals.quantity ? (
        <button className="cart-bar" type="button" onClick={onOpen}>
          <span>{cart.totals.quantity} itens</span>
          <strong>{formatCurrency(cart.totals.subtotal)}</strong>
          <span>Ver carrinho</span>
        </button>
      ) : null}
      <Modal open={open} onClose={onClose} title="Seu carrinho" size="md">
        <div className="cart-drawer">
          {!cart.items.length ? (
            <EmptyState title="Carrinho vazio" description="Adicione produtos para continuar." />
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map((item) => (
                  <article key={item.cartId} className="cart-item">
                    <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                    <div>
                      <strong>{item.name}</strong>
                      {(item.selectedAdditionals || item.addons || []).length ? (
                        <small>
                          {(item.selectedAdditionals || item.addons || [])
                            .map((addon) => formatAdditional(addon))
                            .join(", ")}
                        </small>
                      ) : null}
                      {item.note ? <small>Obs: {item.note}</small> : null}
                      <div className="cart-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onRemove(item.cartId)}>
                          Remover
                        </Button>
                      </div>
                    </div>
                    <strong>{formatCurrency(item.total)}</strong>
                  </article>
                ))}
              </div>
              <div className="cart-summary">
                <span>
                  Subtotal <strong>{formatCurrency(cart.totals.subtotal)}</strong>
                </span>
                <span>
                  Entrega <strong>{formatCurrency(store.deliveryFee)}</strong>
                </span>
                <span className="cart-total">
                  Total com entrega <strong>{formatCurrency(deliveryTotal)}</strong>
                </span>
              </div>
              <div className="modal-actions">
                <Button variant="ghost" onClick={onClear}>
                  Limpar
                </Button>
                <Link className="btn btn-store btn-md" to={`/${store.slug}/checkout`}>
                  Finalizar pedido
                </Link>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
