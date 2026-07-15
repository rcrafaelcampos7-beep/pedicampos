import { useEffect, useState } from "react";
import { NotFound } from "../components/routing/NotFound.jsx";
import { RouteLoading } from "../components/routing/RouteLoading.jsx";
import {
  getCurrentUser,
  hasDevelopmentMasterSession,
  isMasterUser,
  subscribeAuthChanges,
} from "../services/auth.js";
import { lazyNamed } from "./lazyNamed.js";
import { navigate } from "./router.jsx";

const MasterLogin = lazyNamed(() => import("../pages/MasterLogin.jsx"), "MasterLogin");
const MasterDashboard = lazyNamed(() => import("../pages/MasterDashboard.jsx"), "MasterDashboard");
const MasterStores = lazyNamed(() => import("../pages/MasterStores.jsx"), "MasterStores");
const MasterCreateStore = lazyNamed(() => import("../pages/MasterCreateStore.jsx"), "MasterCreateStore");
const MasterOrders = lazyNamed(() => import("../pages/MasterOrders.jsx"), "MasterOrders");
const MasterPlans = lazyNamed(() => import("../pages/MasterPlans.jsx"), "MasterPlans");
const MasterSettings = lazyNamed(() => import("../pages/MasterSettings.jsx"), "MasterSettings");

export function MasterRouter({ path }) {
  const [authState, setAuthState] = useState({ loading: true, authorized: false });

  useEffect(() => {
    let active = true;

    async function verifyMaster() {
      if (hasDevelopmentMasterSession()) {
        if (active) setAuthState({ loading: false, authorized: true });
        return;
      }

      const user = await getCurrentUser();
      const authorized = await isMasterUser(user);
      if (active) setAuthState({ loading: false, authorized });
    }

    verifyMaster();
    const unsubscribe = subscribeAuthChanges(() => window.setTimeout(verifyMaster, 0));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (authState.loading) return <RouteLoading label="Verificando acesso master..." />;
  if (!authState.authorized) return <MasterLogin />;
  if (path === "/master") {
    navigate("/master/dashboard");
    return null;
  }
  if (path === "/master/dashboard") return <MasterDashboard activePath={path} />;
  if (path === "/master/lojas") return <MasterStores activePath={path} />;
  if (path === "/master/criar-loja") return <MasterCreateStore activePath={path} />;
  if (path === "/master/planos") return <MasterPlans activePath={path} />;
  if (path === "/master/pedidos") return <MasterOrders activePath={path} />;
  if (path === "/master/configuracoes") return <MasterSettings activePath={path} />;
  return <NotFound />;
}
