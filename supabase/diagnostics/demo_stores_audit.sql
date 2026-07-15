-- Public-demo inventory and ordering. Brasa House is only reported, never changed.
select name as loja, id as store_id, slug, active, is_demo, demo_featured,
  demo_order, demo_label, plan_key as plano,
  (active and is_demo and demo_featured) as aparece_na_landing
from public.stores
where is_demo or slug in ('lojateste','neguinhodoacai','gordinhoburguer')
order by demo_featured desc, demo_order nulls last, name;
