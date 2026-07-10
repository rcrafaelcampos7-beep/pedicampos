import { initialStores } from "../data/mockStores.js";
import { initialOrders } from "../data/mockOrders.js";
import { PAYMENT_STATUS } from "../utils/orderStatus.js";
import { DEFAULT_FEATURES_BY_PLAN, normalizePlan } from "../utils/plans.js";

const STORAGE_KEY = "pedicampos.database.v1";
const UPDATE_EVENT = "pedicampos:data-updated";

export const defaultPlatformSettings = {
  name: "PediCampos",
  logo: "PC",
  whatsapp: "5522999990000",
  email: "contato@pedicampos.com.br",
  instagram: "@pedicampos",
  primaryColor: "#16a34a",
  secondaryColor: "#111827",
  slogan: "Seu delivery próprio em um link.",
  subtitle: "Cardápio digital, pedidos online, Pix e WhatsApp automático para negócios locais.",
  heroTitle: "Seu delivery próprio em um link.",
  heroSubtitle:
    "Crie um cardápio digital profissional, receba pedidos online, aceite Pix e mantenha seus clientes atualizados pelo WhatsApp.",
  heroPrimaryButton: "Ver loja exemplo",
  heroSecondaryButton: "Quero para minha loja",
  about: "Delivery próprio, cardápio digital e pedidos online para negócios locais.",
  howItWorksTitle: "Do link da loja ao pedido acompanhado em tempo real.",
  howItWorksText:
    "O sistema já nasce multi-lojas: cada operação tem seus produtos, cores, adicionais, pedidos, configurações e link público.",
  implementationPrice: 599.99,
  footerText: "Cardápio digital, delivery próprio e pedidos online para negócios locais.",
  sections: {
    featureStrip: true,
    howItWorks: true,
    features: true,
    demo: true,
    plans: true,
    faq: true,
  },
  featureHighlights: [
    "Cardápio digital",
    "Pedido online",
    "Pix integrado",
    "WhatsApp automático",
    "Painel administrativo",
  ],
  features: [
    "Cardápio digital personalizado",
    "Produtos com fotos e descrições",
    "Categorias e adicionais",
    "Carrinho de compras",
    "Pedido feito dentro do site",
    "Pagamento via Pix",
    "Painel administrativo",
    "Controle de pedidos",
    "Status do pedido",
    "Atualizações pelo WhatsApp",
    "Relatórios simples",
    "Loja com logo e cores próprias",
  ],
  howItWorksSteps: [
    "Criamos o link da sua loja",
    "Cadastramos seus produtos e categorias",
    "Seu cliente faz o pedido pelo site",
    "O pagamento pode ser feito via Pix",
    "A loja acompanha tudo pelo painel",
    "O cliente recebe atualizações pelo WhatsApp",
  ],
  faq: [
    { question: "Preciso ter site?", answer: "Não. A PediCampos cria um link próprio para sua loja." },
    { question: "Funciona no celular?", answer: "Sim. A experiência é pensada primeiro para celular." },
    { question: "Posso alterar produtos?", answer: "Sim. O painel da loja permite editar produtos, preços e categorias." },
    { question: "O pedido chega onde?", answer: "Depende do plano: via WhatsApp no Start e pelo painel nos planos Pro e Premium." },
    { question: "Tem Pix?", answer: "Sim. O cliente vê Pix como forma de pagamento, e os planos Pro e Premium liberam pagamento online no checkout." },
  ],
  plans: {
    start: {
      name: "Start",
      price: 99.99,
      priceLabel: "R$ 99,99/mês",
      description: "Plano básico para cardápio digital e pedidos via WhatsApp.",
      features: ["Loja pública", "Produtos e categorias", "Link personalizado", "Pedido via WhatsApp", "Logo e cores"],
      active: true,
      highlighted: false,
      badge: "",
      comparisonText: "",
    },
    pro: {
      name: "Pro",
      price: 179.99,
      priceLabel: "R$ 179,99/mês",
      description: "Pedidos no site, painel de pedidos, status, adicionais e pagamento online no checkout.",
      features: [
        "Tudo do Start",
        "Pedido salvo no painel",
        "Status dos pedidos",
        "Adicionais configuráveis",
        "Pix automático",
        "Cartão automático",
        "Relatórios simples",
      ],
      active: true,
      highlighted: false,
      badge: "",
      comparisonText: "",
    },
    premium: {
      name: "Premium",
      price: 199.99,
      priceLabel: "R$ 199,99/mês",
      description: "Plano completo com pagamento automático, WhatsApp automático e automações.",
      features: ["Tudo do Pro", "WhatsApp automático", "Mensagens por status", "Cupons", "Automações"],
      active: true,
      highlighted: true,
      badge: "Melhor escolha",
      comparisonText: "Por apenas R$ 20,00 a mais que o Pro",
    },
  },
  featuresByPlan: DEFAULT_FEATURES_BY_PLAN,
};

