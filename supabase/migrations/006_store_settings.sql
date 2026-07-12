-- PediCampos - safe store profile updates for authenticated store users.
-- Commercial fields such as plan_key and active are intentionally not exposed.

begin;

create or replace function public.update_store_public_profile(
  p_store_id uuid,
  p_name text,
  p_slug text,
  p_segment text,
  p_open boolean,
  p_primary_color text,
  p_whatsapp text,
  p_logo text,
  p_banner_url text
)
returns public.stores
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store public.stores;
begin
  if not public.can_access_store(p_store_id) then
    raise exception 'Store access denied' using errcode = '42501';
  end if;

  update public.stores
  set name = p_name,
      slug = p_slug,
      segment = p_segment,
      open = p_open,
      primary_color = p_primary_color,
      whatsapp = p_whatsapp,
      logo = p_logo,
      banner_url = p_banner_url
  where id = p_store_id
  returning * into v_store;

  if v_store.id is null then
    raise exception 'Store not found' using errcode = 'P0002';
  end if;

  return v_store;
end;
$$;

revoke all on function public.update_store_public_profile(uuid, text, text, text, boolean, text, text, text, text) from public;
grant execute on function public.update_store_public_profile(uuid, text, text, text, boolean, text, text, text, text) to authenticated;

commit;
