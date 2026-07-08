import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import { updateStore } from "../services/storage.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const emptyGroup = {
  id: "",
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
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyGroup);

  useEffect(() => {
    resetForm();
  }, [store.id]);

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
  }

  function toggleProduct(productId, checked) {
    updateForm(
      "productIds",
      checked ? [...form.productIds, productId] : form.productIds.filter((id) => id !== productId)
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
    setForm((current) => ({
      ...current,
      options: [...current.options, makeOption()],
    }));
  }

  function removeOption(optionId) {
    setForm((current) => ({
      ...current,
      options: current.options.filter((option) => option.id !== optionId),
    }));
  }

  function saveGroup(event) {
    event.preventDefault();
    const group = {
      ...form,
      id: editingId || `group-${crypto.randomUUID()}`,
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

    updateStore(store.id, (draft) => {
      draft.additionalGroups = editingId
        ? (draft.additionalGroups || []).map((item) => (item.id === editingId ? group : item))
        : [group, ...(draft.additionalGroups || [])];
      return draft;
    });
    resetForm();
  }

  function deleteGroup(groupId) {
    updateStore(store.id, (draft) => {
      draft.additionalGroups = (draft.additionalGroups || []).filter((group) => group.id !== groupId);
      return draft;
    });
    if (editingId === groupId) resetForm();
  }

  function toggleGroup(groupId) {
    updateStore(store.id, (draft) => {
      draft.additionalGroups = (draft.additionalGroups || []).map((group) =>
        group.id === groupId ? { ...group, active: !group.active } : group
      );
      return draft;
    });
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <section className="split-panel">
        <Card className="form-section">
          <span className="eyebrow">Adicionais</span>
          <h2>{editingId ? "Editar grupo" : "Novo grupo"}</h2>
          <form onSubmit={saveGroup}>
            <Input label="Nome do grupo" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required />
            <Textarea
              label="Descrição"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="Ex: escolha até 3 acompanhamentos"
            />
            <div className="form-grid">
              <Select
                label="Tipo de seleção"
                value={form.selectionType}
                onChange={(event) => updateForm("selectionType", event.target.value)}
              >
                <option value="multiple">Múltipla</option>
                <option value="single">Única</option>
              </Select>
              <Input
                label="Mínimo"
                type="number"
                min="0"
                value={form.min}
                onChange={(event) => updateForm("min", event.target.value)}
              />
              <Input
                label="Máximo"
                type="number"
                min="0"
                value={form.max}
                onChange={(event) => updateForm("max", event.target.value)}
                help="Use 0 para sem limite"
              />
            </div>
            <div className="settings-switches">
              <Checkbox label="Grupo obrigatório" checked={form.required} onChange={(checked) => updateForm("required", checked)} />
              <Checkbox label="Grupo ativo" checked={form.active} onChange={(checked) => updateForm("active", checked)} />
            </div>

            <div className="addon-list compact">
              <div className="addon-group-heading">
                <h3>Opções do grupo</h3>
                <Button variant="secondary" size="sm" onClick={addOption}>
                  Adicionar opção
                </Button>
              </div>
              {form.options.map((option) => (
                <div className="option-editor-row" key={option.id}>
                  <Input
                    label="Nome"
                    value={option.name}
                    onChange={(event) => updateOption(option.id, "name", event.target.value)}
                  />
                  <Input
                    label="Preço"
                    type="number"
                    min="0"
                    step="0.01"
                    value={option.price}
                    onChange={(event) => updateOption(option.id, "price", event.target.value)}
                  />
                  <Checkbox
                    label="Ativa"
                    checked={option.active}
                    onChange={(checked) => updateOption(option.id, "active", checked)}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeOption(option.id)}>
                    Remover
                  </Button>
                </div>
              ))}
            </div>

            <div className="addon-list compact">
              <h3>Produtos vinculados</h3>
              {store.products.length ? (
                store.products.map((product) => (
                  <Checkbox
                    key={product.id}
                    label={product.name}
                    checked={form.productIds.includes(product.id)}
                    onChange={(checked) => toggleProduct(product.id, checked)}
                  />
                ))
              ) : (
                <p className="muted">Cadastre produtos antes de vincular este grupo.</p>
              )}
            </div>

            <div className="modal-actions">
              <Button type="submit" variant="primary">
                Salvar grupo
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Limpar
              </Button>
            </div>
          </form>
        </Card>

        <div className="admin-list">
          {(store.additionalGroups || []).map((group) => (
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
                  <small>
                    min {group.min || 0} · max {group.max || "sem limite"}
                  </small>
                </div>
              </div>
              <div className="additional-options-preview">
                {(group.options || []).map((option) => (
                  <span key={option.id}>
                    {option.name} · {Number(option.price) > 0 ? formatCurrency(option.price) : "Grátis"}
                  </span>
                ))}
              </div>
              <p className="muted">
                Vinculado a {group.productIds?.length || 0} produto(s).
              </p>
              <div className="row-actions">
                <Button variant="secondary" size="sm" onClick={() => editGroup(group)}>
                  Editar
                </Button>
                <Button variant={group.active ? "warning" : "success"} size="sm" onClick={() => toggleGroup(group.id)}>
                  {group.active ? "Desativar" : "Ativar"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteGroup(group.id)}>
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
