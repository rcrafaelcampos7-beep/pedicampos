import { supabase } from "./supabaseClient.js";

const DEV_AUTH_KEY = "pedicampos.master.dev-auth";
const isDevFallbackEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_FAKE_MASTER_AUTH === "true";

function notifyAuthChange() {
  window.dispatchEvent(new CustomEvent("pedicampos:session-updated"));
}

export async function isMasterUser(user) {
  if (!user || !supabase) return false;

  const { data, error } = await supabase
    .from("store_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .eq("role", "master")
    .eq("active", true)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function signInMaster(email, password) {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data.user && (await isMasterUser(data.user))) {
      notifyAuthChange();
      return { user: data.user, session: data.session, fallback: false };
    }

    if (data.session) await supabase.auth.signOut();
    if (!isDevFallbackEnabled) throw new Error("MASTER_AUTH_FAILED");
  } else if (!isDevFallbackEnabled) {
    throw new Error("MASTER_AUTH_UNAVAILABLE");
  }

  const devEmail = import.meta.env.VITE_DEV_MASTER_EMAIL;
  const devPassword = import.meta.env.VITE_DEV_MASTER_PASSWORD;
  if (!devEmail || !devPassword || email !== devEmail || password !== devPassword) {
    throw new Error("MASTER_AUTH_FAILED");
  }

  window.sessionStorage.setItem(DEV_AUTH_KEY, "true");
  notifyAuthChange();
  return { user: { id: "development-master", email }, session: null, fallback: true };
}

export async function signOut() {
  window.sessionStorage.removeItem(DEV_AUTH_KEY);
  if (supabase) await supabase.auth.signOut();
  notifyAuthChange();
}

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  return error ? null : data.session;
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

export function subscribeAuthChanges(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(session, event));
  return () => data.subscription.unsubscribe();
}

export function hasDevelopmentMasterSession() {
  return isDevFallbackEnabled && window.sessionStorage.getItem(DEV_AUTH_KEY) === "true";
}
