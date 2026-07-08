import { useEffect, useMemo, useState } from "react";
import { CartDrawer } from "../components/store/CartDrawer.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import { useCart } from "../hooks/useCart.js";
import { usePediData } from "../hooks/usePediData.js";
import { Link, navigate } from "../routes/router.jsx";
import { createOrder } from "../services/storage.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../utils/orderStatus.js";
import { planHasFeature } from "../utils/plans.js";

const paymentLabels = {
  pixOnline: "Pix online",
  pixDelivery: "Pix na entrega",
  cash: "Dinheiro",
  cardDelivery: "Cartão na entrega",
};

function getPaymentOptions(store, platform) {
  return Object.entries(store.paymentMethods || {})
    .filter(([, enabled]) => enabled)
    .filter(([key]) => key !== "pixOnline" || planHasFeature(store.plan, "pixOnline", platform))
    .map(([key]) => ({ key, label: paymentLabels[key] }));
}

function makeOrderNumber() {
  return String(Date.now()).slice(-6);
}

export function CheckoutPage({ slug }) {
  const { stores, platform } = usePediData();
  const store = stores.find((item) => item.slug === slug);
  const cart = useCart(store?.id);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState("");
  const [pixApproved, setPixApproved] = useState(false);
  const [whatsappOrderUrl, setWhatsappOrderUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    fulfillment: "delivery",
    street: "",
    district: "",
    number: "",
    complement: "",
    notes: "",
    paymentMethod: "pixOnline",
    changeFor: "",
  });

  const canUseSiteCheckout = store ? planHasFeature(store.plan, "siteCheckout", platform) : false;
  const canUsePixOnline = store ? planHasFeature(store.plan, "pixOnline", platform) : false;
  const paymentOptions = useMemo(() => (store ? getPaymentOptions(store, platform) : []), [store, platform]);
  const deliveryFee = form.fulfillment === "delivery" ? store?.deliveryFee || 0 : 0;
  const total = cart.totals.subtotal + deliveryFee;
  const pixCode = `000201PEDICAMPOS-${store?.slug || "loja"}-${Math.round(total * 100)}-DEMO`;
  const formatAdditional = (addon) =>
    `${addon.groupName ? `${addon.groupName}: ` : ""}${addon.optionName || addon.name} ${
      Number(addon.price) > 0 ? `+ ${formatCurrency(addon.price)}` : "Grátis"
    }`;

  useEffect(() => {
    if (paymentOptions.length && !paymentOptions.some((option) => option.key === form.paymentMethod)) {
      updateForm("paymentMethod", paymentOptions[0].key);
    }
  }, [paymentOptions, form.paymentMethod]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Informe seu nome.";
    if (!form.phone.trim()) return "Informe seu telefone.";
    if (form.fulfillment === "delivery" && (!form.street.trim() || !form.district.trim() || !form.number.trim())) {
      return "Informe endereço, bairro e número para entrega.";
    }
    return "";
  }

  function buildWhatsAppOrderMessage() {
    const items = cart.items
      .map((item) => {
        const additionals = (item.selectedAdditionals || item.addons || [])
          .map((addon) => `   - ${formatAdditional(addon)}`)
          .join("\n");
        return `${item.quantity}x ${item.name} - ${formatCurrency(item.total)}${additionals ? `\n${additionals}` : ""}${
          item.note ? `\n   Obs: ${item.note}` : ""
        }`;
      })
      .join("\n\n");
    const address =
      form.fulfillment === "delivery"
        ? `${form.street}, ${form.number} - ${form.district}${form.complement ? `, ${form.complement}` : ""}`
        : `Retirada na loja: ${store.address}`;

    return [
      `Olá, ${store.name}! Quero fazer um pedido pelo PediCampos.`,
      "",
      `Cliente: ${form.name}`,
      `Telefone: ${form.phone}`,
      `Entrega: ${form.fulfillment === "delivery" ? "Entrega" : "Retirada"}`,
      `Endereço: ${address}`,
      "",
      items,
      "",
      `Subtotal: ${formatCurrency(cart.totals.subtotal)}`,
      `Entrega: ${formatCurrency(deliveryFee)}`,
      `Total: ${formatCurrency(total)}`,
      form.notes ? `Observação geral: ${form.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!store || !store.active || !store.open) return;
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    if (!canUseSiteCheckout) {
      const url = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(buildWhatsAppOrderMessage())}`;
      setWhatsappOrderUrl(url);
      window.open(url, "_blank", "noopener,noreferrer");
      cart.clearCart();
      return;
    }

    if (form.paymentMethod === "pixOnline" && !canUsePixOnline) {
      setError("Pix online está disponível no Plano Premium.");
      return;
    }

    const number = makeOrderNumber();
    const paymentMethodLabel = paymentLabels[form.paymentMethod];
    const isPixOnline = form.paymentMethod === "pixOnline";
    const order = {
      id: number,
      number,
      storeId: store.id,
      storeSlug: store.slug,
      storeName: store.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: form.name,
        phone: form.phone,
      },
      fulfillment: form.fulfillment,
      address:
        form.fulfillment === "delivery"
          ? {
              street: form.street,
              district: form.district,
              number: form.number,
              complement: form.complement,
            }
          : null,
      notes: form.notes,
      paymentMethod: paymentMethodLabel,
      paymentStatus: isPixOnline
        ? pixApproved
          ? PAYMENT_STATUS.APPROVED
          : PAYMENT_STATUS.WAITING
        : PAYMENT_STATUS.PENDING_DELIVERY,
      orderStatus: isPixOnline
        ? pixApproved
          ? ORDER_STATUS.PAYMENT_CONFIRMED
          : ORDER_STATUS.WAITING_PAYMENT
        : ORDER_STATUS.RECEIVED,
      subtotal: cart.totals.subtotal,
      deliveryFee,
      total,
      pixCode: isPixOnline ? pixCode : "",
      items: cart.items,
    };

    // Integração futura: aqui o backend criaria a cobrança Pix no Mercado Pago ou Asaas.
    // Integração futura: o QR Code retornado pela API substituiria o bloco visual fake abaixo.
    // Integração futura: o webhook de confirmação atualizaria paymentStatus e orderStatus automaticamente.
    createOrder(order);
    cart.clearCart();
    navigate(`/${store.slug}/pedido/${order.id}`);
  }

  if (!store) {
    return (
      <main className="not-found">
        <Card>
          <h1>Loja não encontrada</h1>
          <Link className="btn btn-primary btn-md" to="/">
            Voltar
          </Link>
        </Card>
      </main>
    );
  }

  if (!store.active) {
    return (
      <main className="not-found" style={{ "--store-color": store.primaryColor }}>
        <Card>
          <h1>Esta loja está temporariamente indisponível.</h1>
          <p>{store.name} foi desativada no painel master e não está aceitando pedidos no momento.</p>
          <Link className="btn btn-primary btn-md" to="/">
            Voltar para PediCampos
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <div className="checkout-page" style={{ "--store-color": store.primaryColor }}>
      <header className="checkout-header">
        <Link to={`/${store.slug}`} className="logo-link">
          <span className="brand-mark">{store.logo}</span>
          <strong>{store.name}</strong>
        </Link>
        <Button variant="secondary" onClick={() => setCartOpen(true)}>
          Carrinho
        </Button>
      </header>

      <main className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>Finalize seu pedido</h1>
            <p>Confira seus itens e informe os dados para a loja preparar seu pedido.</p>
          </div>

          {!store.open ? (
            <Card className="alert-card">
              <strong>Loja fechada</strong>
              <p>O checkout está bloqueado enquanto a loja estiver fechada no painel.</p>
            </Card>
          ) : null}

          {!canUseSiteCheckout ? (
            <Card className="alert-card">
              <strong>Checkout do Plano Start</strong>
              <p>Este plano finaliza o pedido pelo WhatsApp da loja. Pedidos no painel e acompanhamento estão disponíveis a partir do Plano Pro.</p>
              {whatsappOrderUrl ? (
                <a className="btn btn-primary btn-md" href={whatsappOrderUrl} target="_blank" rel="noreferrer">
                  Abrir WhatsApp novamente
                </a>
              ) : null}
            </Card>
          ) : null}

          {error ? <div className="form-error">{error}</div> : null}

          <Card className="form-section">
            <h2>Dados do cliente</h2>
            <div className="form-grid">
              <Input label="Nome" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              <Input
                label="Telefone / WhatsApp"
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
              />
            </div>
          </Card>

          <Card className="form-section">
            <h2>Entrega</h2>
            <div className="segmented">
              <button
                type="button"
                className={form.fulfillment === "delivery" ? "active" : ""}
                onClick={() => updateForm("fulfillment", "delivery")}
              >
                Entrega
              </button>
              <button
                type="button"
                className={form.fulfillment === "pickup" ? "active" : ""}
                onClick={() => updateForm("fulfillment", "pickup")}
              >
                Retirada
              </button>
            </div>
            {form.fulfillment === "delivery" ? (
              <div className="form-grid">
                <Input label="Endereço" value={form.street} onChange={(event) => updateForm("street", event.target.value)} />
                <Input label="Bairro" value={form.district} onChange={(event) => updateForm("district", event.target.value)} />
                <Input label="Número" value={form.number} onChange={(event) => updateForm("number", event.target.value)} />
                <Input
                  label="Complemento"
                  value={form.complement}
                  onChange={(event) => updateForm("complement", event.target.value)}
                />
              </div>
            ) : (
              <p className="muted">Retirada no endereço: {store.address}</p>
            )}
            <Textarea
              label="Observação geral"
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
              placeholder="Ex: tocar campainha, sem troco, retirar às 20h..."
            />
          </Card>

          <Card className="form-section">
            <h2>Pagamento</h2>
            <Select
              label="Forma de pagamento"
              value={form.paymentMethod}
              onChange={(event) => {
                updateForm("paymentMethod", event.target.value);
                setPixApproved(false);
              }}
            >
              {paymentOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </Select>
            {form.paymentMethod === "cash" ? (
              <Input
                label="Troco para quanto?"
                value={form.changeFor}
                onChange={(event) => updateForm("changeFor", event.target.value)}
                placeholder="Ex: R$ 100,00"
              />
            ) : null}
            {!canUsePixOnline ? (
              <p className="muted">Pix online está disponível no Plano Premium.</p>
            ) : null}
            {canUsePixOnline && form.paymentMethod === "pixOnline" ? (
              <div className="pix-box">
                <div className="fake-qr" aria-label="QR Code Pix simulado">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span key={index} className={index % 2 === 0 || index % 5 === 0 ? "dark" : ""} />
                  ))}
                </div>
                <div>
                  <strong>Pix copia e cola fictício</strong>
                  <code>{pixCode}</code>
                  <div className="pix-actions">
                    <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(pixCode)}>
                      Copiar Pix
                    </Button>
                    <Button variant={pixApproved ? "success" : "primary"} onClick={() => setPixApproved(true)}>
                      {pixApproved ? "Pagamento aprovado" : "Simular pagamento aprovado"}
                    </Button>
                  </div>
                  <p className="muted">
                    Status: {pixApproved ? "Aprovado" : "Aguardando pagamento"}. Futuramente isso será
                    confirmado por webhook.
                  </p>
                </div>
              </div>
            ) : null}
          </Card>

          <Button variant="store" size="lg" type="submit" disabled={!cart.items.length || !store.active || !store.open}>
            {canUseSiteCheckout ? "Finalizar pedido" : "Enviar pedido no WhatsApp"}
          </Button>
        </form>

        <aside className="checkout-summary">
          <Card>
            <h2>Resumo</h2>
            {cart.items.length ? (
              <>
                {cart.items.map((item) => (
                  <div key={item.cartId} className="summary-line">
                    <span>
                      {item.quantity}x {item.name}
                      {(item.selectedAdditionals || item.addons || []).length ? (
                        <small>
                          {(item.selectedAdditionals || item.addons || [])
                            .map((addon) => formatAdditional(addon))
                            .join(", ")}
                        </small>
                      ) : null}
                    </span>
                    <strong>{formatCurrency(item.total)}</strong>
                  </div>
                ))}
                <div className="summary-total">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(cart.totals.subtotal)}</strong>
                </div>
                <div className="summary-total">
                  <span>Entrega</span>
                  <strong>{formatCurrency(deliveryFee)}</strong>
                </div>
                <div className="summary-grand">
                  <span>Total</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
              </>
            ) : (
              <EmptyState
                title="Carrinho vazio"
                description="Volte para a loja e adicione produtos ao pedido."
                actionLabel="Ver produtos"
                onAction={() => navigate(`/${store.slug}`)}
              />
            )}
          </Card>
          <Card className="mini-settings">
            <h3>Formas ativas</h3>
            {paymentOptions.map((option) => (
              <Checkbox key={option.key} label={option.label} checked readOnly />
            ))}
          </Card>
        </aside>
      </main>

      <CartDrawer
        open={cartOpen}
        onOpen={() => setCartOpen(true)}
        onClose={() => setCartOpen(false)}
        store={store}
        cart={cart}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeItem}
        onClear={cart.clearCart}
      />
    </div>
  );
}
