import { Link } from "../../routes/router.jsx";
import { Card } from "../ui/Card.jsx";

export function NotFound() {
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
