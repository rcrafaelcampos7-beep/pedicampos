# PediCampos

Primeira versão local da plataforma SaaS multi-lojas PediCampos.

## Abrir o projeto

No terminal, dentro desta pasta:

```bash
npm run dev
```

Depois abra:

```text
http://127.0.0.1:5174/
```

Não abra o `index.html` com duplo clique, porque este projeto usa Vite e precisa do servidor local para carregar React.

## Acessos

Admin da loja:

```text
http://127.0.0.1:5174/admin
```

Use um usuario criado no Supabase Auth e vinculado como `store_admin` ou `store_staff` ativo em `store_users`. Nao existem credenciais fixas de producao no frontend.

Master:

```text
http://127.0.0.1:5174/master
```

Use um usuario do Supabase Auth vinculado como `master` ativo em `store_users`. O fallback fake exige build DEV e flag de ambiente explicita; nao deve ser habilitado no dominio.

Lojas demo:

```text
http://127.0.0.1:5174/neguinhodoacai
http://127.0.0.1:5174/gordinhoburguer
```

Com Supabase configurado, lojas remotas sao a fonte de verdade. As lojas demo locais acima so existem no fallback e podem nao aparecer no ambiente remoto.

## Auditoria de producao

Consulte `AUDIT_PEDICAMPOS_SPRINT1.md`. A migration 009 foi preparada para remover INSERT anonimo direto das tabelas de pedidos e manter `create_public_order` como unica fronteira publica de escrita; ela ainda deve ser executada e validada no Supabase antes do go-live. A auditoria tambem registra pendencias de validacao server-side, painel master, paginacao, antiabuso, bundle e testes automatizados.

## Testes e validação

```bash
npm run test
npm run test:run
npm run test:coverage
npm run validate
git diff --check
```

`validate` executa testes e build. `git diff --check` permanece separado para funcionar também fora de um worktree Git. O CI em `.github/workflows/ci.yml` roda em pull requests e pushes para `main`, sem Supabase real, secrets ou deploy. Consulte `TESTING.md` para cobertura, isolamento e integrações pendentes.
