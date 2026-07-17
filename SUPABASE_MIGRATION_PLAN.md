# SUPABASE_MIGRATION_PLAN - PediCampos

Atualizado em: 2026-07-11

Este documento registra a primeira entrega da mudanca de direcao do PediCampos: sair gradualmente de uma persistencia local baseada em mocks/localStorage e preparar o projeto para persistencia real online, com Supabase como banco alvo.

## Visao geral

Objetivo da migracao:

- Fazer tudo que for criado no master/admin refletir online em `pedicampos.com.br`.
- Permitir que lojas, produtos, categorias, adicionais, pedidos e configuracoes sejam compartilhados entre dispositivos.
- Manter o projeto atual funcionando durante a transicao.
- Manter localStorage e mocks temporariamente como fallback.
- Evitar uma refatoracao grande de uma vez.
- Criar uma camada de acesso a dados antes de trocar as telas para Supabase.

Decisao tecnica desta etapa:

- Supabase sera o banco alvo.
- O projeto Supabase `pedicampos` ja foi criado.
- Regiao escolhida: Oeste dos EUA (Oregon) / `us-west-2`.
- URL visivel no painel: `https://tkoo...supabase.co`.
- `localStorage` continua temporariamente como fallback.
- `src/data/mockStores.js` e `src/data/mockOrders.js` continuam existindo ate a migracao estar validada.
- Nenhuma tela deve passar a depender diretamente do SDK do Supabase.
- A primeira camada de service foi criada em `src/services/database.js`.
- `src/services/database.js` funciona como fachada/adapter temporario e ainda usa `src/services/storage.js` por baixo.
- `@supabase/supabase-js` foi instalado.
- `src/services/supabaseClient.js` foi criado.
- `src/services/supabaseClient.js` le `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Se as variaveis nao existirem, o client exporta `null` e nao quebra o app.
- `.env.example` foi criado.
- `.env.local` esta protegido no `.gitignore` e deve guardar as chaves reais.
- Supabase ainda nao esta migrando dados.
- `database.js` continua usando `storage.js/localStorage` como fallback real.
- O arquivo `supabase/schema.sql` foi criado para execucao manual no SQL Editor.
- O arquivo `supabase/README.md` foi criado com instrucoes de execucao e conferencia.
- `supabase/schema.sql` ja foi executado no SQL Editor do Supabase.
- O retorno `Sucesso. Nenhuma linha retornada.` foi recebido e e correto para criacao de tabelas, funcoes, triggers, RLS e policies.
- As tabelas foram conferidas no Table Editor; RLS, policies, indices e triggers devem ser validados item por item se ainda nao tiverem sido conferidos.
- `src/hooks/usePediData.js` foi adaptado para consumir `database.js`.
- Nenhuma tela foi migrada diretamente para `database.js` nesta etapa.
- Teste pos-adaptacao do hook central foi realizado sem conectar Supabase real.
- Copy publica foi revisada para remover termos internos ou de simulacao das telas publicas.
- Projeto foi preparado para teste visual/manual local em `http://127.0.0.1:5174`.
- Teste visual/manual local encontrou pendencias visuais/mobile que devem ser corrigidas antes da conexao Supabase.
- O texto repetido de adicionais no acompanhamento do pedido foi corrigido em `src/pages/OrderTrackingPage.jsx`.
- O layout mobile dos controles de quantidade do carrinho foi ajustado em `src/styles/global.css`.
- O menu superior do admin mobile foi ajustado em `src/components/admin/AdminLayout.jsx` e `src/styles/global.css`.
- O scroll automatico ao editar produtos no admin foi ajustado em `src/pages/AdminProducts.jsx`.
- O scroll automatico ao editar adicionais no admin foi ajustado em `src/pages/AdminAdditionals.jsx`.
- Os cards/chips de adicionais no admin mobile foram revisados em `src/styles/global.css`.
- O ciclo de ajustes visuais/mobile registrado no teste manual foi concluido no codigo.
- Observacao: o layout do admin mobile ainda nao ficou exatamente como Rafael deseja, mas sera redesenhado futuramente; por enquanto a prioridade volta para Supabase.
- A proxima etapa correta e configurar `.env.local` e testar conexao basica Supabase sem migrar dados ainda.

## Pendencias visuais/mobile antes do Supabase

Registrado apos teste manual local em `http://127.0.0.1:5174`:

- Acompanhamento do pedido em desktop:
  - corrigido em `src/pages/OrderTrackingPage.jsx`;
  - adicionais renderizam com prefixo unico, por exemplo `Adicionais: Bacon extra + R$ 5,00, Cheddar + R$ 4,00`.
- Carrinho mobile:
  - corrigido em `src/styles/global.css`;
  - controles de quantidade ficam mais compactos em linha, no formato `[-] [quantidade] [+]`;
  - calculo e comportamento foram preservados.
- Menu superior do admin mobile:
  - corrigido em `src/components/admin/AdminLayout.jsx` e `src/styles/global.css`;
  - navegacao mobile mantida como barra horizontal rolavel, com trilho visual, melhor espacamento e links em formato de pilula;
  - desktop, rotas e logica foram preservados.
- Admin produtos mobile:
  - corrigido em `src/pages/AdminProducts.jsx`;
  - ao tocar em `Editar`, a tela rola suavemente ate o formulario de produto;
  - comportamento de criacao/edicao e desktop foram preservados.
- Admin adicionais mobile:
  - corrigido em `src/pages/AdminAdditionals.jsx`;
  - ao tocar em `Editar`, a tela rola suavemente ate o formulario de grupo/adicional;
  - comportamento de criacao/edicao, vinculos e opcoes foram preservados.
- Admin adicionais mobile:
  - corrigido em `src/styles/global.css`;
  - cards ganharam melhor espacamento;
  - chips/opcoes usam grade responsiva, com quebra de linha mais legivel.

Os ajustes visuais/mobile registrados foram concluidos no codigo. Um novo teste visual/local ainda e recomendado, mas nao bloqueia a proxima etapa tecnica de Supabase: configurar `.env.local` e testar a conexao basica sem migrar dados.

## Proximo objetivo real

Configurar `.env.local` com as chaves reais e testar a conexao basica Supabase sem migrar dados ainda.

Depois da conexao basica validada, migrar primeiro:

- `getStores()`
- `getStoreBySlug()`
- `createStore()`
- `updateStore()`

Durante essa etapa, `database.js` deve manter `storage.js/localStorage` como fallback. Supabase Auth, policies finais de master/admin e migracao das lojas ficam para etapas posteriores.

## Auditoria do estado atual

### Onde os dados sao carregados

- `src/hooks/usePediData.js`
  - chama `getDatabase()` de `src/services/database.js`;
  - assina atualizacoes com `subscribeDatabase()` de `src/services/database.js`;
  - expoe `database`, `stores`, `orders` e `platform` para as telas.
