# Auditoria técnica pré-UX — PediCampos

Data: 17/07/2026
Escopo: estabilidade funcional e segurança antes da reformulação da loja pública.
Restrições respeitadas: sem redesign, migration, alteração comercial, chamada ao Supabase remoto, commit ou push.

## 1. Resumo executivo

O fluxo crítico está corretamente separado: a loja pública resolve o tenant pelo slug remoto; o carrinho fica isolado por `storeId`; o checkout resolve novamente a loja, mantém idempotência e chama a Edge Function; a Edge aplica origem, validação mínima e rate limit antes da RPC; tracking usa token público junto do slug; Admin deriva a loja de `store_users`; Master depende de `is_master()`/RLS.

A auditoria elevou a suíte de 88 para 120 testes e corrigiu problemas objetivos sem alterar o layout. Não foram encontrados `service_role`, segredo privado ou chamada direta de produção à RPC no bundle. A chave anon e a URL do Supabase estão no bundle, como esperado para o cliente público.

**Recomendação atual: NÃO APROVADO incondicionalmente para iniciar a nova UX.** O código automatizado está estável, mas faltam dois critérios de aceite: lint real (o script não existe) e comprovação de RLS/Edge/migrations finais em Supabase descartável ou no domínio. A reformulação pode ser planejada, mas a implementação deve aguardar esses gates para evitar esconder defeitos de integração sob uma nova interface.

## 2. Arquitetura e fluxos encontrados

1. **Loja pública:** `App.jsx` → `StorePage.jsx` → `getStoreBySlug(slug, { allowLocalFallback:false })`; configurações, pagamentos, categorias, produtos, adicionais e entitlements carregam em paralelo. Resposta remota vazia não recebe mock.
2. **Carrinho:** `useCart(store.id)` persiste `{ storeId, items }` em `pedicampos.cart.{storeId}`. Itens recebem o tenant resolvido e carrinhos divergentes são invalidados.
3. **Produtos/adicionais:** `ProductModal` filtra grupos/opções ativos vinculados ao produto, valida obrigatório/mínimo/máximo e recalcula total local para UX; a RPC continua autoridade de preço e vínculo.
4. **Checkout:** valida dados, disponibilidade, modalidade, mínimo e método; resolve novamente o slug; reutiliza idempotency key por fingerprint; em sucesso limpa o carrinho e navega pelo `publicToken`; em erro preserva o carrinho.
5. **Criação do pedido:** `database.createOrder` → `supabase.functions.invoke('create-order')` → rate limit → `create_public_order`. O escape direto existe somente com `import.meta.env.DEV` e flag explícita.
6. **Tracking:** `get_public_order(publicToken, slug)`; o par token/slug impede mistura acidental entre lojas.
7. **Admin:** `AdminRouter` obtém o usuário Auth e o primeiro vínculo ativo em `store_users`; páginas recebem apenas essa loja. Dashboard/pedidos consultam Supabase ao montar.
8. **Master:** `MasterRouter` exige master remoto (ou fallback explicitamente DEV); dashboards/lojas/pedidos/planos usam consultas globais protegidas por RLS.
9. **Planos:** `plans.feature_flags`, RPCs de entitlement, `PlanGuard` e `hasFeature` aplicam START/PRO/PREMIUM sem alterar preços.
10. **Legado:** `storage.js`, `mockStores`, `mockOrders`, `usePediData` e plataforma local continuam presentes e não foram removidos.

## 3. Comandos e resultados

| Comando | Resultado |
|---|---|
| `npm install` | Sucesso; 175 pacotes auditados, 0 vulnerabilidades; aviso `allow-scripts` para o instalador do esbuild |
| `npm run lint` | Não executável: script `lint` ausente no `package.json` |
| `npm run test:run` | 20 arquivos, 120 testes aprovados, 0 falhas |
| `npm run test:coverage` | 44,94% statements; 37,63% branches; 43,33% functions; 48,53% lines |
| `npm run build` | Sucesso; 144 módulos transformados |
| `node --check` | Sucesso nos arquivos JavaScript e `vite.config.js` |
| bundle Edge via esbuild | Sucesso, sem depender de Deno/Supabase remoto |
| `git diff --check` | Sucesso; avisos LF/CRLF ignorados como orientado |

