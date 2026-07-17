# Auditoria de producao - Sprint 1

Data: 2026-07-13

Escopo: arquitetura React, autenticacao, adapters, Supabase/RLS, banco, desempenho, UX e limpeza. A auditoria foi estatica sobre o repositorio e as migrations locais; nao substitui a verificacao das policies e funcoes efetivamente instaladas no projeto remoto.

## Resumo executivo

- O isolamento administrativo por tenant esta bem encaminhado: `AdminRouter` resolve a loja por Supabase Auth e `store_users`, e as telas administrativas recebem esse objeto em vez de aceitar UUID pela URL.
- As entidades operacionais migradas usam adapters Supabase-first. Nesta auditoria, o fallback foi corrigido para nao mascarar erros de RLS, FK, schema ou validacao.
- Ha um bloqueador critico antes de producao: as policies do schema ainda autorizam `INSERT` anonimo direto nas quatro tabelas de pedidos, permitindo contornar a RPC validada.
- O painel master ainda mistura lojas remotas com pedidos/configuracoes comerciais locais em algumas telas.
- Testes automatizados e lint ainda não existem; paginação e divisão de bundle por rota foram implementadas nas Sprints seguintes.

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

### A1 - regras obrigatorias de adicionais existem apenas na UI (corrigido localmente; aplicacao remota pendente)

- Arquivo: `supabase/migrations/007_orders.sql` (linhas 66-90 e 113-159).
- Problema: a RPC valida opcao ativa e vinculo com produto, mas nao valida grupo obrigatorio nem `min_choices`/`max_choices` por grupo.
- Impacto: uma chamada direta pode criar pedido que a interface impediria.
- Correcao: criada `010_validate_order_additionals.sql`. A RPC valida, antes de qualquer INSERT, grupo/opcao ativos e do mesmo tenant, grupo vinculado ao produto, correspondencia `groupId`/`optionId`, duplicidade, required/min/max e selecao unica. O teste transacional `010_validate_order_additionals_test.sql` cobre A-J e termina em ROLLBACK. Aplicacao e teste remoto permanecem pendentes.

### A2 - entitlement de plano e fonte comercial sao client-side/locais (entitlements corrigidos localmente)

- Arquivos: `src/App.jsx`, `src/components/admin/PlanGuard.jsx`, `src/hooks/usePediData.js`, `src/pages/CheckoutPage.jsx`, `src/pages/MasterSettings.jsx`.
- Problema: `platform` e regras por plano ainda vem do snapshot local; guards e checkout sao controles de interface, nao autorizacao no banco.
- Impacto: localStorage adulterado ou chamada direta pode liberar recurso comercial sem o plano devido; configuracoes do master nao sao compartilhadas.
- Correcao: migration 012 centraliza entitlements em `plans.feature_flags`, expoe leitura normalizada por loja e aplica `saved_orders`, `order_tracking` e `online_payment` nas RPCs/policies. Frontend usa o mesmo conjunto canonico. Precos e disponibilidade comercial continuam separados e nao foram alterados.

### A3 - pedidos globais do master ainda sao locais (corrigido localmente)

- Arquivos: `src/pages/MasterDashboard.jsx`, `src/pages/MasterOrders.jsx`, `src/pages/MasterStores.jsx`, `src/hooks/usePediData.js`.
- Problema: essas telas usam `usePediData().orders`, que continua vindo de `storage.js`.
- Impacto: metricas, faturamento e listagem global podem estar vazios ou divergentes dos pedidos reais.
- Correcao: `MasterDashboard`, `MasterOrders` e as metricas de `MasterStores` passaram a usar consultas globais estritas no adapter. Nao ha merge/fallback local; RLS com `can_access_store`/`is_master` continua sendo a fronteira. Paginacao permanece na pendencia A5.

### A4 - RPC publica sem protecao de abuso e limites globais (parcialmente corrigido; rate limit externo pendente)

- Arquivo: `supabase/migrations/007_orders.sql`.
- Problema original: nao havia idempotencia, limites globais de itens/textos/JSON nem rate limit/captcha.
- Impacto: spam de pedidos/clientes, crescimento de banco e custo operacional.
- Correcao: migration 011 adiciona UUID idempotente unico por loja, advisory lock, indice unico e limites de payload/textos/itens/opcoes/quantidade. O frontend reutiliza a chave por fingerprint do carrinho em sessionStorage. Rate limit real por IP/usuario continua pendente para Edge Function, Vercel ou gateway.

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

### M2 - bundle monolitico e assets pesados - resolvido na Sprint 2.3