- `src/services/storage.js`
  - importa `initialStores` de `src/data/mockStores.js`;
  - importa `initialOrders` de `src/data/mockOrders.js`;
  - cria o banco inicial com `createInitialDatabase()`;
  - le `pedicampos.database.v1` do `localStorage`;
  - normaliza dados antigos ao carregar.
- `src/App.jsx`
  - le `pedicampos.admin.auth`, `pedicampos.admin.storeId` e `pedicampos.master.auth` direto do `localStorage`.
- `src/hooks/useCart.js`
  - le carrinho por loja na chave `pedicampos.cart.${storeId}`.

### Onde os dados sao salvos

- `src/services/storage.js`
  - `saveDatabase(nextDatabase)` grava `pedicampos.database.v1`;
  - `mutateDatabase(mutator)` clona, altera e salva o banco;
  - `updateStore(storeId, updater)` altera loja;
  - `createOrder(order)` cria pedido;
  - `updateOrder(orderId, updater)` altera pedido;
  - `updatePlatform(updater)` altera configuracoes da plataforma.
- `src/hooks/useCart.js`
  - grava carrinho por loja em `pedicampos.cart.${storeId}`.
- `src/pages/AdminLogin.jsx`
  - grava sessao fake admin.
- `src/components/admin/AdminLayout.jsx`
  - troca loja selecionada e faz logout admin.
- `src/pages/MasterLogin.jsx`
  - grava sessao fake master.
- `src/components/master/MasterLayout.jsx`
  - remove sessao fake master no logout.

### Funcoes que dependem de localStorage

- `getDatabase()`
- `saveDatabase(nextDatabase)`
- `mutateDatabase(mutator)`
- `subscribeDatabase(callback)`
- `resetDatabase()`
- `updateStore(storeId, updater)`
- `createOrder(order)`
- `updateOrder(orderId, updater)`
- `updatePlatform(updater)`
- `useCart(storeId)`
- leitura de sessao fake em `App.jsx`, `AdminLogin.jsx`, `MasterLogin.jsx`, `AdminLayout.jsx` e `MasterLayout.jsx`.

### Arquivos que usam mocks

- `src/services/storage.js`
  - usa `initialStores`;
  - usa `initialOrders`;
  - usa mocks para inicializar o banco local.
- `src/pages/MasterCreateStore.jsx`
  - usa `createEmptyStore` de `src/data/mockStores.js`.
- `src/data/mockStores.js`
  - contem lojas iniciais, categorias, produtos e grupos de adicionais.
- `src/data/mockOrders.js`
  - contem pedidos iniciais.

### Telas que criam ou alteram dados

- `src/pages/MasterStores.jsx`
  - usa `updateStore`;
  - edita loja, slug, plano, WhatsApp, cor, logo, banner, taxa, tempo, endereco, ativa/aberta;
  - ativa/desativa loja.
- `src/pages/MasterCreateStore.jsx`
  - usa `createEmptyStore` e `mutateDatabase`;
  - cria nova loja.
- `src/pages/MasterSettings.jsx`
  - usa `updatePlatform`;
  - altera identidade, landing, secoes, FAQ, implantacao e planos.
- `src/pages/MasterPlans.jsx`
  - usa `updateStore`;
  - altera plano de uma loja.
- `src/pages/AdminProducts.jsx`
  - usa `updateStore`;
  - cria, edita, exclui, ativa/desativa produtos;
  - vincula grupos de adicionais a produtos.
- `src/pages/AdminCategories.jsx`
  - usa `updateStore`;
  - cria, edita, exclui e ordena categorias;
  - limpa `categoryId` de produtos quando categoria e excluida.
- `src/pages/AdminAdditionals.jsx`
  - usa `updateStore`;
  - cria, edita, exclui, ativa/desativa grupos de adicionais e opcoes.
- `src/pages/AdminSettings.jsx`
  - usa `updateStore`;
  - altera dados da loja, status aberta/ativa e formas de pagamento.
- `src/pages/AdminOrders.jsx`
  - usa `updateOrder`;
  - altera status do pedido;
  - confirma pagamento.
- `src/pages/CheckoutPage.jsx`
  - usa `createOrder`;
  - cria pedido para planos com checkout no site.

### Telas que leem dados criticos

- `src/pages/LandingPage.jsx`
- `src/pages/StorePage.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/pages/OrderTrackingPage.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/AdminOrders.jsx`
- `src/pages/MasterDashboard.jsx`
- `src/pages/MasterOrders.jsx`
- `src/pages/MasterStores.jsx`
- `src/pages/MasterPlans.jsx`
- `src/pages/MasterSettings.jsx`

### Dados que precisam ir para o banco real

- Configuracoes da plataforma.
- Planos e recursos por plano.
- Lojas.
- Usuarios de loja e roles.
- Configuracoes por loja.
- Metodos de pagamento por loja.
- Categorias.
- Produtos.
- Grupos de adicionais.
- Opcoes de adicionais.
- Vinculo entre grupos de adicionais e produtos.
- Clientes.
- Pedidos.
- Itens de pedido.
- Adicionais escolhidos por item.
- Status de pedido e pagamento.
- Futuramente: arquivos/imagens em Supabase Storage.

## Linguagem publica a revisar antes do uso real

Auditoria encontrou termos de simulacao em areas publicas/comerciais:

- `src/pages/LandingPage.jsx`
  - "Demonstracao real no mock";
  - "Loja demo";
  - "mock/localStorage".
- `src/pages/CheckoutPage.jsx`
  - "QR Code Pix simulado";
  - "Pix copia e cola ficticio";
  - "Pagamento com cartao simulado".

Regra para a proxima etapa de copy:

- Cliente final nao deve ver `mock`, `localStorage`, `simulado`, `ficticio`, `dados ficticios` ou nomes internos de plano/recurso.
- Area publica deve usar linguagem profissional: `Pix`, `Cartao`, `WhatsApp automatico`, `pedido online`, `pagamento online`, `acompanhamento do pedido`.
- Area interna/admin/master pode indicar "integracao em andamento" ou "recurso em preparacao" quando necessario.
- Documentacao tecnica deve continuar deixando claro que Pix real, WhatsApp Cloud API e Supabase ainda estao pendentes/em migracao.

## Schema SQL inicial para Supabase

Observacoes:

- O SQL pronto para execucao esta em `supabase/schema.sql`.
- Este schema e a primeira versao real para criar as tabelas no projeto Supabase `pedicampos`.
- O SQL ja foi executado no SQL Editor do Supabase.
- Retorno recebido: `Sucesso. Nenhuma linha retornada.`.
- Esse retorno e esperado porque o script cria estrutura e nao executa uma consulta com linhas de resultado.
- Proximo passo no painel: conferir Table Editor, RLS, policies, indices e triggers de `updated_at`.
- IDs usam `uuid`.
- `store_id` aparece em todo dado pertencente a uma loja.
- `stores.slug` deve ser unico.
- RLS deve ser habilitado antes de producao.
- A tabela `additional_group_products` e uma tabela ponte recomendada, mesmo nao existindo no modelo local atual, porque o vinculo grupo-produto e muitos-para-muitos.
- O React ainda nao foi conectado ao Supabase nesta etapa.
- `localStorage` e mocks continuam como fallback/estado real atual do app.

