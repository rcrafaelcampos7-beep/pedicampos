import { useState } from "react";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { navigate } from "../routes/router.jsx";

export function MasterLogin() {
  const [email, setEmail] = useState("master@pedicampos.com.br");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (email !== "master@pedicampos.com.br" || password !== "123456") {
      setError("Use master@pedicampos.com.br / 123456.");
      return;
    }
    window.localStorage.setItem("pedicampos.master.auth", "true");
    navigate("/master/dashboard");
  }

  return (
    <main className="auth-page master-auth">
      <Card className="auth-card">
        <span className="eyebrow">Painel master</span>
        <h1>Entrar na central PediCampos</h1>
        <p>Controle todas as lojas, planos e pedidos simulados da plataforma.</p>
        {error ? <div className="form-error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <Input label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="primary" size="lg">
            Entrar no master
          </Button>
        </form>
      </Card>
    </main>
  );
}
