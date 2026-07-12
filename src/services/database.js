import { createEmptyStore } from "../data/mockStores.js";
import { uniqueSlug } from "../utils/slug.js";
import { supabase } from "./supabaseClient.js";
import {
  createOrder as createStorageOrder,
  getDatabase as getStorageDatabase,
  migrateLegacyStoresForSupabase,
  mutateDatabase,
  subscribeDatabase as subscribeStorageDatabase,
  updateOrder as updateStorageOrder,
  updatePlatform as updateStoragePlatform,
  updateStore as updateStorageStore,
} from "./storage.js";

// Temporary data facade. Supabase integration should replace the internals here,
// keeping the public functions stable for pages and hooks.

function makeId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const STORE_COLUMNS =
  "id, plan_key, name, slug, segment, active, open, primary_color, whatsapp, logo, banner_url, created_at, updated_at";
const CATEGORY_COLUMNS = "id, store_id, name, active, sort_order, created_at, updated_at";
const PRODUCT_COLUMNS =
  "id, store_id, category_id, name, description, price, image_url, active, sort_order, created_at, updated_at";
const ADDITIONAL_GROUP_COLUMNS =
  "id, store_id, name, description, required, min_choices, max_choices, selection_type, active, sort_order, created_at, updated_at";
const ADDITIONAL_OPTION_COLUMNS =
  "id, store_id, additional_group_id, name, price, active, sort_order, created_at, updated_at";
const STORE_SETTINGS_COLUMNS =
  "id, store_id, address, opening_hours, delivery_time, delivery_fee, pix_key, minimum_order_value, service_mode, extra, created_at, updated_at";
const PAYMENT_METHOD_COLUMNS =
  "id, store_id, type, label, active, provider, provider_config, manual, online_enabled, created_at, updated_at";

function getLocalStores() {
  return getStorageDatabase().stores;
}

function getLocalStoreById(id) {
  return getLocalStores().find((store) => store.id === id) || null;
}

