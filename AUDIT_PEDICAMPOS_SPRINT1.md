# Auditoria de producao - Sprint 1

Data: 2026-07-13

Escopo: arquitetura React, autenticacao, adapters, Supabase/RLS, banco, desempenho, UX e limpeza. A auditoria foi estatica sobre o repositorio e as migrations locais; nao substitui a verificacao das policies e funcoes efetivamente instaladas no projeto remoto.

## Resumo executivo

- O isolamento administrativo por tenant esta bem encaminhado: `AdminRouter` resolve a loja por Supabase Auth e `store_users`, e as telas administrativas recebem esse objeto em vez de aceitar UUID pela URL.
- As entidades operacionais migradas usam adapters Supabase-first. Nesta auditoria, o fallback foi corrigido para nao mascarar erros de RLS, FK, schema ou validacao.
- Ha um bloqueador critico antes de producao: as policies do schema ainda autorizam `INSERT` anonimo direto nas quatro tabelas de pedidos, permitindo contornar a RPC validada.
- O painel master ainda mistura lojas remotas com pedidos/configuracoes comerciais locais em algumas telas.
- Nao existem testes automatizados, lint, paginacao nem divisao de bundle por rota.

## Correcoes automaticas aplicadas

### ALTO - fallback mascarava erros remotos

- Arquivo: `src/services/database.js`.
- Problema: CRUD de lojas, configuracoes, pagamentos, categorias, produtos e adicionais usava fallback local para qualquer erro Supabase.
- Impacto: uma violacao de RLS/FK ou erro de schema podia parecer sucesso local sem persistir no banco.
- Correcao: essas operacoes agora usam `useLocalForConnectionFailure`; somente ausencia de client ou erro real de transporte chega ao storage. Erros com codigo Postgres/PostgREST sao propagados.

### ALTO - associacao de plano alterava apenas localStorage

- Arquivo: `src/pages/MasterPlans.jsx`.
- Problema: a tela importava `updateStore` diretamente de `storage.js`.
- Impacto: o plano exibido no Supabase e no dominio nao era alterado.
- Correcao: a tela usa o adapter assincrono de `database.js`, bloqueia envio duplicado e informa sucesso/erro. A selecao inicial tambem acompanha o carregamento remoto das lojas.

### ALTO - README publicava acessos fake obsoletos

- Arquivo: `README.md`.
- Problema: o guia ainda apresentava e-mails demo e senha `123456` como acessos atuais.
- Impacto: orientacao insegura e incompatibilidade com Supabase Auth real.
- Correcao: removidas as credenciais fixas do guia; o acesso agora referencia Supabase Auth/`store_users` e explicita que o fallback fake e somente DEV com flag.

## CRITICO

### C1 - escrita anonima direta contorna `create_public_order` (corrigido localmente; aplicacao remota pendente)

- Arquivo: `supabase/schema.sql` (policies de `customers`, `orders`, `order_items` e `order_item_additionals`, linhas 805-878).
- Problema: `anon` pode executar `INSERT` diretamente nessas tabelas. As policies conferem tenant/relacoes, mas nao obrigam precos, totais, status e snapshots a passarem pela RPC.
- Impacto: um cliente pode forjar total, status, nomes/precos de itens e gerar spam/PII fora das validacoes atomicas da funcao.
- Correcao: criada a migration idempotente `009_lock_direct_order_writes.sql`. Ela remove as quatro policies publicas, revoga todos os privilegios de tabela de `PUBLIC`/`anon`, preserva CRUD de `authenticated` sob RLS e reafirma as duas RPCs endurecidas. O diagnostico `009_lock_direct_order_writes_audit.sql` valida os catalogos depois da aplicacao. O bloqueador so pode ser considerado encerrado no ambiente remoto apos executar e testar a 009.

## ALTO

### A1 - regras obrigatorias de adicionais existem apenas na UI

- Arquivo: `supabase/migrations/007_orders.sql` (linhas 66-90 e 113-159).
- Problema: a RPC valida opcao ativa e vinculo com produto, mas nao valida grupo obrigatorio nem `min_choices`/`max_choices` por grupo.
- Impacto: uma chamada direta pode criar pedido que a interface impediria.
- Correcao sugerida: validar contagem por grupo dentro da RPC em migration incremental e cobrir com testes SQL.

### A2 - entitlement de plano e fonte comercial sao client-side/locais

- Arquivos: `src/App.jsx`, `src/components/admin/PlanGuard.jsx`, `src/hooks/usePediData.js`, `src/pages/CheckoutPage.jsx`, `src/pages/MasterSettings.jsx`.
- Problema: `platform` e regras por plano ainda vem do snapshot local; guards e checkout sao controles de interface, nao autorizacao no banco.
- Impacto: localStorage adulterado ou chamada direta pode liberar recurso comercial sem o plano devido; configuracoes do master nao sao compartilhadas.
- Correcao sugerida: migrar leitura/escrita de `platform_settings`/`plans` e aplicar regras comerciais relevantes na fronteira server-side. Exige decisao de negocio e banco, portanto nao foi alterado.

