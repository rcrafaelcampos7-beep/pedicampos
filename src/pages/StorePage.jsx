import { useEffect, useMemo, useState } from "react";
import { CategoryTabs } from "../components/store/CategoryTabs.jsx";
import { CartDrawer } from "../components/store/CartDrawer.jsx";
import { ProductCard } from "../components/store/ProductCard.jsx";
import { ProductModal } from "../components/store/ProductModal.jsx";
import { StoreHeader } from "../components/store/StoreHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useCart } from "../hooks/useCart.js";
import { usePediData } from "../hooks/usePediData.js";
import { Link } from "../routes/router.jsx";
import { getPaymentMethodsByStore, getStoreBySlug, getStoreSettings } from "../services/database.js";
import { planHasFeature } from "../utils/plans.js";

export function StorePage({ slug }) {
  const { platform } = usePediData();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "");
  const cart = useCart(store?.id);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setStore(null);
    setLoadError(false);

    if (!validSlug) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
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
        if (active) setStore(result);
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
  }, [slug, validSlug]);

  const categoriesById = useMemo(() => {
    return Object.fromEntries((store?.categories || []).map((category) => [category.id, category]));
  }, [store]);

  const products = useMemo(() => {
    if (!store) return [];
    return (store.products || []).filter((product) => !activeCategory || product.categoryId === activeCategory);
  }, [activeCategory, store]);

  if (loading) {
    return (
      <main className="not-found">
        <Card>
          <h1>Carregando loja...</h1>
          <p>Aguarde enquanto buscamos as informações.</p>
        </Card>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="not-found">
        <Card>
          <h1>Não foi possível carregar a loja</h1>
          <p>Tente novamente em alguns instantes.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </Card>
      </main>
    );
  }

  if (!store) {
    return (
      <main className="not-found">
        <Card>
          <h1>Loja não encontrada</h1>
          <p>Confira o link digitado ou volte para a PediCampos.</p>
          <Link className="btn btn-primary btn-md" to="/">
            Voltar para início
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
    <div className="store-page" style={{ "--store-color": store.primaryColor }}>
      <StoreHeader store={store} />
      <main className="store-content">
        <section className="store-status-card">
          <div>
            <strong>{store.open ? "Loja aberta para pedidos" : "Loja fechada agora"}</strong>
            <p>{store.open ? store.openingHours : "O carrinho continua visível, mas o checkout fica bloqueado."}</p>
            <p className="muted">
              {planHasFeature(store.plan, "siteCheckout", platform)
                ? "Finalize seu pedido aqui pelo site."
                : "Finalize seu pedido pelo WhatsApp da loja."}
            </p>
          </div>
          <Button variant="store" onClick={() => setCartOpen(true)} disabled={!cart.items.length}>
            Ver carrinho
          </Button>
        </section>

        <CategoryTabs
          categories={store.categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {products.length ? (
          <section className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                category={categoriesById[product.categoryId]}
                onOpen={(item) => setSelectedProduct(item)}
              />
            ))}
          </section>
        ) : (
          <EmptyState
            title={activeCategory ? "Nenhum produto nesta categoria" : "Nenhum produto disponível no momento."}
            description={activeCategory ? "Escolha outra categoria." : "A loja ainda está preparando o cardápio."}
          />
        )}
      </main>

      <ProductModal
        product={selectedProduct}
        store={store}
        platform={platform}
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAdd={cart.addItem}
      />

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