Build: 39 chunks JavaScript, 1 CSS e 3 imagens próprias. Maior JS: aproximadamente 249,21 kB bruto (`database`); entrada React: aproximadamente 198,01 kB bruto. Nenhum chunk acima de 500 kB.

## 4. Cobertura por fluxo

Legenda: **coberto**, **parcial**, **manual/SQL**.

### Loja pública

- **Coberto:** loja ativa/inativa/inexistente; loading/erro; categorias e produtos ativos; categoria inativa; produto sem categoria; catálogo vazio; imagem vazia; abertura de card/modal; adicionais grátis/pagos; obrigatório, mínimo, máximo; quantidade; observação; inclusão, edição e remoção; subtotal; persistência e isolamento do carrinho.
- **Parcial:** falha real de carregamento de imagem é coberta para logo, mas não para toda imagem externa de produto.

### Checkout

- **Coberto:** nome, telefone, endereço, mínimo, carrinho vazio, delivery/pickup, payload Edge, idempotência/retry, erro genérico/RLS, 429, loja inativa, limpeza no sucesso e preservação na falha, entitlements START/PRO.
- **Manual/SQL:** produto inválido, preço alterado no servidor, valores/snapshots finais e atomicidade são regras da RPC com diagnósticos SQL; não há PostgreSQL descartável no CI para executá-las automaticamente.

### Pedidos

- **Coberto:** token+slug no tracking, itens/adicionais renderizados, status pickup/delivery, listagem Admin filtrada por loja e atualização de status.
- **Manual/SQL:** linha real em `orders`, FK/snapshots, isolamento RLS Loja A × Loja B e reflexo de status entre duas sessões precisam do ambiente Supabase.

### Admin

- **Coberto:** Auth e vínculo ativo, negação sem vínculo, dashboard remoto, pedidos/loading/vazio/erro/paginação/status, produto sem imagem, paginação comum e `PlanGuard`.
- **Parcial:** CRUD visual completo de produtos/categorias/adicionais/configurações e ciclo de upload/rollback ainda não possui cobertura de página ponta a ponta; o serviço de Storage cobre formato, tamanho, paths e escopo.

### Master

- **Coberto:** Auth master, criação de loja, slug, lista remota, edição/demo/destaque/ordem/label, paginação e dashboard global.
- **Parcial:** MasterOrders, associação de plano e MasterSettings não têm cobertura visual completa. Criação/vinculação de usuário continua procedimento manual, não ação da tela de criação.

### Planos e entitlements

- **Coberto:** START libera WhatsApp; PRO libera pedidos salvos/tracking/pagamento/relatório simples; PREMIUM contém o conjunto completo; feature remota e feature desconhecida; bloqueio visual via `PlanGuard`.
- **Manual/SQL:** confirmar `feature_flags` e policies efetivamente instaladas no projeto remoto.

### Edge Function

- **Coberto:** origem oficial, origem bloqueada, localhost ligado/desligado, Origin ausente, CORS/preflight, métodos, Content-Type, JSON inválido, loja ausente, carrinho vazio, quantidade inválida, idempotency key inválida, payload excessivo, rate limit/429/Retry-After, hash opaco, IPv4/IPv6, sucesso, retry e erro RPC sanitizado.

## 5. Bugs encontrados e corrigidos

1. Edge aceitava `p_items=[]` e quantidade inválida na validação mínima. Agora rejeita antes do rate limit/RPC.
2. Normalização anterior podia truncar o último bloco de IPv6 como porta. IPv4 com porta, IPv6 puro e IPv6 entre colchetes agora são tratados separadamente.
3. Checkout podia exibir a URL da logo como texto. O cabeçalho usa iniciais configuradas/derivadas.
4. `AdminProducts` injetava o banner da loja em produto sem imagem. Produto vazio permanece sem imagem e nenhuma tag recebe `src=""`.
5. `StoreHeader` e `MasterStores` renderizavam banner vazio incondicionalmente. A tag agora só existe com fonte não vazia.
6. `MasterCreateStore` reutilizava banner de outra loja e salvava iniciais no campo de logo. Os campos permanecem vazios quando não fornecidos.
7. Slug automático do Master parava na primeira letra do nome. Agora acompanha o nome até o usuário editar o slug manualmente.
8. Produto ativo de categoria inativa podia aparecer no catálogo geral. Agora é ocultado; produto sem categoria continua permitido.
9. Senhas fake sem consumidor ainda entravam nos mocks. Apenas os campos de senha foram removidos; mocks/fallbacks foram preservados e há teste de regressão.