Tabelas esperadas no Table Editor:

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

```sql
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'default',
  name text not null default 'PediCampos',
  logo text,
  whatsapp text,
  email text,
  instagram text,
  primary_color text,
  secondary_color text,
  slogan text,
  subtitle text,
  hero_title text,
  hero_subtitle text,
  hero_primary_button text,
  hero_secondary_button text,
  implementation_price numeric(10,2) not null default 0,
  footer_text text,
  sections jsonb not null default '{}'::jsonb,
  feature_highlights jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  how_it_works_title text,
  how_it_works_text text,
  how_it_works_steps jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  price numeric(10,2) not null default 0,
  price_label text,
  description text,
  features jsonb not null default '[]'::jsonb,
  feature_flags jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  highlighted boolean not null default false,
  badge text,
  comparison_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.plans(id),
  name text not null,
  slug text not null unique,
  segment text,
  active boolean not null default true,
  open boolean not null default true,
  primary_color text,
  whatsapp text,
  email text,
  logo text,
  banner_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_users (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'store_admin' check (role in ('master', 'store_admin', 'store_staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, auth_user_id)
);

create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade unique,
  address text,
  opening_hours text,
  delivery_time text,
  delivery_fee numeric(10,2) not null default 0,
  pix_key text,
  minimum_order_value numeric(10,2) not null default 0,
  service_mode text not null default 'delivery_pickup',
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  type text not null check (type in ('pix', 'cash', 'card')),
  label text not null,
  active boolean not null default true,
  provider text,
  provider_config jsonb not null default '{}'::jsonb,
  manual boolean not null default true,
  online_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, type)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.additional_groups (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text,
  required boolean not null default false,
  min_choices integer not null default 0,
  max_choices integer not null default 0,
  selection_type text not null default 'multiple' check (selection_type in ('single', 'multiple')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.additional_group_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  additional_group_id uuid not null references public.additional_groups(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (additional_group_id, product_id)
);

create table public.additional_options (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  additional_group_id uuid not null references public.additional_groups(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  last_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  number text not null,
  fulfillment text not null default 'delivery' check (fulfillment in ('delivery', 'pickup')),
  address jsonb,
  notes text,
  payment_method text,
  payment_status text not null default 'Pendente',
  order_status text not null default 'Pedido recebido',
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  pix_code text,
  pix_key text,
  source text not null default 'site',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, number)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null default 0,
  quantity integer not null default 1,
  note text,
  image_url text,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.order_item_additionals (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  additional_group_id uuid references public.additional_groups(id) on delete set null,
  additional_option_id uuid references public.additional_options(id) on delete set null,
  group_name text,
  option_name text not null,
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create index idx_stores_slug on public.stores(slug);
create index idx_categories_store on public.categories(store_id);
create index idx_products_store on public.products(store_id);
create index idx_additional_groups_store on public.additional_groups(store_id);
create index idx_additional_options_group on public.additional_options(additional_group_id);
create index idx_orders_store_created on public.orders(store_id, created_at desc);
create index idx_order_items_order on public.order_items(order_id);
create index idx_order_item_additionals_item on public.order_item_additionals(order_item_id);

create trigger trg_platform_settings_updated_at before update on public.platform_settings for each row execute function public.set_updated_at();
create trigger trg_plans_updated_at before update on public.plans for each row execute function public.set_updated_at();
create trigger trg_stores_updated_at before update on public.stores for each row execute function public.set_updated_at();
create trigger trg_store_users_updated_at before update on public.store_users for each row execute function public.set_updated_at();
create trigger trg_store_settings_updated_at before update on public.store_settings for each row execute function public.set_updated_at();
create trigger trg_payment_methods_updated_at before update on public.payment_methods for each row execute function public.set_updated_at();
create trigger trg_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger trg_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger trg_additional_groups_updated_at before update on public.additional_groups for each row execute function public.set_updated_at();
create trigger trg_additional_options_updated_at before update on public.additional_options for each row execute function public.set_updated_at();
create trigger trg_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger trg_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
```

## Regras de acesso recomendadas

Conceito:

- Usuario master acessa todas as lojas.
- Usuario de loja acessa apenas a loja em que existe registro ativo em `store_users`.
- Cliente final acessa somente leitura publica de loja ativa, categorias ativas, produtos ativos e adicionais ativos.
- Criacao de pedido publico deve ser feita por endpoint/RPC segura ou policy controlada.

Exemplo conceitual de helpers:

```sql
create or replace function public.is_master()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.store_users su
    where su.auth_user_id = auth.uid()
      and su.role = 'master'
      and su.active = true
  );
$$;

create or replace function public.can_access_store(target_store_id uuid)
returns boolean
language sql
security definer
as $$
  select public.is_master()
    or exists (
      select 1
      from public.store_users su
      where su.auth_user_id = auth.uid()
        and su.store_id = target_store_id
        and su.active = true
    );
$$;
```

RLS deve ser implementado tabela por tabela depois do schema inicial, com testes especificos para:

- master ver tudo;
- admin da loja ver apenas sua loja;
- admin da loja nao alterar dados de outra loja;
- publico ler apenas lojas ativas;
- checkout criar pedido sem expor dados de outras lojas.

## Service alvo

Arquivo criado nesta etapa:

- `src/services/database.js`

API inicial exposta:

```js
getDatabase()
subscribeDatabase(callback)
getStores()
getStoreBySlug(slug)
getStoreById(id)
createStore(data)
updateStore(id, data)
deactivateStore(id)
deleteStore(id)
getProductsByStore(storeId)
createProduct(storeId, data)
updateProduct(productId, data)
deleteProduct(productId)
getCategoriesByStore(storeId)
createCategory(storeId, data)
updateCategory(categoryId, data)
deleteCategory(categoryId)
getAdditionalGroupsByStore(storeId)
createAdditionalGroup(storeId, data)
updateAdditionalGroup(groupId, data)
deleteAdditionalGroup(groupId)
getOrdersByStore(storeId)
getOrderById(orderId)
createOrder(storeId, data)
updateOrder(orderId, data)
updateOrderStatus(orderId, status)
getPlatformSettings()
updatePlatformSettings(data)
getPlans()
updatePlan(planId, data)
```

Primeira versao segura:

- As funcoes acima chamam `src/services/storage.js` por baixo.
- O objetivo inicial e trocar as telas para um contrato de dados estavel sem mudar a origem real dos dados.
- Depois, cada funcao pode ganhar uma implementacao Supabase preservando assinatura e formato retornado.

## Ordem segura de implementacao

