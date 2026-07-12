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

O teste anonimo retornou leitura vazia e bloqueou INSERT com PostgreSQL `42501`; nenhuma categoria temporaria foi criada. `AdminCategories` ainda nao usa essas funcoes porque o admin da loja continua fake/local. Nao configure bypass: a proxima etapa correta e criar Auth real para admins, vincula-los a `store_users` e somente entao integrar a tela e executar CRUD por loja. Produtos continuam pendentes.