const initialPlatform = defaultPlatformSettings;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeAdditionalGroups(store) {
  if (Array.isArray(store.additionalGroups)) {
    return store.additionalGroups.map((group) => ({
      id: group.id || `group-${crypto.randomUUID()}`,
      storeId: group.storeId || store.id,
      name: group.name || "Grupo de adicionais",
      description: group.description || "",
      required: Boolean(group.required),
      min: Number(group.min) || 0,
      max: Number(group.max) || 0,
      selectionType: group.selectionType === "single" ? "single" : "multiple",
      productIds: Array.isArray(group.productIds) ? group.productIds : [],
      active: group.active !== false,
      options: Array.isArray(group.options)
        ? group.options.map((option) => ({
            id: option.id || `option-${crypto.randomUUID()}`,
            name: option.name || "Opção",
            price: Number(option.price) || 0,
            active: option.active !== false,
          }))
        : [],
    }));
  }

  const addons = Array.isArray(store.addons) ? store.addons : [];
  const products = Array.isArray(store.products) ? store.products : [];
  const groupsByKey = new Map();

  products.forEach((product) => {
    const addonIds = Array.isArray(product.addonIds) ? product.addonIds : [];
    if (!addonIds.length) return;
    const key = addonIds.slice().sort().join("|");
    const options = addons
      .filter((addon) => addonIds.includes(addon.id))
      .map((addon) => ({
        id: `option-${addon.id}`,
        name: addon.name,
        price: Number(addon.price) || 0,
        active: addon.active !== false,
      }));

    if (!groupsByKey.has(key)) {
      groupsByKey.set(key, {
        id: `group-${store.id}-${groupsByKey.size + 1}`,
        storeId: store.id,
        name: "Adicionais",
        description: "Grupo migrado dos dados antigos.",
        required: false,
        min: 0,
        max: 0,
        selectionType: "multiple",
        productIds: [],
        active: true,
        options,
      });
    }

    groupsByKey.get(key).productIds.push(product.id);
  });

  return Array.from(groupsByKey.values());
}

function normalizePaymentMethods(paymentMethods = {}) {
  const methods = paymentMethods || {};
  const {
    pixDelivery,
    pix_delivery,
    pix_on_delivery,
    cardDelivery,
    card_delivery,
    ...rest
  } = methods;
  const pixOnline = Boolean(
    methods.pixOnline ?? methods.pixAutomatic ?? methods.pixQrCode
  );
  const pix = Boolean(methods.pix ?? pixDelivery ?? pix_delivery ?? pix_on_delivery ?? pixOnline);
  const card = Boolean(methods.card ?? cardDelivery ?? card_delivery);

  return {
    ...rest,
    pix,
    pixOnline,
    cash: Boolean(methods.cash),
    card,
  };
}

