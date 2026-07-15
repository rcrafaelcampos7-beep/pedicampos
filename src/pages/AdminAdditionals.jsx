import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import { PaginationControls } from "../components/ui/PaginationControls.jsx";
import {
  createAdditionalGroup,
  DEFAULT_PAGE_SIZE,
  deleteAdditionalGroup,
  getAdditionalGroupsByStorePaginated,
  getProductsByStorePaginated,
  updateAdditionalGroup,
} from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const emptyGroup = {
  name: "",
  description: "",
  required: false,
  min: 0,
  max: 0,
  selectionType: "multiple",
  productIds: [],
  active: true,
  options: [],
};

function makeOption() {
  return {
    id: `option-${crypto.randomUUID()}`,
    name: "",
    price: 0,
    active: true,
  };
}

export function AdminAdditionals({ activePath, store }) {
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({ ...emptyGroup, options: [makeOption()] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [productPage, setProductPage] = useState(1);
  const [productPagination, setProductPagination] = useState({ total: 0, totalPages: 1 });
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [loadedProductPage, setLoadedProductPage] = useState(0);
  const additionalFormRef = useRef(null);

  async function loadData(targetPage = page, options = {}) {
    setLoading(true);
    setError("");

    try {
      const [groupResult, productResult] = await Promise.all([
        getAdditionalGroupsByStorePaginated(store.id, { page: targetPage, pageSize: DEFAULT_PAGE_SIZE }),
        productsLoaded && loadedProductPage === productPage && !options.refreshReferences
          ? Promise.resolve({ data: products, total: productPagination.total, totalPages: productPagination.totalPages })
          : getProductsByStorePaginated(store.id, { page: productPage, pageSize: DEFAULT_PAGE_SIZE }),
      ]);
      setGroups(groupResult.data);
      setPagination({ total: groupResult.total, totalPages: groupResult.totalPages });
      if (targetPage > groupResult.totalPages) setPage(groupResult.totalPages);
      setProducts(productResult.data);
      setProductsLoaded(true);
      setLoadedProductPage(productPage);
      setProductPagination({ total: productResult.total, totalPages: productResult.totalPages });
      if (productPage > productResult.totalPages) setProductPage(productResult.totalPages);
    } catch {
      setError("Não foi possível carregar os adicionais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    resetForm();
    setPage(1);
    setProductPage(1);
    setProductsLoaded(false);
    setLoadedProductPage(0);
  }, [store.id]);

  useEffect(() => {
    loadData(page);
  }, [store.id, page, productPage]);

  function resetForm() {
    setEditingId("");
    setForm({ ...emptyGroup, options: [makeOption()] });
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editGroup(group) {
    setEditingId(group.id);
    setForm({
      ...group,
      productIds: group.productIds || [],
      options: group.options?.length ? group.options : [makeOption()],
    });
    window.requestAnimationFrame(() => {
      additionalFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleProduct(productId, checked) {
    updateForm(
      "productIds",
      checked
        ? Array.from(new Set([...form.productIds, productId]))
        : form.productIds.filter((id) => id !== productId)
    );
  }

  function updateOption(optionId, field, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.id === optionId ? { ...option, [field]: value } : option
      ),
    }));
  }

  function addOption() {
    setForm((current) => ({ ...current, options: [...current.options, makeOption()] }));
  }

  function removeOption(optionId) {
    setForm((current) => ({
      ...current,
      options: current.options.filter((option) => option.id !== optionId),
    }));
  }

  async function saveGroup(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");

    const group = {
      ...form,
      storeId: store.id,
      min: Number(form.min) || 0,
      max: Number(form.max) || 0,
      options: form.options
        .filter((option) => option.name.trim())
        .map((option) => ({
          ...option,
          price: Number(option.price) || 0,
          active: option.active !== false,
        })),
    };

    try {
      if (editingId) await updateAdditionalGroup(editingId, group);
      else await createAdditionalGroup(store.id, group);
      resetForm();
      await loadData(page);
    } catch {
      setError("Não foi possível salvar o grupo. Confira produtos e opções e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteGroup(groupId) {
    if (pendingGroupId) return;
    setPendingGroupId(groupId);
    setError("");

    try {
      await deleteAdditionalGroup(groupId);
      if (editingId === groupId) resetForm();
      await loadData(page);
    } catch {
      setError("Não foi possível excluir o grupo. Tente novamente.");
    } finally {
      setPendingGroupId("");
    }
  }

  async function toggleGroup(group) {
    if (pendingGroupId) return;
    setPendingGroupId(group.id);
    setError("");

    try {
      await updateAdditionalGroup(group.id, { storeId: store.id, active: !group.active });
      await loadData(page);
    } catch {
      setError("Não foi possível alterar o status do grupo. Tente novamente.");
    } finally {
      setPendingGroupId("");
    }
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="split-panel">
        <Card className="form-section">
          <span className="eyebrow">Adicionais</span>
          <h2>{editingId ? "Editar grupo" : "Novo grupo"}</h2>
          {error ? <div className="form-error">{error}</div> : null}
          <form ref={additionalFormRef} onSubmit={saveGroup}>
            <Input label="Nome do grupo" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required />
            <Textarea
              label="Descrição"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="Ex: escolha até 3 acompanhamentos"
            />
            <div className="form-grid">
              <Select label="Tipo de seleção" value={form.selectionType} onChange={(event) => updateForm("selectionType", event.target.value)}>
                <option value="multiple">Múltipla</option>
                <option value="single">Única</option>
              </Select>
              <Input label="Mínimo" type="number" min="0" value={form.min} onChange={(event) => updateForm("min", event.target.value)} />
              <Input label="Máximo" type="number" min="0" value={form.max} onChange={(event) => updateForm("max", event.target.value)} help="Use 0 para sem limite" />
            </div>
            <div className="settings-switches">
              <Checkbox label="Grupo obrigatório" checked={form.required} onChange={(checked) => updateForm("required", checked)} />
              <Checkbox label="Grupo ativo" checked={form.active} onChange={(checked) => updateForm("active", checked)} />
            </div>

            <div className="addon-list compact">
              <div className="addon-group-heading">
                <h3>Opções do grupo</h3>
                <Button variant="secondary" size="sm" onClick={addOption}>Adicionar opção</Button>
              </div>
              {form.options.map((option) => (
                <div className="option-editor-row" key={option.id}>
                  <Input label="Nome" value={option.name} onChange={(event) => updateOption(option.id, "name", event.target.value)} />
                  <Input label="Preço" type="number" min="0" step="0.01" value={option.price} onChange={(event) => updateOption(option.id, "price", event.target.value)} />
                  <Checkbox label="Ativa" checked={option.active} onChange={(checked) => updateOption(option.id, "active", checked)} />
                  <Button variant="ghost" size="sm" onClick={() => removeOption(option.id)}>Remover</Button>
                </div>
              ))}
            </div>

            <div className="addon-list compact">
              <h3>Produtos vinculados</h3>
              {products.length ? products.map((product) => (
                <Checkbox
                  key={product.id}
                  label={product.name}
                  checked={form.productIds.includes(product.id)}
                  onChange={(checked) => toggleProduct(product.id, checked)}
                />
              )) : <p className="muted">Cadastre produtos antes de vincular este grupo.</p>}
              <PaginationControls
                page={productPage}
                totalPages={productPagination.totalPages}
                total={productPagination.total}
                loading={loading}
                onPageChange={setProductPage}
              />
            </div>

            <div className="modal-actions">
              <Button type="submit" variant="primary" disabled={saving}>{saving ? "Salvando..." : "Salvar grupo"}</Button>
              <Button variant="ghost" disabled={saving} onClick={resetForm}>Limpar</Button>
            </div>
          </form>
        </Card>

        <div className="admin-list">
          <div className="row-actions list-toolbar">
            <Button variant="secondary" size="sm" disabled={loading || saving || Boolean(pendingGroupId)} onClick={() => loadData(page, { refreshReferences: true })}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
          {loading ? <Card><p>Carregando adicionais...</p></Card> : null}
          {!loading && !groups.length ? <Card><p>Nenhum grupo de adicionais cadastrado.</p></Card> : null}
          {!loading && groups.map((group) => (
            <Card key={group.id} className="additional-group-card">
              <div className="additional-group-card-header">
                <div>
                  <Badge tone={group.active ? "success" : "danger"}>{group.active ? "Ativo" : "Inativo"}</Badge>
                  <h3>{group.name}</h3>
                  <p>{group.description || "Sem descrição"}</p>
                </div>
                <div className="store-card-metrics">
                  <span>{group.required ? "Obrigatório" : "Opcional"}</span>
                  <strong>{group.selectionType === "single" ? "Única" : "Múltipla"}</strong>
                  <small>min {group.min || 0} · max {group.max || "sem limite"}</small>
                </div>
              </div>
              <div className="additional-options-preview">
                {(group.options || []).map((option) => (
                  <span key={option.id}>{option.name} · {Number(option.price) > 0 ? formatCurrency(option.price) : "Grátis"}</span>
                ))}
              </div>
              <p className="muted">Vinculado a {group.productIds?.length || 0} produto(s).</p>
              <div className="row-actions">
                <Button variant="secondary" size="sm" disabled={Boolean(pendingGroupId)} onClick={() => editGroup(group)}>Editar</Button>
                <Button variant={group.active ? "warning" : "success"} size="sm" disabled={Boolean(pendingGroupId)} onClick={() => toggleGroup(group)}>
                  {pendingGroupId === group.id ? "Salvando..." : group.active ? "Desativar" : "Ativar"}
                </Button>
                <Button variant="ghost" size="sm" disabled={Boolean(pendingGroupId)} onClick={() => deleteGroup(group.id)}>
                  {pendingGroupId === group.id ? "Excluindo..." : "Excluir"}
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
