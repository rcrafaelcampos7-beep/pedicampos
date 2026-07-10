# SUPABASE_MIGRATION_PLAN - PediCampos

Atualizado em: 2026-07-10

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
- `localStorage` continua temporariamente como fallback.
- `src/data/mockStores.js` e `src/data/mockOrders.js` continuam existindo ate a migracao estar validada.
- Nenhuma tela deve passar a depender diretamente do SDK do Supabase.
- A primeira camada de service foi criada em `src/services/database.js`.
- `src/services/database.js` funciona como fachada/adapter temporario e ainda usa `src/services/storage.js` por baixo.
- Supabase real ainda nao foi conectado.
- `src/hooks/usePediData.js` foi adaptado para consumir `database.js`.
- Nenhuma tela foi migrada diretamente para `database.js` nesta etapa.
- Teste pos-adaptacao do hook central foi realizado sem conectar Supabase real.
- Copy publica foi revisada para remover termos internos ou de simulacao das telas publicas.
- Projeto foi preparado para teste visual/manual local em `http://127.0.0.1:5174`.
- Teste visual/manual local encontrou pendencias visuais/mobile que devem ser corrigidas antes da conexao Supabase.
- A proxima etapa correta e corrigir os ajustes visuais/mobile encontrados no teste manual antes de iniciar Supabase real.

## Pendencias visuais/mobile antes do Supabase

Registrado apos teste manual local em `http://127.0.0.1:5174`:

- Acompanhamento do pedido em desktop:
  - texto dos adicionais aparece quebrado/repetido;
  - exemplo observado: `Adicionais: Bacon extra + R$ 5,00, Adicionais: Cheddar + R$ 4,00`;
  - proxima correcao: renderizar os adicionais como frase limpa ou lista.
- Carrinho mobile:
  - controles de quantidade estao muito largos e pouco centralizados;
  - proxima correcao: melhorar o layout, preferencialmente em linha `[-] [1] [+]`.
- Menu superior do admin mobile:
  - menu esta apertado/cortado;
  - proxima correcao: avaliar menu hamburguer, dropdown ou barra com scroll mais clara.
- Admin produtos mobile:
  - ao tocar em `Editar`, a tela deve rolar automaticamente ate o formulario;
  - sugestao tecnica: `scrollIntoView`.
- Admin adicionais mobile:
  - ao tocar em `Editar`, a tela deve rolar automaticamente ate o formulario;
  - sugestao tecnica: `scrollIntoView`.
- Admin adicionais mobile:
  - cards/chips de opcoes estao carregados visualmente;
  - proxima correcao: melhorar espacamento, quebra de linha e chips.

Supabase real deve comecar somente depois desses ajustes visuais/mobile e de novo build/teste local.

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

- Este schema e uma proposta inicial.
- IDs usam `uuid`.
- `store_id` aparece em todo dado pertencente a uma loja.
- `stores.slug` deve ser unico.
- RLS deve ser habilitado antes de producao.
- A tabela `additional_group_products` e uma tabela ponte recomendada, mesmo nao existindo no modelo local atual, porque o vinculo grupo-produto e muitos-para-muitos.

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
9. Corrigir texto repetido de adicionais no acompanhamento.
10. Melhorar carrinho mobile.
11. Melhorar menu mobile do admin.
12. Adicionar scroll automatico ao editar produtos.
13. Adicionar scroll automatico ao editar adicionais.
14. Revisar cards/chips de adicionais no mobile.
15. Rodar `npm run build` e testar novamente localmente.
16. Migrar leituras centrais restantes:
   - primeiro `src/pages/StorePage.jsx`;
   - depois `src/pages/CheckoutPage.jsx`;
   - depois `src/pages/OrderTrackingPage.jsx`.
17. Criar adaptadores de formato entre modelo atual e modelo relacional antes de ativar Supabase real.
18. Migrar master lojas:
   - `src/pages/MasterCreateStore.jsx`;
   - `src/pages/MasterStores.jsx`;
   - `src/pages/MasterPlans.jsx`.
19. Migrar admin produtos/categorias/adicionais:
   - `src/pages/AdminProducts.jsx`;
   - `src/pages/AdminCategories.jsx`;
   - `src/pages/AdminAdditionals.jsx`.
20. Migrar checkout e pedidos:
   - `src/pages/CheckoutPage.jsx`;
   - `src/pages/AdminOrders.jsx`;
   - `src/pages/MasterOrders.jsx`.
21. Migrar configuracoes:
   - `src/pages/AdminSettings.jsx`;
   - `src/pages/MasterSettings.jsx`.
22. Ativar Supabase por variavel de ambiente:
   - `VITE_DATA_SOURCE=local` ou `VITE_DATA_SOURCE=supabase`;
   - `VITE_SUPABASE_URL`;
   - `VITE_SUPABASE_ANON_KEY`.
23. Criar scripts de seed/migracao dos mocks para Supabase.
24. Habilitar RLS e autenticacao real.
25. Remover mocks/localStorage apenas depois de validacao em producao.

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
- `src/services/supabaseClient.js` (novo, quando conectar Supabase)
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

## Checklist de migracao

- [x] Auditar pontos de leitura e escrita atuais.
- [x] Definir Supabase como banco alvo.
- [x] Manter localStorage/mocks como fallback temporario.
- [x] Propor schema SQL inicial.
- [x] Registrar arquivos criticos.
- [x] Criar `src/services/database.js` com backend local.
- [x] Revisar `src/services/database.js` com `node --check`.
- [x] Confirmar que `database.js` ainda usa `storage.js/localStorage` por baixo.
- [x] Confirmar que Supabase real ainda nao foi conectado.
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
- [ ] Corrigir texto repetido de adicionais no acompanhamento do pedido desktop.
- [ ] Melhorar carrinho mobile, compactando e centralizando controles de quantidade.
- [ ] Melhorar menu superior do admin mobile para evitar corte/aperto.
- [ ] Adicionar scroll automatico ao editar produtos no admin mobile.
- [ ] Adicionar scroll automatico ao editar adicionais no admin mobile.
- [ ] Revisar cards/chips de adicionais no mobile.
- [ ] Rodar `npm run build` apos as correcoes visuais/mobile e testar novamente localmente.
- [ ] Criar adaptadores entre modelo local aninhado e modelo relacional.
- [ ] Criar projeto Supabase.
- [ ] Criar tabelas no Supabase.
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
