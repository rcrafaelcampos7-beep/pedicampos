import { createClient } from "npm:@supabase/supabase-js@2";
import { createOrderHandler } from "./core.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const rateLimitSalt = Deno.env.get("ORDER_RATE_LIMIT_SALT") || "";
const configuredOrigins = (Deno.env.get("ORDER_ALLOWED_ORIGINS") || "https://pedicampos.com.br,https://www.pedicampos.com.br")
  .split(",").map((value) => value.trim()).filter(Boolean);
const allowLocalhost = Deno.env.get("ORDER_ALLOW_LOCALHOST") === "true";
const server = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

function isOriginAllowed(origin: string) {
  if (configuredOrigins.includes(origin)) return true;
  if (!allowLocalhost) return false;
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1"].includes(url.hostname) && ["http:", "https:"].includes(url.protocol);
  } catch { return false; }
}

function normalizeIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const raw = forwarded || request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
  return raw.replace(/^\[|\]$/g, "").replace(/:\d+$/, "").slice(0, 128).toLowerCase();
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const handler = createOrderHandler({
  isOriginAllowed,
  identify: async (request) => {
    if (!rateLimitSalt || rateLimitSalt.length < 32) throw Object.assign(new Error("Rate-limit salt missing"), { code: "RATE_LIMIT_CONFIG" });
    return { subjectHash: await sha256(`${rateLimitSalt}:${normalizeIp(request)}`) };
  },
  checkRateLimit: async (subjectHash, storeId, idempotencyKey) => {
    const keyHash = await sha256(`${rateLimitSalt}:${storeId}:${idempotencyKey}`);
    const { data, error } = await server.rpc("consume_order_rate_limit", { p_subject_hash: subjectHash, p_store_id: storeId, p_idempotency_hash: keyHash });
    if (error) throw error;
    return data;
  },
  completeAttempt: async (attemptId, success) => {
    const { error } = await server.rpc("complete_order_rate_limit", { p_attempt_id: attemptId, p_success: success });
    if (error) throw error;
  },
  createOrder: async (payload) => {
    const { data, error } = await server.rpc("create_public_order", payload);
    if (error) throw error;
    return data;
  },
  log: (level, event) => {
    const safe = { ...event, timestamp: new Date().toISOString(), environment: "edge" };
    if (level === "error") console.error(JSON.stringify(safe));
    else if (level === "warn") console.warn(JSON.stringify(safe));
    else console.info(JSON.stringify(safe));
  },
});

Deno.serve(handler);
