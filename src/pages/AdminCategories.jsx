import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input } from "../components/ui/Input.jsx";
import {
  createCategory,
  deleteCategory as deleteDatabaseCategory,
  getCategoriesByStore,
  updateCategory,
} from "../services/database.js";

export function AdminCategories({ activePath, store }) {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({ name: "", active: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      setCategories(await getCategoriesByStore(store.id));
    } catch {
      setError("Não foi possível carregar as categorias. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [store.id]);

  async function saveCategory(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(store.id, {
          ...form,
          order: categories.length + 1,
        });
      }

      setEditingId("");
      setForm({ name: "", active: true });
      await loadCategories();
    } catch {
      setError("Não foi possível salvar a categoria. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function editCategory(category) {
    setEditingId(category.id);
    setForm({ name: category.name, active: category.active });
  }

  async function deleteCategory(categoryId) {
    if (pendingAction) return;
    setPendingAction(categoryId);
    setError("");

    try {
      await deleteDatabaseCategory(categoryId);
      if (editingId === categoryId) {
        setEditingId("");
        setForm({ name: "", active: true });
      }
      await loadCategories();
    } catch {
      setError("Não foi possível excluir a categoria. Tente novamente.");
    } finally {
      setPendingAction("");
    }
  }

  async function moveCategory(categoryId, direction) {
    if (pendingAction) return;
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((category) => category.id === categoryId);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;

    setPendingAction(categoryId);
    setError("");

    try {
      await Promise.all([
        updateCategory(sorted[index].id, { order: sorted[swapIndex].order }),
        updateCategory(sorted[swapIndex].id, { order: sorted[index].order }),
      ]);
      await loadCategories();
    } catch {
      setError("Não foi possível reordenar as categorias. Tente novamente.");
    } finally {
      setPendingAction("");
    }
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="split-panel">
        <Card className="form-section">
          <span className="eyebrow">Categorias</span>
          <h2>{editingId ? "Editar categoria" : "Nova categoria"}</h2>
          {error ? <div className="form-error">{error}</div> : null}
          <form onSubmit={saveCategory}>
            <Input label="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Checkbox label="Categoria ativa" checked={form.active} onChange={(checked) => setForm({ ...form, active: checked })} />
            <div className="modal-actions">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Salvando..." : "Salvar categoria"}
              </Button>
              <Button
                variant="ghost"
                disabled={saving}
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
          {loading ? <Card><p>Carregando categorias...</p></Card> : null}
          {!loading && !categories.length ? <Card><p>Nenhuma categoria cadastrada.</p></Card> : null}
          {!loading && [...categories]
            .sort((a, b) => a.order - b.order)
            .map((category) => (
              <Card key={category.id} className="category-row">
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.active ? "Ativa" : "Inativa"}</span>
                </div>
                <div className="row-actions">
                  <Button variant="secondary" size="sm" disabled={Boolean(pendingAction)} onClick={() => moveCategory(category.id, "up")}>
                    Subir
                  </Button>
                  <Button variant="secondary" size="sm" disabled={Boolean(pendingAction)} onClick={() => moveCategory(category.id, "down")}>
                    Descer
                  </Button>
                  <Button variant="secondary" size="sm" disabled={Boolean(pendingAction)} onClick={() => editCategory(category)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" disabled={Boolean(pendingAction)} onClick={() => deleteCategory(category.id)}>
                    {pendingAction === category.id ? "Excluindo..." : "Excluir"}
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      </section>
    </AdminLayout>
  );
}
