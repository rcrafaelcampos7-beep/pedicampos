import { Suspense, useEffect, useState } from "react";
import { NotFound } from "./components/routing/NotFound.jsx";
import { RouteLoading } from "./components/routing/RouteLoading.jsx";
import { usePath } from "./routes/router.jsx";
import { lazyNamed } from "./routes/lazyNamed.js";

const LandingPage = lazyNamed(() => import("./pages/LandingPage.jsx"), "LandingPage");
const StorePage = lazyNamed(() => import("./pages/StorePage.jsx"), "StorePage");
const CheckoutPage = lazyNamed(() => import("./pages/CheckoutPage.jsx"), "CheckoutPage");
const OrderTrackingPage = lazyNamed(() => import("./pages/OrderTrackingPage.jsx"), "OrderTrackingPage");
const AdminRouter = lazyNamed(() => import("./routes/AdminRouter.jsx"), "AdminRouter");
const MasterRouter = lazyNamed(() => import("./routes/MasterRouter.jsx"), "MasterRouter");

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

export default function App() {
  const path = usePath();
  useSessionVersion();
  const segments = path.split("/").filter(Boolean);
  let route;

  if (path === "/") route = <LandingPage />;
  else if (segments[0] === "admin") route = <AdminRouter path={path} />;
  else if (segments[0] === "master") route = <MasterRouter path={path} />;
  else if (segments.length === 1) route = <StorePage slug={segments[0]} />;
  else if (segments.length === 2 && segments[1] === "checkout") route = <CheckoutPage slug={segments[0]} />;
  else if (segments.length === 3 && segments[1] === "pedido") {
    route = <OrderTrackingPage slug={segments[0]} orderId={segments[2]} />;
  } else route = <NotFound />;

  return <Suspense fallback={<RouteLoading />}>{route}</Suspense>;
}
