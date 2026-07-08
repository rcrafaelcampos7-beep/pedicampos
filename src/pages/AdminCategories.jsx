import { useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input } from "../components/ui/Input.jsx";
import { updateStore } from "../services/storage.js";

export function AdminCategories({ activePath, store }) {
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({ name: "", active: true });

  function saveCategory(event) {
    event.preventDefault();
    updateStore(store.id, (draft) => {
      if (editingId) {
        draft.categories = draft.categories.map((category) =>
          category.id === editingId ? { ...category, ...form } : category
        );
      } else {
        draft.categories.push({
          id: `cat-${crypto.randomUUID()}`,
          name: form.name,
          active: form.active,
          order: draft.categories.length + 1,
        });
      }
      return draft;
    });
    setEditingId("");
    setForm({ name: "", active: true });
  }

  function editCategory(category) {
    setEditingId(category.id);
    setForm({ name: category.name, active: category.active });
  }

  function deleteCategory(categoryId) {
    updateStore(store.id, (draft) => {
      draft.categories = draft.categories.filter((category) => category.id !== categoryId);
      draft.products = draft.products.map((product) =>
        product.categoryId === categoryId ? { ...product, categoryId: "" } : product
      );
      return draft;
    });
  }

  function moveCategory(categoryId, direction) {
    updateStore(store.id, (draft) => {
      const sorted = [...draft.categories].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((category) => category.id === categoryId);
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= sorted.length) return draft;
      [sorted[index].order, sorted[swapIndex].order] = [sorted[swapIndex].order, sorted[index].order];
      draft.categories = sorted;
      return draft;
    });
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="split-panel">
        <Card className="form-section">
          <span className="eyebrow">Categorias</span>
          <h2>{editingId ? "Editar categoria" : "Nova categoria"}</h2>
          <form onSubmit={saveCategory}>
            <Input label="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Checkbox label="Categoria ativa" checked={form.active} onChange={(checked) => setForm({ ...form, active: checked })} />
            <div className="modal-actions">
              <Button type="submit" variant="primary">
                Salvar categoria
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingId("");
                  setForm({ name: "", active: true });
                }}
              >
                Limpar
              </Button>
            </div>
          </form>
        </Card>

        <div className="admin-list">
          {[...store.categories]
            .sort((a, b) => a.order - b.order)
            .map((category) => (
              <Card key={category.id} className="category-row">
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.active ? "Ativa" : "Inativa"}</span>
                </div>
                <div className="row-actions">
                  <Button variant="secondary" size="sm" onClick={() => moveCategory(category.id, "up")}>
                    Subir
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => moveCategory(category.id, "down")}>
                    Descer
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => editCategory(category)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCategory(category.id)}>
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      </section>
    </AdminLayout>
  );
}
