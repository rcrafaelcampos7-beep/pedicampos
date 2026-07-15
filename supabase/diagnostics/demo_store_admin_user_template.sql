-- Documentation template only. Do not run until placeholders are replaced.
-- 1. Authentication > Users > Add user; use a strong password and confirm it.
-- 2. Copy the Auth user UUID and the target store UUID.
-- 3. Replace every placeholder below, remove the surrounding comment, and run.
/*
insert into public.store_users (store_id, auth_user_id, email, role, active)
values (
  '<STORE_ID>'::uuid,
  '<AUTH_USER_ID>'::uuid,
  '<ADMIN_EMAIL>',
  'store_admin',
  true
)
on conflict (auth_user_id) do update
set store_id=excluded.store_id, email=excluded.email, role='store_admin', active=true;
*/
select 'Template seguro: substitua STORE_ID, AUTH_USER_ID e ADMIN_EMAIL antes de executar.' as instruction;
