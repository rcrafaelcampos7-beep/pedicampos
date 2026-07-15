import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input } from "../components/ui/Input.jsx";
import { PaginationControls } from "../components/ui/PaginationControls.jsx";
import {
  createCategory,
  DEFAULT_PAGE_SIZE,
  deleteCategory as deleteDatabaseCategory,
  getCategoriesByStorePaginated,
  moveCategoryByStore,
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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  async function loadCategories(targetPage = page) {
    setLoading(true);
    setError("");

    try {
      const result = await getCategoriesByStorePaginated(store.id, { page: targetPage, pageSize: DEFAULT_PAGE_SIZE });
      setCategories(result.data);
      setPagination({ total: result.total, totalPages: result.totalPages });
      if (targetPage > result.totalPages) setPage(result.totalPages);
    } catch {
      setError("Não foi possível carregar as categorias. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [store.id]);

  useEffect(() => {
    loadCategories(page);
  }, [store.id, page]);

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
          order: pagination.total + 1,
        });
      }

      setEditingId("");
      setForm({ name: "", active: true });
      await loadCategories(page);
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
      await loadCategories(page);
    } catch {
      setError("Não foi possível excluir a categoria. Tente novamente.");
    } finally {
      setPendingAction("");
    }
  }

  async function moveCategory(categoryId, direction) {
    if (pendingAction) return;
    setPendingAction(categoryId);
    setError("");

    try {
      await moveCategoryByStore(store.id, categoryId, direction);
      await loadCategories(page);
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
          <div className="row-actions list-toolbar">
            <Button variant="secondary" size="sm" disabled={loading || saving || Boolean(pendingAction)} onClick={() => loadCategories(page)}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
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
          {!error ? <PaginationControls page={page} totalPages={pagination.totalPages} total={pagination.total} loading={loading} onPageChange={setPage} /> : null}
        </div>
      </section>
    </AdminLayout>
  );
}
