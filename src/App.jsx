import { useEffect, useState } from "react";
import { Card } from "./components/ui/Card.jsx";
import { usePediData } from "./hooks/usePediData.js";
import { Link, navigate, usePath } from "./routes/router.jsx";
import { AdminCategories } from "./pages/AdminCategories.jsx";
import { AdminAdditionals } from "./pages/AdminAdditionals.jsx";
import { PlanGuard } from "./components/admin/PlanGuard.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { AdminLogin } from "./pages/AdminLogin.jsx";
import { AdminOrders } from "./pages/AdminOrders.jsx";
import { AdminProducts } from "./pages/AdminProducts.jsx";
import { AdminSettings } from "./pages/AdminSettings.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { MasterCreateStore } from "./pages/MasterCreateStore.jsx";
import { MasterDashboard } from "./pages/MasterDashboard.jsx";
import { MasterLogin } from "./pages/MasterLogin.jsx";
import { MasterOrders } from "./pages/MasterOrders.jsx";
import { MasterPlans } from "./pages/MasterPlans.jsx";
import { MasterSettings } from "./pages/MasterSettings.jsx";
import { MasterStores } from "./pages/MasterStores.jsx";
import { OrderTrackingPage } from "./pages/OrderTrackingPage.jsx";
import { StorePage } from "./pages/StorePage.jsx";

function useSessionVersion() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const update = () => setVersion((current) => current + 1);
    window.addEventListener("storage", update);
    window.addEventListener("pedicampos:session-updated", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("pedicampos:session-updated", update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  return version;
}

function NotFound() {
  return (
    <main className="not-found">
      <Card>
        <h1>Página não encontrada</h1>
        <p>Essa rota não existe na primeira versão da PediCampos.</p>
        <Link className="btn btn-primary btn-md" to="/">
          Voltar para início
        </Link>
      </Card>
    </main>
  );
}

function AdminRouter({ path, stores, platform }) {
  const auth = window.localStorage.getItem("pedicampos.admin.auth") === "true";
  const storeId = window.localStorage.getItem("pedicampos.admin.storeId");
  const store = stores.find((item) => item.id === storeId) || stores[0];

  if (!auth || !store) return <AdminLogin />;
  if (path === "/admin") {
    navigate("/admin/dashboard");
    return null;
  }
  if (path === "/admin/dashboard") return <AdminDashboard activePath={path} store={store} />;
  if (path === "/admin/pedidos") {
    return (
      <PlanGuard store={store} platform={platform} feature="ordersPanel" activePath={path}>
        <AdminOrders activePath={path} store={store} />
      </PlanGuard>
    );
  }
  if (path === "/admin/produtos") return <AdminProducts activePath={path} store={store} />;
  if (path === "/admin/categorias") return <AdminCategories activePath={path} store={store} />;
  if (path === "/admin/adicionais") {
    return (
      <PlanGuard store={store} platform={platform} feature="additionals" activePath={path}>
        <AdminAdditionals activePath={path} store={store} />
      </PlanGuard>
    );
  }
  if (path === "/admin/configuracoes") return <AdminSettings activePath={path} store={store} />;
  return <NotFound />;
}

function MasterRouter({ path }) {
  const auth = window.localStorage.getItem("pedicampos.master.auth") === "true";

  if (!auth) return <MasterLogin />;
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

export default function App() {
  const path = usePath();
  const { stores, platform } = usePediData();
  useSessionVersion();
  const segments = path.split("/").filter(Boolean);

  if (path === "/") return <LandingPage />;

  if (segments[0] === "admin") return <AdminRouter path={path} stores={stores} platform={platform} />;
  if (segments[0] === "master") return <MasterRouter path={path} />;

  if (segments.length === 1) return <StorePage slug={segments[0]} />;
  if (segments.length === 2 && segments[1] === "checkout") return <CheckoutPage slug={segments[0]} />;
  if (segments.length === 3 && segments[1] === "pedido") {
    return <OrderTrackingPage slug={segments[0]} orderId={segments[2]} />;
  }

  return <NotFound />;
}
