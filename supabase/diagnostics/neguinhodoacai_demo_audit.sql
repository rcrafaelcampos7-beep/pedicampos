-- Read-only audit after running migration 014 and the Neguinho seed.
select s.name as loja, s.id as store_id, s.active, s.is_demo, s.demo_featured,
  s.demo_order, s.plan_key as plano,
  (select count(*) from public.categories c where c.store_id=s.id) as categorias,
  (select count(*) from public.products p where p.store_id=s.id) as produtos,
  (select count(*) from public.additional_groups g where g.store_id=s.id) as grupos,
  (select count(*) from public.additional_options o where o.store_id=s.id) as opcoes,
  (select count(*) from public.additional_group_products l where l.store_id=s.id) as vinculos,
  (select count(*) from public.products p where p.store_id=s.id and nullif(btrim(p.image_url),'') is not null) as imagens_presentes,
  (select count(*) from public.products p where p.store_id=s.id and nullif(btrim(p.image_url),'') is null) as produtos_sem_imagem,
  (select count(*) from (select lower(name) from public.products p where p.store_id=s.id group by lower(name) having count(*)>1) d) as produtos_duplicados,
  (select count(*) from (select lower(name) from public.categories c where c.store_id=s.id group by lower(name) having count(*)>1) d) as categorias_duplicadas,
  (select count(*) from (select lower(name) from public.additional_groups g where g.store_id=s.id group by lower(name) having count(*)>1) d) as grupos_duplicados,
  (select count(*) from (select additional_group_id,lower(name) from public.additional_options o where o.store_id=s.id group by additional_group_id,lower(name) having count(*)>1) d) as opcoes_duplicadas,
  (select count(*) from (select additional_group_id,product_id from public.additional_group_products l where l.store_id=s.id group by additional_group_id,product_id having count(*)>1) d) as vinculos_duplicados
from public.stores s where s.slug='neguinhodoacai';
