-- PediCampos: validacao remota pre-UX, somente leitura.
-- Execute cada bloco separadamente no SQL Editor do Supabase, na ordem numerada.
-- Os blocos consultam apenas catalogos e metadados. Nenhum dado de clientes,
-- pedidos ou arquivos do Storage e lido.

-- 1. Existencia dos schemas e papeis basicos.
-- Este e o primeiro bloco a executar.
with expected_schemas(schema_name) as (
  values ('public'), ('storage')
), expected_roles(role_name) as (
  values ('anon'), ('authenticated'), ('service_role')
)
select
  'schema' as object_type,
  expected_schemas.schema_name as object_name,
  (n.oid is not null) as object_exists
from expected_schemas
left join pg_namespace n
  on n.nspname = expected_schemas.schema_name

union all

select
  'role' as object_type,
  expected_roles.role_name as object_name,
  (r.oid is not null) as object_exists
from expected_roles
left join pg_roles r
  on r.rolname = expected_roles.role_name
order by object_type, object_name;

-- 2. Existencia das tabelas esperadas em public.
with expected_tables(table_name) as (
  values
    ('platform_settings'),
    ('plans'),
    ('stores'),
    ('store_users'),
    ('store_settings'),
    ('payment_methods'),
    ('categories'),
    ('products'),
    ('additional_groups'),
    ('additional_options'),
    ('additional_group_products'),
    ('customers'),
    ('orders'),
    ('order_items'),
    ('order_item_additionals'),
    ('order_rate_limit_attempts')
)
select
  'public' as schema_name,
  expected_tables.table_name,
  (c.oid is not null) as table_exists,
  c.relkind
from expected_tables
left join pg_namespace n
  on n.nspname = 'public'
left join pg_class c
  on c.relnamespace = n.oid
 and c.relname = expected_tables.table_name
 and c.relkind in ('r', 'p')
order by expected_tables.table_name;

-- 3. Existencia das relacoes padrao usadas pelo Storage.
with expected_relations(relation_name) as (
  values ('buckets'), ('objects')
)
select
  'storage' as schema_name,
  expected_relations.relation_name,
  (c.oid is not null) as relation_exists,
  c.relkind
from expected_relations
left join pg_namespace n
  on n.nspname = 'storage'
left join pg_class c
  on c.relnamespace = n.oid
 and c.relname = expected_relations.relation_name
 and c.relkind in ('r', 'p', 'v')
order by expected_relations.relation_name;

-- 4. Existencia das colunas acrescentadas pelas migrations finais.
with expected_columns(table_name, column_name) as (
  values
    ('orders', 'idempotency_key'),
    ('plans', 'feature_flags'),
    ('stores', 'is_demo'),
    ('stores', 'demo_featured'),
    ('stores', 'demo_order'),
    ('stores', 'demo_label')
)
select
  'public' as schema_name,
  expected_columns.table_name,
  expected_columns.column_name,
  (a.attnum is not null) as column_exists,
  case
    when a.attnum is null then null
    else pg_catalog.format_type(a.atttypid, a.atttypmod)
  end as data_type
from expected_columns
left join pg_namespace n
  on n.nspname = 'public'
left join pg_class c
  on c.relnamespace = n.oid
 and c.relname = expected_columns.table_name
 and c.relkind in ('r', 'p')
left join pg_attribute a
  on a.attrelid = c.oid
 and a.attname = expected_columns.column_name
 and a.attnum > 0
 and not a.attisdropped
order by expected_columns.table_name, expected_columns.column_name;

-- 5. Existencia e metadados das funcoes esperadas.
-- As assinaturas sao comparadas pelos argumentos de identidade do PostgreSQL.
with expected_functions(function_name, identity_arguments) as (
  values
    ('create_public_order', 'uuid, uuid, jsonb, text, jsonb, text, text, jsonb'),
    ('get_public_order', 'uuid, text'),
    ('store_has_feature', 'uuid, text'),
    ('get_store_entitlements', 'uuid'),
    ('consume_order_rate_limit', 'text, uuid, text'),
    ('complete_order_rate_limit', 'uuid, boolean')
)
select
  'public' as schema_name,
  expected_functions.function_name,
  expected_functions.identity_arguments,
  (p.oid is not null) as function_exists,
  case when p.oid is null then null else pg_get_userbyid(p.proowner) end as owner_name,
  case
    when p.oid is null then null
    when p.prosecdef then 'SECURITY DEFINER'
    else 'SECURITY INVOKER'
  end as security_mode,
  case
    when p.oid is null then null
    else coalesce(array_to_string(p.proconfig, ', '), '(not fixed)')
  end as function_config
from expected_functions
left join pg_namespace n
  on n.nspname = 'public'
left join pg_proc p
  on p.pronamespace = n.oid
 and p.proname = expected_functions.function_name
 and pg_get_function_identity_arguments(p.oid) = expected_functions.identity_arguments
order by expected_functions.function_name;

-- 6. Estado de RLS das tabelas relevantes.
with expected_tables(table_name) as (
  values
    ('stores'),
    ('store_users'),
    ('store_settings'),
    ('payment_methods'),
    ('categories'),
    ('products'),
    ('additional_groups'),
    ('additional_options'),
    ('additional_group_products'),
    ('customers'),
    ('orders'),
    ('order_items'),
    ('order_item_additionals'),
    ('order_rate_limit_attempts')
)
select
  'public' as schema_name,
  expected_tables.table_name,
  (c.oid is not null) as table_exists,
  case when c.oid is null then null else c.relrowsecurity end as rls_enabled,
  case when c.oid is null then null else c.relforcerowsecurity end as rls_forced