function normalizeStore(store) {
  const { addons, ...storeData } = store;
  const products = Array.isArray(store.products)
    ? store.products.map(({ addonIds, ...product }) => product)
    : [];

  return {
    ...storeData,
    plan: normalizePlan(store.plan),
    categories: Array.isArray(store.categories) ? store.categories : [],
    products,
    additionalGroups: normalizeAdditionalGroups(store),
    paymentMethods: normalizePaymentMethods(store.paymentMethods),
  };
}

function normalizePlanConfig(key, plan = {}) {
  const fallback = defaultPlatformSettings.plans[key];
  const legacyPrices = { start: [79], pro: [147, 179], premium: [247, 199] };
  const legacyLabels = {
    start: ["R$ 79/mês"],
    pro: ["R$ 147/mês", "R$ 179,00/mês"],
    premium: ["R$ 247/mês", "R$ 199,00/mês"],
  };
  const rawPrice = Number(plan.price ?? fallback.price) || fallback.price;
  const shouldUseFallbackPrice = legacyPrices[key].includes(rawPrice);
  const features = Array.isArray(plan.features) ? plan.features : fallback.features;
  return {
    ...fallback,
    ...plan,
    price: shouldUseFallbackPrice ? fallback.price : rawPrice,
    priceLabel:
      shouldUseFallbackPrice || !plan.priceLabel || legacyLabels[key].includes(plan.priceLabel)
        ? fallback.priceLabel
        : plan.priceLabel,
    description: normalizePublicCopy(plan.description || fallback.description),
    active: plan.active !== false,
    highlighted: Boolean(plan.highlighted ?? fallback.highlighted),
    features: features.map(normalizePublicCopy),
  };
}

function normalizePublicCopy(value) {
  if (typeof value !== "string") return value;

  return value
    .replace(/ver loja demo/gi, "Ver loja exemplo")
    .replace(/loja demo/gi, "Loja exemplo")
    .replace(/pagamento automático simulado/gi, "pagamento online no checkout")
    .replace(/pagamento automatico simulado/gi, "pagamento online no checkout")
    .replace(/pix automático simulado/gi, "Pix automático")
    .replace(/pix automatico simulado/gi, "Pix automático")
    .replace(/cartão automático simulado/gi, "Cartão automático")
    .replace(/cartao automatico simulado/gi, "Cartão automático")
    .replace(/whatsapp automático simulado/gi, "WhatsApp automático")
    .replace(/whatsapp automatico simulado/gi, "WhatsApp automático");
}

function normalizeFeaturesByPlan(featuresByPlan = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_FEATURES_BY_PLAN).map(([plan, defaultFeatures]) => {
      const savedFeatures = Array.isArray(featuresByPlan[plan]) ? featuresByPlan[plan] : [];
      return [plan, Array.from(new Set([...defaultFeatures, ...savedFeatures]))];
    })
  );
}

function normalizePlatform(platform = {}) {
  const merged = {
    ...defaultPlatformSettings,
    ...platform,
    sections: {
      ...defaultPlatformSettings.sections,
      ...(platform.sections || {}),
    },
    plans: {
      start: normalizePlanConfig("start", platform.plans?.start),
      pro: normalizePlanConfig("pro", platform.plans?.pro),
      premium: normalizePlanConfig("premium", platform.plans?.premium),
    },
    featuresByPlan: normalizeFeaturesByPlan(platform.featuresByPlan || {}),
  };

  merged.logo = merged.logo || merged.name?.slice(0, 2).toUpperCase() || "PC";
  merged.heroPrimaryButton = normalizePublicCopy(merged.heroPrimaryButton);
  merged.featureHighlights = Array.isArray(merged.featureHighlights)
    ? merged.featureHighlights.map(normalizePublicCopy)
    : defaultPlatformSettings.featureHighlights;
  merged.features = Array.isArray(merged.features) ? merged.features.map(normalizePublicCopy) : defaultPlatformSettings.features;
  merged.howItWorksSteps = Array.isArray(merged.howItWorksSteps)
    ? merged.howItWorksSteps.map(normalizePublicCopy)
    : defaultPlatformSettings.howItWorksSteps;
  merged.faq = Array.isArray(merged.faq)
    ? merged.faq.map((item) => ({
        ...item,
        question: normalizePublicCopy(item.question),
        answer: normalizePublicCopy(item.answer),
      }))
    : defaultPlatformSettings.faq;
  return merged;
}

