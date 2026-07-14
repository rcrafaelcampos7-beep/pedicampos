import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Checkbox, Input, Textarea } from "../components/ui/Input.jsx";
import { ImageCropModal } from "../components/ui/ImageCropModal.jsx";
import {
  getPaymentMethodsByStore,
  getStoreSettings,
  updatePaymentMethods,
  updateStorePublicProfile,
  updateStoreSettings,
} from "../services/database.js";
import {
  deleteStoredImage,
  uploadStoreBanner,
  uploadStoreLogo,
  validateImageFile,
} from "../services/storageImages.js";
import { ENTITLEMENT_FEATURES, hasFeature } from "../utils/plans.js";
import { slugify } from "../utils/slug.js";

function isImageUrl(value) {
  const candidate = String(value || "").trim();
  return /^(https?:\/\/|data:image\/|blob:|\/)/i.test(candidate);
}

function makeInitialForm(store) {
  const legacyLogo = String(store.logo || "").trim();
  const logo = isImageUrl(legacyLogo) ? legacyLogo : "";
  return {
    ...store,
    logo,
    fallbackInitials: String(store.fallbackInitials || (logo ? "" : legacyLogo)).slice(0, 4).toUpperCase(),
    address: "",
    openingHours: "",
    deliveryTime: "",
    deliveryFee: 0,
    minimumOrderValue: 0,
    deliveryEnabled: true,
    pickupEnabled: true,
    pixKey: "",
    paymentInstructions: "",
    paymentMethods: { pix: false, pixOnline: false, cash: false, card: false },
  };
}