### A3 - pedidos globais do master ainda sao locais

- Arquivos: `src/pages/MasterDashboard.jsx`, `src/pages/MasterOrders.jsx`, `src/pages/MasterStores.jsx`, `src/hooks/usePediData.js`.
- Problema: essas telas usam `usePediData().orders`, que continua vindo de `storage.js`.
- Impacto: metricas, faturamento e listagem global podem estar vazios ou divergentes dos pedidos reais.
- Correcao sugerida: criar uma consulta master paginada no adapter/RPC e remover o snapshot local dessas telas. Evitar uma consulta por loja.

### A4 - RPC publica sem protecao de abuso e limites globais

- Arquivo: `supabase/migrations/007_orders.sql`.
- Problema: nao ha rate limit/captcha; quantidade por item e limitada, mas quantidade de itens, tamanho de textos/JSON e frequencia de chamadas nao possuem limite explicito.
- Impacto: spam de pedidos/clientes, crescimento de banco e custo operacional.
- Correcao sugerida: limite no edge/backend, limites de payload e validacoes de tamanho no servidor.

### A5 - consultas administrativas sem paginacao

- Arquivo: `src/services/database.js` (`getOrdersByStore`).
- Problema: carrega todos os pedidos, depois usa listas `.in(...)` para clientes, itens e adicionais.
- Impacto: URL/payload grande, maior memoria e latencia; pode falhar conforme o historico cresce.
- Correcao sugerida: paginacao por `created_at/id`, consulta relacional ou RPC paginada e indices compostos alinhados aos filtros.

### A6 - bootstrap de master contem identidade real

- Arquivo: `supabase/migrations/002_master_auth.sql` (linhas 50-63).
- Problema: UUID e e-mail especificos do primeiro master ficaram gravados na migration, apesar do comentario pedir placeholder.
- Impacto: PII no repositorio e migration nao portavel para outro ambiente.
- Correcao sugerida: retirar dados especificos do artefato versionado e manter procedimento parametrizado/manual. Nao alterado por ser migration ja aplicada e fora do escopo autorizado.

### A7 - ausencia de testes automatizados e lint

- Arquivo: `package.json`.
- Problema: so existem scripts de dev/build/preview.
- Impacto: regressao de tenant, checkout, adapters e status depende integralmente de teste manual.
- Correcao sugerida: testes unitarios para conversores/status, integracao Supabase local para RLS/RPC e E2E para login-catalogo-checkout-admin; adicionar lint/CI.

## MEDIO

### M1 - multiplas instancias de `usePediData`

- Arquivos: `src/App.jsx` e paginas que chamam `usePediData`.
- Problema: cada chamada cria estado, subscription local e potencial `getStores()` proprio.
- Impacto: consultas repetidas e snapshots independentes.
- Correcao sugerida: provider unico ou hooks especificos por dominio; retirar `orders/platform` do facade legado gradualmente.

### M2 - bundle monolitico e assets pesados

- Arquivos: `src/App.jsx`, `vite.config.js`, `src/assets/*.png`.
- Problema: todas as rotas sao importadas de forma eager; tres PNGs possuem aproximadamente 1,5 MB, 2,0 MB e 2,4 MB.
- Impacto: download e parse iniciais desnecessarios, sobretudo em rede movel.
- Correcao sugerida: `React.lazy` por area/rota e conversao responsiva para WebP/AVIF com dimensoes adequadas.

### M3 - constraints de dominio incompletas

- Arquivo: `supabase/schema.sql`.
- Problema: faltam checks para valores monetarios nao negativos, `min_choices <= max_choices`, modos de servico e varios status; nomes/telefones/textos nao possuem limites.
- Impacto: dados invalidos podem entrar fora do frontend e ampliar payloads.
- Correcao sugerida: inventariar dados existentes e adicionar constraints incrementais seguras antes do go-live.

### M4 - colunas JSON publicas podem receber dados inadequados

- Arquivo: `supabase/schema.sql` (`store_settings.extra`, `payment_methods.provider_config`).
- Problema: as linhas sao publicamente legiveis para lojas ativas; comentarios proibem segredos, mas o schema nao separa configuracao publica de interna.
- Impacto: uma integracao futura pode expor credenciais por engano.
- Correcao sugerida: view/funcao com colunas publicas e tabela privada separada para qualquer credencial.

### M5 - tracking depende de bearer token sem expiracao

- Arquivos: `supabase/migrations/007_orders.sql`, `src/pages/OrderTrackingPage.jsx`.
- Problema: quem possuir token e slug le o snapshot publico do pedido, sem expiracao/revogacao.
- Impacto: vazamento do link permite acesso persistente a dados do pedido.
- Correcao sugerida: politica de retencao/expiracao, resposta minima e cuidado para nao registrar tokens em analytics/logs.

