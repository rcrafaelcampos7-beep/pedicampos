-- Selective cleanup for supabase/seeds/lojateste_demo_catalog.sql.
--
-- Only deterministic UUIDs owned by lojateste_demo_v1 and orders carrying both
-- demo markers are removed. Rows from other stores and same-name manual rows use
-- different IDs and are not touched. Order snapshots cascade from demo orders.
--
-- The store's brand/name and values applied to an already-existing settings or
-- payment row are intentionally not reverted: their previous values cannot be
-- reconstructed safely. Settings/payment rows created by the seed itself have
-- deterministic IDs and are removed.

begin;

create or replace function pg_temp.demo_uuid(p_key text)
returns uuid
language sql
immutable
strict
as $$
  select (
    substr(md5(p_key), 1, 8) || '-' ||
    substr(md5(p_key), 9, 4) || '-4' ||
    substr(md5(p_key), 14, 3) || '-8' ||
    substr(md5(p_key), 18, 3) || '-' ||
    substr(md5(p_key), 21, 12)
  )::uuid
$$;

do $$
begin
  if not exists (select 1 from public.stores where slug = 'lojateste') then
    raise exception 'Demo cleanup aborted: store slug lojateste was not found'
      using errcode = 'P0002';
  end if;
end
$$;

create temporary table demo_store on commit drop as
select id from public.stores where slug = 'lojateste';

create temporary table demo_category_keys on commit drop as
select unnest(array[
  'hamburgueres', 'combos', 'smash-burgers', 'porcoes', 'bebidas', 'sobremesas'
])::text as key;

create temporary table demo_product_keys on commit drop as
select * from (values
  ('brasa-classico', 'hamburgueres'), ('brasa-bacon', 'hamburgueres'),
  ('brasa-cheddar', 'hamburgueres'), ('brasa-salada', 'hamburgueres'),
  ('brasa-duplo', 'hamburgueres'), ('brasa-especial', 'hamburgueres'),
  ('combo-classico', 'combos'), ('combo-bacon', 'combos'),
  ('combo-duplo', 'combos'), ('combo-familia', 'combos'), ('combo-casal', 'combos'),
  ('smash-simples', 'smash-burgers'), ('smash-duplo', 'smash-burgers'),
  ('smash-triplo', 'smash-burgers'), ('smash-cheddar', 'smash-burgers'),
  ('smash-bacon', 'smash-burgers'),
  ('batata-p', 'porcoes'), ('batata-g', 'porcoes'),
  ('batata-cheddar-bacon', 'porcoes'), ('onion-rings', 'porcoes'), ('nuggets', 'porcoes'),
  ('coca-cola-lata', 'bebidas'), ('coca-cola-1l', 'bebidas'),
  ('guarana-lata', 'bebidas'), ('agua-mineral', 'bebidas'), ('suco-laranja', 'bebidas'),
  ('brownie', 'sobremesas'), ('pudim', 'sobremesas'), ('mousse-chocolate', 'sobremesas')
) as value(key, category_key);

create temporary table demo_group_keys on commit drop as
select unnest(array[
  'ponto-carne', 'adicionais', 'retirar', 'molhos', 'tamanho-bebida'
])::text as key;

create temporary table demo_option_keys on commit drop as
select unnest(array[
  'mal-passada', 'ao-ponto', 'bem-passada',
  'bacon-extra', 'cheddar-extra', 'catupiry', 'ovo', 'hamburguer-extra', 'cebola-caramelizada',
  'sem-cebola', 'sem-tomate', 'sem-alface', 'sem-molho',
  'maionese-casa', 'barbecue', 'molho-alho', 'molho-picante',
  'lata', '600ml', '1-litro'
])::text as key;

