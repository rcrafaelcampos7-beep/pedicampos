import { useEffect, useState } from "react";
import { PlanGuard } from "../components/admin/PlanGuard.jsx";
import { NotFound } from "../components/routing/NotFound.jsx";
import { RouteLoading } from "../components/routing/RouteLoading.jsx";
import {
  getAuthorizedStoreForUser,
  getCurrentUser,
  subscribeAuthChanges,
} from "../services/auth.js";
import { ENTITLEMENT_FEATURES } from "../utils/plans.js";
import { navigate } from "./router.jsx";
import { lazyNamed } from "./lazyNamed.js";

const AdminLogin = lazyNamed(() => import("../pages/AdminLogin.jsx"), "AdminLogin");
const AdminDashboard = lazyNamed(() => import("../pages/AdminDashboard.jsx"), "AdminDashboard");
const AdminOrders = lazyNamed(() => import("../pages/AdminOrders.jsx"), "AdminOrders");
const AdminProducts = lazyNamed(() => import("../pages/AdminProducts.jsx"), "AdminProducts");
const AdminCategories = lazyNamed(() => import("../pages/AdminCategories.jsx"), "AdminCategories");
const AdminAdditionals = lazyNamed(() => import("../pages/AdminAdditionals.jsx"), "AdminAdditionals");
const AdminSettings = lazyNamed(() => import("../pages/AdminSettings.jsx"), "AdminSettings");

export function AdminRouter({ path }) {
  const [authState, setAuthState] = useState({ loading: true, store: null });

  useEffect(() => {
    let active = true;

    async function verifyStoreUser() {
      const user = await getCurrentUser();
      let authorization = null;

      try {
        authorization = await getAuthorizedStoreForUser(user);
      } catch {
        authorization = null;
      }

      if (active) setAuthState({ loading: false, store: authorization?.store || null });
    }

    verifyStoreUser();
    const unsubscribe = subscribeAuthChanges(() => window.setTimeout(verifyStoreUser, 0));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (authState.loading) return <RouteLoading label="Verificando acesso à loja..." />;
  const store = authState.store;

  if (!store) return <AdminLogin />;
  if (path === "/admin") {
    navigate("/admin/dashboard");
    return null;
  }
  if (path === "/admin/dashboard") {
    return (
      <PlanGuard store={store} feature={ENTITLEMENT_FEATURES.SIMPLE_REPORTS} activePath={path}>
        <AdminDashboard activePath={path} store={store} />
      </PlanGuard>
    );
  }
  if (path === "/admin/pedidos") {
    return (
      <PlanGuard store={store} feature={ENTITLEMENT_FEATURES.SAVED_ORDERS} activePath={path}>
        <AdminOrders activePath={path} store={store} />
      </PlanGuard>
    );
  }
  if (path === "/admin/produtos") return <AdminProducts activePath={path} store={store} />;
  if (path === "/admin/categorias") return <AdminCategories activePath={path} store={store} />;
  if (path === "/admin/adicionais") {
    return (
      <PlanGuard store={store} feature={ENTITLEMENT_FEATURES.SAVED_ORDERS} activePath={path}>
        <AdminAdditionals activePath={path} store={store} />
      </PlanGuard>
    );
  }
  if (path === "/admin/configuracoes") return <AdminSettings activePath={path} store={store} />;
  return <NotFound />;
}