- Arquivos: `src/App.jsx`, `vite.config.js`, `src/assets/*.png`.
- Problema: todas as rotas sao importadas de forma eager; tres PNGs possuem aproximadamente 1,5 MB, 2,0 MB e 2,4 MB.
- Impacto: download e parse iniciais desnecessarios, sobretudo em rede movel.
- Correcao sugerida: `React.lazy` por area/rota e conversao responsiva para WebP/AVIF com dimensoes adequadas.
- Correção aplicada: 18 páginas e routers Admin/Master usam lazy loading; chunk inicial caiu de 595,15 kB para 198,01 kB e o aviso de 500 kB desapareceu.
- Assets corrigidos: três PNGs (5.963,75 kB) foram substituídos por WebP dimensionados (256,98 kB), preservando prioridade das imagens de LCP.
- Dependência isolada: `react-easy-crop` ficou em chunk assíncrono de 29,69 kB, usado apenas nas telas de imagem.

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
- Bundle JS principal apos a 011: 539,04 kB minificado / 151,16 kB gzip; Vite emitiu alerta acima de 500 kB.
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

### Validacao da migration 010

- A funcao conserva a identidade de sete parametros, owner postgres, SECURITY DEFINER, `search_path=public` e EXECUTE para anon/authenticated.
- Todos os erros de adicionais usam SQLSTATE controlado `23514` e acontecem na fase anterior ao primeiro INSERT.
- O teste rollback-only cria fixtures isoladas e cobre obrigatorio, min, max, single, duplicidade, mismatch, vinculo, grupo/opcao inativos, pedidos validos, quantidade > 1 e ausencia de registros parciais.
- A estrutura local e o build passaram; os notices PASS do teste so podem ser confirmados depois de executar 010 no Supabase.

### Validacao da migration 011

- Migration e frontend usam a nova identidade `(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)`; o overload publico antigo e removido.
- O teste rollback-only cobre mesma chave, lojas diferentes, chaves diferentes, todos os limites, pedido valido e ausencia de linhas parciais.
- Diagnostico verifica coluna UUID, indice unico parcial, owner/SECURITY DEFINER/search_path, grants da funcao publica e bloqueio da implementacao privada.
- Build/checks locais passaram; idempotencia concorrente e notices A-K dependem da execucao remota da 011.

### Validacao do painel Master remoto

- `MasterDashboard` carrega lojas, planos e pedidos reais, calculando pedidos/faturamento de hoje, andamento, plano mais usado e pedidos recentes.
- `MasterOrders` carrega pedidos de todas as lojas ao montar e no botao Atualizar; loading, erro e vazio nao usam snapshots locais.
- `MasterStores` usa pedidos e planos remotos para as metricas de cada loja.
- As consultas globais nao possuem fallback: client ausente, RLS, schema ou consulta falha geram erro de tela.
- Policies atuais usam `can_access_store`, que inclui `is_master`; usuario comum permanece limitado ao proprio tenant.
- Build, `node --check` e `git diff --check` passaram. Validacao funcional no Supabase com master e duas lojas permanece manual.

## Notas

- Arquitetura: 6,5/10
- Seguranca: 5,5/10
- Performance: 6,0/10
- UX: 7,0/10
- Organizacao do codigo: 6,5/10

O projeto nao deve ser considerado pronto para producao antes de aplicar/validar a 009 no ambiente remoto, adicionar testes automatizados dos fluxos criticos, retirar dados operacionais locais do master, impor entitlement no servidor e introduzir paginacao/controles de abuso.

## Sprint 2.1 - imagens no Supabase Storage

- Migration 013 cria/configura somente `store-assets` e `product-images` como buckets publicos de leitura, com 5 MB e MIME JPG/PNG/WEBP.
- O primeiro segmento e sempre `store_id`; policies authenticated usam `can_access_store`, incluindo master, e nao criam escrita anonima.
- O cliente valida arquivo, extensao, bucket, origem e formato completo do path antes de upload/exclusao.
- Substituicao e compensatoria: URL nova so substitui a antiga depois do banco confirmar; falha de banco remove o upload novo; URL externa nunca e removida.
- Risco remoto: qualquer policy permissiva antiga para os mesmos buckets seria combinada por OR. O diagnostico 013 lista todas as policies que citam os buckets e deve ser revisado antes do teste multi-loja.

## Correção de identidade visual - 2026-07-14

