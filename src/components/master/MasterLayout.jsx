import { Sidebar } from "../layout/Sidebar.jsx";
import { Button } from "../ui/Button.jsx";
import { navigate } from "../../routes/router.jsx";

const masterLinks = [
  { to: "/master/dashboard", label: "Dashboard", icon: "D" },
  { to: "/master/lojas", label: "Lojas", icon: "L" },
  { to: "/master/criar-loja", label: "Criar Loja", icon: "+" },
  { to: "/master/planos", label: "Planos", icon: "P" },
  { to: "/master/pedidos", label: "Pedidos Gerais", icon: "O" },
  { to: "/master/configuracoes", label: "Configurações", icon: "S" },
];

export function MasterLayout({ children, activePath }) {
  function logout() {
    window.localStorage.removeItem("pedicampos.master.auth");
    navigate("/master");
  }

  return (
    <div className="app-shell">
      <Sidebar
        brand="PediCampos"
        links={masterLinks}
        activePath={activePath}
        footer={
          <Button variant="ghost" onClick={logout}>
            Sair
          </Button>
        }
      />
      <main className="panel-main">
        <header className="panel-topbar">
          <div>
            <span>Central master</span>
            <h1>PediCampos</h1>
          </div>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Ver landing
          </Button>
        </header>
        {children}
      </main>
    </div>
  );
}
