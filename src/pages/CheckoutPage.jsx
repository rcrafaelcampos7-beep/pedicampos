import { useEffect, useMemo, useState } from "react";
import { CartDrawer } from "../components/store/CartDrawer.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Input, Select, Textarea } from "../components/ui/Input.jsx";
import { useCart } from "../hooks/useCart.js";
import { usePediData } from "../hooks/usePediData.js";
import { Link, navigate } from "../routes/router.jsx";
import { getPaymentMethodsByStore, getStoreBySlug, getStoreSettings } from "../services/database.js";
import { createOrder } from "../services/storage.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../utils/orderStatus.js";
import { planHasFeature } from "../utils/plans.js";

const paymentLabels = {
  pix: "Pix",
  cash: "Dinheiro",
  card: "Cartão",
};

function getPaymentOptions(store) {
  const methods = store.paymentMethods || {};
  const options = [];

  if (methods.pix || methods.pixOnline || methods.pixDelivery) {
    options.push({ key: "pix", label: paymentLabels.pix });
  }
  if (methods.cash) {
    options.push({ key: "cash", label: paymentLabels.cash });
  }
  if (methods.card || methods.cardDelivery) {
    options.push({ key: "card", label: paymentLabels.card });
  }

  return options;
}

function makeOrderNumber() {
  return String(Date.now()).slice(-6);
}

function getStorePixKey(store) {
  return (
    store?.pixKey ||
    store?.chavePix ||
    store?.paymentMethods?.pixKey ||
    store?.paymentMethods?.chavePix ||
    ""
  );
}

