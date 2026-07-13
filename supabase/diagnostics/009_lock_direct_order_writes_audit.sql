-- Read-only post-migration audit for 009_lock_direct_order_writes.sql.
-- Run in Supabase SQL Editor after migration 009. Every assertion must pass.

do $$
declare
  v_table text;
  v_create_oid regprocedure := to_regprocedure(
    'public.create_public_order(uuid,jsonb,text,jsonb,text,text,jsonb)'
  );
  v_tracking_oid regprocedure := to_regprocedure('public.get_public_order(uuid,text)');
begin
  foreach v_table in array array[
    'public.customers',
    'public.orders',
    'public.order_items',
    'public.order_item_additionals'
  ]
  loop
    if has_table_privilege('anon', v_table, 'SELECT')
      or has_table_privilege('anon', v_table, 'INSERT')
      or has_table_privilege('anon', v_table, 'UPDATE')
      or has_table_privilege('anon', v_table, 'DELETE') then
      raise exception 'FAIL: anon still has direct table privileges on %', v_table;
    end if;
  end loop;

  if exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = any(array['customers', 'orders', 'order_items', 'order_item_additionals'])
      and p.cmd in ('INSERT', 'ALL')
      and (p.roles @> array['anon']::name[] or p.roles @> array['public']::name[])
  ) then
    raise exception 'FAIL: a public/anon direct INSERT policy still exists';
  end if;

  if v_create_oid is null or v_tracking_oid is null then
    raise exception 'FAIL: an expected public order RPC identity is missing';
  end if;

  if not has_function_privilege(
    'anon',
    'public.create_public_order(uuid,jsonb,text,jsonb,text,text,jsonb)',
    'EXECUTE'
  ) or not has_function_privilege(
    'authenticated',
    'public.create_public_order(uuid,jsonb,text,jsonb,text,text,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'FAIL: create_public_order EXECUTE grants are incomplete';
  end if;

  if not has_function_privilege('anon', 'public.get_public_order(uuid,text)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.get_public_order(uuid,text)', 'EXECUTE') then
    raise exception 'FAIL: get_public_order EXECUTE grants are incomplete';
  end if;

  if exists (
    select 1
    from pg_proc p
    where p.oid in (v_create_oid::oid, v_tracking_oid::oid)
      and (
        not p.prosecdef
        or p.proowner::regrole::text <> 'postgres'
        or not coalesce(p.proconfig, array[]::text[]) @> array['search_path=public']::text[]
      )
  ) then
    raise exception 'FAIL: RPC owner, SECURITY DEFINER or search_path is not hardened';
  end if;

  raise notice 'PASS: anon has no direct SELECT/INSERT/UPDATE/DELETE on order tables';
  raise notice 'PASS: no public direct INSERT policy remains';
  raise notice 'PASS: create_public_order/get_public_order identities and execution settings are hardened';
end
$$;

-- Human-readable grants and policies.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('customers', 'orders', 'order_items', 'order_item_additionals')
order by table_name, grantee, privilege_type;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('customers', 'orders', 'order_items', 'order_item_additionals')
order by tablename, policyname;

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
  and p.proname in ('create_public_order', 'get_public_order')
order by p.oid::regprocedure::text;

-- Any other anon-executable SECURITY DEFINER function containing DML must be
-- reviewed manually. The expected public DML entry here is create_public_order.
select
  p.oid::regprocedure as identity,
  p.proowner::regrole as owner,
  p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef
  and p.prokind = 'f'
  and has_function_privilege('anon', p.oid, 'EXECUTE')
  and pg_get_functiondef(p.oid) ~* '\m(insert|update|delete)\M'
order by p.oid::regprocedure::text;
