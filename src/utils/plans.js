export const PLAN_KEYS = ["start", "pro", "premium"];

export const DEFAULT_FEATURES_BY_PLAN = {
  start: [
    "publicStore",
    "whatsappOrder",
    "products",
    "categories",
    "basicAdmin",
    "simpleCart",
    "paymentsManual",
    "pixManual",
    "cardManual",
  ],
  pro: [
    "publicStore",
    "whatsappOrder",
    "products",
    "categories",
    "basicAdmin",
    "simpleCart",
    "siteCheckout",
    "ordersPanel",
    "orderStatus",
    "additionals",
    "reportsBasic",
    "orderTracking",
    "pixAutomatic",
    "cardAutomatic",
    "onlinePayments",
    "automaticPaymentConfirmation",
  ],
  premium: [
    "publicStore",
    "whatsappOrder",
    "products",
    "categories",
    "basicAdmin",
    "simpleCart",
    "siteCheckout",
    "ordersPanel",
    "orderStatus",
    "additionals",
    "reportsBasic",
    "orderTracking",
    "pixAutomatic",
    "cardAutomatic",
    "onlinePayments",
    "automaticPaymentConfirmation",
    "whatsappAutomation",
    "coupons",
    "reportsAdvanced",
    "automations",
  ],
};

export const FEATURE_MIN_PLAN = {
  paymentsManual: "start",
  pixManual: "start",
  cardManual: "start",
  siteCheckout: "pro",
  ordersPanel: "pro",
  orderStatus: "pro",
  additionals: "pro",
  reportsBasic: "pro",
  orderTracking: "pro",
  pixAutomatic: "pro",
  cardAutomatic: "pro",
  onlinePayments: "pro",
  automaticPaymentConfirmation: "pro",
  pixOnline: "pro",
  whatsappAutomation: "premium",
  coupons: "premium",
  reportsAdvanced: "premium",
  automations: "premium",
};

export function normalizePlan(plan = "start") {
  const normalized = String(plan).trim().toLowerCase();
  if (normalized === "starter") return "start";
  if (PLAN_KEYS.includes(normalized)) return normalized;
  return "start";
}

export function getFeaturesByPlan(platform) {
  return platform?.featuresByPlan || DEFAULT_FEATURES_BY_PLAN;
}

export function planHasFeature(plan, feature, platform) {
  const features = getFeaturesByPlan(platform)[normalizePlan(plan)] || [];
  return features.includes(feature);
}

export function getMinimumPlanForFeature(feature) {
  return FEATURE_MIN_PLAN[feature] || "start";
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
  }).format(Number(config.price) || 0) + "/mês";
}

export function getActivePlans(platform) {
  return PLAN_KEYS.map((key) => ({ key, ...platform.plans[key] })).filter((plan) => plan.active !== false);
}