from expected_tables
left join pg_namespace n
  on n.nspname = 'public'
left join pg_class c
  on c.relnamespace = n.oid
 and c.relname = expected_tables.table_name
 and c.relkind in ('r', 'p')
order by expected_tables.table_name;

-- 7. Policies das tabelas publicas relevantes.
-- Resultado vazio para uma tabela significa que nenhuma policy foi encontrada.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'stores',
    'store_users',
    'store_settings',
    'payment_methods',
    'categories',
    'products',
    'additional_groups',
    'additional_options',
    'additional_group_products',
    'customers',
    'orders',
    'order_items',
    'order_item_additionals',
    'order_rate_limit_attempts'
  )
order by tablename, policyname;

-- 8. Privilegios efetivos nas tabelas privadas do fluxo de pedidos.
-- Este bloco depende dos papeis padrao conferidos no bloco 1.
with expected_tables(table_name) as (
  values
    ('customers'),
    ('orders'),
    ('order_items'),
    ('order_item_additionals'),
    ('order_rate_limit_attempts')
), expected_roles(role_name) as (
  values ('anon'), ('authenticated'), ('service_role')
)
select
  expected_tables.table_name,
  expected_roles.role_name,
  (c.oid is not null) as table_exists,
  case when c.oid is null then null
    else has_table_privilege(expected_roles.role_name, c.oid, 'SELECT')
  end as select_privilege,
  case when c.oid is null then null
    else has_table_privilege(expected_roles.role_name, c.oid, 'INSERT')
  end as insert_privilege,
  case when c.oid is null then null
    else has_table_privilege(expected_roles.role_name, c.oid, 'UPDATE')
  end as update_privilege,
  case when c.oid is null then null
    else has_table_privilege(expected_roles.role_name, c.oid, 'DELETE')
  end as delete_privilege
from expected_tables
cross join expected_roles
left join pg_namespace n
  on n.nspname = 'public'
left join pg_class c
  on c.relnamespace = n.oid
 and c.relname = expected_tables.table_name
 and c.relkind in ('r', 'p')
order by expected_tables.table_name, expected_roles.role_name;

-- 9. Privilegios efetivos de execucao das funcoes esperadas.
-- O resultado esperado para create_public_order apos a migration 015 e:
-- anon=false, authenticated=false e service_role=true.
with expected_functions(function_name, identity_arguments) as (
  values
    ('create_public_order', 'uuid, uuid, jsonb, text, jsonb, text, text, jsonb'),
    ('get_public_order', 'uuid, text'),
    ('store_has_feature', 'uuid, text'),
    ('get_store_entitlements', 'uuid'),
    ('consume_order_rate_limit', 'text, uuid, text'),
    ('complete_order_rate_limit', 'uuid, boolean')
), expected_roles(role_name) as (
  values ('anon'), ('authenticated'), ('service_role')
)
select
  expected_functions.function_name,
  expected_functions.identity_arguments,
  expected_roles.role_name,
  (p.oid is not null) as function_exists,
  case when p.oid is null then null
    else has_function_privilege(expected_roles.role_name, p.oid, 'EXECUTE')
  end as execute_privilege
from expected_functions
cross join expected_roles
left join pg_namespace n
  on n.nspname = 'public'
left join pg_proc p
  on p.pronamespace = n.oid
 and p.proname = expected_functions.function_name
 and pg_get_function_identity_arguments(p.oid) = expected_functions.identity_arguments
order by expected_functions.function_name, expected_roles.role_name;

-- 10. Overloads existentes de create_public_order.
-- Este bloco revela assinaturas antigas sem depender de uma assinatura especifica.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_userbyid(p.proowner) as owner_name,
  case when p.prosecdef then 'SECURITY DEFINER' else 'SECURITY INVOKER' end as security_mode,
  coalesce(array_to_string(p.proconfig, ', '), '(not fixed)') as function_config
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'create_public_order'
order by identity_arguments;

-- 11. Buckets de imagens esperados.
-- Bloco independente que depende do objeto padrao storage.buckets.
-- Se o schema/tabela de Storage estiver ausente, este bloco falhara de forma
-- explicita; confirme primeiro o bloco 3. Nenhum arquivo e consultado.
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id in ('store-assets', 'product-images')
order by id;

-- 12. Policies de storage.objects.
-- Le somente metadados de policy em pg_policies; nao le objetos nem arquivos.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;

-- 13. Triggers das tabelas relevantes.
select
  event_object_schema as schema_name,
  event_object_table as table_name,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table in (
    'platform_settings',
    'plans',
    'stores',
    'store_users',
    'store_settings',
    'payment_methods',
    'categories',
    'products',
    'additional_groups',
    'additional_options',
    'additional_group_products',
    'customers',
    'orders',
    'order_items',
    'order_item_additionals',
    'order_rate_limit_attempts'
  )
order by event_object_table, trigger_name, event_manipulation;

-- 14. Indices das tabelas relevantes.
select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'plans',
    'stores',
    'store_users',
    'categories',
    'products',
    'additional_groups',
    'additional_options',
    'additional_group_products',
    'customers',
    'orders',
    'order_items',
    'order_item_additionals',
    'order_rate_limit_attempts'
  )
order by tablename, indexname;