function normalizeOrderItem(item) {
  const selectedAdditionals = Array.isArray(item.selectedAdditionals)
    ? item.selectedAdditionals
    : (item.addons || []).map((addon) => ({
        groupId: addon.groupId || "legacy-addons",
        groupName: addon.groupName || "Adicionais",
        optionId: addon.id || addon.optionId,
        optionName: addon.name || addon.optionName,
        price: Number(addon.price) || 0,
      }));

  return {
    ...item,
    selectedAdditionals,
  };
}

function normalizePaymentMethodLabel(value) {
  const text = String(value || "");
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("pix")) return "Pix";
  if (normalized.includes("dinheiro")) return "Dinheiro";
  if (normalized.includes("cart")) return "Cartão";
  return text;
}

function normalizePaymentStatusLabel(value) {
  const text = String(value || "");
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (!text || normalized.includes("pagamento na entrega") || normalized.includes("pending_delivery")) {
    return PAYMENT_STATUS.PENDING;
  }
  if (normalized.includes("aprovado") || normalized.includes("pago") || normalized.includes("confirmado")) {
    return PAYMENT_STATUS.APPROVED;
  }
  if (normalized.includes("aguardando") || normalized === "waiting") {
    return PAYMENT_STATUS.WAITING;
  }
  return text;
}

function normalizeDatabase(database) {
  const platform = normalizePlatform(database.platform || database.platformSettings || initialPlatform);
  return {
    stores: (database.stores || []).map(normalizeStore),
    orders: (database.orders || []).map((order) => ({
      ...order,
      paymentMethod: normalizePaymentMethodLabel(order.paymentMethod),
      paymentStatus: normalizePaymentStatusLabel(order.paymentStatus),
      items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
    })),
    platform,
    platformSettings: platform,
  };
}

export function createInitialDatabase() {
  return normalizeDatabase({
    stores: clone(initialStores),
    orders: clone(initialOrders),
    platform: clone(initialPlatform),
  });
}

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function getDatabase() {
  if (!canUseStorage()) return createInitialDatabase();

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const fresh = createInitialDatabase();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  try {
    const parsed = JSON.parse(saved);
    const normalized = normalizeDatabase(parsed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const fresh = createInitialDatabase();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

export function saveDatabase(nextDatabase) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDatabase));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: nextDatabase }));
}

export function mutateDatabase(mutator) {
  const current = getDatabase();
  const next = mutator(clone(current)) || current;
  saveDatabase(next);
  return next;
}

export function subscribeDatabase(callback) {
  const handleUpdate = () => callback(getDatabase());
  window.addEventListener(UPDATE_EVENT, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(UPDATE_EVENT, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}

export function resetDatabase() {
  const fresh = createInitialDatabase();
  saveDatabase(fresh);
  return fresh;
}

export function updateStore(storeId, updater) {
  return mutateDatabase((database) => {
    database.stores = database.stores.map((store) => {
      if (store.id !== storeId) return store;
      return typeof updater === "function" ? updater(store) : { ...store, ...updater };
    });
    return database;
  });
}

export function createOrder(order) {
  return mutateDatabase((database) => {
    database.orders = [order, ...database.orders];
    return database;
  });
}

export function updateOrder(orderId, updater) {
  return mutateDatabase((database) => {
    database.orders = database.orders.map((order) => {
      if (order.id !== orderId) return order;
      return typeof updater === "function" ? updater(order) : { ...order, ...updater };
    });
    return database;
  });
}

export function updatePlatform(updater) {
  return mutateDatabase((database) => {
    const platform =
      typeof updater === "function" ? updater(database.platform) : { ...database.platform, ...updater };
    database.platform = normalizePlatform(platform);
    database.platformSettings = database.platform;
    return database;
  });
}