## 6. Segurança

### Confirmado

- Nenhuma `SUPABASE_SERVICE_ROLE_KEY` no frontend ou bundle.
- `.env.local` não é versionado; somente nomes de variáveis foram auditados.
- URL e anon key são públicas por natureza e aparecem no bundle; nenhum valor foi reproduzido neste relatório.
- Nenhum `dangerouslySetInnerHTML`/`innerHTML` no código React auditado.
- Logs centrais removem PII/payload/tokens; eventos info são silenciosos em produção.
- Browser de produção chama a Edge Function; a string da RPC direta não aparece no bundle de produção.
- Storage valida tipo, extensão, tamanho, UUID, bucket, origem do projeto e estrutura do path.
- Carrinho não guarda nome/telefone/endereço; idempotency key fica em `sessionStorage` e não contém PII.

### Riscos restantes

| Severidade | Arquivo/área | Risco | Recomendação |
|---|---|---|---|
| Alto | ambiente Supabase | Não foi comprovado nesta auditoria que migrations 009–015, grants, owner e Edge publicados correspondem ao repositório | Executar diagnósticos e testes Loja A × Loja B em ambiente descartável/domínio |
| Alto | `package.json` | Sem lint, erros estáticos e regras React Hooks não são verificáveis | Adicionar ESLint em tarefa própria antes do redesign |
| Médio | `MasterSettings.jsx`, `usePediData.js` | Identidade/textos da plataforma ainda são locais e não se propagam entre navegadores | Migrar em etapa explícita; não misturar com redesign |
| Médio | mutações Admin por ID | Algumas mutações usam apenas ID do registro e confiam no RLS para tenant isolation | Manter RLS como barreira e adicionar testes de integração reais; considerar filtro defensivo quando o contrato permitir |
| Médio | Auth Supabase | Sessão do SDK persiste no navegador, logo XSS continua sendo o principal risco de token | Manter ausência de HTML inseguro, CSP/headers e dependências atualizadas |
| Baixo | rate limit IP | VPN/CGNAT pode agrupar clientes; forwarded IP depende da garantia do gateway | Monitorar 429 e validar headers no ambiente Edge |

## 7. Legado e mocks

| Item | Classificação | Motivo |
|---|---|---|
| `mockStores.js` / `mockOrders.js` | Remover depois de validação | Ainda alimentam `storage.js` e fallback sem Supabase |
| campos de senha fake | Pode remover agora — concluído | Não tinham consumidor e não são autenticação válida |
| fallback master por env | Ainda necessário, opcional | Limitado por `import.meta.env.DEV`; não funciona em produção |
| localStorage do banco legado | Remover depois de validação | Landing/MasterSettings/fallback ainda dependem dele |
| `usePediData` | Ainda necessário | Landing, MasterCreateStore e MasterSettings ainda usam plataforma local |
| fallback local de lojas/catálogo | Remover depois de validação | Fluxos migrados usam modo estrito, mas ambiente sem Supabase ainda depende do facade |
| fallback local de pedidos | Dúvida/legado | `createOrder` local só ocorre sem client; produção Edge não cai nele |
| QR/pagamento visual fake | Ainda necessário até integração comercial autorizada | Não representa pagamento real e está documentado |
| assets WebP próprios | Ainda necessários | Todos possuem referência comprovada |
| exports locais `getDatabase/updatePlatformSettings/getPlans/updatePlan` em `database.js` | Pode remover depois de busca/validação final | Não há consumidor direto identificado, mas pertencem ao facade legado |

## 8. Testes manuais obrigatórios no domínio

