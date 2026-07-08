import { Sidebar } from "../layout/Sidebar.jsx";
import { Button } from "../ui/Button.jsx";
import { Select } from "../ui/Input.jsx";
import { navigate } from "../../routes/router.jsx";
import { usePediData } from "../../hooks/usePediData.js";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "D" },
  { to: "/admin/pedidos", label: "Pedidos", icon: "P" },
  { to: "/admin/produtos", label: "Produtos", icon: "I" },
  { to: "/admin/categorias", label: "Categorias", icon: "C" },
  { to: "/admin/adicionais", label: "Adicionais", icon: "A" },
  { to: "/admin/configuracoes", label: "Configurações", icon: "S" },
];

export function AdminLayout({ children, activePath, store }) {
  const { stores } = usePediData();

  function changeStore(storeId) {
    window.localStorage.setItem("pedicampos.admin.storeId", storeId);
    window.dispatchEvent(new CustomEvent("pedicampos:session-updated"));
  }

  function logout() {
    window.localStorage.removeItem("pedicampos.admin.storeId");
    window.localStorage.removeItem("pedicampos.admin.auth");
    navigate("/admin");
  }

  return (
    <div className="app-shell">
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
          <Select
            label="Loja de demonstração"
            value={store?.id || ""}
            onChange={(event) => changeStore(event.target.value)}
          >
            {stores.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </header>
        {children}
      </main>
    </div>
  );
}
