# PediCampos Supabase

Esta pasta guarda os arquivos iniciais da migracao do PediCampos para Supabase.

Nesta etapa, o React ainda nao foi conectado ao Supabase. O app continua usando `localStorage` por baixo de `src/services/database.js`.

## Estado atual em 2026-07-12

- Projeto Supabase criado com nome `pedicampos`.
- Regiao escolhida: Oeste dos EUA (Oregon) / `us-west-2`.
- URL visivel no painel: `https://tkoo...supabase.co`.
- `supabase/schema.sql` ja foi executado no SQL Editor do Supabase.
- Retorno recebido: `Sucesso. Nenhuma linha retornada.`.
- Esse retorno e esperado para criacao de tabelas, funcoes, triggers, RLS e policies.
- As 15 tabelas foram conferidas no Table Editor.
- `@supabase/supabase-js` foi instalado.
- `src/services/supabaseClient.js` foi criado.
- `.env.example` foi criado com as variaveis esperadas.
- `.env.local` deve guardar as chaves reais e esta protegido no `.gitignore`.
- O client Supabase ja existe no React, mas ainda nao migra dados.
- Nenhuma loja foi migrada para o banco real ainda.
- `storage.js`, mocks e `localStorage` continuam preservados.
- `npm run build` passou apos atualizar as memorias com este estado.

### Adapter de lojas

`src/services/database.js` tenta Supabase primeiro nas seis operacoes de lojas e converte somente as colunas reais de `public.stores`. Configuracoes operacionais em `store_settings`, formas de pagamento e entidades de catalogo ainda nao sao migradas.

Se o client estiver ausente ou uma operacao falhar, o adapter usa `storage.js`. Se a consulta Supabase for bem-sucedida e retornar zero lojas, o resultado e vazio e mocks nao sao misturados.

Teste de 2026-07-12: leitura anonima passou e encontrou zero lojas. A tentativa de criar `teste-supabase-1783864386108` foi recusada com `42501 permission denied for table stores`; portanto esse registro nao foi criado e nao precisa ser removido. As policies atuais exigem master autenticado para insert e usuario autorizado para update. Enquanto Auth e a integracao assincroma das telas nao forem concluídos, local e dominio ainda nao compartilham lojas criadas pelas telas.

## Como executar o SQL

Este SQL ja foi executado no projeto `pedicampos`. Use os passos abaixo apenas se for recriar o schema em um ambiente limpo ou repetir manualmente a operacao com cuidado.

1. Abra o projeto `pedicampos` no painel do Supabase.
2. Acesse `SQL Editor`.
3. Crie uma nova query.
4. Copie todo o conteudo de `supabase/schema.sql`.
5. Cole no SQL Editor.
6. Clique em `Run`.

O script cria as tabelas, indices, triggers de `updated_at`, ativa RLS e cria politicas iniciais temporarias para desenvolvimento.

## Como conferir se as tabelas foram criadas

Depois de rodar o SQL:

1. Va em `Table Editor`.
2. Confira se existem estas tabelas:
   - `platform_settings`
   - `plans`
   - `stores`
   - `store_users`
   - `store_settings`
   - `categories`
   - `products`
   - `additional_groups`
   - `additional_options`
   - `additional_group_products`
   - `customers`
   - `orders`
   - `order_items`
   - `order_item_additionals`
   - `payment_methods`
3. Abra algumas tabelas e confirme que `RLS enabled` esta ativo.
4. Em `Authentication > Policies`, confira as policies criadas.
5. Confira tambem indices e triggers de `updated_at`.

Tambem e possivel conferir pelo SQL Editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'platform_settings',
    'plans',
    'stores',
    'store_users',
    'store_settings',
    'categories',
    'products',
    'additional_groups',
    'additional_options',
    'additional_group_products',
    'customers',
    'orders',
    'order_items',
    'order_item_additionals',
    'payment_methods'
  )
