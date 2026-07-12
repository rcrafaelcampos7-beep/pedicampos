-- PediCampos - enforce that a product category belongs to the same store.
-- This complements the existing foreign key and RLS policies without widening access.

begin;

create or replace function public.validate_product_category_store()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and c.store_id = new.store_id
  ) then
    raise exception 'Product category must belong to the same store'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_product_category_store() from public;

drop trigger if exists trg_products_validate_category_store on public.products;
create trigger trg_products_validate_category_store
before insert or update of store_id, category_id on public.products
for each row execute function public.validate_product_category_store();

commit;
