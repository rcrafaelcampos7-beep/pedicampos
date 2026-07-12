-- Read-only audit for every public.create_public_order overload.
-- Run in Supabase SQL Editor and inspect all returned rows before changing the function.

select
  p.oid::regprocedure as exact_signature,
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  p.prosecdef as security_definer,
  pg_get_userbyid(p.proowner) as function_owner,
  p.proconfig as function_config,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'create_public_order'
order by p.oid;

-- The frontend currently calls this exact identity by named parameters:
-- p_store_id, p_customer, p_fulfillment, p_address, p_notes,
-- p_payment_method and p_items.
select
  to_regprocedure(
    'public.create_public_order(uuid,jsonb,text,jsonb,text,text,jsonb)'
  ) as frontend_target_signature;

select
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'create_public_order'
order by grantee, privilege_type;
