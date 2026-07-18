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
import { Link } from "../routes/router.jsx";
import {
  getAdditionalGroupsByStore,
  getCategoriesByStore,
  getPaymentMethodsByStore,
  getProductsByStore,
  getStoreBySlug,
  getStoreEntitlements,
  getStoreSettings,
} from "../services/database.js";
import { ENTITLEMENT_FEATURES, hasFeature } from "../utils/plans.js";
import { logInfo } from "../services/logger.js";

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

export function StorePage({ slug }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "");
  const cart = useCart(store?.id);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    getStoreBySlug(slug, { allowLocalFallback: false })
      .then(async (result) => {
        if (!result) return null;
        const [settings, paymentMethods, remoteCategories, remoteProducts, remoteAdditionalGroups, entitlements] = await Promise.all([
          getStoreSettings(result.id),
          getPaymentMethodsByStore(result.id),
          getCategoriesByStore(result.id),
          getProductsByStore(result.id),
          getAdditionalGroupsByStore(result.id),
          getStoreEntitlements(result.id),
        ]);
        const categories = remoteCategories.filter((category) => category.active);
        const activeCategoryIds = new Set(categories.map((category) => category.id));
        const products = remoteProducts.filter((product) =>
          product.active && (!product.categoryId || activeCategoryIds.has(product.categoryId))
        );
        const activeProductIds = new Set(products.map((product) => product.id));
        const additionalGroups = remoteAdditionalGroups
          .filter((group) => group.active)
          .map((group) => ({
            ...group,
            options: (group.options || []).filter((option) => option.active),
            productIds: (group.productIds || []).filter((productId) => activeProductIds.has(productId)),
          }));
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
          categories,
          products,
          additionalGroups,
          entitlements,
          plan: entitlements?.planKey || result.plan,
          planName: entitlements?.planName || "",
          id: result.id,
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
    const normalizedQuery = normalizeSearch(searchQuery.trim());
    return (store.products || []).filter((product) => {
      const inCategory = !activeCategory || product.categoryId === activeCategory;
      const searchableText = normalizeSearch(`${product.name || ""} ${product.description || ""}`);
      return inCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [activeCategory, searchQuery, store]);

  const activeCategoryName = activeCategory
    ? categoriesById[activeCategory]?.name || "Produtos"
    : "Todos os produtos";

  function addProductToCart(item) {
    logInfo({ area: "store", operation: "add_product", storeId: store.id });
    cart.addItem(item);
  }

  if (loading) {
    return (
      <main className="store-skeleton" aria-label="Carregando loja..." aria-busy="true">
        <span className="sr-only">Carregando loja...</span>
        <div className="store-skeleton-hero skeleton" />
        <div className="store-skeleton-content">
          <div className="store-skeleton-search skeleton" />
          <div className="store-skeleton-tabs">
            <span className="skeleton" /><span className="skeleton" /><span className="skeleton" />
          </div>
          <div className="store-skeleton-grid">
            {[0, 1, 2, 3, 4, 5].map((item) => <div className="store-skeleton-card skeleton" key={item} />)}
          </div>
        </div>
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
      <main className="store-main">
        <section className="store-order-callout" aria-label="Status de atendimento">
          <span className={`store-order-indicator ${store.open ? "is-open" : "is-closed"}`} aria-hidden="true" />
          <div>
            <strong>{store.open ? "Loja aberta para pedidos" : "Loja fechada agora"}</strong>
            <p>{store.open ? store.openingHours : "O carrinho continua visível, mas o checkout fica bloqueado."}</p>
            <p className="muted">
              {hasFeature(store.entitlements, ENTITLEMENT_FEATURES.SAVED_ORDERS)
                ? "Finalize seu pedido aqui pelo site."
                : hasFeature(store.entitlements, ENTITLEMENT_FEATURES.WHATSAPP_ORDERS)
                  ? "Finalize seu pedido pelo WhatsApp da loja."
                  : "Pedidos indisponiveis para o plano atual."}
            </p>
          </div>
          <Button variant="store" onClick={() => setCartOpen(true)} disabled={!cart.items.length}>
            Ver carrinho
          </Button>
        </section>

        <section className="store-catalog-navigation" aria-label="Navegação do catálogo">
          <div className="store-catalog-navigation-inner">
            <label className="store-search">
              <span className="store-search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar produtos"
                aria-label="Buscar produtos"
              />
              {searchQuery ? (
                <button type="button" onClick={() => setSearchQuery("")} aria-label="Limpar busca">×</button>
              ) : null}
            </label>

            <CategoryTabs
              categories={store.categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>
        </section>

        <section className="store-products-section" aria-labelledby="catalog-title">
          <header className="store-products-heading">
            <div>
              <span>Cardápio</span>
              <h2 id="catalog-title">{activeCategoryName}</h2>
            </div>
            <strong>{products.length} {products.length === 1 ? "produto" : "produtos"}</strong>
          </header>

          {products.length ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={categoriesById[product.categoryId]}
                  onOpen={(item) => setSelectedProduct(item)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              className="store-empty-state"
              icon="⌕"
              title={searchQuery ? "Nenhum produto encontrado" : activeCategory ? "Nenhum produto nesta categoria" : "Nenhum produto disponível no momento."}
              description={searchQuery ? "Tente buscar por outro termo." : activeCategory ? "Escolha outra categoria." : "A loja ainda está preparando o cardápio."}
              actionLabel={searchQuery ? "Limpar busca" : undefined}
              onAction={searchQuery ? () => setSearchQuery("") : undefined}
            />
          )}
        </section>
      </main>

      <footer className="store-footer">
        <div className="store-footer-identity">
          <strong>{store.name}</strong>
          <span>{store.segment}</span>
        </div>
        <div className="store-footer-actions">
          <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp de ${store.name}`}>
            WhatsApp
          </a>
          <small>Tecnologia PediCampos</small>
        </div>
      </footer>

      <ProductModal
        product={selectedProduct}
        store={store}
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAdd={addProductToCart}
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
