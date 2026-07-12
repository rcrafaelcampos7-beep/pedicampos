import { useState } from "react";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { navigate } from "../routes/router.jsx";
import { signInMaster } from "../services/auth.js";

export function MasterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInMaster(email, password);
      navigate("/master/dashboard");
    } catch {
      setError("Não foi possível entrar. Confira suas credenciais e sua autorização de master.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page master-auth">
      <Card className="auth-card">
        <span className="eyebrow">Painel master</span>
        <h1>Entrar na central PediCampos</h1>
        <p>Controle todas as lojas, planos e pedidos da plataforma.</p>
        {error ? <div className="form-error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <Input label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no master"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
