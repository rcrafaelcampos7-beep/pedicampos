import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import {
  createProduct,
  deleteProduct as deleteDatabaseProduct,
  getCategoriesByStore,
  getProductsByStore,
  updateProduct,
} from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  categoryId: "",
  image: "",
  active: true,
};

export function AdminProducts({ activePath, store }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingProductId, setPendingProductId] = useState("");
  const productFormRef = useRef(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [nextProducts, nextCategories] = await Promise.all([
        getProductsByStore(store.id),
        getCategoriesByStore(store.id),
      ]);
      setProducts(nextProducts);
      setCategories(nextCategories);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || nextCategories[0]?.id || "",
        image: current.image || store.banner,
      }));
    } catch {
      setError("Não foi possível carregar os produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditingId("");
    setForm({ ...emptyProduct, image: store.banner });
    loadData();
  }, [store.id]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      image: product.image,
      active: product.active,
    });
    window.requestAnimationFrame(() => {
      productFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function resetForm() {
    setEditingId("");
    setForm({
      ...emptyProduct,
      categoryId: categories[0]?.id || "",
      image: store.banner,
    });
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");

    const product = {
      ...form,
      price: Number(form.price) || 0,
      image: form.image || store.banner,
    };

    try {
      if (editingId) await updateProduct(editingId, product);
      else await createProduct(store.id, product);
      resetForm();
      await loadData();
    } catch {
      setError("Não foi possível salvar o produto. Confira a categoria e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(productId) {
    if (pendingProductId) return;
    setPendingProductId(productId);
    setError("");

    try {
      await deleteDatabaseProduct(productId);
      if (editingId === productId) resetForm();
      await loadData();
    } catch {
      setError("Não foi possível excluir o produto. Tente novamente.");
    } finally {
      setPendingProductId("");
    }
  }

  async function toggleProduct(product) {
    if (pendingProductId) return;
    setPendingProductId(product.id);
    setError("");

    try {
      await updateProduct(product.id, { active: !product.active });
      await loadData();
    } catch {
      setError("Não foi possível alterar o status do produto. Tente novamente.");
    } finally {
      setPendingProductId("");
    }
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="split-panel">
        <Card className="form-section">
          <span className="eyebrow">Produtos</span>
          <h2>{editingId ? "Editar produto" : "Novo produto"}</h2>
          {error ? <div className="form-error">{error}</div> : null}
          <form ref={productFormRef} onSubmit={saveProduct}>
            <Input label="Nome" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required />
            <Textarea
              label="Descrição"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              required
            />
            <div className="form-grid">
              <Input
                label="Preço"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
              />
              <Select
                label="Categoria"
                value={form.categoryId}
                onChange={(event) => updateForm("categoryId", event.target.value)}
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              label="Imagem ou banner URL"
              value={form.image}
              onChange={(event) => updateForm("image", event.target.value)}
            />
            <Checkbox label="Produto ativo" checked={form.active} onChange={(checked) => updateForm("active", checked)} />
            <div className="addon-list compact">
              <h3>Adicionais vinculados</h3>
              <p className="muted">Os adicionais serão conectados ao Supabase na próxima etapa.</p>
            </div>
            <div className="modal-actions">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Salvando..." : "Salvar produto"}
              </Button>
              <Button variant="ghost" disabled={saving} onClick={resetForm}>
                Limpar
              </Button>
            </div>
          </form>
        </Card>

        <div className="admin-list">
          {loading ? <Card><p>Carregando produtos...</p></Card> : null}
          {!loading && !products.length ? <Card><p>Nenhum produto cadastrado.</p></Card> : null}
          {!loading && products.map((product) => {
            const category = categories.find((item) => item.id === product.categoryId);
            return (
              <Card key={product.id} className="admin-product-row">
                <img src={product.image || store.banner} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{category?.name || "Sem categoria"}</span>
                  <p>{product.description}</p>
                </div>
                <strong>{formatCurrency(product.price)}</strong>
                <div className="row-actions">
                  <Button variant="secondary" size="sm" disabled={Boolean(pendingProductId)} onClick={() => editProduct(product)}>
                    Editar
                  </Button>
                  <Button variant={product.active ? "warning" : "success"} size="sm" disabled={Boolean(pendingProductId)} onClick={() => toggleProduct(product)}>
                    {pendingProductId === product.id ? "Salvando..." : product.active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="ghost" size="sm" disabled={Boolean(pendingProductId)} onClick={() => deleteProduct(product.id)}>
                    {pendingProductId === product.id ? "Excluindo..." : "Excluir"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </AdminLayout>
  );
}