### M6 - erros de autorizacao sao apresentados como logout

- Arquivo: `src/App.jsx` (`AdminRouter`).
- Problema: falha de rede/RLS ao resolver membership e convertida em `store: null` e mostra login.
- Impacto: diagnostico ruim e usuario pode pensar que a senha/sessao expirou.
- Correcao sugerida: estado separado de erro/retry sem revelar detalhes sensiveis.

### M7 - master sem estados completos de carregamento/erro/vazio

- Arquivos: `src/pages/MasterDashboard.jsx`, `src/pages/MasterOrders.jsx`, `src/pages/MasterSettings.jsx`.
- Problema: dados locais/fixos podem renderizar zeros/tabelas vazias sem indicar origem ou falha.
- Impacto: decisao administrativa baseada em informacao incorreta.
- Correcao sugerida: integrar fontes remotas e padronizar loading/error/empty quando essas entidades forem migradas.

## BAIXO

### B1 - facade de dados concentra responsabilidades

- Arquivo: `src/services/database.js` (aproximadamente 39 KB).
- Problema: adapters de todos os dominios, fallback, RPC e operacoes locais estao no mesmo modulo.
- Impacto: maior acoplamento e revisoes mais arriscadas.
- Correcao sugerida: separar por dominio sem mudar a API publica quando a migracao estabilizar.

### B2 - exports e codigo de compatibilidade sem consumidores

- Arquivo: `src/services/database.js` (`deleteStore`, `updateOrderStatus`, helpers de platform/plans).
- Problema: alguns exports nao possuem chamadas atuais; mocks e senhas fake continuam no storage de desenvolvimento.
- Impacto: ruido e risco de reuso acidental.
- Correcao sugerida: marcar deprecacoes e remover apenas depois de cobertura/teste e fim do fallback. Nada foi removido nesta sprint.

### B3 - comentarios de arquitetura desatualizados

- Arquivos: `src/services/database.js`, `supabase/schema.sql`.
- Problema: comentarios ainda descrevem toda a integracao como futura e o login como fake.
- Impacto: manutencao confusa, sem impacto direto de execucao.
- Correcao sugerida: revisar comentarios junto da proxima consolidacao de schema.

## Pontos positivos confirmados

- Nao ha `service_role` no frontend; `.env.local` esta ignorado pelo Git.
- Master fake exige `DEV` e flag explicita; admin de loja usa Supabase Auth real.
- Admin nao recebe `store_id` pela URL/formulario: a raiz vem de `store_users` e resolucao estrita.
- StorePage e Checkout resolvem loja por slug remoto sem fallback local; o carrinho nao e fonte de autoridade do tenant.
- RLS esta habilitado no schema para todas as tabelas de tenant, com helpers de acesso e integridade entre loja/categoria/adicionais.
- Indices basicos por `store_id`, status ativo/ordem e pedidos por `(store_id, created_at desc)` ja existem.
- Catalogo publico usa consultas paralelas e filtra entidades ativas; listas remotas vazias nao recebem mocks.

## Validacao da sprint

- `npm run build`: passou (Vite 7.3.6, 126 modulos).
- Bundle JS principal: 537,52 kB minificado / 150,54 kB gzip; Vite emitiu alerta acima de 500 kB.
- Assets raster principais: 1.569,60 kB, 2.017,41 kB e 2.376,74 kB.
- `node --check`: passou em todos os arquivos `.js` sob `src`.
- `git diff --check`: passou; somente avisos de normalizacao LF/CRLF, sem erro de whitespace.
- Nao ha script de teste ou lint no `package.json`; nenhuma validacao remota destrutiva foi executada.

### Validacao da migration 009

- Estrutura local: passou para as quatro tabelas, quatro policies conhecidas, remocao dinamica de policies publicas equivalentes, grants authenticated e identidades exatas das RPCs.
- Build, checks JS e diff check: passaram depois da criacao da 009.
- A-D e F: o diagnostico pos-migration verifica privilegios efetivos de anon e ausencia de policy publica; execucao remota pendente.
- E e G: RPCs, owner, SECURITY DEFINER, search_path e EXECUTE foram preservados no SQL; checkout/tracking pos-migration pendentes.
- H e I: grants authenticated e policies tenant foram preservados; teste com sessoes Loja A/Loja B permanece pendente.
- Nao foi possivel executar a migration remotamente a partir do repositorio; nenhum resultado pos-009 e declarado antes da aplicacao no SQL Editor.

## Notas

- Arquitetura: 6,5/10
- Seguranca: 5,5/10
- Performance: 6,0/10
- UX: 7,0/10
- Organizacao do codigo: 6,5/10

O projeto nao deve ser considerado pronto para producao antes de aplicar/validar a 009 no ambiente remoto, adicionar testes automatizados dos fluxos criticos, retirar dados operacionais locais do master, impor entitlement no servidor e introduzir paginacao/controles de abuso.
