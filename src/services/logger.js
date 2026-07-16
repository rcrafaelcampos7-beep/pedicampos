const SAFE_CONTEXT_KEYS = new Set(["area", "operation", "code", "storeId", "requestId"]);
const SENSITIVE_KEY = /password|token|secret|authorization|jwt|phone|name|address|pix|payload|customer|session|key/i;

function errorSource(error) {
  return error?.cause || error || {};
}

function sanitizeContext(context = {}, { includeCode = true } = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(context || {})) {
    if (
      SAFE_CONTEXT_KEYS.has(key)
      && (includeCode || key !== "code")
      && value !== undefined
      && !SENSITIVE_KEY.test(key)
    ) {
      safe[key] = String(value).slice(0, 160);
    }
  }
  return safe;
}

export function sanitizeError(error, context = {}, { detailed = import.meta.env.DEV } = {}) {
  const source = errorSource(error);
  const safe = sanitizeContext(context);
  safe.code = String(context.code || source.code || "UNKNOWN_ERROR").slice(0, 80);
  if (detailed) {
    safe.message = String(source.message || error?.message || "").slice(0, 500);
    if (source.details) safe.details = String(source.details).slice(0, 500);
    if (source.hint) safe.hint = String(source.hint).slice(0, 300);
  }
  return safe;
}

export function createLogger({ isDev = import.meta.env.DEV, consoleTarget = console, adapter = null } = {}) {
  function emit(level, context, error) {
    const details = level === "info"
      ? sanitizeContext(context, { includeCode: false })
      : sanitizeError(error, context, { detailed: isDev });
    const event = {
      ...details,
      area: context?.area || "app",
      operation: context?.operation || "unknown",
      timestamp: new Date().toISOString(),
      environment: isDev ? "development" : "production",
    };
    if (level === "info" && !isDev) return event;
    const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";
    consoleTarget[method]?.("[PediCampos]", event);
    adapter?.(level, event);
    return event;
  }
  return {
    info: (context) => emit("info", context),
    warn: (context, error) => emit("warn", context, error),
    error: (context, error) => emit("error", context, error),
  };
}

let externalAdapter = null;
export function setObservabilityAdapter(adapter) {
  externalAdapter = typeof adapter === "function" ? adapter : null;
}

const logger = createLogger({ adapter: (level, event) => externalAdapter?.(level, event) });
export const logInfo = logger.info;
export const logWarn = logger.warn;
export const logError = logger.error;
