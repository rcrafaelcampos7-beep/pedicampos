-- Optional image map for the Brasa House Burger demo catalog.
--
-- This seed does not upload files. First upload each final WEBP to:
--   product-images/{storeId}/{productId}/{unique-file}.webp
-- Then paste its public URL into demo_product_images below.
--
-- Safety rules:
-- - NULL URLs are pending; they only clear the known legacy logo/banner copy.
-- - URLs must belong to the exact store/product path in product-images.
-- - Duplicate URLs in the map abort the transaction.
-- - A blank image or the old repeated store logo/banner may be replaced.
-- - Any other existing image requires replace_existing = true as explicit
--   confirmation. Only products.image_url is updated.

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
    raise exception 'Demo image seed aborted: store slug lojateste was not found'
      using errcode = 'P0002';
  end if;
end
$$;

create temporary table demo_image_store on commit drop as
select id, logo, banner_url
from public.stores
where slug = 'lojateste';

-- Paste only stable, public Supabase Storage URLs in image_url.
-- Keep replace_existing=false unless replacing a non-demo/manual image is
-- intentional and has been explicitly confirmed.
create temporary table demo_product_images on commit drop as
select * from (values
  ('brasa-classico', 'Brasa Clássico', null::text, false),
  ('brasa-bacon', 'Brasa Bacon', null, false),
  ('brasa-cheddar', 'Brasa Cheddar', null, false),
  ('brasa-salada', 'Brasa Salada', null, false),
  ('brasa-duplo', 'Brasa Duplo', null, false),
  ('brasa-especial', 'Brasa Especial', null, false),
  ('combo-classico', 'Combo Clássico', null, false),
  ('combo-bacon', 'Combo Bacon', null, false),
  ('combo-duplo', 'Combo Duplo', null, false),
  ('combo-familia', 'Combo Família', null, false),
  ('combo-casal', 'Combo Casal', null, false),
  ('smash-simples', 'Smash Simples', null, false),
  ('smash-duplo', 'Smash Duplo', null, false),
  ('smash-triplo', 'Smash Triplo', null, false),
  ('smash-cheddar', 'Smash Cheddar', null, false),
  ('smash-bacon', 'Smash Bacon', null, false),
  ('batata-p', 'Batata P', null, false),
  ('batata-g', 'Batata G', null, false),
  ('batata-cheddar-bacon', 'Batata com Cheddar e Bacon', null, false),
  ('onion-rings', 'Onion Rings', null, false),
  ('nuggets', 'Nuggets', null, false),
  ('coca-cola-lata', 'Coca-Cola Lata', null, false),
  ('coca-cola-1l', 'Coca-Cola 1L', null, false),
  ('guarana-lata', 'Guaraná Lata', null, false),
  ('agua-mineral', 'Água Mineral', null, false),
  ('suco-laranja', 'Suco de Laranja', null, false),
  ('brownie', 'Brownie', null, false),
  ('pudim', 'Pudim', null, false),
  ('mousse-chocolate', 'Mousse de Chocolate', null, false)
) as map(product_key, product_name, image_url, replace_existing);

create temporary table demo_resolved_product_images on commit drop as
select
  map.product_key,
  map.product_name,
  nullif(btrim(map.image_url), '') as image_url,
  map.replace_existing,
  store.id as store_id,
  store.logo,
  store.banner_url,
  resolved.id as product_id,
  resolved.current_image_url
from demo_product_images map
cross join demo_image_store store
left join lateral (
  select p.id, p.image_url as current_image_url
  from public.products p
  where p.store_id = store.id
    and (
      p.id = pg_temp.demo_uuid('lojateste_demo_v1:product:' || map.product_key)
      or lower(p.name) = lower(map.product_name)
    )
  order by
    (p.id = pg_temp.demo_uuid('lojateste_demo_v1:product:' || map.product_key)) desc,
    p.created_at asc
  limit 1
) resolved on true;

do $$
declare
  v_problem text;
begin
  select product_name into v_problem
  from demo_resolved_product_images
  where image_url is not null and product_id is null
  limit 1;
  if v_problem is not null then
    raise exception 'Demo image seed aborted: product not found: %', v_problem
      using errcode = 'P0002';
  end if;

  select min(product_name) into v_problem
  from demo_resolved_product_images
  where image_url is not null
  group by lower(image_url)
  having count(*) > 1
  limit 1;
  if v_problem is not null then
    raise exception 'Demo image seed aborted: one URL is mapped to multiple products (including %)', v_problem
      using errcode = '23514';
  end if;

  select product_name into v_problem
  from demo_resolved_product_images
  where image_url is not null
    and image_url !~* (
      '^https://[^/]+/storage/v1/object/public/product-images/'
      || store_id::text || '/' || product_id::text || '/[^/?#]+[.]webp$'
    )
  limit 1;
  if v_problem is not null then
    raise exception 'Demo image seed aborted: invalid product-images path for %', v_problem
      using errcode = '23514';
  end if;

  select product_name into v_problem
  from demo_resolved_product_images target
  where target.image_url is not null
    and not exists (
      select 1
      from storage.objects object
      where object.bucket_id = 'product-images'
        and object.name = split_part(
          target.image_url,
          '/storage/v1/object/public/product-images/',
          2
        )
    )
  limit 1;
  if v_problem is not null then
    raise exception 'Demo image seed aborted: Storage object was not found for %', v_problem
      using errcode = 'P0002';
  end if;

  select product_name into v_problem
  from demo_resolved_product_images
  where image_url is not null
    and coalesce(current_image_url, '') <> ''
    and current_image_url is distinct from logo
    and current_image_url is distinct from banner_url
    and current_image_url is distinct from image_url
    and replace_existing is not true
  limit 1;
  if v_problem is not null then
    raise exception 'Demo image seed aborted: % already has an image; set replace_existing=true only after confirmation', v_problem
      using errcode = '23514';
  end if;
end
$$;

update public.products product
set image_url = target.image_url
from demo_resolved_product_images target
where product.id = target.product_id
  and product.store_id = target.store_id
  and product.image_url is distinct from target.image_url
  and (
    (
      target.image_url is null
      and (
        product.image_url is not distinct from target.logo
        or product.image_url is not distinct from target.banner_url
      )
    )
    or (
      target.image_url is not null
      and (
        coalesce(product.image_url, '') = ''
        or product.image_url is not distinct from target.logo
        or product.image_url is not distinct from target.banner_url
        or target.replace_existing is true
      )
    )
  );

commit;