export function storeFromSupabase(row) {
  if (!row) return null;

  return createEmptyStore({
    id: row.id,
    plan: row.plan_key || "start",
    name: row.name || "",
    slug: row.slug || "",
    segment: row.segment || "",
    active: row.active !== false,
    open: row.open !== false,
    primaryColor: row.primary_color || "#16a34a",
    whatsapp: row.whatsapp || "",
    logo: row.logo || "",
    banner: row.banner_url || "",
    categories: [],
    products: [],
    additionalGroups: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function storeToSupabase(store = {}) {
  const mapped = {
    plan_key: store.plan,
    name: store.name,
    slug: store.slug,
    segment: store.segment,
    active: store.active,
    open: store.open,
    primary_color: store.primaryColor,
    whatsapp: store.whatsapp,
    logo: store.logo,
    banner_url: store.banner,
  };

  return Object.fromEntries(Object.entries(mapped).filter(([, value]) => value !== undefined));
}

export function categoryFromSupabase(row) {
  if (!row) return null;

  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name || "",
    active: row.active !== false,
    order: Number(row.sort_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function categoryToSupabase(category = {}, storeId) {
  const mapped = {
    store_id: storeId ?? category.storeId,
    name: category.name,
    active: category.active,
    sort_order: category.order,
  };

  return Object.fromEntries(Object.entries(mapped).filter(([, value]) => value !== undefined));
}

export function productFromSupabase(row) {
  if (!row) return null;

  return {
    id: row.id,
    storeId: row.store_id,
    categoryId: row.category_id || "",
    name: row.name || "",
    description: row.description || "",
    price: Number(row.price) || 0,
    image: row.image_url || "",
    active: row.active !== false,
    order: Number(row.sort_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function productToSupabase(product = {}, storeId) {
  const mapped = {
    store_id: storeId ?? product.storeId,
    category_id: product.categoryId === undefined ? undefined : product.categoryId || null,
    name: product.name,
    description: product.description,
    price: product.price === undefined ? undefined : Number(product.price) || 0,
    image_url: product.image,
    active: product.active,
    sort_order: product.order,
  };

  return Object.fromEntries(Object.entries(mapped).filter(([, value]) => value !== undefined));
}

export function additionalOptionFromSupabase(row) {
  if (!row) return null;
  return {
    id: row.id,
    storeId: row.store_id,
    groupId: row.additional_group_id,
    name: row.name || "",
    price: Number(row.price) || 0,
    active: row.active !== false,
    order: Number(row.sort_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function additionalOptionToSupabase(option = {}, storeId, groupId) {
  return {
    store_id: storeId ?? option.storeId,
    additional_group_id: groupId ?? option.groupId,
    name: option.name || "",
    price: Number(option.price) || 0,
    active: option.active !== false,
    sort_order: Number(option.order) || 0,
  };
}

export function additionalGroupFromSupabase(row, options = [], productIds = []) {
  if (!row) return null;
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name || "",
    description: row.description || "",
    required: Boolean(row.required),
    min: Number(row.min_choices) || 0,
    max: Number(row.max_choices) || 0,
    selectionType: row.selection_type === "single" ? "single" : "multiple",
    productIds,
    active: row.active !== false,
    order: Number(row.sort_order) || 0,
    options,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function additionalGroupToSupabase(group = {}, storeId) {
  return {
    store_id: storeId ?? group.storeId,
    name: group.name || "",
    description: group.description || "",
    required: Boolean(group.required),
    min_choices: Number(group.min) || 0,
    max_choices: Number(group.max) || 0,
    selection_type: group.selectionType === "single" ? "single" : "multiple",
    active: group.active !== false,
    sort_order: Number(group.order) || 0,
  };
}

export function storeSettingsFromSupabase(row) {
  if (!row) return null;
  const serviceMode = row.service_mode || "delivery_pickup";
  return {
    id: row.id,
    storeId: row.store_id,
    address: row.address || "",
    openingHours: row.opening_hours || "",
    deliveryTime: row.delivery_time || "",
    deliveryFee: Number(row.delivery_fee) || 0,
    pixKey: row.pix_key || "",
    minimumOrderValue: Number(row.minimum_order_value) || 0,
    deliveryEnabled: serviceMode === "delivery" || serviceMode === "delivery_pickup",
    pickupEnabled: serviceMode === "pickup" || serviceMode === "delivery_pickup",
    paymentInstructions: row.extra?.paymentInstructions || "",
    extra: row.extra || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function storeSettingsToSupabase(data = {}, storeId) {
  const deliveryEnabled = data.deliveryEnabled !== false;
  const pickupEnabled = data.pickupEnabled !== false;
  const serviceMode = deliveryEnabled && pickupEnabled
    ? "delivery_pickup"
    : deliveryEnabled
      ? "delivery"
      : pickupEnabled
        ? "pickup"
        : "disabled";

  return {
    store_id: storeId,
    address: data.address || "",
    opening_hours: data.openingHours || "",
    delivery_time: data.deliveryTime || "",
    delivery_fee: Number(data.deliveryFee) || 0,
    pix_key: data.pixKey || "",
    minimum_order_value: Number(data.minimumOrderValue) || 0,
    service_mode: serviceMode,
    extra: {
      ...(data.extra || {}),
      paymentInstructions: data.paymentInstructions || "",
    },
  };
}

export function paymentMethodFromSupabase(row) {
  if (!row) return null;
  return {
    id: row.id,
    storeId: row.store_id,
    type: row.type,
    label: row.label,
    active: row.active !== false,
    manual: row.manual !== false,
    onlineEnabled: Boolean(row.online_enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function paymentMethodToSupabase(method = {}, storeId) {
  const labels = { pix: "Pix", cash: "Dinheiro", card: "Cartão" };
  return {
    store_id: storeId,
    type: method.type,
    label: method.label || labels[method.type] || method.type,
    active: method.active !== false,
    provider: null,
    provider_config: {},
    manual: true,
    online_enabled: method.type === "pix" ? Boolean(method.onlineEnabled) : false,
  };
}

export function orderAdditionalFromSupabase(row) {
  return {
    groupId: row.additional_group_id,
    groupName: row.group_name || "Adicionais",
    optionId: row.additional_option_id,
    optionName: row.option_name,
    name: row.option_name,
    price: Number(row.price) || 0,
  };
}

export function orderItemFromSupabase(row) {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.product_name,
    unitPrice: Number(row.unit_price) || 0,
    quantity: Number(row.quantity) || 1,
    note: row.note || "",
    image: row.image_url || "",
    total: Number(row.total) || 0,
    selectedAdditionals: (row.order_item_additionals || []).map(orderAdditionalFromSupabase),
  };
}

export function orderFromSupabase(row) {
  if (!row) return null;
  const customer = row.customers || row.customer || {};
  const store = row.stores || {};
  return {
    id: row.id,
    publicToken: row.public_token || row.publicToken,
    number: row.number,
    storeId: row.store_id || row.storeId,
    storeSlug: store.slug || row.storeSlug || row.metadata?.storeSlug || "",
    storeName: store.name || row.storeName || row.metadata?.storeName || "",
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    customer: {
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
    },
    fulfillment: row.fulfillment,
    address: row.address,
    notes: row.notes || "",
    paymentMethod: row.payment_method || row.paymentMethod,
    paymentStatus: row.payment_status || row.paymentStatus,
    orderStatus: row.order_status || row.orderStatus,
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.delivery_fee ?? row.deliveryFee) || 0,
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
    pixCode: row.pix_code || row.pixCode || "",
    pixKey: row.pix_key || row.pixKey || "",
    items: (row.order_items || row.items || []).map((item) =>
      item.product_name ? orderItemFromSupabase(item) : item
    ),
  };
}

export function customerToSupabase(customer = {}) {
  return { name: customer.name || "", phone: customer.phone || "", email: customer.email || "" };
}

export function orderToSupabase(order = {}) {
  const paymentKeys = { Pix: "pix", Dinheiro: "cash", Cartão: "card", Cartao: "card" };
  return {
    customer: customerToSupabase(order.customer),
    fulfillment: order.fulfillment === "pickup" ? "pickup" : "delivery",
    address: order.address || null,
    notes: order.notes || "",
    paymentMethod: order.paymentMethodKey || paymentKeys[order.paymentMethod] || order.paymentMethod,
    items: (order.items || []).map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity) || 1,
      note: item.note || item.observation || "",
      selectedAdditionals: (item.selectedAdditionals || item.addons || []).map((additional) => ({
        groupId: additional.groupId,
        optionId: additional.optionId || additional.id,
      })),
    })),
  };
}

function warnAndUseLocal(operation, error) {
  console.warn(`[PediCampos] Supabase falhou em ${operation}; usando fallback local.`, error);
}

function isConnectionError(error) {
  if (!error) return false;
  const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return !error.code && (
    error instanceof TypeError ||
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("networkerror") ||
    message.includes("network error") ||
    message.includes("load failed")
  );
}

function throwDatabaseError(operation, error) {
  const failure = new Error(`Não foi possível concluir ${operation}.`);
  failure.code = error?.code;
  failure.cause = error;
  throw failure;
}

function useLocalForConnectionFailure(operation, error) {
  if (!isConnectionError(error)) throwDatabaseError(operation, error);
  warnAndUseLocal(operation, error);
}

function getStoreContaining(collectionName, itemId) {
  return getStorageDatabase().stores.find((store) =>
    (store[collectionName] || []).some((item) => item.id === itemId)
  );
}

function getAdditionalGroupStore(groupId) {
  return getStorageDatabase().stores.find((store) =>
    (store.additionalGroups || []).some((group) => group.id === groupId)
  );
}

export function getDatabase() {
  const database = getStorageDatabase();
  return supabase ? { ...database, stores: [] } : database;
}

export function subscribeDatabase(callback) {
  return subscribeStorageDatabase(callback);
}

export async function getStores() {
  if (!supabase) return getLocalStores();

  const { data, error } = await supabase.from("stores").select(STORE_COLUMNS).order("created_at", { ascending: false });
  if (error) {
    useLocalForConnectionFailure("getStores", error);
    return getLocalStores();
  }

  const stores = (data || []).map(storeFromSupabase);
  migrateLegacyStoresForSupabase(stores, { complete: true });
  return stores;
}

export async function getStoreBySlug(slug, options = {}) {
  const allowLocalFallback = options.allowLocalFallback !== false;
  if (!supabase) {
    if (!allowLocalFallback) throw new Error("Supabase não está configurado para resolver a loja do checkout.");
    return getLocalStores().find((store) => store.slug === slug) || null;
  }

  const { data, error } = await supabase.from("stores").select(STORE_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) {
    if (!allowLocalFallback) throwDatabaseError("resolver a loja pelo slug", error);
    useLocalForConnectionFailure("getStoreBySlug", error);
    return getLocalStores().find((store) => store.slug === slug) || null;
  }

  const store = storeFromSupabase(data);
  if (store) migrateLegacyStoresForSupabase([store]);
  return store;
}

export async function getStoreById(id, options = {}) {
  const allowLocalFallback = options.allowLocalFallback !== false;
  if (!supabase) {
    if (!allowLocalFallback) throw new Error("Supabase não está configurado para resolver a loja autorizada.");
    return getLocalStoreById(id);
  }

  const { data, error } = await supabase.from("stores").select(STORE_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    if (!allowLocalFallback) throwDatabaseError("resolver a loja autorizada", error);
    useLocalForConnectionFailure("getStoreById", error);
    return getLocalStoreById(id);
  }

  const store = storeFromSupabase(data);
  if (store) migrateLegacyStoresForSupabase([store]);
  return store;
}

export async function createStore(data = {}) {
  const stores = supabase ? await getStores() : getLocalStores();
  const slug = uniqueSlug(data.slug || data.name || "nova-loja", stores);
  const store = createEmptyStore({
    ...data,
    slug,
    categories: data.categories || [],
    products: data.products || [],
    additionalGroups: data.additionalGroups || [],
  });

  if (supabase) {
    const { data: existing, error: lookupError } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!lookupError && existing) return getStoreById(existing.id);

    const { data: created, error } = await supabase
      .from("stores")
      .insert(storeToSupabase(store))
      .select(STORE_COLUMNS)
      .single();

    if (!error) return storeFromSupabase(created);
    warnAndUseLocal("createStore", error);
  }

  mutateDatabase((database) => {
    const exists = database.stores.some((item) => item.slug === slug);
    if (!exists) database.stores = [store, ...database.stores];
    return database;
  });

  return getLocalStores().find((item) => item.slug === slug) || store;
}

export async function updateStore(id, data) {
  if (supabase) {
    const { data: updated, error } = await supabase
      .from("stores")
      .update(storeToSupabase(data))
      .eq("id", id)
      .select(STORE_COLUMNS)
      .single();

    if (!error) return storeFromSupabase(updated);
    warnAndUseLocal("updateStore", error);
  }

  updateStorageStore(id, data);
  return getLocalStoreById(id);
}

export async function deactivateStore(id) {
  return updateStore(id, { active: false });
}

export async function updateStorePublicProfile(storeId, data) {
  if (supabase) {
    const { data: updated, error } = await supabase.rpc("update_store_public_profile", {
      p_store_id: storeId,
      p_name: data.name || "",
      p_slug: data.slug || "",
      p_segment: data.segment || "",
      p_open: data.open !== false,
      p_primary_color: data.primaryColor || "#16a34a",
      p_whatsapp: data.whatsapp || "",
      p_logo: data.logo || "",
      p_banner_url: data.banner || "",
    });

    if (!error) return storeFromSupabase(updated);
    warnAndUseLocal("updateStorePublicProfile", error);
  }

  updateStorageStore(storeId, data);
  return getLocalStoreById(storeId);
}

export async function getStoreSettings(storeId) {
  if (!supabase) {
    const store = getLocalStoreById(storeId);
    if (!store) return null;
    return {
      storeId,
      address: store.address || "",
      openingHours: store.openingHours || "",
      deliveryTime: store.deliveryTime || "",
      deliveryFee: Number(store.deliveryFee) || 0,
      pixKey: store.pixKey || "",
      minimumOrderValue: Number(store.minimumOrderValue) || 0,
      deliveryEnabled: store.deliveryEnabled !== false,
      pickupEnabled: store.pickupEnabled !== false,
      paymentInstructions: store.paymentInstructions || "",
    };
  }

  const { data, error } = await supabase
    .from("store_settings")
    .select(STORE_SETTINGS_COLUMNS)
    .eq("store_id", storeId)
    .maybeSingle();

  if (error) {
    warnAndUseLocal("getStoreSettings", error);
    const store = getLocalStoreById(storeId);
    return store ? storeSettingsFromSupabase({
      store_id: storeId,
      address: store.address,
      opening_hours: store.openingHours,
      delivery_time: store.deliveryTime,
      delivery_fee: store.deliveryFee,
      pix_key: store.pixKey,
      minimum_order_value: store.minimumOrderValue,
      service_mode: store.deliveryEnabled === false ? "pickup" : store.pickupEnabled === false ? "delivery" : "delivery_pickup",
      extra: { paymentInstructions: store.paymentInstructions || "" },
    }) : null;
  }

  return storeSettingsFromSupabase(data);
}

export async function updateStoreSettings(storeId, data) {
  if (supabase) {
    const current = await getStoreSettings(storeId);
    const payload = storeSettingsToSupabase({ ...current, ...data }, storeId);
    const { data: updated, error } = await supabase
      .from("store_settings")
      .upsert(payload, { onConflict: "store_id" })
      .select(STORE_SETTINGS_COLUMNS)
      .single();

    if (!error) return storeSettingsFromSupabase(updated);
    warnAndUseLocal("updateStoreSettings", error);
  }

  updateStorageStore(storeId, data);
  const store = getLocalStoreById(storeId);
  return store ? { ...data, storeId } : null;
}

export async function getPaymentMethodsByStore(storeId) {
  if (!supabase) return getLocalStoreById(storeId)?.paymentMethods || {};

  const { data, error } = await supabase
    .from("payment_methods")
    .select(PAYMENT_METHOD_COLUMNS)
    .eq("store_id", storeId);

  if (error) {
    warnAndUseLocal("getPaymentMethodsByStore", error);
    return getLocalStoreById(storeId)?.paymentMethods || {};
  }

  const methods = { pix: false, pixOnline: false, cash: false, card: false };
  for (const row of data || []) {
    const method = paymentMethodFromSupabase(row);
    methods[method.type] = method.active;
    if (method.type === "pix") methods.pixOnline = method.onlineEnabled;
  }
  return methods;
}

export async function updatePaymentMethods(storeId, methods = {}) {
  if (supabase) {
    const rows = [
      { type: "pix", active: Boolean(methods.pix), onlineEnabled: Boolean(methods.pixOnline) },
      { type: "cash", active: Boolean(methods.cash) },
      { type: "card", active: Boolean(methods.card) },
    ].map((method) => paymentMethodToSupabase(method, storeId));

    const { error } = await supabase
      .from("payment_methods")
      .upsert(rows, { onConflict: "store_id,type" });

    if (!error) return getPaymentMethodsByStore(storeId);
    warnAndUseLocal("updatePaymentMethods", error);
  }

  updateStorageStore(storeId, { paymentMethods: methods });
  return getLocalStoreById(storeId)?.paymentMethods || methods;
}

export function deleteStore(id) {
  return deactivateStore(id);
}

export async function getProductsByStore(storeId) {
  if (!supabase) return getLocalStoreById(storeId)?.products || [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("store_id", storeId)
    .order("sort_order", { ascending: true });

  if (error) {
    warnAndUseLocal("getProductsByStore", error);
    return getLocalStoreById(storeId)?.products || [];
  }

  return (data || []).map(productFromSupabase);
}

export async function createProduct(storeId, data = {}) {
  const products = await getProductsByStore(storeId);
  const product = {
    id: data.id || makeId("prod"),
    name: data.name || "",
    description: data.description || "",
    price: Number(data.price) || 0,
    categoryId: data.categoryId || "",
    image: data.image || getLocalStoreById(storeId)?.banner || "",
    active: data.active !== false,
    order: Number(data.order) || products.length + 1,
    ...data,
  };

  if (supabase) {
    const { data: created, error } = await supabase
      .from("products")
      .insert(productToSupabase(product, storeId))
      .select(PRODUCT_COLUMNS)
      .single();

    if (!error) return productFromSupabase(created);
    warnAndUseLocal("createProduct", error);
  }

  updateStorageStore(storeId, (store) => ({
    ...store,
    products: [product, ...(store.products || [])],
  }));

  return product;
}

export async function updateProduct(productId, data) {
  if (supabase) {
    const { data: updated, error } = await supabase
      .from("products")
      .update(productToSupabase(data))
      .eq("id", productId)
      .select(PRODUCT_COLUMNS)
      .maybeSingle();

    if (!error) return productFromSupabase(updated);
    warnAndUseLocal("updateProduct", error);
  }

  const store = getStoreContaining("products", productId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    products: (draft.products || []).map((product) =>
      product.id === productId ? { ...product, ...data } : product
    ),
  }));

  return getLocalStoreById(store.id)?.products.find((product) => product.id === productId) || null;
}

export async function deleteProduct(productId) {
  if (supabase) {
    const { data: deleted, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select("id")
      .maybeSingle();

    if (!error) return deleted?.id || null;
    warnAndUseLocal("deleteProduct", error);
  }

  const store = getStoreContaining("products", productId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    products: (draft.products || []).filter((product) => product.id !== productId),
    additionalGroups: (draft.additionalGroups || []).map((group) => ({
      ...group,
      productIds: (group.productIds || []).filter((id) => id !== productId),
    })),
  }));

  return productId;
}

export async function getCategoriesByStore(storeId) {
  if (!supabase) return getLocalStoreById(storeId)?.categories || [];

  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .eq("store_id", storeId)
    .order("sort_order", { ascending: true });

  if (error) {
    warnAndUseLocal("getCategoriesByStore", error);
    return getLocalStoreById(storeId)?.categories || [];
  }

  return (data || []).map(categoryFromSupabase);
}

export async function createCategory(storeId, data = {}) {
  const categories = await getCategoriesByStore(storeId);
  const category = {
    id: data.id || makeId("cat"),
    name: data.name || "",
    active: data.active !== false,
    order: Number(data.order) || categories.length + 1,
    ...data,
  };

  if (supabase) {
    const { data: created, error } = await supabase
      .from("categories")
      .insert(categoryToSupabase(category, storeId))
      .select(CATEGORY_COLUMNS)
      .single();

    if (!error) return categoryFromSupabase(created);
    warnAndUseLocal("createCategory", error);
  }

  updateStorageStore(storeId, (store) => ({
    ...store,
    categories: [...(store.categories || []), category],
  }));

  return category;
}

export async function updateCategory(categoryId, data) {
  if (supabase) {
    const { data: updated, error } = await supabase
      .from("categories")
      .update(categoryToSupabase(data))
      .eq("id", categoryId)
      .select(CATEGORY_COLUMNS)
      .maybeSingle();

    if (!error) return categoryFromSupabase(updated);
    warnAndUseLocal("updateCategory", error);
  }

  const store = getStoreContaining("categories", categoryId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    categories: (draft.categories || []).map((category) =>
      category.id === categoryId ? { ...category, ...data } : category
    ),
  }));

  return getLocalStoreById(store.id)?.categories.find((category) => category.id === categoryId) || null;
}

export async function deleteCategory(categoryId) {
  if (supabase) {
    const { data: deleted, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .select("id")
      .maybeSingle();

    if (!error) return deleted?.id || null;
    warnAndUseLocal("deleteCategory", error);
  }

  const store = getStoreContaining("categories", categoryId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    categories: (draft.categories || []).filter((category) => category.id !== categoryId),
    products: (draft.products || []).map((product) =>
      product.categoryId === categoryId ? { ...product, categoryId: "" } : product
    ),
  }));

  return categoryId;
}

export async function getAdditionalGroupsByStore(storeId) {
  if (!supabase) return getLocalStoreById(storeId)?.additionalGroups || [];

  const [groupsResult, optionsResult, linksResult] = await Promise.all([
    supabase.from("additional_groups").select(ADDITIONAL_GROUP_COLUMNS).eq("store_id", storeId).order("sort_order"),
    supabase.from("additional_options").select(ADDITIONAL_OPTION_COLUMNS).eq("store_id", storeId).order("sort_order"),
    supabase.from("additional_group_products").select("additional_group_id, product_id").eq("store_id", storeId),
  ]);

  const error = groupsResult.error || optionsResult.error || linksResult.error;
  if (error) {
    warnAndUseLocal("getAdditionalGroupsByStore", error);
    return getLocalStoreById(storeId)?.additionalGroups || [];
  }

  const optionsByGroup = new Map();
  for (const row of optionsResult.data || []) {
    const options = optionsByGroup.get(row.additional_group_id) || [];
    options.push(additionalOptionFromSupabase(row));
    optionsByGroup.set(row.additional_group_id, options);
  }

  const productsByGroup = new Map();
  for (const row of linksResult.data || []) {
    const productIds = productsByGroup.get(row.additional_group_id) || [];
    productIds.push(row.product_id);
    productsByGroup.set(row.additional_group_id, productIds);
  }

  return (groupsResult.data || []).map((row) =>
    additionalGroupFromSupabase(
      row,
      optionsByGroup.get(row.id) || [],
      productsByGroup.get(row.id) || []
    )
  );
}

async function saveAdditionalGroupToSupabase(storeId, groupId, group) {
  const payload = additionalGroupToSupabase(group, storeId);
  const productIds = Array.from(new Set(Array.isArray(group.productIds) ? group.productIds : []));
  const options = (Array.isArray(group.options) ? group.options : []).map((option, index) => ({
    name: option.name || "",
    price: Number(option.price) || 0,
    active: option.active !== false,
    order: index + 1,
  }));

  const { data, error } = await supabase.rpc("save_additional_group", {
    p_group_id: groupId || null,
    p_store_id: storeId,
    p_name: payload.name,
    p_description: payload.description,
    p_required: payload.required,
    p_min_choices: payload.min_choices,
    p_max_choices: payload.max_choices,
    p_selection_type: payload.selection_type,
    p_active: payload.active,
    p_sort_order: payload.sort_order,
    p_options: options,
    p_product_ids: productIds,
  });

  if (error) throw error;
  const groups = await getAdditionalGroupsByStore(storeId);
  return groups.find((item) => item.id === data) || null;
}

export async function createAdditionalGroup(storeId, data = {}) {
  const groups = await getAdditionalGroupsByStore(storeId);
  const group = {
    id: data.id || makeId("group"),
    storeId,
    name: data.name || "",
    description: data.description || "",
    required: Boolean(data.required),
    min: Number(data.min) || 0,
    max: Number(data.max) || 0,
    selectionType: data.selectionType === "single" ? "single" : "multiple",
    productIds: Array.isArray(data.productIds) ? data.productIds : [],
    active: data.active !== false,
    options: Array.isArray(data.options) ? data.options : [],
    order: Number(data.order) || groups.length + 1,
    ...data,
  };

  if (supabase) {
    try {
      return await saveAdditionalGroupToSupabase(storeId, null, group);
    } catch (error) {
      warnAndUseLocal("createAdditionalGroup", error);
    }
  }

  updateStorageStore(storeId, (store) => ({
    ...store,
    additionalGroups: [group, ...(store.additionalGroups || [])],
  }));

  return group;
}

export async function updateAdditionalGroup(groupId, data) {
  if (supabase) {
    const { data: groupRow, error: lookupError } = await supabase
      .from("additional_groups")
      .select("store_id")
      .eq("id", groupId)
      .maybeSingle();

    if (!lookupError && !groupRow) return null;
    if (lookupError) {
      warnAndUseLocal("updateAdditionalGroup lookup", lookupError);
    } else {
      const currentGroups = await getAdditionalGroupsByStore(groupRow.store_id);
      const current = currentGroups.find((group) => group.id === groupId);
      if (!current) return null;

      try {
        return await saveAdditionalGroupToSupabase(current.storeId, groupId, { ...current, ...data });
      } catch (error) {
        warnAndUseLocal("updateAdditionalGroup", error);
      }
    }
  }

  const store = getAdditionalGroupStore(groupId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    additionalGroups: (draft.additionalGroups || []).map((group) =>
      group.id === groupId ? { ...group, ...data } : group
    ),
  }));

  return getLocalStoreById(store.id)?.additionalGroups.find((group) => group.id === groupId) || null;
}

export async function deleteAdditionalGroup(groupId) {
  if (supabase) {
    const { data: deleted, error } = await supabase
      .from("additional_groups")
      .delete()
      .eq("id", groupId)
      .select("id")
      .maybeSingle();

    if (!error) return deleted?.id || null;
    warnAndUseLocal("deleteAdditionalGroup", error);
  }

  const store = getAdditionalGroupStore(groupId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    additionalGroups: (draft.additionalGroups || []).filter((group) => group.id !== groupId),
  }));

  return groupId;
}

export async function getOrdersByStore(storeId) {
  if (!supabase) return getStorageDatabase().orders.filter((order) => order.storeId === storeId);

  const { data: orderRows, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (ordersError) {
    useLocalForConnectionFailure("getOrdersByStore", ordersError);
    return getStorageDatabase().orders.filter((order) => order.storeId === storeId);
  }
  if (!orderRows?.length) return [];

  const orderIds = orderRows.map((order) => order.id);
  const customerIds = [...new Set(orderRows.map((order) => order.customer_id).filter(Boolean))];
  const [customersResult, itemsResult, storeResult] = await Promise.all([
    customerIds.length
      ? supabase.from("customers").select("id, name, phone, email").in("id", customerIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("order_items").select("*").eq("store_id", storeId).in("order_id", orderIds),
    supabase.from("stores").select("slug, name").eq("id", storeId).maybeSingle(),
  ]);

  const relatedError = customersResult.error || itemsResult.error || storeResult.error;
  if (relatedError) {
    useLocalForConnectionFailure("carregar os detalhes dos pedidos", relatedError);
    return getStorageDatabase().orders.filter((order) => order.storeId === storeId);
  }

  const itemRows = itemsResult.data || [];
  const itemIds = itemRows.map((item) => item.id);
  const additionalsResult = itemIds.length
    ? await supabase
      .from("order_item_additionals")
      .select("*")
      .eq("store_id", storeId)
      .in("order_item_id", itemIds)
    : { data: [], error: null };

  if (additionalsResult.error) {
    useLocalForConnectionFailure("carregar os adicionais dos pedidos", additionalsResult.error);
    return getStorageDatabase().orders.filter((order) => order.storeId === storeId);
  }

  const customersById = new Map((customersResult.data || []).map((customer) => [customer.id, customer]));
  const additionalsByItem = new Map();
  for (const additional of additionalsResult.data || []) {
    const current = additionalsByItem.get(additional.order_item_id) || [];
    current.push(additional);
    additionalsByItem.set(additional.order_item_id, current);
  }
  const itemsByOrder = new Map();
  for (const item of itemRows) {
    const current = itemsByOrder.get(item.order_id) || [];
    current.push({ ...item, order_item_additionals: additionalsByItem.get(item.id) || [] });
    itemsByOrder.set(item.order_id, current);
  }

  return orderRows.map((order) => orderFromSupabase({
    ...order,
    customers: customersById.get(order.customer_id),
    stores: storeResult.data,
    order_items: itemsByOrder.get(order.id) || [],
  }));
}

export async function getOrderById(orderId, storeSlug = "") {
  if (supabase && storeSlug) {
    const { data, error } = await supabase.rpc("get_public_order", {
      p_token: orderId,
      p_store_slug: storeSlug,
    });
    if (!error) return orderFromSupabase(data);
    useLocalForConnectionFailure("buscar o pedido público", error);
  } else if (supabase) {
    const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!error) {
      if (!data) return null;
      const orders = await getOrdersByStore(data.store_id);
      return orders.find((order) => order.id === orderId) || null;
    }
    useLocalForConnectionFailure("buscar o pedido", error);
  }

  return getStorageDatabase().orders.find((order) =>
    (order.id === orderId || order.publicToken === orderId) && (!storeSlug || order.storeSlug === storeSlug)
  ) || null;
}

export async function createOrder(storeId, data = {}) {
  if (supabase) {
    const payload = orderToSupabase(data);
    const { data: created, error } = await supabase.rpc("create_public_order", {
      p_store_id: storeId,
      p_customer: payload.customer,
      p_fulfillment: payload.fulfillment,
      p_address: payload.address,
      p_notes: payload.notes,
      p_payment_method: payload.paymentMethod,
      p_items: payload.items,
    });

    if (!error) {
      return {
        ...data,
        id: created.id,
        publicToken: created.publicToken,
        number: created.number,
        storeId,
      };
    }
    if (import.meta.env.DEV) {
      console.error("[PediCampos] create_public_order falhou.", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        request: {
          storeId,
          fulfillment: payload.fulfillment,
          paymentMethod: payload.paymentMethod,
          items: payload.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            optionIds: item.selectedAdditionals.map((additional) => additional.optionId),
          })),
        },
      });
    }
    useLocalForConnectionFailure("criar o pedido", error);
  }

  const store = getLocalStoreById(storeId);
  const order = {
    ...data,
    storeId,
    storeSlug: data.storeSlug || store?.slug || "",
    storeName: data.storeName || store?.name || "",
  };

  createStorageOrder(order);
  return order;
}