order by table_name;
```

## Variaveis de ambiente

O arquivo `.env.example` documenta:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Crie um `.env.local` local, fora do Git, com os valores reais:

```txt
VITE_SUPABASE_URL=https://tkoo...supabase.co
VITE_SUPABASE_ANON_KEY=
```

Enquanto a camada `database.js` nao for migrada, o app continua usando o adapter local atual.

Nunca usar a senha do banco no React. A `anon public key` pode ir no frontend, desde que RLS e policies estejam protegendo os dados.

## Proxima etapa tecnica

1. Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` reais.
2. Testar conexao basica Supabase com `src/services/supabaseClient.js`.
3. Conferir RLS, policies, indices e triggers de `updated_at`, se ainda nao tiver sido validado item por item.
4. Manter `database.js` com `storage.js/localStorage` como fallback.
5. Depois migrar primeiro `getStores()`, `getStoreBySlug()`, `createStore()` e `updateStore()`.

## Observacoes importantes

- Este SQL nao popula dados demo.
- Este SQL nao migra dados para o React.
- Este SQL nao remove mocks nem `localStorage`.
- Admin/master real com Supabase Auth ainda fica para uma etapa posterior.
- As policies permitem leitura publica apenas de catalogo ativo.
- Pedidos podem ser criados publicamente, mas dados de clientes e pedidos nao ficam publicamente legiveis por padrao.
- Para acompanhamento publico de pedido em producao, a recomendacao e criar uma RPC ou Edge Function segura em etapa posterior.

## Criar e autorizar o primeiro master

1. No Supabase, abra `Authentication > Users`.
2. Use `Add user` para criar o e-mail do master com uma senha forte.
3. Marque/confirme o usuario para permitir login por senha.
4. Copie o UUID exibido para o usuario criado.
5. Abra `supabase/migrations/002_master_auth.sql`.
6. Substitua todas as ocorrencias de `00000000-0000-0000-0000-000000000000` pelo UUID copiado.
7. Substitua todas as ocorrencias de `master@example.com` pelo e-mail criado.
8. Execute o arquivo completo no SQL Editor.
9. Confira em `store_users` uma linha com `store_id = null`, o UUID correto, `role = master` e `active = true`.

Nao coloque service role, senha do banco ou senha do usuario no frontend. A migration registra somente UUID e e-mail; a senha permanece no Supabase Auth.

Depois da migration, lojas ativas continuam publicamente legiveis. INSERT, UPDATE/desativacao e DELETE de `stores` exigem role `authenticated` e `public.is_master()`. `platform_settings` e `plans` continuam publicamente legiveis nos limites atuais, mas somente master pode administra-los. `store_users` permite a cada autenticado ler a propria autorizacao e ao master administrar registros.

O fallback fake e opcional somente no servidor Vite de desenvolvimento. Para usa-lo, configure localmente `VITE_ENABLE_FAKE_MASTER_AUTH=true`, `VITE_DEV_MASTER_EMAIL` e `VITE_DEV_MASTER_PASSWORD`. Nao configure essas variaveis na Vercel. Esse fallback nao gera JWT e nao permite writes no Supabase.

O master ja foi autorizado e as telas de lojas foram conectadas ao adapter assincrono. Admins das lojas continuam pendentes.

## Telas master de lojas conectadas

`MasterCreateStore` e `MasterStores` agora usam as funcoes assincronas Supabase-first de `database.js`. Criacao, listagem, edicao, ativacao e desativacao usam a sessao Auth atual e respeitam RLS. Quando Supabase responde com sucesso, a tela nao grava uma segunda copia local. Se o client estiver ausente ou o adapter receber erro, o fallback local existente continua disponivel.

Lojas gravadas remotamente sao compartilhadas entre desenvolvimento local e dominio porque ambos consultam `public.stores`. A listagem consulta novamente depois de cada operacao. Nao ha Supabase Realtime: `subscribeDatabase` observa somente localStorage.

Para validar, crie uma loja descartavel com slug `teste-supabase-[timestamp]`, confira no Table Editor, edite o nome, desative e confirme `active = false`. Depois remova o registro manualmente apenas se nao quiser mante-lo. A proxima entidade planejada e categorias; produtos, adicionais e pedidos ainda nao foram migrados.

## Migration 003 - carga inicial de planos

A tabela `plans` estava vazia. Como `stores.plan_key` referencia `plans.key`, os planos precisam existir antes do primeiro cadastro remoto de loja.

