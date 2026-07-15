-- Visible, read-only audit for the Brasa House Burger demo seed.
-- Run after supabase/seeds/lojateste_demo_catalog.sql.

with target_store as (
  select id, slug, name, active, open
  from public.stores
  where slug = 'lojateste'
),
summary as (
  select 10 as sort_group, 'store'::text as section, 'loja encontrada'::text as label,
         count(ts.id)::bigint as total,
         coalesce(
           max(format('%s | id=%s | active=%s | open=%s', ts.name, ts.id, ts.active, ts.open)),
           'slug lojateste não encontrado'
         )::text as details
  from target_store ts

  union all
  select 20, 'totals', 'categorias', count(c.id), 'todos os registros da loja'
  from target_store ts left join public.categories c on c.store_id = ts.id

  union all
  select 21, 'totals', 'produtos', count(p.id), 'todos os registros da loja'
  from target_store ts left join public.products p on p.store_id = ts.id

  union all
  select 22, 'totals', 'grupos de adicionais', count(ag.id), 'todos os registros da loja'
  from target_store ts left join public.additional_groups ag on ag.store_id = ts.id

  union all
  select 23, 'totals', 'opções de adicionais', count(ao.id), 'todos os registros da loja'
  from target_store ts left join public.additional_options ao on ao.store_id = ts.id

  union all
  select 24, 'totals', 'vínculos grupo/produto', count(agp.id), 'todos os registros da loja'
  from target_store ts left join public.additional_group_products agp on agp.store_id = ts.id

  union all
  select 25, 'totals', 'pedidos-demo', count(o.id), 'source=demo_seed; metadata.demoSeed=lojateste_demo_v1'
  from target_store ts
  left join public.orders o
    on o.store_id = ts.id
   and o.source = 'demo_seed'
   and o.metadata ->> 'demoSeed' = 'lojateste_demo_v1'
),
products_by_category as (
  select 100 + row_number() over (order by c.sort_order, c.name)::integer as sort_group,
         'products_by_category'::text as section,
         c.name::text as label,
         count(p.id)::bigint as total,
         count(p.id) filter (where p.active)::text || ' ativos' as details
  from target_store ts
  join public.categories c on c.store_id = ts.id
  left join public.products p on p.store_id = ts.id and p.category_id = c.id
  group by c.id, c.name, c.sort_order
),
orders_by_status as (
  select 200 + row_number() over (order by o.order_status)::integer as sort_group,
         'demo_orders_by_status'::text as section,
         o.order_status::text as label,
         count(*)::bigint as total,
         count(*) filter (where o.fulfillment = 'delivery')::text || ' entrega; '
           || count(*) filter (where o.fulfillment = 'pickup')::text || ' retirada' as details
  from target_store ts
  join public.orders o
    on o.store_id = ts.id
   and o.source = 'demo_seed'
   and o.metadata ->> 'demoSeed' = 'lojateste_demo_v1'
  group by o.order_status
)
select section, label, total, details
from (
  select * from summary
  union all
  select * from products_by_category
  union all
  select * from orders_by_status
) audit
order by sort_group, label;