export async function updateOrder(orderId, data) {
  if (supabase) {
    const mapped = {
      order_status: data.orderStatus,
      payment_status: data.paymentStatus,
      notes: data.notes,
    };
    const payload = Object.fromEntries(Object.entries(mapped).filter(([, value]) => value !== undefined));
    const { data: updated, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId)
      .select("*")
      .maybeSingle();

    if (!error) return orderFromSupabase(updated);
    useLocalForConnectionFailure("atualizar o pedido", error);
  }

  updateStorageOrder(orderId, data);
  return getStorageDatabase().orders.find((order) => order.id === orderId) || null;
}

export async function updateOrderStatus(orderId, status) {
  return updateOrder(orderId, {
    orderStatus: status,
    updatedAt: new Date().toISOString(),
  });
}

export function getPlatformSettings() {
  return getStorageDatabase().platform;
}

export function updatePlatformSettings(data) {
  updateStoragePlatform(data);
  return getPlatformSettings();
}

export function getPlans() {
  return getPlatformSettings().plans || {};
}

export function updatePlan(planId, data) {
  updateStoragePlatform((platform) => ({
    ...platform,
    plans: {
      ...platform.plans,
      [planId]: {
        ...(platform.plans?.[planId] || {}),
        ...data,
      },
    },
  }));

  return getPlans()[planId] || null;
}