export function CheckoutPage({ slug }) {
  const { platform } = usePediData();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const cart = useCart(store?.id);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState("");
  const [automaticPaymentApproved, setAutomaticPaymentApproved] = useState(false);
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
    paymentMethod: "pix",
    changeFor: "",
  });

  const canUseSiteCheckout = store ? planHasFeature(store.plan, "siteCheckout", platform) : false;
  const canUseAutomaticPayments = store ? planHasFeature(store.plan, "onlinePayments", platform) : false;
  const canUsePixAutomatic = store ? planHasFeature(store.plan, "pixAutomatic", platform) : false;
  const canUseCardAutomatic = store ? planHasFeature(store.plan, "cardAutomatic", platform) : false;
  const canShowPixQrCode = Boolean(
    store &&
      form.paymentMethod === "pix" &&
      canUseAutomaticPayments &&
      canUsePixAutomatic &&
      (store.paymentMethods?.pixOnline || store.paymentMethods?.pix)
  );
  const canShowCardSimulation = Boolean(
    store && form.paymentMethod === "card" && canUseAutomaticPayments && canUseCardAutomatic && store.paymentMethods?.card
  );
  const paymentOptions = useMemo(() => (store ? getPaymentOptions(store) : []), [store]);
  const deliveryFee = form.fulfillment === "delivery" ? store?.deliveryFee || 0 : 0;
  const total = cart.totals.subtotal + deliveryFee;
  const pixCode = `000201PEDICAMPOS-${store?.slug || "loja"}-${Math.round(total * 100)}-PEDIDO`;
  const formatAdditional = (addon) =>
    `${addon.groupName ? `${addon.groupName}: ` : ""}${addon.optionName || addon.name} ${
      Number(addon.price) > 0 ? `+ ${formatCurrency(addon.price)}` : "Grátis"
    }`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    setStore(null);

    getStoreBySlug(slug)
      .then(async (result) => {
        if (!result) return null;
        const [settings, paymentMethods] = await Promise.all([
          getStoreSettings(result.id),
          getPaymentMethodsByStore(result.id),
        ]);
        return {
          ...result,
          address: "",
          openingHours: "",
          deliveryTime: "",
          deliveryFee: 0,
          minimumOrderValue: 0,
          deliveryEnabled: true,
          pickupEnabled: true,
          pixKey: "",
          paymentInstructions: "",
          ...(settings || {}),
          paymentMethods,
        };
      })
      .then((result) => {
        if (!active) return;
        setStore(result);
        if (result && !result.deliveryEnabled && result.pickupEnabled) {
          setForm((current) => ({ ...current, fulfillment: "pickup" }));
        }
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

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
    if (form.fulfillment === "delivery" && !store.deliveryEnabled) return "Entrega indisponível para esta loja.";
    if (form.fulfillment === "pickup" && !store.pickupEnabled) return "Retirada indisponível para esta loja.";
    if (cart.totals.subtotal < (store.minimumOrderValue || 0)) {
      return `O pedido mínimo é ${formatCurrency(store.minimumOrderValue)}.`;
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
    const pixKey = getStorePixKey(store);
    const paymentMethodLabel = paymentLabels[form.paymentMethod] || "A combinar";

    return [
      `Olá, ${store.name}! Quero fazer um pedido pelo PediCampos.`,
      "",
      `Cliente: ${form.name}`,
      `Telefone: ${form.phone}`,
      `Entrega: ${form.fulfillment === "delivery" ? "Entrega" : "Retirada"}`,
      `Forma de pagamento: ${paymentMethodLabel}`,
      form.paymentMethod === "pix" && pixKey ? `Chave Pix: ${pixKey}` : "",
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

    if (!paymentOptions.some((option) => option.key === form.paymentMethod)) {
      setError("Escolha uma forma de pagamento disponível.");
      return;
    }

    const number = makeOrderNumber();
    const paymentMethodLabel = paymentLabels[form.paymentMethod] || "A combinar";
    const isAutomaticPayment = canShowPixQrCode || canShowCardSimulation;
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
      paymentStatus: isAutomaticPayment
        ? automaticPaymentApproved
          ? PAYMENT_STATUS.APPROVED
          : PAYMENT_STATUS.WAITING
        : PAYMENT_STATUS.PENDING,
      orderStatus: isAutomaticPayment
        ? automaticPaymentApproved
          ? ORDER_STATUS.PAYMENT_CONFIRMED
          : ORDER_STATUS.WAITING_PAYMENT
        : ORDER_STATUS.RECEIVED,
      subtotal: cart.totals.subtotal,
      deliveryFee,
      total,
      pixCode: canShowPixQrCode ? pixCode : "",
      pixKey: form.paymentMethod === "pix" ? getStorePixKey(store) : "",
      items: cart.items,
    };

    // Integração futura: aqui o backend criaria a cobrança Pix no Mercado Pago ou Asaas.
    // Integração futura: o QR Code retornado pela API substituiria o bloco visual fake abaixo.
    // Integração futura: o webhook de confirmação atualizaria paymentStatus e orderStatus automaticamente.
    createOrder(order);
    cart.clearCart();
    navigate(`/${store.slug}/pedido/${order.id}`);
  }

  if (loading) {
    return <main className="not-found"><Card><h1>Carregando checkout...</h1></Card></main>;
  }

  if (loadError) {
    return (
      <main className="not-found">
        <Card>
          <h1>Não foi possível carregar o checkout</h1>
          <p>Tente novamente em instantes.</p>
        </Card>
      </main>
    );
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
          <p>{store.name} não está aceitando pedidos por este link no momento.</p>
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
              <p>A loja está fechada no momento. Tente novamente dentro do horário de atendimento.</p>
            </Card>
          ) : null}

          {!canUseSiteCheckout ? (
            <Card className="alert-card">
              <strong>Pedido pelo WhatsApp</strong>
              <p>Confira seus dados e envie seu pedido diretamente para o WhatsApp da loja.</p>
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
                disabled={!store.deliveryEnabled}
                onClick={() => updateForm("fulfillment", "delivery")}
              >
                Entrega
              </button>
              <button
                type="button"
                className={form.fulfillment === "pickup" ? "active" : ""}
                disabled={!store.pickupEnabled}
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
                setAutomaticPaymentApproved(false);
              }}
            >
              {paymentOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </Select>
            {store.paymentInstructions ? <p className="muted">{store.paymentInstructions}</p> : null}
            {form.paymentMethod === "cash" ? (
              <Input
                label="Troco para quanto?"
                value={form.changeFor}
                onChange={(event) => updateForm("changeFor", event.target.value)}
                placeholder="Ex: R$ 100,00"
              />
            ) : null}
            {canShowPixQrCode ? (
              <div className="pix-box">
                <div className="fake-qr" aria-label="QR Code Pix">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span key={index} className={index % 2 === 0 || index % 5 === 0 ? "dark" : ""} />
                  ))}
                </div>
                <div>
                  <strong>Pix copia e cola</strong>
                  <code>{pixCode}</code>
                  <div className="pix-actions">
                    <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(pixCode)}>
                      Copiar Pix
                    </Button>
                    <Button
                      variant={automaticPaymentApproved ? "success" : "primary"}
                      onClick={() => setAutomaticPaymentApproved(true)}
                    >
                      {automaticPaymentApproved ? "Pagamento aprovado" : "Confirmar pagamento"}
                    </Button>
                  </div>
                  <p className="muted">
                    Status: {automaticPaymentApproved ? "Pagamento confirmado" : "Aguardando pagamento"}.
                  </p>
                </div>
              </div>
            ) : null}
            {canShowCardSimulation ? (
              <div className="pix-box">
                <div className="fake-qr" aria-label="Pagamento com cartão">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span key={index} className={index % 3 === 0 || index % 7 === 0 ? "dark" : ""} />
                  ))}
                </div>
                <div>
                  <strong>Pagamento com cartão</strong>
                  <p className="muted">Confirme o pagamento para prosseguir com o pedido.</p>
                  <div className="pix-actions">
                    <Button
                      variant={automaticPaymentApproved ? "success" : "primary"}
                      onClick={() => setAutomaticPaymentApproved(true)}
                    >
                      {automaticPaymentApproved ? "Pagamento aprovado" : "Confirmar pagamento"}
                    </Button>
                  </div>
                  <p className="muted">
                    Status: {automaticPaymentApproved ? "Pagamento confirmado" : "Aguardando pagamento"}.
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
