-- Read-only audit after 011_order_idempotency_and_limits.sql.

do $$
declare
  v_public_oid regprocedure := to_regprocedure(
    'public.create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)'
  );
  v_private_oid regprocedure := to_regprocedure(
    'public.create_public_order_validated_v10(uuid,jsonb,text,jsonb,text,text,jsonb)'
  );
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'idempotency_key'
      and data_type = 'uuid'
  ) then
    raise exception 'FAIL: orders.idempotency_key uuid is missing';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'orders'
      and indexname = 'idx_orders_store_idempotency_key'
      and indexdef ilike 'create unique index%'
      and indexdef like '%(store_id, idempotency_key)%'
  ) then
    raise exception 'FAIL: unique store/idempotency index is missing';
  end if;

  if v_public_oid is null or v_private_oid is null then
    raise exception 'FAIL: expected public/private RPC identities are missing';
  end if;
  if to_regprocedure('public.create_public_order(uuid,jsonb,text,jsonb,text,text,jsonb)') is not null then
    raise exception 'FAIL: obsolete seven-parameter public overload still exists';
  end if;

  if not has_function_privilege('anon', v_public_oid, 'EXECUTE')
    or not has_function_privilege('authenticated', v_public_oid, 'EXECUTE') then
    raise exception 'FAIL: public RPC execute grants are incomplete';
  end if;
  if has_function_privilege('anon', v_private_oid, 'EXECUTE')
    or has_function_privilege('authenticated', v_private_oid, 'EXECUTE') then
    raise exception 'FAIL: private validated implementation is externally executable';
  end if;

  if exists (
    select 1
    from pg_proc p
    where p.oid in (v_public_oid::oid, v_private_oid::oid)
      and (
        not p.prosecdef
        or p.proowner::regrole::text <> 'postgres'
        or not coalesce(p.proconfig, array[]::text[]) @> array['search_path=public']::text[]
      )
  ) then
    raise exception 'FAIL: owner, SECURITY DEFINER or search_path is not hardened';
  end if;

  raise notice 'PASS: UUID idempotency column and unique per-store index exist';
  raise notice 'PASS: only the bounded eight-parameter RPC is public';
  raise notice 'PASS: private v10 implementation has no anon/authenticated EXECUTE';
end
$$;

select
  a.attname as column_name,
  format_type(a.atttypid, a.atttypmod) as data_type,
  a.attnotnull as not_null
from pg_attribute a
where a.attrelid = 'public.orders'::regclass
  and a.attname = 'idempotency_key'
  and not a.attisdropped;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'orders'
  and indexname = 'idx_orders_store_idempotency_key';

select
  p.oid::regprocedure as identity,
  p.prosecdef as security_definer,
  p.proowner::regrole as owner,
  p.proconfig,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('create_public_order', 'create_public_order_validated_v10')
order by p.oid::regprocedure::text;
