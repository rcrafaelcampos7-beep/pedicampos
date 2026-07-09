import { useMemo, useState } from "react";
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
import { planHasFeature } from "../utils/plans.js";

export function StorePage({ slug }) {
  const { stores, platform } = usePediData();
  const store = stores.find((item) => item.slug === slug);
  const cart = useCart(store?.id);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const categoriesById = useMemo(() => {
    return Object.fromEntries((store?.categories || []).map((category) => [category.id, category]));
  }, [store]);

  const products = useMemo(() => {
    if (!store) return [];
    return store.products.filter((product) => !activeCategory || product.categoryId === activeCategory);
  }, [activeCategory, store]);

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
            title="Nenhum produto nesta categoria"
            description="Escolha outra categoria ou cadastre produtos pelo painel."
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
