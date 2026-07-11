import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createSafeSupabaseClient() {
  if (!isSupabaseConfigured) {
    if (import.meta.env.DEV) {
      console.warn(
        "[PediCampos] Supabase nao configurado. Mantendo adapter local como fonte de dados."
      );
    }

    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn("[PediCampos] Falha ao criar client Supabase.", error);
    return null;
  }
}

export const supabase = createSafeSupabaseClient();

export function getSupabaseClient() {
  return supabase;
}

