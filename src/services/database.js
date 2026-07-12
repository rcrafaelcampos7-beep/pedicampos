import { createEmptyStore } from "../data/mockStores.js";
import { uniqueSlug } from "../utils/slug.js";
import { supabase } from "./supabaseClient.js";
import {
  createOrder as createStorageOrder,
  getDatabase as getStorageDatabase,
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

function warnAndUseLocal(operation, error) {
  console.warn(`[PediCampos] Supabase falhou em ${operation}; usando fallback local.`, error);
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
  return getStorageDatabase();
}

export function subscribeDatabase(callback) {
  return subscribeStorageDatabase(callback);
}

export async function getStores() {
  if (!supabase) return getLocalStores();

  const { data, error } = await supabase.from("stores").select(STORE_COLUMNS).order("created_at", { ascending: false });
  if (error) {
    warnAndUseLocal("getStores", error);
    return getLocalStores();
  }

  return (data || []).map(storeFromSupabase);
}

export async function getStoreBySlug(slug) {
  if (!supabase) return getLocalStores().find((store) => store.slug === slug) || null;

  const { data, error } = await supabase.from("stores").select(STORE_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) {
    warnAndUseLocal("getStoreBySlug", error);
    return getLocalStores().find((store) => store.slug === slug) || null;
  }

  return storeFromSupabase(data);
}

export async function getStoreById(id) {
  if (!supabase) return getLocalStoreById(id);

  const { data, error } = await supabase.from("stores").select(STORE_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    warnAndUseLocal("getStoreById", error);
    return getLocalStoreById(id);
  }

  return storeFromSupabase(data);
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

export function deleteStore(id) {
  return deactivateStore(id);
}

export function getProductsByStore(storeId) {
  return getLocalStoreById(storeId)?.products || [];
}

export function createProduct(storeId, data = {}) {
  const product = {
    id: data.id || makeId("prod"),
    name: data.name || "",
    description: data.description || "",
    price: Number(data.price) || 0,
    categoryId: data.categoryId || "",
    image: data.image || getLocalStoreById(storeId)?.banner || "",
    active: data.active !== false,
    ...data,
  };

  updateStorageStore(storeId, (store) => ({
    ...store,
    products: [product, ...(store.products || [])],
  }));

  return product;
}

export function updateProduct(productId, data) {
  const store = getStoreContaining("products", productId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    products: (draft.products || []).map((product) =>
      product.id === productId ? { ...product, ...data } : product
    ),
  }));

  return getProductsByStore(store.id).find((product) => product.id === productId) || null;
}

export function deleteProduct(productId) {
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

export function getAdditionalGroupsByStore(storeId) {
  return getLocalStoreById(storeId)?.additionalGroups || [];
}

export function createAdditionalGroup(storeId, data = {}) {
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
    ...data,
  };

  updateStorageStore(storeId, (store) => ({
    ...store,
    additionalGroups: [group, ...(store.additionalGroups || [])],
  }));

  return group;
}

export function updateAdditionalGroup(groupId, data) {
  const store = getAdditionalGroupStore(groupId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    additionalGroups: (draft.additionalGroups || []).map((group) =>
      group.id === groupId ? { ...group, ...data } : group
    ),
  }));

  return getAdditionalGroupsByStore(store.id).find((group) => group.id === groupId) || null;
}

export function deleteAdditionalGroup(groupId) {
  const store = getAdditionalGroupStore(groupId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    additionalGroups: (draft.additionalGroups || []).filter((group) => group.id !== groupId),
  }));

  return groupId;
}

export function getOrdersByStore(storeId) {
  return getStorageDatabase().orders.filter((order) => order.storeId === storeId);
}

export function getOrderById(orderId) {
  return getStorageDatabase().orders.find((order) => order.id === orderId) || null;
}

export function createOrder(storeId, data = {}) {
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

export function updateOrder(orderId, data) {
  updateStorageOrder(orderId, data);
  return getOrderById(orderId);
}

export function updateOrderStatus(orderId, status) {
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
