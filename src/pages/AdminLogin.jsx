import { useState } from "react";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { navigate } from "../routes/router.jsx";
import { signInStoreUser } from "../services/auth.js";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInStoreUser(email, password);
      navigate("/admin/dashboard");
    } catch {
      setError("Não foi possível entrar. Confira suas credenciais e o acesso à loja.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <span className="eyebrow">Painel da loja</span>
        <h1>Entrar no admin</h1>
        <p>Use a conta autorizada da sua loja para acessar o painel.</p>
        {error ? <div className="form-error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <Input label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
