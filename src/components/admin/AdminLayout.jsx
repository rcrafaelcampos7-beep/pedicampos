import { Sidebar } from "../layout/Sidebar.jsx";
import { Button } from "../ui/Button.jsx";
import { navigate } from "../../routes/router.jsx";
import { signOut } from "../../services/auth.js";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "D" },
  { to: "/admin/pedidos", label: "Pedidos", icon: "P" },
  { to: "/admin/produtos", label: "Produtos", icon: "I" },
  { to: "/admin/categorias", label: "Categorias", icon: "C" },
  { to: "/admin/adicionais", label: "Adicionais", icon: "A" },
  { to: "/admin/configuracoes", label: "Configurações", icon: "S" },
];

export function AdminLayout({ children, activePath, store }) {
  async function logout() {
    await signOut();
    navigate("/admin");
  }

  return (
    <div className="app-shell admin-shell">
      <Sidebar
        brand="Admin loja"
        links={adminLinks}
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
            <span>Painel da loja</span>
            <h1>{store?.name || "Loja"}</h1>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