1. Manter o app atual funcionando com localStorage e mocks.
2. `src/services/database.js` foi criado usando `storage.js` por baixo como fallback.
3. `src/hooks/usePediData.js` foi migrado para a fachada local.
4. Rotas principais e fluxo critico foram testados novamente apos a troca do hook central.
5. Copy publica foi revisada para remover termos internos ou de simulacao.
6. Projeto foi preparado para teste visual/manual local com `npm run dev` em `http://127.0.0.1:5174`.
7. Teste visual/manual local foi realizado em navegador real.
8. Pendencias visuais/mobile foram registradas e devem ser corrigidas antes da conexao Supabase.
9. Corrigir texto repetido de adicionais no acompanhamento: concluido em `src/pages/OrderTrackingPage.jsx`.
10. Melhorar carrinho mobile: concluido em `src/styles/global.css`.
11. Melhorar menu mobile do admin: concluido em `src/components/admin/AdminLayout.jsx` e `src/styles/global.css`.
12. Adicionar scroll automatico ao editar produtos: concluido em `src/pages/AdminProducts.jsx`.
13. Adicionar scroll automatico ao editar adicionais: concluido em `src/pages/AdminAdditionals.jsx`.
14. Revisar cards/chips de adicionais no mobile: concluido em `src/styles/global.css`.
15. Rodar `npm run build`: concluido.
16. `supabase/schema.sql` foi executado no SQL Editor do projeto `pedicampos`.
17. As 15 tabelas esperadas foram conferidas no Table Editor.
18. Instalar `@supabase/supabase-js`: concluido.
19. Criar `.env.example`: concluido.
20. Proteger `.env.local` no `.gitignore`: concluido.
21. Nao colocar senha do banco no React: preservado.
22. Criar `src/services/supabaseClient.js`: concluido.
23. Preparar conexao Supabase no projeto sem migrar dados: concluido.
24. Rodar `npm run build`: concluido.
25. Criar `.env.local` com:
   - `VITE_SUPABASE_URL`;
   - `VITE_SUPABASE_ANON_KEY`.
26. Testar conexao basica Supabase.
27. Conferir RLS, policies, indices e triggers de `updated_at`, se ainda nao tiver sido validado item por item.
28. Manter `database.js` com `storage.js/localStorage` como fallback.
29. Migrar primeiro funcoes de lojas:
   - `getStores()`;
   - `getStoreBySlug()`;
   - `createStore()`;
   - `updateStore()`.
30. Criar adaptadores de formato entre modelo atual e modelo relacional antes de ativar mais telas.
31. Migrar leituras centrais restantes:
   - primeiro `src/pages/StorePage.jsx`;
   - depois `src/pages/CheckoutPage.jsx`;
   - depois `src/pages/OrderTrackingPage.jsx`.
32. Migrar master lojas:
   - `src/pages/MasterCreateStore.jsx`;
   - `src/pages/MasterStores.jsx`;
   - `src/pages/MasterPlans.jsx`.
33. Migrar admin produtos/categorias/adicionais:
   - `src/pages/AdminProducts.jsx`;
   - `src/pages/AdminCategories.jsx`;
   - `src/pages/AdminAdditionals.jsx`.
34. Migrar checkout e pedidos:
   - `src/pages/CheckoutPage.jsx`;
   - `src/pages/AdminOrders.jsx`;
   - `src/pages/MasterOrders.jsx`.
35. Migrar configuracoes:
   - `src/pages/AdminSettings.jsx`;
   - `src/pages/MasterSettings.jsx`.
36. Ativar Supabase por variavel de ambiente:
   - `VITE_DATA_SOURCE=local` ou `VITE_DATA_SOURCE=supabase`;
   - `VITE_SUPABASE_URL`;
   - `VITE_SUPABASE_ANON_KEY`.
37. Criar scripts de seed/migracao dos mocks para Supabase.
38. Habilitar autenticacao real.
39. Remover mocks/localStorage apenas depois de validacao em producao.

## Plano de fallback

Enquanto `VITE_DATA_SOURCE` estiver `local` ou ausente:

- `database.js` chama `storage.js`;
- mocks continuam inicializando o banco local;
- carrinho continua no localStorage;
- login fake pode continuar funcionando para desenvolvimento.

Quando `VITE_DATA_SOURCE=supabase`:

- leituras e escritas principais usam Supabase;
- se Supabase falhar, o app pode mostrar erro controlado;
- fallback silencioso para localStorage em producao deve ser evitado para nao criar divergencia entre local e online.

## Arquivos criticos para alteracao futura

- `src/services/storage.js`
- `src/services/database.js`
- `src/services/supabaseClient.js`
- `src/hooks/usePediData.js`
- `src/hooks/useCart.js`
- `src/App.jsx`
- `src/data/mockStores.js`
- `src/data/mockOrders.js`
- `src/pages/MasterStores.jsx`
- `src/pages/MasterCreateStore.jsx`
- `src/pages/MasterSettings.jsx`
- `src/pages/MasterPlans.jsx`
- `src/pages/AdminProducts.jsx`
- `src/pages/AdminCategories.jsx`
- `src/pages/AdminAdditionals.jsx`
- `src/pages/AdminOrders.jsx`
- `src/pages/AdminSettings.jsx`
- `src/pages/StorePage.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/pages/OrderTrackingPage.jsx`
- `src/pages/LandingPage.jsx`
- `src/pages/MasterOrders.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/MasterDashboard.jsx`

## Riscos

- Divergencia entre dados locais e dados online durante transicao.
- Slugs duplicados se a validacao ficar apenas no frontend.
- Quebra de isolamento multi-loja se RLS nao for testada.
- Pedidos criados publicamente precisam de uma estrategia segura sem expor permissao ampla.
- Carrinho ainda pode continuar local, mas itens precisam lidar com produto alterado/removido no banco.
- `additionalGroups.productIds` precisa virar relacionamento relacional.
- Mudar de objetos aninhados para tabelas pode quebrar componentes que esperam `store.products`, `store.categories` e `store.additionalGroups`.
- Login fake precisa ser substituido por Supabase Auth antes de uso real.
- Pix real e WhatsApp Cloud API ainda nao existem; textos publicos devem evitar prometer integracao real antes da entrega.
- Imagens ainda sao URL/assets; Supabase Storage sera necessario para upload real.

## Seguranca Supabase

- Nao colocar senha do banco no codigo.
- Nao colocar senha do banco em `.env.local` usado pelo React.
- A `anon public key` pode ir para o frontend.
- A seguranca real deve vir de RLS, policies e Supabase Auth.
- As policies atuais sao iniciais e temporarias para desenvolvimento.
- Policies reais de master/admin serao refinadas depois, quando autenticacao real substituir os logins fake.

## Checklist de migracao

