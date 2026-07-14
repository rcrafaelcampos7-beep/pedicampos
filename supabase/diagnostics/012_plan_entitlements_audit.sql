-- Read-only verification after migration 012.
select
  p.key as plan,
  p.price,
  p.active,
  p.feature_flags
from public.plans p
where p.key in ('start', 'pro', 'premium')
order by case p.key when 'start' then 1 when 'pro' then 2 else 3 end;

select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  p.prosecdef as security_definer,
  pg_get_userbyid(p.proowner) as owner,
  p.proconfig as configuration
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('store_has_feature', 'get_store_entitlements', 'create_public_order', 'get_public_order')
order by p.proname;

select
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('customers', 'orders', 'order_items', 'order_item_additionals', 'payment_methods')
order by tablename, policyname;
