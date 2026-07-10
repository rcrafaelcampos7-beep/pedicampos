import { useState } from "react";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Select } from "../components/ui/Input.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { navigate } from "../routes/router.jsx";

export function AdminLogin() {
  const { stores } = usePediData();
  const [email, setEmail] = useState("admin@neguinho.com");
  const [password, setPassword] = useState("123456");
  const [storeId, setStoreId] = useState("store-neguinho");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const selectedStore = stores.find((store) => store.id === storeId);
    const matchingStore = stores.find((store) => store.email === email && store.password === password);
    const validStoreAccess = password === "123456" && selectedStore;

    if (!matchingStore && !validStoreAccess) {
      setError("Credenciais inválidas. Use admin@neguinho.com / 123456.");
      return;
    }

    const finalStore = matchingStore || selectedStore;
    window.localStorage.setItem("pedicampos.admin.auth", "true");
    window.localStorage.setItem("pedicampos.admin.storeId", finalStore.id);
    navigate("/admin/dashboard");
  }

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <span className="eyebrow">Painel da loja</span>
        <h1>Entrar no admin</h1>
        <p>Use a conta da loja ou escolha uma operação para editar os mesmos dados vistos na vitrine pública.</p>
        {error ? <div className="form-error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <Input label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Select label="Loja" value={storeId} onChange={(event) => setStoreId(event.target.value)}>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="primary" size="lg">
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}