Execute `supabase/migrations/003_seed_plans.sql` no SQL Editor. O arquivo insere:

- `start`: Start, R$ 99,99/mes, ativo;
- `pro`: Pro, R$ 179,99/mes, ativo;
- `premium`: Premium, R$ 199,99/mes, ativo.

A migration usa `on conflict (key) do nothing`. Ela pode ser executada novamente sem duplicar linhas e sem sobrescrever precos ou outros dados ja existentes. Alteracoes comerciais futuras devem ser feitas pelo painel master.

Depois da execucao, confirme os tres registros no Table Editor e repita o teste de criacao, edicao e desativacao de uma loja temporaria.

## Loja publica por slug

A rota `/:slug` agora consulta `getStoreBySlug` no adapter Supabase-first. Uma loja ativa cadastrada em `public.stores` pode abrir tanto localmente quanto no dominio. Enquanto categorias e produtos nao forem migrados, a pagina abre com cardapio vazio e mostra `Nenhum produto disponível no momento.`

Uma consulta bem-sucedida sem linha mostra loja nao encontrada e nao injeta mocks. Se Supabase estiver indisponivel ou retornar erro, o fallback local existente permanece.

A policy publica atual permite ler apenas `active = true`. Por seguranca, uma loja remota inativa nao e exposta ao role anon e aparece como nao encontrada. A mensagem especifica de indisponibilidade e usada quando uma linha inativa e retornada em contexto autorizado ou pelo fallback local. Categorias sao a proxima entidade planejada.

## Categorias Supabase

As funcoes de categorias em `database.js` agora consultam e gravam `public.categories` primeiro. O formato relacional usa `store_id` e `sort_order`; o frontend continua recebendo `storeId` e `order`. Uma lista remota vazia nao recebe categorias mock/local automaticamente.

Nenhuma migration adicional foi necessaria. As policies existentes permitem leitura publica somente de categorias ativas pertencentes a lojas ativas e permitem escrita somente ao master ou usuario autenticado ativo vinculado a mesma loja em `store_users`.

O teste anonimo retornou leitura vazia e bloqueou INSERT com PostgreSQL `42501`; nenhuma categoria temporaria foi criada. Depois da validacao do Auth real, `AdminCategories` foi conectado a essas funcoes. Produtos continuam pendentes.

## Criar um usuario de loja

1. Em `Authentication > Users`, use `Add user`.
2. Informe o e-mail do usuario, uma senha forte e deixe o usuario confirmado.
3. Copie o UUID do usuario Auth.
4. Copie o UUID da loja em `Table Editor > stores`.
5. No SQL Editor, execute substituindo os tres valores:

```sql
insert into public.store_users (store_id, auth_user_id, email, role, active)
values (
  'UUID_DA_LOJA'::uuid,
  'UUID_DO_USUARIO_AUTH'::uuid,
  'email@da-loja.com',
  'store_admin',
  true
)
on conflict (store_id, auth_user_id)
do update set email = excluded.email, role = excluded.role, active = true;
```

As roles de loja aceitas pelo schema atual sao `store_admin` e `store_staff`. Nao use `master` para um admin de loja. O frontend nao cria usuarios nem recebe service role.

O login `/admin` valida a sessao e o vinculo ativo. IDs salvos manualmente no navegador nao alteram a loja autorizada. Multiplos vinculos sao suportados pela camada, mas a interface usa o primeiro por ordem de criacao ate existir uma tela de selecao. Nao ha fallback fake para admin.

Depois do vinculo, teste login, refresh, logout, usuario sem vinculo, usuario inativo e tentativa de acesso a outra loja. Categorias, produtos, adicionais e pedidos ja usam adapters Supabase-first.

## AdminCategories conectado ao adapter

A rota autenticada resolve a loja pelo vinculo ativo em `store_users` e entrega esse objeto a `AdminCategories`. A tela usa somente esse `store.id`; nao existe campo, URL ou chave local capaz de escolher outro `store_id`.

Listagem, criacao, edicao, ativacao/inativacao, exclusao e ordenacao chamam as funcoes Supabase-first e recarregam a lista. Sucesso remoto nao gera copia local paralela; erros Supabase continuam sujeitos ao fallback interno existente.