- [x] Auditar pontos de leitura e escrita atuais.
- [x] Definir Supabase como banco alvo.
- [x] Criar projeto Supabase `pedicampos`.
- [x] Manter localStorage/mocks como fallback temporario.
- [x] Propor schema SQL inicial.
- [x] Criar `supabase/schema.sql` com 15 tabelas, indices, triggers, RLS e policies temporarias.
- [x] Criar `supabase/README.md` com instrucoes para executar o SQL no Supabase.
- [x] Registrar arquivos criticos.
- [x] Criar `src/services/database.js` com backend local.
- [x] Revisar `src/services/database.js` com `node --check`.
- [x] Confirmar que `database.js` ainda usa `storage.js/localStorage` por baixo.
- [x] Confirmar que Supabase ainda nao migra dados e `database.js` continua usando localStorage.
- [x] Confirmar que nenhuma tela foi migrada diretamente para `database.js`.
- [x] Rodar `npm run build` apos a criacao de `database.js`; build passou com permissao elevada apos falha conhecida do sandbox.
- [x] Migrar `usePediData` para a nova camada.
- [x] Rodar `npm run build` apos migrar `usePediData`; build passou com permissao elevada apos falha conhecida do sandbox.
- [x] Testar rotas principais e fluxo critico novamente apos a troca do hook central.
- [x] Confirmar que nao houve bug causado pela troca de `usePediData.js` para `database.js`.
- [x] Corrigir/revisar copy publica que ainda exibia `simulado`, `mock` e `localStorage`.
- [x] Manter termos tecnicos apenas em documentacao, codigo, comentarios e normalizacao de legado.
- [x] Preparar servidor local para teste visual/manual em `http://127.0.0.1:5174`.
- [x] Concluir teste visual/manual local em navegador real em `http://127.0.0.1:5174`.
- [x] Registrar pendencias visuais/mobile encontradas no teste manual local.
- [x] Rodar `npm run build` apos finalizacao das memorias; build passou em 2026-07-10 com permissao elevada apos falha conhecida do sandbox.
- [x] Corrigir texto repetido de adicionais no acompanhamento do pedido desktop.
- [x] Rodar `npm run build` apos a correcao dos adicionais no acompanhamento.
- [x] Melhorar carrinho mobile, compactando e centralizando controles de quantidade.
- [x] Rodar `npm run build` apos ajuste mobile do carrinho.
- [x] Melhorar menu superior do admin mobile para evitar corte/aperto.
- [x] Rodar `npm run build` apos ajuste do menu superior do admin mobile.
- [x] Adicionar scroll automatico ao editar produtos no admin mobile.
- [x] Rodar `npm run build` apos scroll automatico ao editar produtos.
- [x] Adicionar scroll automatico ao editar adicionais no admin mobile.
- [x] Rodar `npm run build` apos scroll automatico ao editar adicionais.
- [x] Revisar cards/chips de adicionais no mobile.
- [x] Rodar `npm run build` apos as correcoes visuais/mobile.
- [ ] Testar novamente localmente no navegador real apos as correcoes visuais/mobile.
- [x] Executar `supabase/schema.sql` no SQL Editor do Supabase.
- [x] Confirmar retorno `Sucesso. Nenhuma linha retornada.` como esperado.
- [x] Rodar `npm run build` apos atualizacao das memorias com o estado real do Supabase.
- [x] Conferir as 15 tabelas no Table Editor.
- [ ] Conferir policies no painel do Supabase.
- [ ] Conferir indices criados.
- [ ] Conferir triggers de `updated_at`.
- [x] Instalar `@supabase/supabase-js`.
- [x] Criar `.env.example` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [x] Proteger `.env.local` no `.gitignore`.
- [ ] Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [x] Garantir que senha do banco nao va para o React.
- [x] Criar `src/services/supabaseClient.js`.
- [x] Preparar conexao Supabase sem migrar dados ainda.
- [ ] Testar conexao basica Supabase com `.env.local` configurado.
- [ ] Manter `database.js` com `storage.js/localStorage` como fallback.
- [ ] Criar adaptadores entre modelo local aninhado e modelo relacional.
- [ ] Migrar primeiro `getStores()`, `getStoreBySlug()`, `createStore()` e `updateStore()`.
- [ ] Popular `plans` e `platform_settings`.
- [ ] Criar seed das lojas demo.
- [ ] Criar Supabase Auth para master/admin.
- [ ] Implementar RLS.
- [ ] Migrar loja publica.
- [ ] Migrar master lojas.
- [ ] Migrar admin produtos.
- [ ] Migrar admin categorias.
- [ ] Migrar admin adicionais.
- [ ] Migrar checkout/pedidos.
- [ ] Migrar admin pedidos.
- [ ] Migrar master configuracoes.
- [x] Revisar linguagem publica para remover termos de simulacao.
- [ ] Testar fluxo completo online no dominio.
- [ ] Remover dependencia obrigatoria de localStorage somente depois da validacao.
## Resultado da etapa de lojas - 2026-07-12

- Concluido no adapter: leitura geral, busca por slug, busca por id, criacao, atualizacao e desativacao Supabase-first.
- Fallback: `storage.js` quando nao ha client ou quando Supabase retorna erro; resposta vazia bem-sucedida nao usa mocks.
- Fora do escopo: `store_settings`, `payment_methods`, produtos, categorias, adicionais e pedidos.
- Teste real: select permitido e tabela vazia; insert anonimo negado com `42501 permission denied for table stores`.
- Risco prioritario: as policies exigem usuario master/autenticado para insert e acesso autorizado para update, mas o app ainda usa login fake.
- Proxima acao: definir Supabase Auth/policy segura para master, depois integrar o hook/telas ao adapter assincromo e repetir CRUD temporario completo.
- Proximas entidades, somente apos estabilizar lojas: produtos, categorias, adicionais e pedidos, nessa ordem planejada.

## Etapa Auth master - 2026-07-12

- Implementado login Supabase Auth e autorizacao separada via `store_users`.
- Criada migration `002_master_auth.sql`, que deve ser personalizada com o UUID/e-mail do primeiro master.
- Policies de `stores`: SELECT publico somente para ativas; master autenticado le todas pela policy de acesso e e o unico autorizado a inserir, atualizar/desativar ou excluir.
- `plans` e `platform_settings` mantem leitura publica adequada e writes somente master.
- A criacao anteriormente bloqueada com `42501` permanece evidência de que anon nao possui write.
- Pendente antes do teste: criar usuario Auth, executar migration e integrar `MasterCreateStore`/`MasterStores` ao adapter assincrono.
- Auth dos admins de loja permanece para etapa futura.

## Integracao das telas de lojas - 2026-07-12

- Concluida no codigo: criar, listar, editar, ativar e desativar lojas pelo adapter assincrono.
- O login master fornece o JWT usado automaticamente pelo client Supabase nas policies RLS.
- Sucesso remoto nao gera copia local paralela; falha remota continua acionando o fallback definido em `database.js`.
- O teste CRUD remoto ainda deve ser executado com uma sessao master no navegador e confirmado no Table Editor.
- Realtime e sincronizacao global do `usePediData` nao fazem parte desta etapa.
- Proxima entidade: categorias. Produtos, adicionais e pedidos permanecem pendentes.

