-- PediCampos - authorize the first Supabase Auth master.
-- Run after creating the Auth user and replace the UUID placeholder below.

begin;

create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.store_users su
    where su.auth_user_id = auth.uid()
      and su.role = 'master'
      and su.active = true
  );
$$;

revoke all on function public.is_master() from public;
grant execute on function public.is_master() to authenticated;

drop policy if exists "Store users can update their stores" on public.stores;
drop policy if exists "Masters can update stores" on public.stores;
create policy "Masters can update stores"
on public.stores
for update
to authenticated
using (public.is_master())
with check (public.is_master());

drop policy if exists "Masters can insert stores" on public.stores;
create policy "Masters can insert stores"
on public.stores
for insert
to authenticated
with check (public.is_master());

drop policy if exists "Masters can delete stores" on public.stores;
create policy "Masters can delete stores"
on public.stores
for delete
to authenticated
using (public.is_master());

-- Replace the UUID and email before running. store_id stays NULL for a platform master.
update public.store_users
set email = 'master@example.com', role = 'master', active = true
where auth_user_id = '00000000-0000-0000-0000-000000000000'::uuid;

insert into public.store_users (store_id, auth_user_id, email, role, active)
select
  null,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'master@example.com',
  'master',
  true
where not exists (
  select 1
  from public.store_users
  where auth_user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

commit;
