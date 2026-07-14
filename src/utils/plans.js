export const PLAN_KEYS = ["start", "pro", "premium"];

export const ENTITLEMENT_FEATURES = Object.freeze({
  WHATSAPP_ORDERS: "whatsapp_orders",
  SAVED_ORDERS: "saved_orders",
  ORDER_TRACKING: "order_tracking",
  ONLINE_PAYMENT: "online_payment",
  AUTOMATIC_PAYMENT_CONFIRMATION: "automatic_payment_confirmation",
  WHATSAPP_AUTOMATION: "whatsapp_automation",
  AUTOMATIC_STATUS_MESSAGES: "automatic_status_messages",
  SIMPLE_REPORTS: "simple_reports",
  ADVANCED_REPORTS: "advanced_reports",
  COUPONS: "coupons",
  LOYALTY: "loyalty",
  AI_TOOLS: "ai_tools",
  CUSTOM_DOMAIN: "custom_domain",
  API_ACCESS: "api_access",
});

export const DEFAULT_ENTITLEMENTS_BY_PLAN = Object.freeze({
  start: [ENTITLEMENT_FEATURES.WHATSAPP_ORDERS],
  pro: [
    ENTITLEMENT_FEATURES.WHATSAPP_ORDERS,
    ENTITLEMENT_FEATURES.SAVED_ORDERS,
    ENTITLEMENT_FEATURES.ORDER_TRACKING,
    ENTITLEMENT_FEATURES.ONLINE_PAYMENT,
    ENTITLEMENT_FEATURES.AUTOMATIC_PAYMENT_CONFIRMATION,
    ENTITLEMENT_FEATURES.SIMPLE_REPORTS,
  ],
  premium: Object.values(ENTITLEMENT_FEATURES),
});

// Compatibility for existing UI names while every decision resolves to one
// canonical feature persisted in plans.feature_flags.
const FEATURE_ALIASES = Object.freeze({
  whatsappOrder: ENTITLEMENT_FEATURES.WHATSAPP_ORDERS,
  siteCheckout: ENTITLEMENT_FEATURES.SAVED_ORDERS,
  ordersPanel: ENTITLEMENT_FEATURES.SAVED_ORDERS,
  orderStatus: ENTITLEMENT_FEATURES.SAVED_ORDERS,
  additionals: ENTITLEMENT_FEATURES.SAVED_ORDERS,
  orderTracking: ENTITLEMENT_FEATURES.ORDER_TRACKING,
  onlinePayments: ENTITLEMENT_FEATURES.ONLINE_PAYMENT,
  pixAutomatic: ENTITLEMENT_FEATURES.ONLINE_PAYMENT,
  cardAutomatic: ENTITLEMENT_FEATURES.ONLINE_PAYMENT,
  automaticPaymentConfirmation: ENTITLEMENT_FEATURES.AUTOMATIC_PAYMENT_CONFIRMATION,
  whatsappAutomation: ENTITLEMENT_FEATURES.WHATSAPP_AUTOMATION,
  reportsBasic: ENTITLEMENT_FEATURES.SIMPLE_REPORTS,
  reportsAdvanced: ENTITLEMENT_FEATURES.ADVANCED_REPORTS,
});

export const DEFAULT_FEATURES_BY_PLAN = DEFAULT_ENTITLEMENTS_BY_PLAN;

const MINIMUM_PLAN_BY_FEATURE = Object.freeze({
  [ENTITLEMENT_FEATURES.WHATSAPP_ORDERS]: "start",
  [ENTITLEMENT_FEATURES.SAVED_ORDERS]: "pro",
  [ENTITLEMENT_FEATURES.ORDER_TRACKING]: "pro",
  [ENTITLEMENT_FEATURES.ONLINE_PAYMENT]: "pro",
  [ENTITLEMENT_FEATURES.AUTOMATIC_PAYMENT_CONFIRMATION]: "pro",
  [ENTITLEMENT_FEATURES.SIMPLE_REPORTS]: "pro",
  [ENTITLEMENT_FEATURES.WHATSAPP_AUTOMATION]: "premium",
  [ENTITLEMENT_FEATURES.AUTOMATIC_STATUS_MESSAGES]: "premium",
  [ENTITLEMENT_FEATURES.ADVANCED_REPORTS]: "premium",
  [ENTITLEMENT_FEATURES.COUPONS]: "premium",
  [ENTITLEMENT_FEATURES.LOYALTY]: "premium",
  [ENTITLEMENT_FEATURES.AI_TOOLS]: "premium",
  [ENTITLEMENT_FEATURES.CUSTOM_DOMAIN]: "premium",
  [ENTITLEMENT_FEATURES.API_ACCESS]: "premium",
});

export const FEATURE_MIN_PLAN = MINIMUM_PLAN_BY_FEATURE;

export function normalizePlan(plan = "start") {
  const normalized = String(plan).trim().toLowerCase();
  if (normalized === "starter") return "start";
  if (PLAN_KEYS.includes(normalized)) return normalized;
  return "start";
}

export function normalizeFeature(feature) {
  return FEATURE_ALIASES[feature] || feature;
}

export function getDefaultEntitlementsForPlan(plan) {
  return [...(DEFAULT_ENTITLEMENTS_BY_PLAN[normalizePlan(plan)] || [])];
}

export function hasFeature(entitlements, feature) {
  const normalized = normalizeFeature(feature);
  const features = Array.isArray(entitlements)
    ? entitlements
    : Array.isArray(entitlements?.features)
      ? entitlements.features
      : [];
  return features.includes(normalized);
}

export function getFeaturesByPlan(platform) {
  if (platform?.plans) {
    return Object.fromEntries(PLAN_KEYS.map((key) => [
      key,
      platform.plans[key]?.featureFlags || platform.plans[key]?.features || [],
    ]));
  }
  return platform?.featuresByPlan || DEFAULT_ENTITLEMENTS_BY_PLAN;
}

export function planHasFeature(plan, feature, platform) {
  const features = getFeaturesByPlan(platform)[normalizePlan(plan)] || [];
  return hasFeature(features, feature);
}

export function getMinimumPlanForFeature(feature) {
  return MINIMUM_PLAN_BY_FEATURE[normalizeFeature(feature)] || "start";
}

export function getPlanConfig(platform, plan) {
  const key = normalizePlan(plan);
  return platform?.plans?.[key] || null;
}

export function getPlanName(platform, plan) {
  return getPlanConfig(platform, plan)?.name || normalizePlan(plan).toUpperCase();
}

export function getPlanPriceLabel(platform, plan) {
  const config = getPlanConfig(platform, plan);
  if (!config) return "";
  return config.priceLabel || new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(config.price) || 0) + "/mes";
}

export function getActivePlans(platform) {
  return PLAN_KEYS
    .map((key) => ({ key, ...(platform?.plans?.[key] || {}) }))
    .filter((plan) => plan.active !== false);
}
