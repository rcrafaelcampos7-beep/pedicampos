# Testes automatizados

## Comandos

- `npm run test`: Vitest em modo interativo.
- `npm run test:run`: suíte determinística usada pelo CI.
- `npm run test:coverage`: cobertura V8 em texto, JSON e HTML.
- `npm run validate`: testes e build, sem comandos específicos de Windows.
- `git diff --check`: executar separadamente antes de commit; não está no `validate` porque depende de um worktree Git disponível.

Não existe script `lint`: o projeto ainda não possui configuração ESLint confiável. Ele deve ser adicionado em uma etapa própria, com regras validadas e sem fingir cobertura.

## Isolamento

Os testes usam jsdom e limpam `localStorage` e `sessionStorage` entre casos. Mocks são restaurados automaticamente, não há rede real e as fixtures usam somente dados fictícios. O client Supabase é substituído por um mock controlado em `database.test.js`; erros 42501/42703 são verificados como falhas sem fallback, enquanto somente `TypeError` de rede permite fallback técnico.

## Testes de integração Supabase pendentes

Mocks não comprovam RLS, grants, policies, triggers ou RPCs instalados. A próxima camada deve usar Supabase CLI local ou um projeto exclusivo de testes, nunca produção. Ela deverá:

1. Subir schema/migrations em ambiente descartável.
2. Criar usuários anon, Admin A, Admin B e master fictícios.
3. Exercitar isolamento A/B, RPC pública de pedidos, idempotência, entitlements e policies de Storage.
4. Destruir o ambiente/dados ao final.

Nenhum teste frontend deve receber `service_role`. O CI atual não usa URLs, chaves ou secrets Supabase.

## Cobertura inicial

A meta desta primeira etapa é alta cobertura das regras puras e fluxos críticos, sem bloquear o CI por percentual arbitrário. O relatório registrou 71 casos em 11 arquivos: 35,11% de statements, 26,57% de branches, 34,54% de funções e 38,34% de linhas globais. `utils` ficou em 83,16% de statements, `useCart` em 86,95% e as quatro páginas testadas em 72,05% no conjunto.

Ainda faltam testes aprofundados de Auth/routers, dashboards, CRUD completo de categorias/produtos/adicionais/configurações, uploads reais, Storage, Landing e integrações SQL/RLS reais.

## Sprint 2.5

A suíte adiciona testes puros do core da Edge para sucesso, CORS, método, Content-Type, body máximo, 429/Retry-After, idempotency key e erro RPC sanitizado. Logger é testado em DEV/produção e o frontend valida a mensagem de 429. O total atual é 86 casos em 13 arquivos. A Edge real, headers de IP do gateway e funções SQL da migration 015 continuam exigindo teste local/remoto controlado.

Cobertura após a Sprint 2.5: 38,08% statements, 29,46% branches, 36,25% functions e 41,52% lines. `logger.js` alcançou 91,17% de statements e o core da Edge, 90%.

O ajuste local de 16/07/2026 adiciona dois casos para carrinho sem imagem e `logInfo` sem erro artificial, inclusive silencioso em produção. Total atual: 88 testes em 13 arquivos.