- Corrigido problema de UX em que StoreHeader renderizava o valor textual de `store.logo`, inclusive URLs completas.
- Logo, banner e iniciais agora seguem campos semânticos independentes; fallback de imagem quebrada não expõe a URL ao público.
- Não houve mudança de banco, policies, buckets ou regras de plano. Build e diff check passaram; matriz visual/upload permanece para validação manual.

## Recorte de imagens - 2026-07-14

- Uploads de logo, banner e produto agora exigem confirmação do recorte antes de substituir a imagem anterior.
- Processamento é local, limitado em dimensão e novamente validado em tamanho/MIME antes do Storage; original não é enviado após confirmação.
- Object URLs possuem cleanup e cancelamento preserva o estado anterior. Build passou; interação mobile, EXIF e publicação real aguardam teste manual autenticado.

## Confirmação de URLs de assets - 2026-07-14

- Eliminado sucesso não confirmado no salvamento de logo/banner: resposta RPC e releitura remota são comparadas às URLs esperadas.
- Schema remoto auditado em leitura pública: logo usa `stores.logo`; tentativa de `stores.logo_url` retorna 42703. Banner usa `stores.banner_url`.
- Erros Supabase completos ficam disponíveis apenas em DEV e falhas preservam a compensação de uploads.
- Nenhuma migration, policy ou bucket foi alterado; teste de escrita autenticada permanece manual.

## Follow-up: lojas-demo

- A Landing usava `usePediData` e preferia o mock `neguinhodoacai`; agora exemplos vêm de consulta Supabase estrita por `active/is_demo/demo_featured`.
- A auditoria encontrou credenciais fake e dois pedidos mockados; ambos permanecem até validação, sem serem copiados para Auth ou para os seeds.
- Os 18 produtos dos dois mocks repetiam o banner da loja. Como não existem imagens específicas, os seeds não propagam essa referência e preservam qualquer `image_url` já existente.
- Escrita dos novos metadados permanece master-only; anon e Admin de loja não podem se promover a demo/destaque.
- Pendências manuais: executar migration/seeds, testar RLS e isolamento, criar Admins, migrar imagens ao Storage e só então remover mocks.

## Follow-up: testes automatizados

- A ausência de suíte/CI foi parcialmente resolvida com 71 testes em 11 arquivos e workflow sem secrets.
- Regras críticas puras e quatro páginas possuem cobertura útil; utils atingiram 83,16% de statements e `useCart`, 86,95%.
- Cobertura global inicial é 35,11% de statements e não bloqueia o CI por percentual nesta primeira etapa.
- RLS, grants, RPCs e Storage continuam sem teste de integração real; mocks validam contrato e fallback, não a instalação remota.
- Auth, routers, dashboards e CRUDs administrativos restantes continuam como expansão prioritária.

## Follow-up: proteção contra abuso

- A falta de rate limit ganhou implementação preparada na Edge com storage privado e limites 10/min, 30/10min e 5 falhas por loja/chave.
- Migration 015 fecha o bypass por EXECUTE direto; ela ainda precisa ser aplicada e validada manualmente.
- Logs frontend foram centralizados e sanitizados; produção não imprime payload, telefone, endereço, Pix, token ou mensagem interna.
- IP puro não é persistido. Risco residual: clientes atrás de VPN/CGNAT podem compartilhar identidade e exigem monitoramento de 429.
- Sentry continua opcional e não configurado; logger possui adapter para integração futura.
- O teste local posterior corrigiu dois avisos de baixo risco: `img src=""` em produtos sem imagem e eventos informativos classificados como `UNKNOWN_ERROR`.

## Auditoria complementar pré-UX — 17/07/2026

- Os bloqueadores críticos anteriormente tratados continuam preservados nos arquivos: escrita anônima direta fechada pela 009 e criação pública mediada pela Edge após a 015.
- Foram ampliados testes de Auth, Storage, pedidos, dashboards e componentes críticos, totalizando 120 testes em 20 arquivos.
- Não houve validação remota nesta rodada; grants, RLS, Edge, secrets e rate limit continuam como gate manual de produção.
- O projeto não possui `npm run lint`; criar essa configuração é pendência de qualidade antes da aprovação definitiva.
- Evidências, riscos e checklist completos estão em `AUDIT_PEDICAMPOS_PRE_UX_2026-07-17.md`.

### Continuação do gate pré-UX

- Lint configurado e aprovado com zero erros; 12 warnings de dependências de loaders permanecem visíveis e documentados.
- Diagnóstico Supabase consolidado e somente leitura preparado, sem execução remota.
- Status: aprovado para validação remota; nova UX aguarda as evidências do ambiente instalado.