Valide com uma categoria temporaria: crie, edite nome/status, reordene, exclua e acompanhe cada mudanca no Table Editor. Depois use um usuario ligado a outra loja e confirme que `can_access_store` impede alteracoes cruzadas. Produtos foram conectados na etapa seguinte.

## Produtos Supabase e migration 004

`AdminProducts` agora usa o CRUD Supabase-first e carrega as categorias da loja autenticada. O formulario nao aceita `store_id`; usa exclusivamente o `store.id` resolvido pelo Auth. Imagens continuam sendo URL/string em `image_url`, sem upload real.

Antes de testar, execute `supabase/migrations/004_product_category_store.sql` no SQL Editor. O trigger idempotente valida que `category_id`, quando informado, pertence ao mesmo `store_id` do produto. Categoria de outra loja e rejeitada com erro PostgreSQL `23514`; RLS continua bloqueando writes de usuarios nao vinculados.

Depois teste criacao, edicao de nome/preco/categoria, status e exclusao no Table Editor. Teste tambem Loja A x Loja B e categoria cruzada. Os vinculos de adicionais sao mantidos na tabela relacional propria e os pedidos usam snapshots.

## Adicionais Supabase e migration 005

Execute `supabase/migrations/005_additionals_integrity.sql` antes de usar a tela. A migration cria validacoes para que opcoes, grupos, produtos e links pertençam ao mesmo `store_id`, alem da RPC atomica `save_additional_group`.

A RPC e `security invoker`, concedida somente a `authenticated`, e continua obedecendo RLS/can_access_store. Ela salva grupo, opcoes e vinculos na mesma transacao. A constraint unica e a deduplicacao do adapter impedem repetir o mesmo vinculo grupo-produto.

`AdminAdditionals` agora carrega grupos e produtos remotos. Preco `0` aparece como Gratis; valores positivos sao mantidos em `numeric(10,2)`. Para validar, crie um grupo com opcao gratis e paga, vincule a produto, edite/status/exclua e confira `additional_groups`, `additional_options` e `additional_group_products`.

Teste tambem produto de outra loja e confirme erro `23514` ou bloqueio RLS. Pedidos continuam pendentes. A proxima etapa recomendada e migrar `store_settings` e `payment_methods` antes de checkout/pedidos.

## Configuracoes da loja e formas de pagamento

Execute `supabase/migrations/006_store_settings.sql` antes de salvar pelo admin. A RPC permite ao usuario vinculado alterar nome, slug, segmento, open, visual e WhatsApp, mas nao permite modificar `plan_key` nem `active`.

Dados ficam separados assim:

- `stores`: identidade/visual, WhatsApp e aberto/fechado;
- `store_settings`: endereco, horario, tempo, taxa, minimo, chave Pix, entrega/retirada e instrucoes;
- `payment_methods`: Pix, dinheiro e cartao ativos, apenas como configuracao.

AdminSettings usa upserts por `store_id`. StorePage e CheckoutPage leem esses dados remotamente; sem linha, aplicam defaults controlados. O checkout respeita taxa, minimo, entrega/retirada e metodos ativos, mas nao cria cobranca real nem pedido Supabase.

Teste alteracoes no admin e confira `stores`, `store_settings` e `payment_methods`. Depois abra loja/checkout e valide os reflexos. Escrita anonima permaneceu bloqueada com `42501`. A proxima etapa e pedidos.

## Pedidos Supabase e migration 007

Execute `supabase/migrations/007_orders.sql` antes de testar. Ela adiciona token UUID publico, desconto, indice e duas RPCs:

- `create_public_order`: valida e cria cliente/pedido/itens/adicionais atomicamente;
- `get_public_order`: retorna somente o pedido identificado por token UUID + slug.

O checkout nao envia precos confiaveis para persistencia. A RPC consulta produtos, opcoes, vinculos, taxa e minimo no banco; calcula subtotal/total e salva snapshots. Nao existe policy de SELECT geral para anon.

Teste retirada, entrega, Pix, cartao, dinheiro e adicionais gratis/pagos. Confira `customers`, `orders`, `order_items` e `order_item_additionals`; abra o acompanhamento e atualize status no admin. Tente produto/opcao de outra loja e adulteracao de totais. Pagamento real e WhatsApp Cloud API continuam pendentes.

