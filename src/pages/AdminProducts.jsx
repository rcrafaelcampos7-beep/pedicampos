import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Select, Textarea } from "../components/ui/Input.jsx";
import { ImageCropModal } from "../components/ui/ImageCropModal.jsx";
import { PaginationControls } from "../components/ui/PaginationControls.jsx";
import {
  createProduct,
  DEFAULT_PAGE_SIZE,
  deleteProduct as deleteDatabaseProduct,
  getCategoriesByStorePaginated,
  getProductsByStorePaginated,
  updateProduct,
} from "../services/database.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import {
  deleteStoredImage,
  uploadProductImage,
  validateImageFile,
} from "../services/storageImages.js";

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingLabel, setUploadingLabel] = useState("");
  const [fileInputVersion, setFileInputVersion] = useState(0);
  const [cropRequest, setCropRequest] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPagination, setCategoryPagination] = useState({ total: 0, totalPages: 1 });
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loadedCategoryPage, setLoadedCategoryPage] = useState(0);
  const productFormRef = useRef(null);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  useEffect(() => () => {
    if (cropRequest?.sourceUrl) URL.revokeObjectURL(cropRequest.sourceUrl);
  }, [cropRequest?.sourceUrl]);

  async function loadData(targetPage = page, options = {}) {
    setLoading(true);
    setError("");

    try {
      const [productResult, categoryResult] = await Promise.all([
        getProductsByStorePaginated(store.id, { page: targetPage, pageSize: DEFAULT_PAGE_SIZE }),
        categoriesLoaded && loadedCategoryPage === categoryPage && !options.refreshReferences
          ? Promise.resolve({ data: categories, total: categoryPagination.total, totalPages: categoryPagination.totalPages })
          : getCategoriesByStorePaginated(store.id, { page: categoryPage, pageSize: DEFAULT_PAGE_SIZE }),
      ]);
      setProducts(productResult.data);
      setPagination({ total: productResult.total, totalPages: productResult.totalPages });
      if (targetPage > productResult.totalPages) setPage(productResult.totalPages);
      setCategories(categoryResult.data);
      setCategoriesLoaded(true);
      setLoadedCategoryPage(categoryPage);
      setCategoryPagination({ total: categoryResult.total, totalPages: categoryResult.totalPages });
      if (categoryPage > categoryResult.totalPages) setCategoryPage(categoryResult.totalPages);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoryResult.data[0]?.id || "",
        image: current.image || store.banner,
      }));
    } catch {
      setError("Não foi possível carregar os produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setImageFile(null);
    setImagePreview("");
    setCropRequest(null);
    setFileInputVersion((current) => current + 1);
    setEditingId("");
    setForm({ ...emptyProduct, image: store.banner });
    setPage(1);
    setCategoryPage(1);
    setCategoriesLoaded(false);
    setLoadedCategoryPage(0);
  }, [store.id]);

  useEffect(() => {
    loadData(page);
  }, [store.id, page, categoryPage]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editProduct(product) {
    setImageFile(null);
    setImagePreview("");
    setCropRequest(null);
    setFileInputVersion((current) => current + 1);
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
    setImageFile(null);
    setImagePreview("");
    setCropRequest(null);
    setFileInputVersion((current) => current + 1);
    setEditingId("");
    setForm({
      ...emptyProduct,
      categoryId: categories[0]?.id || "",
      image: store.banner,
    });
  }

  function selectProductImage(event) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    try {
      validateImageFile(file);
      setError("");
      setCropRequest({
        kind: "product",
        file,
        sourceUrl: URL.createObjectURL(file),
        title: "Recortar imagem do produto",
        aspect: 1,
        output: { width: 800, height: 800 },
      });
    } catch (imageError) {
      event.target.value = "";
      setError(imageError.message);
    }
  }

  function cancelCrop() {
    setCropRequest(null);
    setFileInputVersion((current) => current + 1);
  }

  function confirmCrop(file) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setCropRequest(null);
    setFileInputVersion((current) => current + 1);
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

    let uploadedImage = null;
    try {
      if (editingId) {
        const previousImage = products.find((item) => item.id === editingId)?.image || "";
        let nextImage = product.image;
        if (imageFile) {
          setUploadingLabel("Enviando imagem...");
          uploadedImage = await uploadProductImage(store.id, editingId, imageFile);
          nextImage = uploadedImage.publicUrl;
        }

        setUploadingLabel("Salvando produto...");
        await updateProduct(editingId, { ...product, image: nextImage });
        if (previousImage !== nextImage) {
          await Promise.allSettled([deleteStoredImage(previousImage)]);
        }
      } else {
        setUploadingLabel("Salvando produto...");
        const created = await createProduct(store.id, product);
        if (imageFile) {
          try {
            setUploadingLabel("Enviando imagem...");
            uploadedImage = await uploadProductImage(store.id, created.id, imageFile);
            await updateProduct(created.id, { image: uploadedImage.publicUrl });
          } catch (imageError) {
            if (uploadedImage) await Promise.allSettled([deleteStoredImage(uploadedImage.publicUrl)]);
            await loadData(page);
            setEditingId(created.id);
            setForm({ ...product, image: created.image });
            setError(`Produto salvo, mas a imagem nao foi enviada. ${imageError.message || "Tente novamente."}`);
            return;
          }
        }
      }

      resetForm();
      await loadData(page);
    } catch (saveError) {
      if (uploadedImage) await Promise.allSettled([deleteStoredImage(uploadedImage.publicUrl)]);
      setError(saveError.message || "Nao foi possivel salvar o produto. Confira a categoria e tente novamente.");
    } finally {
      setUploadingLabel("");
      setSaving(false);
    }
  }

  async function deleteProduct(productId) {
    if (pendingProductId) return;
    setPendingProductId(productId);
    setError("");

    try {
      const product = products.find((item) => item.id === productId);
      await deleteDatabaseProduct(productId);
      if (product?.image) await Promise.allSettled([deleteStoredImage(product.image)]);
      if (editingId === productId) resetForm();
      await loadData(page);
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
      await loadData(page);
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
                {form.categoryId && !categories.some((category) => category.id === form.categoryId) ? (
                  <option value={form.categoryId}>Categoria atual</option>
                ) : null}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <PaginationControls
              page={categoryPage}
              totalPages={categoryPagination.totalPages}
              total={categoryPagination.total}
              loading={loading}
              onPageChange={setCategoryPage}
            />
            <Input
              label="Imagem ou banner URL"
              value={form.image}
              onChange={(event) => updateForm("image", event.target.value)}
            />
            <label>
              <span>Enviar imagem do produto</span>
              <input key={fileInputVersion} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectProductImage} />
            </label>
            {imagePreview ? <img src={imagePreview} alt="Previa da nova imagem do produto" className="settings-image-preview" /> : null}
            <Checkbox label="Produto ativo" checked={form.active} onChange={(checked) => updateForm("active", checked)} />
            <div className="addon-list compact">
              <h3>Adicionais vinculados</h3>
              <p className="muted">Os adicionais serão conectados ao Supabase na próxima etapa.</p>
            </div>
            <div className="modal-actions">
              <Button type="submit" variant="primary" disabled={saving}>
                {uploadingLabel || (saving ? "Salvando..." : "Salvar produto")}
              </Button>
              <Button variant="ghost" disabled={saving} onClick={resetForm}>
                Limpar
              </Button>
            </div>
          </form>
        </Card>

        <div className="admin-list">
          <div className="row-actions list-toolbar">
            <Button variant="secondary" size="sm" disabled={loading || saving || Boolean(pendingProductId)} onClick={() => loadData(page, { refreshReferences: true })}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
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
          {!error ? <PaginationControls page={page} totalPages={pagination.totalPages} total={pagination.total} loading={loading} onPageChange={setPage} /> : null}
        </div>
      </section>
      <ImageCropModal request={cropRequest} onCancel={cancelCrop} onConfirm={confirmCrop} />
    </AdminLayout>
  );
}
