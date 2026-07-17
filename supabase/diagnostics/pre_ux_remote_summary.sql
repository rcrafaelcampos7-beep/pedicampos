-- PediCampos: resumo remoto pre-UX, somente leitura.
-- Esta unica instrucao retorna uma unica grade com todas as verificacoes.
-- Nao le clientes, pedidos ou arquivos do Storage.
-- Funcoes sao resolvidas pela assinatura canonica com to_regprocedure e OID.

with
expected_schemas(schema_name) as (
  values ('public'), ('auth'), ('storage')
),
schema_checks as (
  select
    'SCHEMA'::text as categoria,
    ('schema ' || expected_schemas.schema_name)::text as verificacao,
    'exists'::text as esperado,
    case when n.oid is not null then 'exists' else 'not found' end::text as resultado,
    case when n.oid is not null then 'PASS' else 'FAIL' end::text as status,
    true as critical
  from expected_schemas
  left join pg_namespace n
    on n.nspname = expected_schemas.schema_name
),
expected_roles(role_name) as (
  values ('anon'), ('authenticated'), ('service_role')
),
role_inventory as (
  select
    expected_roles.role_name,
    r.oid as role_oid
  from expected_roles
  left join pg_roles r
    on r.rolname = expected_roles.role_name
),
role_checks as (
  select
    'ROLE'::text as categoria,
    ('role ' || role_name)::text as verificacao,
    'exists'::text as esperado,
    case when role_oid is not null then 'exists' else 'not found' end::text as resultado,
    case when role_oid is not null then 'PASS' else 'FAIL' end::text as status,
    true as critical
  from role_inventory
),
expected_tables(table_name) as (
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
    ('order_item_additionals')
),
table_inventory as (
  select
    expected_tables.table_name,
    c.oid as table_oid
  from expected_tables
  left join pg_namespace n
    on n.nspname = 'public'
  left join pg_class c
    on c.relnamespace = n.oid
   and c.relname = expected_tables.table_name
   and c.relkind in ('r', 'p')
),
table_checks as (
  select
    'TABLE'::text as categoria,
    ('public.' || table_name)::text as verificacao,
    'exists'::text as esperado,
    case when table_oid is not null then 'exists' else 'not found' end::text as resultado,
    case when table_oid is not null then 'PASS' else 'FAIL' end::text as status,
    true as critical
  from table_inventory
),
rate_limit_table as (
  select c.oid as table_oid
  from pg_class c
  join pg_namespace n
    on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'order_rate_limit_attempts'
    and c.relkind in ('r', 'p')
),
rate_limit_table_check as (
  select
    'TABLE'::text as categoria,
    'public.order_rate_limit_attempts'::text as verificacao,
    'exists'::text as esperado,
    case when exists (select 1 from rate_limit_table)
      then 'exists' else 'not found' end::text as resultado,
    case when exists (select 1 from rate_limit_table)
      then 'PASS' else 'FAIL' end::text as status,
    true as critical
),
expected_functions(function_name, expected_signature) as (
  values
    (
      'create_public_order',
      'public.create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)'
    ),
    (
      'get_public_order',
      'public.get_public_order(uuid,text)'
    ),
    (
      'consume_order_rate_limit',
      'public.consume_order_rate_limit(text,uuid,text)'
    ),
    (
      'complete_order_rate_limit',
      'public.complete_order_rate_limit(uuid,boolean)'
    ),
    (
      'store_has_feature',
      'public.store_has_feature(uuid,text)'
    ),
    (
      'get_store_entitlements',
      'public.get_store_entitlements(uuid)'
    )
),
expected_functions_resolved as (
  select
    function_name,
    expected_signature,
    to_regprocedure(expected_signature) as expected_oid
  from expected_functions
),
function_inventory as (
  select
    expected.function_name,
    expected.expected_signature,
    p.oid as function_oid,
    p.prosecdef,
    p.proconfig
  from expected_functions_resolved expected
  left join pg_proc p
    on p.oid = expected.expected_oid
),
function_existence_checks as (
  select
    'FUNCTION'::text as categoria,
    expected_signature::text as verificacao,
    'exists'::text as esperado,
    case when function_oid is not null then 'exists' else 'not found' end::text as resultado,
    case when function_oid is not null then 'PASS' else 'FAIL' end::text as status,
    true as critical
  from function_inventory
),
function_security_checks as (
  select
    'FUNCTION SECURITY'::text as categoria,
    ('security mode: public.' || function_name)::text as verificacao,
    'SECURITY DEFINER'::text as esperado,
    case
      when function_oid is null then 'function not found'
      when prosecdef then 'SECURITY DEFINER'
      else 'SECURITY INVOKER'
    end::text as resultado,
    case
      when function_oid is not null and prosecdef then 'PASS'
      else 'FAIL'
    end::text as status,
    true as critical
  from function_inventory
),
function_search_path_checks as (
  select
    'FUNCTION SEARCH_PATH'::text as categoria,
    ('search_path: public.' || function_name)::text as verificacao,
    'search_path=public'::text as esperado,
    case
      when function_oid is null then 'function not found'
      else coalesce(array_to_string(proconfig, ', '), '(not fixed)')
    end::text as resultado,
    case
      when function_oid is not null
       and coalesce(proconfig @> array['search_path=public']::text[], false)
        then 'PASS'
      else 'FAIL'
    end::text as status,
    true as critical
  from function_inventory
),
expected_rls_tables(table_name) as (
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
),
rls_inventory as (
  select
    expected_rls_tables.table_name,
    c.oid as table_oid,
    c.relrowsecurity
  from expected_rls_tables
  left join pg_namespace n
    on n.nspname = 'public'
  left join pg_class c
    on c.relnamespace = n.oid
   and c.relname = expected_rls_tables.table_name
   and c.relkind in ('r', 'p')
),
rls_checks as (
  select
    'RLS'::text as categoria,
    ('RLS public.' || table_name)::text as verificacao,
    'enabled'::text as esperado,
    case
      when table_oid is null then 'table not found'
      when relrowsecurity then 'enabled'
      else 'disabled'
    end::text as resultado,
    case
      when table_oid is not null and relrowsecurity then 'PASS'
      else 'FAIL'
    end::text as status,
    true as critical
  from rls_inventory
),
private_tables(table_name) as (
  values
    ('customers'),
    ('orders'),
    ('order_items'),
    ('order_item_additionals'),
    ('order_rate_limit_attempts')
),
write_privileges(privilege_name) as (
  values ('INSERT'), ('UPDATE'), ('DELETE')
),
anon_write_checks as (
  select
    'TABLE PRIVILEGE'::text as categoria,
    ('anon ' || write_privileges.privilege_name || ' public.' || private_tables.table_name)::text as verificacao,
    'false'::text as esperado,
    case
      when anon.role_oid is null then 'role not found'
      when c.oid is null then 'table not found'
      when has_table_privilege(anon.role_oid, c.oid, write_privileges.privilege_name)
        then 'true'
      else 'false'
    end::text as resultado,
    case
      when anon.role_oid is not null
       and c.oid is not null
       and not has_table_privilege(anon.role_oid, c.oid, write_privileges.privilege_name)
        then 'PASS'
      else 'FAIL'
    end::text as status,
    true as critical
  from private_tables
  cross join write_privileges
  left join role_inventory anon
    on anon.role_name = 'anon'
  left join pg_namespace n
    on n.nspname = 'public'
  left join pg_class c
    on c.relnamespace = n.oid
   and c.relname = private_tables.table_name
   and c.relkind in ('r', 'p')
),
create_order_roles(role_name, expected_execute) as (
  values
    ('anon', false),
    ('authenticated', false),
    ('service_role', true)
),
create_order_function as (
  select function_oid
  from function_inventory
  where function_name = 'create_public_order'
),
create_order_execute_checks as (
  select
    'FUNCTION PRIVILEGE'::text as categoria,
    ('execute create_public_order: ' || create_order_roles.role_name)::text as verificacao,
    create_order_roles.expected_execute::text as esperado,
    case
      when roles.role_oid is null then 'role not found'
      when functions.function_oid is null then 'function not found'
      else has_function_privilege(roles.role_oid, functions.function_oid, 'EXECUTE')::text
    end::text as resultado,
    case
      when roles.role_oid is not null
       and functions.function_oid is not null
       and has_function_privilege(roles.role_oid, functions.function_oid, 'EXECUTE')
           = create_order_roles.expected_execute
        then 'PASS'
      else 'FAIL'
    end::text as status,
    true as critical
  from create_order_roles
  left join role_inventory roles
    on roles.role_name = create_order_roles.role_name
  cross join create_order_function functions
),
expected_buckets(bucket_id) as (
  values ('store-assets'), ('product-images')
),
bucket_checks as (
  select
    'STORAGE BUCKET'::text as categoria,
    ('storage.buckets: ' || expected_buckets.bucket_id)::text as verificacao,
    'exists'::text as esperado,
    case when b.id is not null then 'exists' else 'not found' end::text as resultado,
    case when b.id is not null then 'PASS' else 'FAIL' end::text as status,
    true as critical
  from expected_buckets
  left join storage.buckets b
    on b.id = expected_buckets.bucket_id
),
storage_policy_check as (
  select
    'STORAGE POLICY'::text as categoria,
    'policies on storage.objects'::text as verificacao,
    'at least 1'::text as esperado,
    count(*)::text as resultado,
    case when count(*) > 0 then 'PASS' else 'FAIL' end::text as status,
    true as critical
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
),
expected_indexes(category_name, index_name) as (
  values
    ('IDEMPOTENCY INDEX', 'idx_orders_store_idempotency_key'),
    ('RATE LIMIT INDEX', 'order_rate_limit_subject_created_idx'),
    ('RATE LIMIT INDEX', 'order_rate_limit_store_key_created_idx'),
    ('RATE LIMIT INDEX', 'order_rate_limit_expiry_idx'),
    ('DEMO INDEX', 'stores_featured_demo_order_idx')
),
index_checks as (
  select
    expected_indexes.category_name::text as categoria,
    expected_indexes.index_name::text as verificacao,
    'exists'::text as esperado,
    case when i.indexname is not null then 'exists' else 'not found' end::text as resultado,
    case when i.indexname is not null then 'PASS' else 'FAIL' end::text as status,
    true as critical
  from expected_indexes
  left join pg_indexes i
    on i.schemaname = 'public'
   and i.indexname = expected_indexes.index_name
),
checks as (
  select * from schema_checks
  union all select * from role_checks
  union all select * from table_checks
  union all select * from rate_limit_table_check
  union all select * from function_existence_checks
  union all select * from function_security_checks
  union all select * from function_search_path_checks
  union all select * from rls_checks
  union all select * from anon_write_checks
  union all select * from create_order_execute_checks
  union all select * from bucket_checks
  union all select * from storage_policy_check
  union all select * from index_checks
),
gate as (
  select
    'FINAL GATE'::text as categoria,
    'PRE_UX_REMOTE_GATE'::text as verificacao,
    'all critical checks PASS'::text as esperado,
    case
      when coalesce(bool_and(status = 'PASS') filter (where critical), false)
        then 'all critical checks passed'
      else (count(*) filter (where critical and status <> 'PASS'))::text || ' critical check(s) not PASS'
    end::text as resultado,
    case
      when coalesce(bool_and(status = 'PASS') filter (where critical), false)
        then 'PASS'
      else 'FAIL'
    end::text as status,
    true as critical
  from checks
)
select
  categoria,
  verificacao,
  esperado,
  resultado,
  status
from (
  select categoria, verificacao, esperado, resultado, status, critical, 0 as sort_gate
  from checks

  union all

  select categoria, verificacao, esperado, resultado, status, critical, 1 as sort_gate
  from gate
) final_result
order by sort_gate, categoria, verificacao;