## Catalogo da loja publica

StorePage agora carrega, em paralelo, categorias, produtos e adicionais depois de resolver a loja por slug. O conversor de `stores` continua retornando arrays vazios por padrao, mas a pagina os substitui pelas consultas relacionais.

Somente registros ativos e links para produtos ativos sao exibidos. Produtos sem categoria continuam visiveis no grid geral. A leitura anon real confirmou acesso ao catalogo sem erro de RLS, portanto nenhuma migration adicional foi necessaria.

Valide o catalogo no dominio antes de continuar os testes da migration 007 de pedidos.

## Diagnostico de pedidos ausentes no admin

O adapter nao converte mais erros de RLS, RPC, schema, FK ou validacao em pedidos locais. Somente falha real de conexao ou client nao configurado usa o fallback. A listagem administrativa hidrata clientes, itens e adicionais em consultas separadas, todas limitadas ao `store_id` autorizado.

No Table Editor, confira `customers`, `orders`, `order_items` e `order_item_additionals`. Em `orders`, valide `store_id`, `public_token`, `order_status`, `payment_status` e `created_at`, comparando o `store_id` com o vinculo ativo em `store_users`. Nenhuma nova migration foi necessaria; SELECT geral para anon continua bloqueado.

## Migration 008 - create_public_order

Execute `supabase/migrations/008_public_order_rpc_permissions.sql` depois da 007. Ela corrige `42501 permission denied for table customers` causado pelo `INSERT ... RETURNING` sob `SECURITY INVOKER`.

A RPC passa a ser definer com `search_path` fixo e EXECUTE apenas para anon/authenticated. Nao conceda o SELECT sugerido pelo hint do Postgres: customers e orders devem continuar sem leitura anonima direta. Depois execute um pedido e confira atomicamente as quatro tabelas; se falhar, o console de desenvolvimento mostra `code`, `message`, `details` e `hint`.

### Auditoria da funcao remota

Execute `supabase/diagnostics/create_public_order_audit.sql` no SQL Editor para listar todas as assinaturas, `prosecdef`, owner, `proconfig`, definicao e grants. A API anonima nao possui acesso a pg_proc.

A chamada direta apos a 008 criou `80EE5827` com sucesso. Se o checkout ainda falhar, compare no console DEV o code/message/details/hint e o resumo de store, modalidade, metodo, produto, quantidade e option IDs. Remova o pedido temporario depois da conferencia.

### Store ID enviado pelo checkout

O checkout nao aceita mais uma loja retornada pelo fallback local para criar pedido remoto. Ele resolve o slug estritamente no Supabase e repete a consulta antes de chamar a RPC. O ID do carrinho serve apenas para detectar divergencia e nunca vira `p_store_id`.

Se houver carrinho de outra loja, ele e limpo e o cliente deve adicionar os produtos novamente. A RPC continua sendo a validacao final de produto, opcao, vinculo e precos. Nenhuma migration adicional foi criada.

StorePage tambem exige resolucao remota antes de criar o carrinho. Carrinhos novos sao salvos como `{ storeId, items }`, com o UUID remoto no envelope e nos itens. Logs DEV permitem comparar StorePage, localStorage e Checkout sem expor dados pessoais.

### Lojas legadas no navegador

Quando Supabase esta configurado, lojas remotas sao a unica fonte das areas migradas. O banco local ainda existe para fallback/domínios pendentes, mas suas lojas nao sao publicadas pelo facade nem mescladas com resultados remotos.

Na primeira lista/resolucao remota, `pedicampos.localMigration.supabaseStoresV1` registra a limpeza. Apenas uma loja local com slug remoto igual e ID diferente e removida, junto de `pedicampos.cart.<id-local>`. Lojas e carrinhos sem colisao permanecem. Resposta remota vazia nunca recebe mocks.

### ID de store_settings no frontend

A PK `store_settings.id` e convertida para `settingsId`; a FK permanece `storeId`. Ao hidratar uma loja, `id` sempre significa `stores.id`. Isso evita que spreads de configuracao troquem o tenant enviado a consultas e RPCs. Nao existe alteracao de schema para esta correcao.

