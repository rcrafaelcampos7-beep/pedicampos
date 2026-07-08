import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { planHasFeature } from "../../utils/plans.js";
import { Button } from "../ui/Button.jsx";
import { Textarea } from "../ui/Input.jsx";
import { Modal } from "../ui/Modal.jsx";

export function ProductModal({ product, store, platform, open, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selectedByGroup, setSelectedByGroup] = useState({});
  const [error, setError] = useState("");

  const additionalGroups = useMemo(() => {
    if (!product) return [];
    if (!planHasFeature(store.plan, "additionals", platform)) return [];
    return (store.additionalGroups || [])
      .filter((group) => group.active && group.productIds?.includes(product.id))
      .map((group) => ({
        ...group,
        options: (group.options || []).filter((option) => option.active),
      }))
      .filter((group) => group.options.length);
  }, [product, store]);

  useEffect(() => {
    setSelectedByGroup({});
    setError("");
  }, [product?.id]);

  const selectedAdditionals = additionalGroups.flatMap((group) => {
    const selectedOptionIds = selectedByGroup[group.id] || [];
    return group.options
      .filter((option) => selectedOptionIds.includes(option.id))
      .map((option) => ({
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionName: option.name,
        name: option.name,
        price: Number(option.price) || 0,
      }));
  });

  const addonTotal = selectedAdditionals.reduce((sum, addon) => sum + addon.price, 0);

  const total = product ? (product.price + addonTotal) * quantity : 0;

  function formatOptionPrice(price) {
    return Number(price) > 0 ? `+ ${formatCurrency(price)}` : "Grátis";
  }

  function toggleOption(group, optionId, checked) {
    setError("");
    setSelectedByGroup((current) => {
      const selected = current[group.id] || [];
      let nextSelected;

      if (group.selectionType === "single") {
        nextSelected = checked ? [optionId] : [];
      } else if (checked) {
        nextSelected = selected.includes(optionId) ? selected : [...selected, optionId];
      } else {
        nextSelected = selected.filter((id) => id !== optionId);
      }

      if (group.max > 0 && nextSelected.length > group.max) {
        setError(`Escolha no máximo ${group.max} opções em ${group.name}.`);
        return current;
      }

      return {
        ...current,
        [group.id]: nextSelected,
      };
    });
  }

  function validateSelections() {
    for (const group of additionalGroups) {
      const selectedCount = (selectedByGroup[group.id] || []).length;
      const min = Math.max(Number(group.min) || 0, group.required ? 1 : 0);

      if (min > 0 && selectedCount < min) {
        return group.required
          ? `Este adicional é obrigatório: ${group.name}.`
          : `Escolha pelo menos ${min} opção em ${group.name}.`;
      }

      if (group.max > 0 && selectedCount > group.max) {
        return `Escolha no máximo ${group.max} opções em ${group.name}.`;
      }
    }

    return "";
  }

  function handleAdd() {
    const validation = validateSelections();
    if (validation) {
      setError(validation);
      return;
    }

    onAdd({
      productId: product.id,
      productName: product.name,
      name: product.name,
      basePrice: product.price,
      unitPrice: product.price,
      quantity,
      selectedAdditionals,
      observation: note,
      note,
      total,
      image: product.image,
    });
    setQuantity(1);
    setNote("");
    setSelectedByGroup({});
    setError("");
    onClose();
  }

  return (
    <Modal open={open && Boolean(product)} onClose={onClose} title={product?.name} size="lg">
      {product ? (
        <div className="product-modal">
          <img src={product.image} alt={product.name} />
          <div className="product-modal-content">
            <p>{product.description}</p>
            <strong className="modal-price">{formatCurrency(product.price)}</strong>
            {additionalGroups.map((group) => (
              <div className="addon-list" key={group.id}>
                <div className="addon-group-heading">
                  <div>
                    <h3>{group.name}</h3>
                    {group.description ? <p>{group.description}</p> : null}
                  </div>
                  <span>{group.required ? "Obrigatório" : "Opcional"}</span>
                </div>
                <small>
                  {group.selectionType === "single" ? "Escolha uma opção" : "Escolha múltiplas opções"}
                  {group.max > 0 ? ` · máximo ${group.max}` : ""}
                </small>
                {group.options.map((option) => {
                  const inputType = group.selectionType === "single" ? "radio" : "checkbox";
                  const checked = (selectedByGroup[group.id] || []).includes(option.id);

                  return (
                    <label className="checkbox addon-option-row" key={option.id}>
                      <input
                        type={inputType}
                        name={group.id}
                        checked={checked}
                        onChange={(event) => toggleOption(group, option.id, event.target.checked)}
                      />
                      <span>{option.name}</span>
                      <strong>{formatOptionPrice(option.price)}</strong>
                    </label>
                  );
                })}
              </div>
            ))}
            {error ? <div className="form-error">{error}</div> : null}
            <div className="quantity-stepper">
              <Button variant="secondary" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                -
              </Button>
              <strong>{quantity}</strong>
              <Button variant="secondary" onClick={() => setQuantity((value) => value + 1)}>
                +
              </Button>
            </div>
            <Textarea
              label="Observação"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ex: sem banana, ponto da carne, trocar bebida..."
            />
            <Button variant="store" size="lg" onClick={handleAdd} disabled={!product.active}>
              Adicionar ao carrinho - {formatCurrency(total)}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