## Migration 003 - seed de planos

- Detectado bloqueio: `plans` vazia impedia gravar `stores.plan_key` por chave estrangeira.
- Criada carga inicial idempotente para `start`, `pro` e `premium` com os precos oficiais atuais.
- Conflitos por `key` sao ignorados para nunca restaurar ou sobrescrever precos alterados futuramente.
- Proximo passo operacional: executar a migration, conferir os tres registros e testar CRUD de loja real.
- Depois de estabilizar lojas, a proxima entidade continua sendo categorias.

## Loja publica Supabase por slug

- Concluido no codigo: `StorePage` consulta `getStoreBySlug` e nao depende da lista local do hook.
- Lojas ativas podem abrir mesmo sem produtos/categorias migrados.
- Ausencia remota bem-sucedida nao aciona mock; falhas continuam cobertas pelo fallback do adapter.
- RLS de leitura apenas para lojas ativas foi preservado; inativas ficam indistinguiveis de inexistentes para anon.
- Proxima etapa planejada: migracao de categorias.

## Categorias - adapter preparado

- Concluido: funcoes CRUD Supabase-first, conversores e filtro por `store_id`.
- Schema/policies existentes foram suficientes; nenhuma migration SQL adicional foi criada.
- Teste de seguranca: SELECT anon passou vazio; INSERT anon falhou com `42501`; nenhuma linha temporaria foi criada.
- CRUD autenticado ainda nao foi executado nesta sessao.
- Bloqueio atual: admins de loja usam login fake e nao podem receber write remoto seguro.
- Proxima etapa correta: Supabase Auth dos admins + registros `store_users`; depois integrar e testar `AdminCategories`.
- Produtos permanecem pendentes.

## Auth dos usuarios de loja

- Concluido no codigo: login Supabase, leitura de memberships, resolucao da loja e protecao das rotas admin.
- Roles aceitas conforme schema atual: `store_admin` e `store_staff`; master permanece separado.
- Nenhuma migration 004 foi necessaria; as policies existentes ja limitam leitura do proprio vinculo e administracao ao master.
- Nao existe fallback fake de admin nem selecao arbitraria de `store_id`.
- Pendente: criar usuario/vinculo real e executar testes de sessao e isolamento.
- Proxima etapa: integrar AdminCategories ao CRUD assincrono; produtos continuam depois.

## AdminCategories conectado

- Concluido no codigo: leitura, criacao, edicao, status, exclusao e reordenacao Supabase-first.
- `store_id` e derivado apenas da sessao/vinculo autorizado e nao pode ser escolhido na tela.
- Nenhuma migration ou mudanca de policy foi necessaria.
- Pendente: teste CRUD temporario no navegador/Table Editor e teste cruzado Loja A x Loja B.
- Proxima entidade: produtos. Adicionais e pedidos permanecem fora do escopo.

## Produtos conectados

- Concluido no codigo: adapter CRUD e AdminProducts assincrono com categorias remotas.
- Criada migration 004 idempotente para rejeitar categoria pertencente a outra loja.
- Policies existentes de leitura publica e write autenticado foram preservadas.
- Pendente: executar migration, testar CRUD real e validar erros `23514`/RLS em acesso cruzado.
- Upload real continua pendente; `image_url` armazena string/URL.
- Proxima entidade: adicionais. Pedidos permanecem fora do escopo.

## Adicionais conectados

- Concluido no codigo: adapter e AdminAdditionals para grupos, opcoes e produtos vinculados.
- Migration 005 cria integridade por loja e RPC atomica sujeita a RLS.
- INSERT anonimo permaneceu bloqueado com `42501`; nenhuma linha de teste foi criada.
- Pendente: executar migration e testar CRUD/cross-store nas tres tabelas.
- Pedidos continuam pendentes.
- Proxima etapa recomendada: `store_settings` e `payment_methods`, pois checkout/pedidos dependem dessas configuracoes online.

## Store settings e payment methods conectados

- Concluido no codigo: adapters, AdminSettings e leitura publica/checkout.
- Migration 006 permite update seguro de perfil sem liberar plano ou `active` ao lojista.
- Policies existentes de settings/metodos foram suficientes e writes anon continuam bloqueados.
- Ausencia de registro remoto usa defaults controlados; resposta vazia nao injeta mock.
- Checkout continua sem gateway e pedidos continuam locais.
- Pendente: executar migration e validar fluxo completo. Proxima entidade: pedidos.

## Pedidos conectados

- Concluido no codigo: RPC atomica, token publico, adapter e tres telas principais.
- Migration 007 adiciona `public_token`, desconto, indice e RPCs create/tracking.
- Totais e snapshots sao calculados no banco; SELECT publico geral continua inexistente.
- Admin/master permanecem protegidos pelas policies atuais.
- Pendente: executar migration e testar matriz completa no Table Editor.
- Proxima etapa: endurecimento/observabilidade e, separadamente, gateway de pagamento e WhatsApp reais.

## Correcao previa a validacao de pedidos

- Corrigida StorePage, que buscava a loja mas nao hidratava o catalogo relacional.
- Leitura publica confirmou categorias/produtos/grupos/opcoes/links sem bloqueio RLS.
- Nenhuma migration foi criada; policies atuais ja atendem ao catalogo ativo.
- Validar catalogo no dominio antes de retomar a matriz de testes de pedidos.

## Correcao da listagem administrativa de pedidos

- O bug era agravado pelo fallback indistinto: qualquer erro remoto era convertido em leitura do localStorage, normalmente vazio no navegador do admin.
- Consultas administrativas agora sao segmentadas e filtradas por `store_id`; erros RLS/schema/RPC deixam de ser mascarados.
- A migration 007 ja possui policies com `can_access_store(store_id)`, portanto nao foi criada migration adicional nem aberta leitura anonima.
- Validacao pendente no projeto remoto: confirmar as quatro linhas relacionadas, o `store_id`, atualizar status e testar uma segunda loja.

## Migration 008 - permissao da RPC publica

- A migration 007 executada correspondia ao comportamento local relevante: assinatura correta e `SECURITY INVOKER`.
- Teste anonimo real aceitou todo o payload e falhou no primeiro `INSERT ... RETURNING` com `42501` em customers.
- A migration 008 muda somente a funcao validada para `SECURITY DEFINER`; nao concede SELECT anonimo, nao remove RLS e reafirma `search_path` e grants.
- Depois de executar 008, repetir a matriz de criacao e conferir rollback/linhas nas quatro tabelas.

## Auditoria depois da 008

- A RPC remota aceitou a identidade `(uuid,jsonb,text,jsonb,text,text,jsonb)` e criou o pedido `80EE5827`.
- Nao criar migration 009 ate o SQL `supabase/diagnostics/create_public_order_audit.sql` demonstrar overload incorreto ou definicao divergente.
- Pendente: executar o diagnostico no SQL Editor, comparar o erro/payload exato do navegador e remover o pedido temporario depois da auditoria.

