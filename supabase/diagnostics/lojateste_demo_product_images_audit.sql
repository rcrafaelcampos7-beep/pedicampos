-- Read-only image audit for the 29 Brasa House Burger demo products.

with target_store as (
  select id, logo, banner_url
  from public.stores
  where slug = 'lojateste'
),
demo_products(product_key, product_name) as (
  values
    ('brasa-classico', 'Brasa Clássico'), ('brasa-bacon', 'Brasa Bacon'),
    ('brasa-cheddar', 'Brasa Cheddar'), ('brasa-salada', 'Brasa Salada'),
    ('brasa-duplo', 'Brasa Duplo'), ('brasa-especial', 'Brasa Especial'),
    ('combo-classico', 'Combo Clássico'), ('combo-bacon', 'Combo Bacon'),
    ('combo-duplo', 'Combo Duplo'), ('combo-familia', 'Combo Família'),
    ('combo-casal', 'Combo Casal'), ('smash-simples', 'Smash Simples'),
    ('smash-duplo', 'Smash Duplo'), ('smash-triplo', 'Smash Triplo'),
    ('smash-cheddar', 'Smash Cheddar'), ('smash-bacon', 'Smash Bacon'),
    ('batata-p', 'Batata P'), ('batata-g', 'Batata G'),
    ('batata-cheddar-bacon', 'Batata com Cheddar e Bacon'),
    ('onion-rings', 'Onion Rings'), ('nuggets', 'Nuggets'),
    ('coca-cola-lata', 'Coca-Cola Lata'), ('coca-cola-1l', 'Coca-Cola 1L'),
    ('guarana-lata', 'Guaraná Lata'), ('agua-mineral', 'Água Mineral'),
    ('suco-laranja', 'Suco de Laranja'), ('brownie', 'Brownie'),
    ('pudim', 'Pudim'), ('mousse-chocolate', 'Mousse de Chocolate')
),
demo_product_keys as (
  select
    product_key,
    product_name,
    (
      substr(md5('lojateste_demo_v1:product:' || product_key), 1, 8) || '-' ||
      substr(md5('lojateste_demo_v1:product:' || product_key), 9, 4) || '-4' ||
      substr(md5('lojateste_demo_v1:product:' || product_key), 14, 3) || '-8' ||
      substr(md5('lojateste_demo_v1:product:' || product_key), 18, 3) || '-' ||
      substr(md5('lojateste_demo_v1:product:' || product_key), 21, 12)
    )::uuid as deterministic_id
  from demo_products
),
resolved as (
  select
    expected.product_key,
    expected.product_name as expected_name,
    store.id as store_id,
    store.logo,
    store.banner_url,
    product.id as product_id,
    product.name as product,
    category.name as category,
    nullif(btrim(product.image_url), '') as image_url
  from demo_product_keys expected
  cross join target_store store
  left join lateral (
    select p.*
    from public.products p
    where p.store_id = store.id
      and (p.id = expected.deterministic_id or lower(p.name) = lower(expected.product_name))
    order by (p.id = expected.deterministic_id) desc, p.created_at asc
    limit 1
  ) product on true
  left join public.categories category
    on category.id = product.category_id and category.store_id = store.id
),
image_counts as (
  select image_url, count(*)::integer as usage_count
  from resolved
  where image_url is not null
  group by image_url
),
audited as (
  select
    resolved.*,
    coalesce(image_counts.usage_count, 0) as image_usage_count
  from resolved
  left join image_counts on image_counts.image_url = resolved.image_url
)
select
  coalesce(product, expected_name) as product,
  category,
  product_id,
  case when product_id is null then null else
    'product-images/' || store_id::text || '/' || product_id::text || '/'
  end as expected_storage_prefix,
  image_url,
  case when image_url is null then null else image_usage_count = 1 end as is_unique,
  image_usage_count as products_using_same_image,
  count(*) filter (where image_url is null) over () as total_without_image,
  count(*) filter (where image_usage_count > 1) over () as total_products_sharing_images,
  case
    when image_url is null or product_id is null then false
    else image_url ~* (
      '^https://[^/]+/storage/v1/object/public/product-images/'
      || store_id::text || '/' || product_id::text || '/[^/?#]+[.]webp$'
    )
  end as is_correct_product_images_url,
  case
    when image_url is null then false
    else exists (
      select 1
      from storage.objects object
      where object.bucket_id = 'product-images'
        and object.name = split_part(
          image_url,
          '/storage/v1/object/public/product-images/',
          2
        )
    )
  end as storage_object_exists,
  case
    when product_id is null then 'PRODUCT_NOT_FOUND'
    when image_url is null then 'PENDING'
    when image_url is not distinct from logo then 'STORE_LOGO_REPEATED'
    when image_url is not distinct from banner_url then 'STORE_BANNER_REPEATED'
    when image_usage_count > 1 then 'SHARED_WITH_OTHER_PRODUCT'
    when image_url !~* (
      '^https://[^/]+/storage/v1/object/public/product-images/'
      || store_id::text || '/' || product_id::text || '/[^/?#]+[.]webp$'
    ) then 'INVALID_PRODUCT_IMAGES_PATH'
    when not exists (
      select 1
      from storage.objects object
      where object.bucket_id = 'product-images'
        and object.name = split_part(
          image_url,
          '/storage/v1/object/public/product-images/',
          2
        )
    ) then 'STORAGE_OBJECT_NOT_FOUND'
    else 'OK'
  end as status
from audited
order by category nulls last, product;
