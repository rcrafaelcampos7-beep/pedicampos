-- PediCampos - additional groups integrity and atomic save operation.
-- Keeps groups, options and product links inside the same store.

begin;

create or replace function public.validate_additional_option_store()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.additional_groups ag
    where ag.id = new.additional_group_id and ag.store_id = new.store_id
  ) then
    raise exception 'Additional option group must belong to the same store'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function public.validate_additional_group_product_store()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.additional_groups ag
    where ag.id = new.additional_group_id and ag.store_id = new.store_id
  ) or not exists (
    select 1 from public.products p
    where p.id = new.product_id and p.store_id = new.store_id
  ) then
    raise exception 'Additional group and product must belong to the same store'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function public.validate_additional_option_store() from public;
revoke all on function public.validate_additional_group_product_store() from public;

drop trigger if exists trg_additional_options_validate_store on public.additional_options;
create trigger trg_additional_options_validate_store
before insert or update of store_id, additional_group_id on public.additional_options
for each row execute function public.validate_additional_option_store();

drop trigger if exists trg_additional_group_products_validate_store on public.additional_group_products;
create trigger trg_additional_group_products_validate_store
before insert or update of store_id, additional_group_id, product_id on public.additional_group_products
for each row execute function public.validate_additional_group_product_store();

create or replace function public.save_additional_group(
  p_group_id uuid,
  p_store_id uuid,
  p_name text,
  p_description text,
  p_required boolean,
  p_min_choices integer,
  p_max_choices integer,
  p_selection_type text,
  p_active boolean,
  p_sort_order integer,
  p_options jsonb,
  p_product_ids uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_group_id uuid := coalesce(p_group_id, gen_random_uuid());
  v_updated integer;
begin
  if p_group_id is null then
    insert into public.additional_groups (
      id, store_id, name, description, required, min_choices, max_choices,
      selection_type, active, sort_order
    ) values (
      v_group_id, p_store_id, p_name, p_description, p_required, p_min_choices,
      p_max_choices, p_selection_type, p_active, p_sort_order
    );
  else
    update public.additional_groups
    set name = p_name,
        description = p_description,
        required = p_required,
        min_choices = p_min_choices,
        max_choices = p_max_choices,
        selection_type = p_selection_type,
        active = p_active,
        sort_order = p_sort_order
    where id = p_group_id and store_id = p_store_id;
    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'Additional group not found or not authorized'
        using errcode = '42501';
    end if;
  end if;

  delete from public.additional_options where additional_group_id = v_group_id;
  insert into public.additional_options (
    store_id, additional_group_id, name, price, active, sort_order
  )
  select
    p_store_id,
    v_group_id,
    option_item.value->>'name',
    coalesce((option_item.value->>'price')::numeric, 0),
    coalesce((option_item.value->>'active')::boolean, true),
    option_item.ordinality::integer
  from jsonb_array_elements(coalesce(p_options, '[]'::jsonb)) with ordinality as option_item(value, ordinality)
  where nullif(trim(option_item.value->>'name'), '') is not null;

  delete from public.additional_group_products where additional_group_id = v_group_id;
  insert into public.additional_group_products (store_id, additional_group_id, product_id)
  select p_store_id, v_group_id, product_id
  from unnest(coalesce(p_product_ids, array[]::uuid[])) as product_id
  on conflict (additional_group_id, product_id) do nothing;

  return v_group_id;
end;
$$;

revoke all on function public.save_additional_group(uuid, uuid, text, text, boolean, integer, integer, text, boolean, integer, jsonb, uuid[]) from public;
grant execute on function public.save_additional_group(uuid, uuid, text, text, boolean, integer, integer, text, boolean, integer, jsonb, uuid[]) to authenticated;

commit;
