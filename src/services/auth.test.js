import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ memberships: [], master: { data: null, error: null } }));
const query = vi.hoisted(() => ({
  select: vi.fn(() => query), eq: vi.fn(() => query), in: vi.fn(() => query), not: vi.fn(() => query),
  order: vi.fn(async () => ({ data: state.memberships, error: null })),
  maybeSingle: vi.fn(async () => state.master),
}));
const client = vi.hoisted(() => ({
  from: vi.fn(() => query),
  auth: {
    signInWithPassword: vi.fn(), signOut: vi.fn(async () => ({})),
    getSession: vi.fn(), getUser: vi.fn(), onAuthStateChange: vi.fn(),
  },
}));
const database = vi.hoisted(() => ({ getStoreById: vi.fn(), getStoreEntitlements: vi.fn() }));

vi.mock("./supabaseClient.js", () => ({ supabase: client }));
vi.mock("./database.js", () => database);

import { isMasterUser, signInMaster, signInStoreUser } from "./auth.js";

describe("auth Supabase", () => {
  beforeEach(() => {
    state.memberships = [];
    state.master = { data: null, error: null };
    query.eq.mockClear();
    client.auth.signOut.mockClear();
    database.getStoreById.mockResolvedValue({ id: "store-a", name: "Loja A", plan: "pro" });
    database.getStoreEntitlements.mockResolvedValue({ planKey: "pro", features: ["saved_orders"] });
  });

  it("autoriza master somente pelo auth_user_id e role ativos", async () => {
    state.master = { data: { id: "membership-master" }, error: null };
    expect(await isMasterUser({ id: "auth-master" })).toBe(true);
    expect(query.eq).toHaveBeenCalledWith("auth_user_id", "auth-master");
    expect(query.eq).toHaveBeenCalledWith("role", "master");
    expect(query.eq).toHaveBeenCalledWith("active", true);
  });

  it("login master exige vinculo remoto e nao usa credencial fixa", async () => {
    client.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "auth-master" }, session: { access_token: "test-only" } }, error: null });
    state.master = { data: { id: "membership-master" }, error: null };
    await expect(signInMaster("master@example.test", "senha-teste")).resolves.toMatchObject({ fallback: false });
  });

  it("login admin deriva store.id exclusivamente do vinculo store_users", async () => {
    client.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "auth-admin" }, session: {} }, error: null });
    state.memberships = [{ id: "membership-a", store_id: "store-a", auth_user_id: "auth-admin", role: "store_admin", active: true }];
    const authorization = await signInStoreUser("admin@example.test", "senha-teste");
    expect(database.getStoreById).toHaveBeenCalledWith("store-a", { allowLocalFallback: false });
    expect(authorization.store).toMatchObject({ id: "store-a", plan: "pro" });
  });

  it("nega e encerra sessao de usuario sem loja vinculada", async () => {
    client.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "auth-sem-loja" }, session: {} }, error: null });
    await expect(signInStoreUser("sem-loja@example.test", "senha-teste")).rejects.toThrow("STORE_ACCESS_DENIED");
    expect(client.auth.signOut).toHaveBeenCalled();
  });
});