### Dashboard e pedidos do admin

AdminDashboard consulta pedidos e produtos da loja autenticada ao abrir. AdminOrders consulta pedidos ao abrir e depois de atualizar status. Ambas as telas possuem Atualizar manual; nao foi habilitado Realtime ou polling.

Novos pedidos aparecem ao recarregar, navegar novamente para a rota ou clicar em Atualizar. As policies continuam limitando os dados ao `store_id` autorizado.

### Status por fulfillment

O frontend usa `orders.fulfillment`: `delivery` mostra “Saiu para entrega” e `pickup` mostra “Pronto para retirada”. A mesma funcao alimenta timeline e botoes do admin.

Pedidos pickup antigos com `out_for_delivery`/“Saiu para entrega” sao apresentados como prontos para retirada. O valor historico nao e modificado no banco.

## Auditoria de producao - Sprint 1

O relatorio `AUDIT_PEDICAMPOS_SPRINT1.md` identificou um bloqueador: o schema base ainda possui policies de INSERT para anon em customers, orders, order_items e order_item_additionals. Como a migration 008 torna a RPC SECURITY DEFINER, a escrita publica direta nao e necessaria e permite contornar validacoes/totais da funcao.

Nenhuma policy foi alterada nesta sprint. Antes do go-live, crie e revise uma migration incremental que remova somente a via de INSERT direto para anon, mantenha RLS e preserve EXECUTE em `create_public_order`. Valide tambem required/min/max de adicionais dentro da RPC, rate limit/limites de payload e a configuracao remota real de grants/owner/search_path.

No frontend, adapters migrados agora propagam RLS/FK/schema/validacao e so usam storage em falha real de transporte ou client ausente. Isso evita sucesso local falso.

### Migration 009 - RPC como unica escrita publica

Execute `supabase/migrations/009_lock_direct_order_writes.sql` depois da 008. Ela remove os grants/policies que permitiam INSERT anonimo direto nas quatro tabelas do pedido. Nao conceda privilegios de tabela novamente ao anon.

Depois execute `supabase/diagnostics/009_lock_direct_order_writes_audit.sql`. As tres mensagens PASS confirmam ausencia de privilegios/policies publicos e endurecimento das RPCs. Em seguida teste checkout, tracking, admin da mesma loja e isolamento com outra loja. A migration preserva os grants de authenticated, mas o acesso continua limitado pelas policies RLS existentes.

O diagnostico de catalogo cobre A-D/F sem criar dados: sem privilegio efetivo de tabela, o papel anon falha antes mesmo da avaliacao RLS. E/G/H/I exigem o teste funcional no projeto remoto depois da 009; nao os considere aprovados apenas porque o arquivo local foi criado.

### Migration 010 - regras de grupos de adicionais

Execute `supabase/migrations/010_validate_order_additionals.sql` depois da 009. Ela mantem a assinatura do frontend e passa a rejeitar no banco opcao duplicada, grupo incorreto/nao vinculado/inativo, opcao inativa, minimo obrigatorio, maximo e mais de uma opcao em grupo single.

Depois rode `supabase/diagnostics/010_validate_order_additionals_test.sql`. O script cria uma loja/catalogo de teste dentro de uma transacao, imprime PASS para A-J e executa ROLLBACK. Confira que nenhuma fixture `teste-rpc-add-*` permaneceu caso a execucao seja interrompida; uma transacao abortada tambem deve ser revertida antes de reutilizar a sessao SQL.

### Migration 011 - idempotencia e limites

Execute `supabase/migrations/011_order_idempotency_and_limits.sql` depois da 010. A RPC passa a exigir `p_idempotency_key uuid`; coordene a aplicacao com o deploy do frontend porque o overload publico antigo e removido deliberadamente.

Limites: 50 itens, quantidade de 1 a 100, 30 opcoes por item, nota do item 500 chars, nota geral 1000, nome 120, telefone 32, endereco 8192 bytes e payload total 262144 bytes. Excesso retorna SQLSTATE 23514.