1. Confirmar Edge publicada, origins e `ORDER_ALLOW_LOCALHOST=false`.
2. Executar auditorias das migrations 009–015 e confirmar RPC somente para `service_role` após 015.
3. Criar pedido delivery e pickup com adicionais; conferir quatro tabelas, total e snapshots.
4. Repetir mesma idempotency key e confirmar um pedido.
5. Provocar 429 controlado e conferir `Retry-After`, sem PII no log.
6. Login Loja A/Loja B: leitura e mutação cruzadas devem falhar; master deve ver ambas.
7. Alterar status no Admin e confirmar tracking em outra sessão.
8. Validar START/PRO/PREMIUM contra `feature_flags` remotos.
9. Upload/recorte/substituição/rollback de logo, banner e produto; conferir paths e ausência de órfãos.
10. Navegação direta/reload de todas as rotas na Vercel.

## 9. Testes manuais no localhost

1. Não chamar Edge remota quando localhost estiver bloqueado; usar mocks ou `supabase functions serve` com ambiente local.
2. Loja com imagem e sem imagem, categoria ativa/inativa e produto sem categoria.
3. Modal com toque, obrigatório, mínimo/máximo, grátis/pago, quantidade e observação.
4. Carrinho persistido, reload e troca de loja.
5. Checkout vazio, mínimo, endereço, retry e erro preservando carrinho.
6. Responsividade atual apenas para detectar regressões; nenhuma decisão visual deve ser tomada nesta auditoria.

## 10. Impacto na futura reformulação visual

- Preservar os contratos de `StorePage`, `ProductModal`, `useCart`, `CheckoutPage` e `OrderTrackingPage`; os testes agora funcionam como rede de segurança.
- Não acoplar o novo design a `usePediData`/plataforma local; essa dívida precisa de migração separada.
- Manter estados loading/error/empty/inativo e acessibilidade de labels/botões.
- Não mover cálculo autoritativo para o navegador; RPC permanece fonte de valores e validações.
- Manter imagens opcionais: o redesign não pode pressupor banner/logo/produto existentes.

## 11. Gate recomendado

Antes de autorizar a implementação da nova UX:

1. Configurar e zerar erros críticos de lint.
2. Executar o checklist remoto acima e anexar os resultados dos diagnósticos SQL/Edge.
3. Confirmar que a migration 015 e o frontend Edge estão implantados de forma coordenada.

Com esses três itens aprovados, a base funcional pode ser considerada pronta para a reformulação visual.

## 12. Continuação dos gates técnicos — 17/07/2026

- ESLint flat foi configurado para JavaScript/JSX, browser, Vitest e Node; TypeScript/Deno da Edge permanece fora desse parser incompatível.
- `npm run lint` passa com zero erros e 12 warnings `exhaustive-deps` em loaders legados. Os warnings ficaram visíveis porque sua correção correta exige refatorar ciclos de carregamento, fora desta etapa.
- Os 120 testes, cobertura e build continuam aprovados.
- Foi criado `supabase/diagnostics/pre_ux_remote_validation.sql`, somente leitura, e `SUPABASE_PRE_UX_VALIDATION.md` para execução manual.
- Status atualizado: **aprovado para validação remota**, ainda não aprovado para iniciar a nova UX até analisar as evidências reais de RLS/Edge/Storage e isolamento.

## 13. Resultado do gate remoto — 17/07/2026

- O diagnóstico consolidado `supabase/diagnostics/pre_ux_remote_summary.sql` foi executado manualmente no Supabase e retornou `PRE_UX_REMOTE_GATE = PASS`.
- O inventário `supabase/diagnostics/function_inventory.sql` confirmou as seis assinaturas críticas esperadas; falsos negativos da primeira versão do resumo foram corrigidos pela resolução canônica com `to_regprocedure` e OID.
- Nenhuma função, migration, policy ou dado foi alterado pelos diagnósticos, que permanecem somente leitura.
- Com lint, testes, build e gate remoto aprovados, o projeto está liberado para planejar a UX/UI V2. Testes funcionais de domínio, isolamento entre lojas, uploads e rate limit continuam obrigatórios antes de produção.
