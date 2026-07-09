import { createEmptyStore } from "../data/mockStores.js";
import { uniqueSlug } from "../utils/slug.js";
import {
  createOrder as createStorageOrder,
  getDatabase as getStorageDatabase,
  mutateDatabase,
  updateOrder as updateStorageOrder,
  updatePlatform as updateStoragePlatform,
  updateStore as updateStorageStore,
} from "./storage.js";

// Temporary data facade. Supabase integration should replace the internals here,
// keeping the public functions stable for pages and hooks.

function makeId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
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

export function getStores() {
  return getStorageDatabase().stores;
}

export function getStoreBySlug(slug) {
  return getStores().find((store) => store.slug === slug) || null;
}

export function getStoreById(id) {
  return getStores().find((store) => store.id === id) || null;
}

export function createStore(data = {}) {
  const stores = getStores();
  const slug = uniqueSlug(data.slug || data.name || "nova-loja", stores);
  const store = createEmptyStore({
    ...data,
    slug,
    categories: data.categories || [],
    products: data.products || [],
    additionalGroups: data.additionalGroups || [],
  });

  mutateDatabase((database) => {
    database.stores = [store, ...database.stores];
    return database;
  });

  return store;
}

export function updateStore(id, data) {
  updateStorageStore(id, data);
  return getStoreById(id);
}

export function deactivateStore(id) {
  return updateStore(id, { active: false });
}

export function deleteStore(id) {
  return deactivateStore(id);
}

export function getProductsByStore(storeId) {
  return getStoreById(storeId)?.products || [];
}

export function createProduct(storeId, data = {}) {
  const product = {
    id: data.id || makeId("prod"),
    name: data.name || "",
    description: data.description || "",
    price: Number(data.price) || 0,
    categoryId: data.categoryId || "",
    image: data.image || getStoreById(storeId)?.banner || "",
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

export function getCategoriesByStore(storeId) {
  return getStoreById(storeId)?.categories || [];
}

export function createCategory(storeId, data = {}) {
  const categories = getCategoriesByStore(storeId);
  const category = {
    id: data.id || makeId("cat"),
    name: data.name || "",
    active: data.active !== false,
    order: Number(data.order) || categories.length + 1,
    ...data,
  };

  updateStorageStore(storeId, (store) => ({
    ...store,
    categories: [...(store.categories || []), category],
  }));

  return category;
}

export function updateCategory(categoryId, data) {
  const store = getStoreContaining("categories", categoryId);
  if (!store) return null;

  updateStorageStore(store.id, (draft) => ({
    ...draft,
    categories: (draft.categories || []).map((category) =>
      category.id === categoryId ? { ...category, ...data } : category
    ),
  }));

  return getCategoriesByStore(store.id).find((category) => category.id === categoryId) || null;
}

export function deleteCategory(categoryId) {
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
  return getStoreById(storeId)?.additionalGroups || [];
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
  const store = getStoreById(storeId);
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

