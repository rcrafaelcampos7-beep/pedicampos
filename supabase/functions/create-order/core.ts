export const MAX_BODY_BYTES = 262_144;

type Dependencies = {
  isOriginAllowed: (origin: string) => boolean;
  identify: (request: Request) => Promise<{ subjectHash: string }>;
  checkRateLimit: (subjectHash: string, storeId: string, idempotencyKey: string) => Promise<any>;
  completeAttempt: (attemptId: string, success: boolean) => Promise<void>;
  createOrder: (payload: Record<string, unknown>) => Promise<any>;
  log?: (level: string, event: Record<string, unknown>) => void;
};

function corsHeaders(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods": "POST, OPTIONS",
    vary: "Origin",
  };
}

function json(status: number, body: Record<string, unknown>, origin: string, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders(origin), ...extra },
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasMinimumShape(payload: any) {
  return payload && UUID.test(payload.p_store_id || "") && UUID.test(payload.p_idempotency_key || "")
    && payload.p_customer && typeof payload.p_customer === "object"
    && Array.isArray(payload.p_items) && typeof payload.p_fulfillment === "string"
    && typeof payload.p_payment_method === "string";
}

export function createOrderHandler(deps: Dependencies) {
  return async (request: Request) => {
    const requestId = crypto.randomUUID();
    const origin = request.headers.get("origin") || "";
    if (!origin || !deps.isOriginAllowed(origin)) {
      deps.log?.("warn", { area: "edge", operation: "create_order", code: "ORIGIN_DENIED", requestId });
      return new Response(JSON.stringify({ error: "Origem não autorizada.", requestId }), {
        status: 403, headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== "POST") return json(405, { error: "Método não permitido.", requestId }, origin, { allow: "POST, OPTIONS" });
    if (!String(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
      return json(415, { error: "Content-Type deve ser application/json.", requestId }, origin);
    }
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_BODY_BYTES) return json(413, { error: "Payload muito grande.", requestId }, origin);

    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json(413, { error: "Payload muito grande.", requestId }, origin);
    }
    let payload: any;
    try { payload = JSON.parse(raw); } catch { return json(400, { error: "JSON inválido.", requestId }, origin); }
    if (!hasMinimumShape(payload)) return json(400, { error: "Dados do pedido inválidos.", requestId }, origin);

    let attemptId = "";
    try {
      const { subjectHash } = await deps.identify(request);
      const limit = await deps.checkRateLimit(subjectHash, payload.p_store_id, payload.p_idempotency_key);
      if (!limit?.allowed) {
        const retryAfter = Math.max(1, Number(limit?.retryAfter) || 60);
        deps.log?.("warn", { area: "edge", operation: "create_order", code: "RATE_LIMITED", requestId, storeId: payload.p_store_id });
        return json(429, { error: "Muitas tentativas em pouco tempo.", code: "RATE_LIMITED", requestId, retryAfter }, origin, { "retry-after": String(retryAfter) });
      }
      attemptId = limit.attemptId;
      const created = await deps.createOrder(payload);
      if (attemptId) {
        await deps.completeAttempt(attemptId, true).catch((error) => {
          deps.log?.("error", { area: "edge", operation: "complete_rate_attempt", code: error?.code || "RATE_COMPLETE_ERROR", requestId });
        });
      }
      deps.log?.("info", { area: "edge", operation: "create_order", code: "ORDER_CREATED", requestId, storeId: payload.p_store_id });
      return json(200, created, origin, { "x-request-id": requestId });
    } catch (error: any) {
      if (attemptId) await deps.completeAttempt(attemptId, false).catch(() => undefined);
      const code = error?.code || "EDGE_ORDER_ERROR";
      const status = code === "23514" ? 400 : code === "42501" ? 403 : 500;
      deps.log?.("error", { area: "edge", operation: "create_order", code, requestId, storeId: payload.p_store_id });
      return json(status, { error: status < 500 ? "Não foi possível validar o pedido." : "Não foi possível criar o pedido.", code, requestId }, origin, { "x-request-id": requestId });
    }
  };
}
