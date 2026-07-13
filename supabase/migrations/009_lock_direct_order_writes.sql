-- PediCampos - make the validated RPC the only public order write boundary.
-- Anonymous users must never write order tables directly, even when RLS is enabled.

begin;

-- Remove every legacy policy that allowed a public direct INSERT.
drop policy if exists "Public can create customers for active stores" on public.customers;
drop policy if exists "Public can create orders for active stores" on public.orders;
drop policy if exists "Public can create order items" on public.order_items;
drop policy if exists "Public can create order item additionals" on public.order_item_additionals;

-- Also remove any equivalent policy created under a different name. Policies
-- exclusive to authenticated remain untouched.
do $$
declare
  v_policy record;
begin
  for v_policy in
    select p.schemaname, p.tablename, p.policyname
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = any(array['customers', 'orders', 'order_items', 'order_item_additionals'])
      and p.cmd in ('INSERT', 'ALL')
      and exists (
        select 1
        from unnest(p.roles) as policy_role(role_name)
        where policy_role.role_name in ('anon', 'public')
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      v_policy.policyname,
      v_policy.schemaname,
      v_policy.tablename
    );
  end loop;
end
$$;

-- Privileges are a separate security layer from RLS. Revoke from both the
-- Supabase anon role and PostgreSQL PUBLIC so anon cannot inherit a grant.
revoke all privileges on table public.customers from public, anon;
revoke all privileges on table public.orders from public, anon;
revoke all privileges on table public.order_items from public, anon;
revoke all privileges on table public.order_item_additionals from public, anon;

-- Authenticated users keep table privileges. Existing tenant RLS policies
-- remain responsible for restricting admins/masters to authorized stores.
grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert, update, delete on table public.orders to authenticated;
grant select, insert, update, delete on table public.order_items to authenticated;
grant select, insert, update, delete on table public.order_item_additionals to authenticated;

-- Reassert the exact public RPC identities and their hardened execution model.
alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)
  owner to postgres;
alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)
  security definer;
alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)
  set search_path = public;
revoke all on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) from public;
grant execute on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) to anon, authenticated;

alter function public.get_public_order(uuid, text)
  owner to postgres;
alter function public.get_public_order(uuid, text)
  security definer;
alter function public.get_public_order(uuid, text)
  set search_path = public;
revoke all on function public.get_public_order(uuid, text) from public;
grant execute on function public.get_public_order(uuid, text) to anon, authenticated;

comment on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) is
  'Only public order write boundary. Validates tenant/catalog/payment data and atomically writes order snapshots.';

commit;
