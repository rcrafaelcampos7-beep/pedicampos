# PediCampos Supabase

Esta pasta guarda os arquivos iniciais da migracao do PediCampos para Supabase.

Nesta etapa, o React ainda nao foi conectado ao Supabase. O app continua usando `localStorage` por baixo de `src/services/database.js`.

## Estado atual em 2026-07-11

- Projeto Supabase criado com nome `pedicampos`.
- Regiao escolhida: Oeste dos EUA (Oregon) / `us-west-2`.
- URL visivel no painel: `https://tkoo...supabase.co`.
- `supabase/schema.sql` ja foi executado no SQL Editor do Supabase.
- Retorno recebido: `Sucesso. Nenhuma linha retornada.`.
- Esse retorno e esperado para criacao de tabelas, funcoes, triggers, RLS e policies.
- Proximo passo: conferir no Table Editor se as 15 tabelas foram criadas.
- Supabase ainda nao foi conectado ao React.
- Nenhuma loja foi migrada para o banco real ainda.
- `storage.js`, mocks e `localStorage` continuam preservados.
- `npm run build` passou apos atualizar as memorias com este estado.

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

## Variaveis de ambiente necessarias depois

Quando a conexao React/Supabase for implementada, o projeto deve usar:

```txt
VITE_DATA_SOURCE=supabase
VITE_SUPABASE_URL=https://tkoo...supabase.co
VITE_SUPABASE_ANON_KEY=
```

Enquanto `VITE_DATA_SOURCE` estiver ausente ou `local`, o app deve continuar usando o adapter local atual.

Nunca usar a senha do banco no React. A `anon public key` pode ir no frontend, desde que RLS e policies estejam protegendo os dados.

## Proxima etapa tecnica

1. Conferir tabelas no Table Editor.
2. Conferir RLS.
3. Conferir policies.
4. Conferir indices.
5. Conferir triggers de `updated_at`.
6. Instalar `@supabase/supabase-js`.
7. Criar `src/services/supabaseClient.js`.
8. Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
9. Manter `database.js` com `storage.js/localStorage` como fallback.
10. Criar conexao Supabase sem migrar dados ainda.
11. Depois migrar primeiro `getStores()`, `getStoreBySlug()`, `createStore()` e `updateStore()`.

## Observacoes importantes

- Este SQL nao popula dados demo.
- Este SQL nao conecta o React.
- Este SQL nao remove mocks nem `localStorage`.
- Admin/master real com Supabase Auth ainda fica para uma etapa posterior.
- As policies permitem leitura publica apenas de catalogo ativo.
- Pedidos podem ser criados publicamente, mas dados de clientes e pedidos nao ficam publicamente legiveis por padrao.
- Para acompanhamento publico de pedido em producao, a recomendacao e criar uma RPC ou Edge Function segura em etapa posterior.
