-- PediCampos: inventario de funcoes publicas, somente leitura.
-- Lista funcoes relacionadas ao dominio e compara as identidades por OID.
-- A assinatura textual e exibida para diagnostico, mas nao e usada como
-- criterio de igualdade.

with
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
expected_resolved as (
  select
    function_name,
    expected_signature,
    to_regprocedure(expected_signature) as expected_oid
  from expected_functions
),
public_function_base as (
  select
    n.nspname::text as schema_name,
    p.proname::text as function_name,
    p.oid as function_oid,
    format(
      '%I.%I(%s)',
      n.nspname,
      p.proname,
      pg_get_function_identity_arguments(p.oid)
    )::text as full_signature,
    pg_get_function_arguments(p.oid)::text as parameters,
    pg_get_function_result(p.oid)::text as return_type,
    case
      when p.prosecdef then 'SECURITY DEFINER'
      else 'SECURITY INVOKER'
    end::text as security_mode,
    pg_get_userbyid(p.proowner)::text as owner_name,
    coalesce(
      (
        select regexp_replace(config_item, '^search_path=', '')
        from unnest(p.proconfig) as config(config_item)
        where config_item like 'search_path=%'
        limit 1
      ),
      '(not fixed)'
    )::text as search_path,
    count(*) over (
      partition by n.nspname, p.proname
    ) as same_name_count,
    count(*) over (
      partition by n.nspname, p.proname, p.proargtypes::text
    ) as same_identity_count
  from pg_proc p
  join pg_namespace n
    on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prokind = 'f'
    and p.proname ~* '(order|store|entitlement|feature|rate)'
),
public_function_inventory as (
  select
    base.*,
    expected.expected_signature,
    expected.expected_oid,
    exists (
      select 1
      from public_function_base sibling
      where sibling.function_name = base.function_name
        and sibling.function_oid = expected.expected_oid
    ) as expected_signature_exists
  from public_function_base base
  left join expected_resolved expected
    on expected.function_name = base.function_name
),
assessed_inventory as (
  select
    schema_name,
    function_name,
    full_signature,
    parameters,
    return_type,
    security_mode,
    owner_name,
    search_path,
    coalesce(expected_signature, '(not expected by project)')::text
      as expected_signature,
    case
      when same_identity_count > 1
        then 'DUPLICATE_FUNCTION'
      when expected_signature is null and same_name_count > 1
        then 'RELATED_FUNCTION; OVERLOAD_EXISTS'
      when expected_signature is null
        then 'RELATED_FUNCTION'
      when function_oid = expected_oid and same_name_count > 1
        then 'EXPECTED_SIGNATURE_FOUND; OVERLOAD_EXISTS'
      when function_oid = expected_oid
        then 'EXPECTED_SIGNATURE_FOUND'
      when expected_signature_exists
        then 'OVERLOAD_EXISTS'
      when same_name_count > 1
        then 'FUNCTION_FOUND_WITH_DIFFERENT_SIGNATURE; OVERLOAD_EXISTS'
      else 'FUNCTION_FOUND_WITH_DIFFERENT_SIGNATURE'
    end::text as comparison,
    same_name_count,
    same_identity_count,
    0 as sort_missing
  from public_function_inventory
),
missing_expected as (
  select
    'public'::text as schema_name,
    expected.function_name::text as function_name,
    expected.expected_signature::text as full_signature,
    regexp_replace(
      expected.expected_signature,
      '^public\.[^(]+\((.*)\)$',
      '\1'
    )::text as parameters,
    '(unknown)'::text as return_type,
    '(unknown)'::text as security_mode,
    '(unknown)'::text as owner_name,
    '(unknown)'::text as search_path,
    expected.expected_signature::text as expected_signature,
    case
      when exists (
        select 1
        from public_function_base actual
        where actual.function_name = expected.function_name
      ) and (
        select count(*)
        from public_function_base actual
        where actual.function_name = expected.function_name
      ) > 1
        then 'EXPECTED_SIGNATURE_MISSING; FUNCTION_FOUND_WITH_DIFFERENT_SIGNATURE; OVERLOAD_EXISTS'
      when exists (
        select 1
        from public_function_base actual
        where actual.function_name = expected.function_name
      ) then 'EXPECTED_SIGNATURE_MISSING; FUNCTION_FOUND_WITH_DIFFERENT_SIGNATURE'
      else 'FUNCTION_ABSENT'
    end::text as comparison,
    (
      select count(*)
      from public_function_base actual
      where actual.function_name = expected.function_name
    ) as same_name_count,
    0::bigint as same_identity_count,
    1 as sort_missing
  from expected_resolved expected
  where expected.expected_oid is null
)
select
  schema_name as schema,
  function_name as nome_funcao,
  full_signature as assinatura_completa,
  parameters as parametros,
  return_type as tipo_retorno,
  security_mode as modo_seguranca,
  owner_name as owner,
  search_path,
  expected_signature as assinatura_esperada,
  comparison as comparacao,
  same_name_count as ocorrencias_mesmo_nome,
  same_identity_count as ocorrencias_mesma_identidade
from (
  select * from assessed_inventory

  union all

  select * from missing_expected
) inventory_result
order by
  sort_missing,
  function_name,
  full_signature;