export function AdminSettings({ activePath, store }) {
  const canUseOnlinePayment = hasFeature(store.entitlements, ENTITLEMENT_FEATURES.ONLINE_PAYMENT);
  const [form, setForm] = useState(() => makeInitialForm(store));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [uploadingLabel, setUploadingLabel] = useState("");
  const [fileInputVersion, setFileInputVersion] = useState(0);
  const [cropRequest, setCropRequest] = useState(null);
  const [savedImageUrls, setSavedImageUrls] = useState({
    logo: makeInitialForm(store).logo,
    banner: store.banner || "",
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview("");
    setBannerPreview("");
    setCropRequest(null);
    setFileInputVersion((current) => current + 1);
    const initialForm = makeInitialForm(store);
    setSavedImageUrls({ logo: initialForm.logo, banner: store.banner || "" });

    Promise.all([getStoreSettings(store.id), getPaymentMethodsByStore(store.id)])
      .then(([settings, paymentMethods]) => {
        if (!active) return;
        setForm({
          ...initialForm,
          ...(settings || {}),
          fallbackInitials: settings?.fallbackInitials || initialForm.fallbackInitials,
          paymentMethods: {
            ...paymentMethods,
            pixOnline: canUseOnlinePayment && Boolean(paymentMethods.pixOnline),
          },
          id: store.id,
        });
      })
      .catch(() => {
        if (active) setError("Nao foi possivel carregar as configuracoes. Tente novamente.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [store.id, canUseOnlinePayment]);

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  useEffect(() => () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
  }, [bannerPreview]);

  useEffect(() => () => {
    if (cropRequest?.sourceUrl) URL.revokeObjectURL(cropRequest.sourceUrl);
  }, [cropRequest?.sourceUrl]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePayment(field, checked) {
    setForm((current) => ({
      ...current,
      paymentMethods: { ...current.paymentMethods, [field]: checked },
    }));
  }

  function selectImage(kind, event) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    try {
      validateImageFile(file);
      setError("");
      setCropRequest({
        kind,
        file,
        sourceUrl: URL.createObjectURL(file),
        title: kind === "logo" ? "Recortar logo" : "Recortar banner",
        aspect: kind === "logo" ? 1 : 16 / 9,
        output: kind === "logo" ? { width: 512, height: 512 } : { width: 1600, height: 900 },
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
    const preview = URL.createObjectURL(file);
    if (cropRequest.kind === "logo") {
      setLogoFile(file);
      setLogoPreview(preview);
    } else {
      setBannerFile(file);
      setBannerPreview(preview);
    }
    setCropRequest(null);
    setFileInputVersion((current) => current + 1);
  }

  async function saveSettings(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const uploadedImages = [];
    const previousLogo = savedImageUrls.logo;
    const previousBanner = savedImageUrls.banner;

    try {
      let nextLogo = form.logo;
      let nextBanner = form.banner;
      if (logoFile) {
        setUploadingLabel("Enviando logo...");
        const uploaded = await uploadStoreLogo(store.id, logoFile);
        uploadedImages.push(uploaded);
        nextLogo = uploaded.publicUrl;
      }
      if (bannerFile) {
        setUploadingLabel("Enviando banner...");
        const uploaded = await uploadStoreBanner(store.id, bannerFile);
        uploadedImages.push(uploaded);
        nextBanner = uploaded.publicUrl;
      }

      if (import.meta.env.DEV) {
        console.info("[PediCampos] Imagens prontas para persistencia.", {
          storeId: store.id,
          newLogoUrl: nextLogo,
          newBannerUrl: nextBanner,
        });
      }

      setUploadingLabel("Salvando configuracoes...");
      await Promise.all([
        updateStoreSettings(store.id, {
          address: form.address,
          openingHours: form.openingHours,
          deliveryTime: form.deliveryTime,
          deliveryFee: Number(form.deliveryFee) || 0,
          minimumOrderValue: Number(form.minimumOrderValue) || 0,
          deliveryEnabled: form.deliveryEnabled,
          pickupEnabled: form.pickupEnabled,
          pixKey: form.pixKey,
          paymentInstructions: form.paymentInstructions,
          fallbackInitials: form.fallbackInitials,
        }),
        updatePaymentMethods(store.id, form.paymentMethods),
      ]);

      const profilePayload = {
        name: form.name,
        slug: slugify(form.slug),
        segment: form.segment,
        open: form.open,
        primaryColor: form.primaryColor,
        whatsapp: form.whatsapp,
        logo: nextLogo,
        banner: nextBanner,
      };
      if (import.meta.env.DEV) {
        console.info("[PediCampos] Payload visual enviado ao banco.", {
          storeId: store.id,
          logo: profilePayload.logo,
          banner: profilePayload.banner,
        });
      }
      const savedProfile = await updateStorePublicProfile(store.id, profilePayload);
      if (import.meta.env.DEV) {
        console.info("[PediCampos] Perfil visual retornado pelo banco.", {
          storeId: savedProfile.id,
          logo: savedProfile.logo,
          banner: savedProfile.banner,
        });
      }

      setForm((current) => ({ ...current, logo: nextLogo, banner: nextBanner }));
      setSavedImageUrls({ logo: nextLogo, banner: nextBanner });
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview("");
      setBannerPreview("");
      setFileInputVersion((current) => current + 1);
      await Promise.allSettled([
        nextLogo !== previousLogo ? deleteStoredImage(previousLogo) : Promise.resolve(false),
        nextBanner !== previousBanner ? deleteStoredImage(previousBanner) : Promise.resolve(false),
      ]);
      setSuccess("Configuracoes salvas com sucesso.");
    } catch (saveError) {
      await Promise.allSettled(uploadedImages.map((image) => deleteStoredImage(image.publicUrl)));
      if (import.meta.env.DEV) {
        const databaseError = saveError.cause || saveError;
        console.error("[PediCampos] Falha ao salvar configuracoes da loja.", {
          code: databaseError.code,
          message: databaseError.message,
          details: databaseError.details,
          hint: databaseError.hint,
        });
      }
      setError(saveError.message || "Nao foi possivel salvar todas as configuracoes. Tente novamente.");
    } finally {
      setUploadingLabel("");
      setSaving(false);
    }
  }

  return (
    <AdminLayout activePath={activePath} store={store}>
      <Card className="form-section settings-card">
        <span className="eyebrow">Configuracoes</span>
        <h2>Dados da loja</h2>
        {loading ? <p>Carregando configuracoes...</p> : null}
        {error ? <div className="form-error">{error}</div> : null}
        {success ? <div className="form-success">{success}</div> : null}
        {!loading ? (
          <form onSubmit={saveSettings}>
            <div className="form-grid">
              <Input label="Nome da loja" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              <Input label="Slug" value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} />
              <Input label="Segmento" value={form.segment} onChange={(event) => updateForm("segment", event.target.value)} />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(event) => updateForm("whatsapp", event.target.value)} />
              <Input label="Cor principal" type="color" value={form.primaryColor} onChange={(event) => updateForm("primaryColor", event.target.value)} />
            </div>

            <div className="asset-settings-grid">
              <section className="asset-settings-section" aria-labelledby="logo-settings-title">
                <h3 id="logo-settings-title">Logo</h3>
                <p className="muted">Cole uma URL ou escolha uma imagem do dispositivo.</p>
                <Input label="URL da logo (opcional)" value={form.logo} onChange={(event) => updateForm("logo", event.target.value)} />
                <Input
                  label="Iniciais de fallback"
                  value={form.fallbackInitials}
                  maxLength={4}
                  onChange={(event) => updateForm("fallbackInitials", event.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase())}
                />
                <label className="settings-file-field">
                  <span>Enviar logo da galeria</span>
                  <input key={`logo-${fileInputVersion}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage("logo", event)} />
                </label>
                {logoFile ? <small>Arquivo selecionado: {logoFile.name}</small> : null}
                {uploadingLabel === "Enviando logo..." ? <small role="status">Enviando logo...</small> : null}
                {logoPreview || form.logo ? (
                  <img
                    key={logoPreview || form.logo}
                    src={logoPreview || form.logo}
                    alt="Previa da logo"
                    className="settings-image-preview settings-logo-preview"
                    onError={(event) => { event.currentTarget.hidden = true; }}
                  />
                ) : null}
              </section>

              <section className="asset-settings-section" aria-labelledby="banner-settings-title">
                <h3 id="banner-settings-title">Banner</h3>
                <p className="muted">Cole uma URL ou escolha uma imagem do dispositivo.</p>
                <Input label="URL do banner (opcional)" value={form.banner} onChange={(event) => updateForm("banner", event.target.value)} />
                <label className="settings-file-field">
                  <span>Enviar banner da galeria</span>
                  <input key={`banner-${fileInputVersion}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage("banner", event)} />
                </label>
                {bannerFile ? <small>Arquivo selecionado: {bannerFile.name}</small> : null}
                {uploadingLabel === "Enviando banner..." ? <small role="status">Enviando banner...</small> : null}
                {bannerPreview || form.banner ? (
                  <img
                    key={bannerPreview || form.banner}
                    src={bannerPreview || form.banner}
                    alt="Previa do banner"
                    className="settings-image-preview"
                    onError={(event) => { event.currentTarget.hidden = true; }}
                  />
                ) : null}
              </section>
            </div>

            <div className="form-grid">
              <Input label="Tempo medio" value={form.deliveryTime} onChange={(event) => updateForm("deliveryTime", event.target.value)} />
              <Input label="Taxa de entrega" type="number" min="0" step="0.01" value={form.deliveryFee} onChange={(event) => updateForm("deliveryFee", event.target.value)} />
              <Input label="Pedido minimo" type="number" min="0" step="0.01" value={form.minimumOrderValue} onChange={(event) => updateForm("minimumOrderValue", event.target.value)} />
              <Input label="Horario de funcionamento" value={form.openingHours} onChange={(event) => updateForm("openingHours", event.target.value)} />
              <Input label="Chave Pix" value={form.pixKey} onChange={(event) => updateForm("pixKey", event.target.value)} />
            </div>
            <Textarea label="Endereco" value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
            <Textarea label="Instrucoes de pagamento" value={form.paymentInstructions} onChange={(event) => updateForm("paymentInstructions", event.target.value)} />
            <div className="settings-switches">
              <Checkbox label="Loja aberta" checked={form.open} onChange={(checked) => updateForm("open", checked)} />
              <Checkbox label="Entrega habilitada" checked={form.deliveryEnabled} onChange={(checked) => updateForm("deliveryEnabled", checked)} />
              <Checkbox label="Retirada habilitada" checked={form.pickupEnabled} onChange={(checked) => updateForm("pickupEnabled", checked)} />
            </div>
            <div className="settings-switches">
              <Checkbox label="Pix" checked={Boolean(form.paymentMethods.pix)} onChange={(checked) => updatePayment("pix", checked)} />
              {canUseOnlinePayment ? <Checkbox label="Pix automatico / QR Code" checked={Boolean(form.paymentMethods.pixOnline)} onChange={(checked) => updatePayment("pixOnline", checked)} /> : null}
              <Checkbox label="Dinheiro" checked={Boolean(form.paymentMethods.cash)} onChange={(checked) => updatePayment("cash", checked)} />
              <Checkbox label="Cartao" checked={Boolean(form.paymentMethods.card)} onChange={(checked) => updatePayment("card", checked)} />
            </div>
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {uploadingLabel || (saving ? "Salvando..." : "Salvar configuracoes")}
            </Button>
          </form>
        ) : null}
      </Card>
      <ImageCropModal request={cropRequest} onCancel={cancelCrop} onConfirm={confirmCrop} />
    </AdminLayout>
  );
}
