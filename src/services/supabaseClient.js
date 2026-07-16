import { createClient } from "@supabase/supabase-js";
import { logWarn } from "./logger.js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createSafeSupabaseClient() {
  if (!isSupabaseConfigured) {
    if (import.meta.env.DEV) {
      logWarn({ area: "supabase", operation: "initialize", code: "NOT_CONFIGURED" });
    }

    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    logWarn({ area: "supabase", operation: "initialize", code: "CLIENT_CREATION_FAILED" }, error);
    return null;
  }
}

export const supabase = createSafeSupabaseClient();

export function getSupabaseClient() {
  return supabase;
}
