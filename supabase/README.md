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
