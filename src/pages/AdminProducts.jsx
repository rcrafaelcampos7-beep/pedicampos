import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import { updateStore } from "../services/storage.js";

const emptyProduct = {
  id: "",
  name: "",
  description: "",
  price: 0,
  categoryId: "",
  image: "",
  active: true,
  additionalGroupIds: [],
};

export function AdminProducts({ activePath, store }) {
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      categoryId: current.categoryId || store.categories[0]?.id || "",
      image: current.image || store.banner,
    }));
  }, [store]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      ...product,
      additionalGroupIds: (store.additionalGroups || [])
        .filter((group) => group.productIds?.includes(product.id))
        .map((group) => group.id),
    });
  }

  function resetForm() {
    setEditingId("");
    setForm({
      ...emptyProduct,
      categoryId: store.categories[0]?.id || "",
      image: store.banner,
      active: true,
    });
  }

  function saveProduct(event) {
    event.preventDefault();
    const productId = editingId || `prod-${crypto.randomUUID()}`;
    const { additionalGroupIds = [], ...productData } = form;
    const product = {
      ...productData,
      id: productId,
      price: Number(form.price) || 0,
      image: form.image || store.banner,
    };

    updateStore(store.id, (draft) => {
      draft.products = editingId
        ? draft.products.map((item) => (item.id === editingId ? product : item))
        : [product, ...draft.products];
      draft.additionalGroups = (draft.additionalGroups || []).map((group) => {
        const productIds = new Set(group.productIds || []);
        if (additionalGroupIds.includes(group.id)) {
          productIds.add(productId);
        } else {
          productIds.delete(productId);
        }
        return { ...group, productIds: Array.from(productIds) };
      });
      return draft;
    });
    resetForm();
  }

  function deleteProduct(productId) {
    updateStore(store.id, (draft) => {
      draft.products = draft.products.filter((product) => product.id !== productId);
      draft.additionalGroups = (draft.additionalGroups || []).map((group) => ({
        ...group,
        productIds: (group.productIds || []).filter((id) => id !== productId),
      }));
      return draft;
    });
  }

  function toggleProduct(productId) {
    updateStore(store.id, (draft) => {
      draft.products = draft.products.map((product) =>
        product.id === productId ? { ...product, active: !product.active } : product
      );
      return draft;
    });
  }

  function toggleAdditionalGroup(groupId, checked) {
    updateForm(
      "additionalGroupIds",
      checked
        ? [...(form.additionalGroupIds || []), groupId]
        : (form.additionalGroupIds || []).filter((id) => id !== groupId)
    );
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="split-panel">
        <Card className="form-section">
          <span className="eyebrow">Produtos</span>
          <h2>{editingId ? "Editar produto" : "Novo produto"}</h2>
          <form onSubmit={saveProduct}>
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
                {store.categories.map((category) => (
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
              {(store.additionalGroups || []).length ? (
                (store.additionalGroups || []).map((group) => (
                  <Checkbox
                    key={group.id}
                    label={`${group.name} (${group.options?.length || 0} opções)`}
                    checked={(form.additionalGroupIds || []).includes(group.id)}
                    onChange={(checked) => toggleAdditionalGroup(group.id, checked)}
                  />
                ))
              ) : (
                <p className="muted">Crie grupos em Adicionais para vinculá-los a produtos.</p>
              )}
            </div>
            <div className="modal-actions">
              <Button type="submit" variant="primary">
                Salvar produto
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Limpar
              </Button>
            </div>
          </form>
        </Card>

        <div className="admin-list">
          {store.products.map((product) => {
            const category = store.categories.find((item) => item.id === product.categoryId);
            return (
              <Card key={product.id} className="admin-product-row">
                <img src={product.image} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{category?.name || "Sem categoria"}</span>
                  <p>{product.description}</p>
                </div>
                <strong>{formatCurrency(product.price)}</strong>
                <div className="row-actions">
                  <Button variant="secondary" size="sm" onClick={() => editProduct(product)}>
                    Editar
                  </Button>
                  <Button variant={product.active ? "warning" : "success"} size="sm" onClick={() => toggleProduct(product.id)}>
                    {product.active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}>
                    Excluir
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