create temporary table demo_links on commit drop as
select 'ponto-carne'::text as group_key, dpk.key as product_key
from demo_product_keys dpk where dpk.category_key in ('hamburgueres', 'smash-burgers')
union all
select 'adicionais', dpk.key
from demo_product_keys dpk where dpk.category_key in ('hamburgueres', 'smash-burgers')
union all
select 'retirar', dpk.key
from demo_product_keys dpk where dpk.category_key in ('hamburgueres', 'smash-burgers')
union all
select 'molhos', dpk.key
from demo_product_keys dpk where dpk.category_key in ('hamburgueres', 'smash-burgers', 'combos', 'porcoes')
union all
select 'tamanho-bebida', dpk.key
from demo_product_keys dpk where dpk.key in ('coca-cola-lata', 'guarana-lata');

-- Cascades remove only the demo order items and item additionals.
delete from public.orders o
using demo_store ds
where o.store_id = ds.id
  and o.source = 'demo_seed'
  and o.metadata ->> 'demoSeed' = 'lojateste_demo_v1'
  and o.id in (
    select pg_temp.demo_uuid('lojateste_demo_v1:order:' || sequence_number)
    from generate_series(1, 22) as series(sequence_number)
  );

delete from public.customers c
using demo_store ds
where c.store_id = ds.id
  and c.id in (
    select pg_temp.demo_uuid('lojateste_demo_v1:customer:' || sequence_number)
    from generate_series(1, 22) as series(sequence_number)
  )
  and c.name like 'DEMO Cliente %'
  and not exists (select 1 from public.orders o where o.customer_id = c.id);

delete from public.additional_group_products agp
using demo_store ds
where agp.store_id = ds.id
  and agp.id in (
    select pg_temp.demo_uuid('lojateste_demo_v1:link:' || dl.group_key || ':' || dl.product_key)
    from demo_links dl
  );

delete from public.additional_options ao
using demo_store ds
where ao.store_id = ds.id
  and ao.id in (
    select pg_temp.demo_uuid('lojateste_demo_v1:option:' || dok.key)
    from demo_option_keys dok
  );

-- Seed products are removed only after their deterministic links are gone.
-- Historical real orders remain valid because order_items keep snapshots and
-- product_id uses ON DELETE SET NULL.
delete from public.products p
using demo_store ds
where p.store_id = ds.id
  and p.id in (
    select pg_temp.demo_uuid('lojateste_demo_v1:product:' || dpk.key)
    from demo_product_keys dpk
  )
  and not exists (
    select 1 from public.additional_group_products agp where agp.product_id = p.id
  );

delete from public.additional_groups ag
using demo_store ds
where ag.store_id = ds.id
  and ag.id in (
    select pg_temp.demo_uuid('lojateste_demo_v1:group:' || dgk.key)
    from demo_group_keys dgk
  )
  and not exists (select 1 from public.additional_options ao where ao.additional_group_id = ag.id)
  and not exists (select 1 from public.additional_group_products agp where agp.additional_group_id = ag.id);

delete from public.categories c
using demo_store ds
where c.store_id = ds.id
  and c.id in (
    select pg_temp.demo_uuid('lojateste_demo_v1:category:' || dck.key)
    from demo_category_keys dck
  )
  and not exists (select 1 from public.products p where p.category_id = c.id);

delete from public.payment_methods pm
using demo_store ds
where pm.store_id = ds.id
  and pm.id in (
    select pg_temp.demo_uuid('lojateste_demo_v1:payment:' || method_type)
    from unnest(array['pix', 'card', 'cash']) as methods(method_type)
  );

delete from public.store_settings ss
using demo_store ds
where ss.store_id = ds.id
  and ss.id = pg_temp.demo_uuid('lojateste_demo_v1:store-settings')
  and ss.extra ->> 'demoSeed' = 'lojateste_demo_v1';

-- If settings already existed before the seed, only its non-destructive marker
-- is removed. Operational values are left intact rather than guessed/reverted.
update public.store_settings ss
set extra = ss.extra - 'demoSeed', updated_at = now()
from demo_store ds
where ss.store_id = ds.id
  and ss.extra ->> 'demoSeed' = 'lojateste_demo_v1';

commit;