## Correcao frontend do tenant do pedido

- O erro `Store unavailable` vinha de um UUID de loja local antiga usado apos fallback de slug.
- A criacao agora exige duas resolucoes remotas coerentes e nunca usa ID do carrinho/localStorage como autoridade.
- Nao houve mudanca SQL; nenhuma migration 009 e necessaria para esta causa.
- Pendente: deploy e matriz manual carrinho antigo/novo, banco, admin e tracking.

### Carrinho novo

- StorePage e Checkout usam a loja remota como origem do ID.
- Persistencia inclui ownership explicita e bloqueia divergencias; nenhuma mudanca SQL foi necessaria.
- Build passou; teste visual de reload/localStorage permanece manual.

## Separacao definitiva de lojas locais/remotas

- Supabase e fonte unica para lojas quando configurado; snapshots locais nao entram nas areas migradas.
- Fallback ocorre somente por conectividade real, nunca por resposta vazia, RLS ou schema.
- Limpeza local V1 e seletiva e idempotente: colisao comprovada por slug remove loja/carrinho legado; dados local-only permanecem.
- Testes isolados confirmaram colisao, preservacao local-only e null remoto sem mock.
- Nenhuma migration SQL foi necessaria. Pendente apenas validacao E2E do pedido/admin.

## Correcao de identidade no adapter de settings

- O conflito nao era de banco: a PK de `store_settings` sobrescrevia a PK de `stores` no objeto React.
- Adapter agora usa `settingsId`; merges preservam `store.id` explicitamente.
- Nenhuma migration/RPC foi alterada. Pedido remoto de verificacao foi criado com tenant correto.

## Painel administrativo depois de pedidos

- AdminDashboard foi conectado a `getOrdersByStore` e `getProductsByStore`.
- AdminOrders ja recarregava na entrada e apos status; recebeu refresh manual.
- Nao houve mudanca SQL. Realtime permanece opcional para etapa posterior.
- Pendente validacao visual autenticada das metricas e sincronizacao por nova carga.

## Status por entrega/retirada

- Ajuste exclusivamente frontend; `orders.fulfillment` ja diferencia delivery/pickup.
- Timeline e admin usam funcoes compartilhadas e status pickup especifico.
- Legado e normalizado visualmente. Nenhuma migration ou mudanca de dados foi necessaria.

## Auditoria de producao - Sprint 1

- Nenhuma migration foi criada nesta auditoria.
- Prioridade critica da proxima etapa SQL: retirar INSERT anonimo direto de customers, orders, order_items e order_item_additionals, deixando `create_public_order` como unica fronteira publica de escrita.
- Endurecimentos seguintes: validar required/min/max dos adicionais na RPC, limites de payload/abuso, constraints de dominio e entitlement comercial server-side.
- Antes de qualquer SQL, auditar policies/grants e definicao efetivamente instalados no projeto remoto; os achados desta sprint vieram dos arquivos locais.
- Manter indices atuais por tenant e acrescentar somente indices guiados pelas consultas paginadas/EXPLAIN.

## Migration 009 - bloquear escrita anonima direta

- Arquivo: `supabase/migrations/009_lock_direct_order_writes.sql`.
- Remove policies `Public can create ...` de customers, orders, order_items e order_item_additionals.
- Revoga todos os privilegios dessas tabelas de `PUBLIC` e `anon`; reafirma CRUD de authenticated sob RLS.
- Reafirma owner postgres, SECURITY DEFINER, `search_path=public` e grants restritos das RPCs create/get public order.
- Apos executar, rode `supabase/diagnostics/009_lock_direct_order_writes_audit.sql` e a matriz checkout/tracking/admin/isolamento.
- Nao editar nem reaplicar destrutivamente as migrations 007/008; a 009 e incremental e idempotente.

## Migration 010 - validar regras de adicionais no pedido

- Arquivo: `supabase/migrations/010_validate_order_additionals.sql`.
- Substitui somente a implementacao da assinatura existente de `create_public_order`.
- Valida antes de INSERT: IDs/tipos do payload, opcoes distintas, opcao no grupo informado, atividade, mesmo tenant, vinculo grupo/produto, required/min/max e single.
- Preserva preco do catalogo, snapshots, atomicidade e configuracao de seguranca estabelecida pelas migrations 008/009.
- Execute depois da 009 e rode `supabase/diagnostics/010_validate_order_additionals_test.sql`; o teste cria fixtures na transacao e finaliza com ROLLBACK.

## Migration 011 - idempotencia e limites

- Arquivo: `supabase/migrations/011_order_idempotency_and_limits.sql`.
- Adiciona coluna UUID e indice unico parcial por loja/chave; pedidos legados permanecem com NULL.
- Renomeia a implementacao 010 para rotina privada e cria wrapper publico de oito parametros.
- Limita itens/quantidade/opcoes/notas/nome/telefone/endereco/payload; todos os excessos usam SQLSTATE 23514.
- Advisory lock + indice evitam duplicidade concorrente e retries retornam os identificadores originais.
- Execute depois da 010, publique o frontend coordenadamente e rode diagnostico/teste 011. Atualize os diagnosticos 009/010 para a assinatura atual.
- Rate limit externo continua em etapa futura; nao confiar em IP recebido diretamente no PostgreSQL.

## Painel Master remoto - sem migration

- As policies existentes ja permitem leitura global ao master por `can_access_store`/`is_master`; nenhuma alteracao SQL foi necessaria.
- `getAllStoresForMaster`, `getAllOrdersForMaster` e `getPlansForMaster` fazem leituras estritas, sem fallback local.
- MasterDashboard agrega metricas no cliente sobre os dados remotos; MasterOrders e MasterStores reutilizam as mesmas consultas.
- Antes de escala, substituir cargas completas por paginacao/cursor e validar indices com `EXPLAIN` usando volume representativo.
- Testar manualmente master global e isolamento de usuario de loja antes do deploy.

## Migration 012 - entitlements por plano

- Arquivo: `supabase/migrations/012_plan_entitlements.sql`.
- Preenche `feature_flags` apenas quando ainda e `[]`; nao altera `price`, `active`, nomes ou atribuicoes de loja.
- Cria helpers SECURITY DEFINER com `search_path=public` e endurece RPCs/policies de pedidos, tracking e pagamento online.
- Execute depois da 011; depois rode `012_plan_entitlements_audit.sql` e `012_plan_entitlements_test.sql`.
- Deploy do frontend deve acompanhar a migration, pois ele passa a buscar `get_store_entitlements`.
- Disponibilidade para novas vendas e termos comerciais por loja permanecem modelagens futuras separadas.

## Migration 013 - Storage de imagens