Rode `supabase/diagnostics/011_order_idempotency_audit.sql` e depois `011_order_idempotency_and_limits_test.sql`. O segundo cria duas lojas efemeras, cobre A-K e termina em ROLLBACK. Rate limit por IP/usuario deve ser implementado futuramente no edge/gateway; nao use cabecalhos de proxy nao confiaveis dentro do PostgreSQL.

### Leitura global do painel Master

MasterDashboard, MasterOrders e as metricas de MasterStores consultam diretamente stores, plans e snapshots de pedidos. Nao ha fallback para localStorage nessas consultas: qualquer falha de client, RLS ou schema aparece como erro controlado.

Nenhuma policy nova foi necessaria. As policies authenticated das tabelas de pedidos usam `can_access_store(store_id)`; essa funcao permite todas as lojas somente ao papel de aplicacao reconhecido por `is_master()`. Admins comuns continuam vendo apenas o tenant vinculado em `store_users`.

As telas recarregam ao montar e pelo botao Atualizar. Realtime e paginacao nao fazem parte desta etapa e continuam pendentes para volume de producao.

### Migration 012 - entitlements reais

Execute `supabase/migrations/012_plan_entitlements.sql` depois da 011. Ela usa `plans.feature_flags` sem alterar precos ou desativar Start, Pro ou Premium.

O banco passa a decidir recursos por `store_has_feature`: pedidos persistidos exigem `saved_orders`, acompanhamento exige `order_tracking`, snapshots administrativos exigem o entitlement da loja e `online_enabled` exige `online_payment`. O frontend le o mesmo conjunto por `get_store_entitlements`.

Depois execute `supabase/diagnostics/012_plan_entitlements_audit.sql` e `012_plan_entitlements_test.sql`. O teste cria uma loja efemera, valida os tres mapas e troca Start para Pro dentro de uma transacao finalizada com ROLLBACK.

Para ocultar Start de novas vendas no futuro, nao use `active=false`: adicione uma coluna comercial como `available_for_new_stores`. Precos promocionais e implantacao isenta devem ficar em tabela futura por loja, preservando `plans.price` como valor oficial.

### Migration 013 - imagens no Storage

Execute `supabase/migrations/013_storage_images.sql`. Ela cria/configura `store-assets` e `product-images` com leitura publica, 5 MB e apenas JPEG/PNG/WEBP. Nenhum papel anon recebe policy de escrita.

Os objetos devem seguir exatamente:

- `store-assets/{storeId}/logo/{nome-unico}`
- `store-assets/{storeId}/banner/{nome-unico}`
- `product-images/{storeId}/{productId}/{nome-unico}`

Policies authenticated extraem o primeiro segmento e chamam `can_access_store`; master continua autorizado pela mesma funcao. Rode `013_storage_images_audit.sql` e confirme que nao existe policy antiga permissiva para os mesmos buckets. Depois rode o checklist e os testes Loja A/Loja B no navegador.

URLs externas antigas permanecem suportadas. O frontend so remove uma imagem quando reconhece origem, bucket e path PediCampos e sempre depois de a nova URL ter sido salva. Nao coloque `service_role` em variavel `VITE_`.

### Logo, banner e iniciais

Logo usa `stores.logo`; banner usa `stores.banner_url`. Iniciais não são URLs e ficam em `store_settings.extra.fallbackInitials`, sem migration adicional. URLs externas e URLs públicas dos buckets da migration 013 continuam aceitas. Uma logo ausente ou inválida cai para as iniciais configuradas ou derivadas do nome da loja.

### Recorte antes do Storage

Uploads da galeria passam por recorte obrigatório no navegador. As saídas são logo 512x512, banner 1600x900 e produto 800x800; somente o arquivo final é enviado aos mesmos buckets/paths da migration 013. JPEG/WEBP usam qualidade 0,88, PNG mantém transparência e a validação de MIME/extensão/5 MB é repetida após o canvas. Nenhuma policy adicional é necessária.

### Persistência de URLs da loja

A coluna da logo é `public.stores.logo`; não existe `stores.logo_url`. Banner usa `public.stores.banner_url`. A RPC da migration 006 recebe `p_logo` e `p_banner_url`, retorna a linha atualizada e o frontend exige que os valores retornados coincidam com as URLs enviadas antes de mostrar sucesso ou excluir os objetos anteriores.
### Paginação do frontend

As listagens administrativas usam páginas de 20 registros. As consultas principais executam `.select(..., { count: "exact" })`, ordenação determinística e `.range(from, to)`, retornando dados e metadados na mesma requisição.

Admin filtra sempre pelo `store_id` obtido da sessão; Master depende das policies de master e não usa fallback local. Nenhuma migration é necessária para a Sprint 2.2. Consultas auxiliares de detalhes usam apenas os IDs da página corrente, não conjuntos globais.

### Loja-demo Brasa House Burger

O arquivo `seeds/lojateste_demo_catalog.sql` é um seed opcional e não deve ser adicionado à sequência de migrations. No SQL Editor do projeto correto, execute o arquivo completo; ele aborta se o slug `lojateste` não existir e nunca exige um UUID de loja hardcoded.

Depois execute `diagnostics/lojateste_demo_catalog_audit.sql`. O resultado mostra a loja, totais de categorias/produtos/grupos/opções/vínculos/pedidos-demo, produtos por categoria e pedidos por status.

O conjunto esperado em uma loja sem colisões é: 6 categorias, 29 produtos, 5 grupos, 20 opções, 56 vínculos, 22 clientes fictícios, 22 pedidos, 22 itens e 33 adicionais de item. Registros manuais homônimos são preservados, portanto alguns podem ser reutilizados em vez de criados.

Para remover a massa controlada, execute `diagnostics/lojateste_demo_catalog_cleanup.sql`. Ele limita todas as operações ao tenant resolvido por slug, aos UUIDs determinísticos do namespace `lojateste_demo_v1` e, para pedidos, também a `source = demo_seed` e `metadata.demoSeed`. O nome/perfil comercial e valores aplicados a registros de configuração pré-existentes não são revertidos automaticamente.

#### Imagens específicas dos produtos-demo

O catálogo não reutiliza mais logo ou banner em produtos. Novos registros ficam com `image_url` nula e reexecuções preservam qualquer URL já existente. Ao executar o mapa, uma cópia legada exatamente igual à logo/banner pode ser limpa para `null`; nenhuma imagem manual é limpa.

Para completar as imagens, envie cada WEBP ao path `product-images/{storeId}/{productId}/{arquivo-unico}.webp`, copie a URL pública e preencha a linha correspondente em `seeds/lojateste_demo_product_images.sql`. O mapa contém `replace_existing`, que deve continuar `false` salvo quando a substituição de uma imagem manual tiver sido confirmada.

Execute primeiro `diagnostics/lojateste_demo_product_images_audit.sql`, depois o seed de imagens preenchido e então repita o audit. O seed rejeita URL duplicada, produto ausente, bucket/path incorreto e sobrescrita manual não confirmada. Ele atualiza somente `products.image_url`.

### Sprint 2.3 - impacto no Supabase

A divisão de bundle e a otimização dos assets locais não alteram schema, RLS, migrations, RPCs, buckets ou paths do Storage. `database.js` e o client Supabase são carregados sob demanda pelas rotas/efeitos que precisam deles; seus contratos e regras de fallback permanecem iguais.

Não execute SQL para esta Sprint. Imagens de lojas e produtos enviadas aos buckets continuam inalteradas.

### Lojas-demo reais

Consulte `DEMO_STORES.md` para ordem de execução e validação. A migration `014_demo_stores.sql` deve preceder os seeds opcionais. Os scripts não foram executados remotamente, não criam Auth/store_users e não modificam automaticamente a Brasa House.

Os diagnósticos são somente leitura. Os cleanups removem apenas IDs determinísticos de catálogo, mantêm tenant/configuração/usuários e abortam se um produto do seed ganhou imagem manual. O inventário de imagens explica as referências locais temporárias e a migração futura ao Storage.

### Testes automatizados

A Sprint 2.4 não executa Supabase real. `database.test.js` usa um client mockado para verificar contratos, fonte remota vazia, isolamento do `storeId` e diferenciação entre falha de rede e erros RLS/schema. Consulte `../TESTING.md` para a seção “Testes de integração Supabase pendentes”. Nenhuma chave ou secret é necessário no CI.