- Arquivo: `supabase/migrations/013_storage_images.sql`.
- Cria ou normaliza apenas `store-assets` e `product-images`: publicos, 5 MB, JPEG/PNG/WEBP.
- Policies publicas sao exclusivamente SELECT. INSERT/UPDATE/DELETE exigem authenticated, path estrito e `can_access_store(store_id)`.
- Execute depois das migrations de Auth/RLS; a 013 depende de `can_access_store`.
- Depois rode `013_storage_images_audit.sql` e `013_storage_images_checklist.sql`.
- Revise policies remotas desconhecidas que mencionem esses buckets, pois policies permissivas sao somadas por OR.
- Deploy do frontend deve ocorrer depois da migration para evitar uploads bloqueados por bucket inexistente.

## Ajuste de identidade visual - sem migration

- Logo e banner continuam nas colunas existentes de `stores`.
- Iniciais de fallback usam `store_settings.extra.fallbackInitials`; não foi necessária alteração de schema, bucket ou policy.
- Migration 013 permanece inalterada e continua responsável apenas pelo Storage de imagens.

## Recorte no cliente - sem migration

- O recorte/redimensionamento ocorre integralmente no navegador antes do upload.
- Não houve alteração de bucket, policy, schema ou migration 013.
- Storage recebe somente o File final confirmado; URL manual continua disponível sem processamento.

## Confirmação de logo/banner - sem migration

- A migration 006 já define `update_store_public_profile(..., p_logo, p_banner_url)` e atualiza `stores.logo`/`stores.banner_url`.
- A consulta remota confirmou que `logo_url` não é coluna de `stores`; o nome canônico existente é `logo`.
- A correção foi exclusivamente no cliente/adapter para validar a resposta antes de sucesso; migrations 006 e 013 permanecem inalteradas.
## Sprint 2.2 - paginação sem migration

- Não houve alteração de schema, RLS, índices, RPCs ou migrations.
- A paginação usa as ordenações e índices já existentes, `count: "exact"` e ranges inclusivos do PostgREST.
- Antes de volumes muito altos, revisar `EXPLAIN` das ordenações por `store_id/sort_order/created_at` e considerar índices somente com evidência; nenhuma criação foi antecipada nesta etapa.
- Agregação server-side para métricas de MasterStores permanece candidata futura, pois agregados REST retornam PGRST123 no projeto atual.

## Seed manual da loja-demo - sem migration

- `supabase/seeds/lojateste_demo_catalog.sql` não integra o rollout obrigatório de produção e deve ser executado manualmente somente no projeto que hospeda a loja `lojateste`.
- O script não altera schema, RLS, grants, policies, RPCs ou regras de plano; apenas insere/atualiza massa isolada pelo `store_id` resolvido por slug.
- Execute depois o audit `supabase/diagnostics/lojateste_demo_catalog_audit.sql` e confira 6 categorias, 29 produtos, 5 grupos, 20 opções, 56 vínculos e 22 pedidos-demo, considerando que registros manuais homônimos podem ser reutilizados.
- Para remoção, use `supabase/diagnostics/lojateste_demo_catalog_cleanup.sql`; ele apaga somente IDs determinísticos e pedidos com os marcadores do seed.
- O seed não foi executado remotamente durante sua criação.

### Mapa de imagens da loja-demo - sem migration

- `supabase/seeds/lojateste_demo_product_images.sql` é opcional e deve ser executado somente depois do upload dos arquivos finais.
- O mapa começa com URLs nulas: ele pode apenas limpar cópias legadas exatamente iguais à logo/banner, deixando esses produtos pendentes; imagens manuais permanecem intocadas.
- Cada URL é validada contra o `store_id` e `product_id` resolvidos; duplicidades ou paths incorretos abortam toda a transação.
- Execute `supabase/diagnostics/lojateste_demo_product_images_audit.sql` antes e depois para localizar repetições e pendências.
- Não houve alteração de migration, bucket, policy, schema ou dado remoto.

## Sprint 2.3 - somente frontend

- Code splitting, WebP e carregamento de imagens não exigem migration, RPC, policy, índice ou alteração de Storage.
- Nenhuma imagem enviada por lojistas foi modificada; apenas três assets versionados em `src/assets` foram otimizados.
- O adapter Supabase continua igual e apenas passou a ser solicitado sob demanda conforme a rota/efeito.
- Não existe passo manual no SQL Editor para esta Sprint.

## Migration 014 e seeds demo

1. Executar `014_demo_stores.sql` antes do frontend novo.
2. Executar opcionalmente `neguinhodoacai_demo.sql` e `gordinhoburguer_demo.sql`.
3. Rodar os diagnósticos individuais e `demo_stores_audit.sql`.
4. Configurar destaque/ordem pelo Master e criar Auth/store_users manualmente.

A migration adiciona somente metadados demo, constraints e índice parcial. Não marca Brasa House automaticamente. Os seeds iniciam as duas lojas como demo, mas não destacadas; não criam usuários nem sobrescrevem imagem existente. Upload dos banners locais e das imagens específicas de produtos continua pendente.

## Sprint 2.4 - integração de testes pendente

Nenhuma migration, policy, RPC ou dado remoto foi alterado. Os testes atuais usam mocks e não devem ser considerados prova de RLS real. A etapa futura deve aplicar todas as migrations em Supabase CLI local ou projeto exclusivo de testes, criar identidades fictícias anon/Admin A/Admin B/master e destruir os dados ao final. Produção e `service_role` frontend ficam fora dessa estratégia.

## Migration 015 - implantação coordenada

1. Configurar secrets da Edge e publicar `create-order` em teste.
2. Executar `015_order_rate_limit.sql`, que fecha a execução direta da RPC.
3. Publicar frontend que chama a Edge imediatamente após a migration.
4. Rodar `015_order_rate_limit_audit.sql` e testes de domínio.

Não aplicar a migration isoladamente antes da Edge/frontend: o checkout antigo perderá acesso direto. Em emergência, o rollback documentado restaura temporariamente o grant sem remover idempotência ou RLS.

O ajuste de imagens vazias e classificação dos logs de 16/07/2026 é exclusivamente frontend; não exige nova migration nem altera a 015.

## Auditoria pré-UX (17/07/2026)

Nenhuma migration nova foi criada ou aplicada. A leitura dos arquivos confirmou que a migration 009 bloqueia escrita anônima direta nas tabelas de pedidos e a 015 remove a execução pública direta de `create_public_order`, mas a instalação efetiva deve ser comprovada manualmente no Supabase antes de produção. Também devem ser validados os grants, policies, isolamento entre lojas, secrets/origens da Edge e respostas 429. O relatório completo está em `AUDIT_PEDICAMPOS_PRE_UX_2026-07-17.md`.

O arquivo `supabase/diagnostics/pre_ux_remote_validation.sql` consolida a verificação somente leitura do estado final esperado das migrations 009–015. Ele não aplica correções; resultados divergentes devem ser analisados antes de qualquer migration ou deploy.
