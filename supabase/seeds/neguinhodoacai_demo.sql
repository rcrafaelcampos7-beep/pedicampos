-- Optional, idempotent demo seed for slug neguinhodoacai.
-- Run manually after migration 014. It does not create Auth/store_users.
-- The banner uses a repository asset reference resolved by the frontend until
-- it is deliberately migrated to Storage. Products have no specific images in
-- the legacy mock, so image_url stays NULL instead of repeating the banner.

begin;

create or replace function pg_temp.demo_uuid(p_key text) returns uuid
language sql immutable strict as $$
  select (substr(md5(p_key),1,8)||'-'||substr(md5(p_key),9,4)||'-4'||substr(md5(p_key),14,3)||'-8'||substr(md5(p_key),18,3)||'-'||substr(md5(p_key),21,12))::uuid
$$;

insert into public.stores (
  id, plan_key, name, slug, segment, active, open, primary_color, whatsapp,
  logo, banner_url, is_demo, demo_featured, demo_order, demo_label
)
values (
  pg_temp.demo_uuid('neguinhodoacai_demo_v1:store'), 'pro', 'Neguinho do Açaí',
  'neguinhodoacai', 'Açaí e lanches', true, true, '#7c3aed', '559999100100',
  null, 'asset:demo/neguinhodoacai/banner', true, false, null, 'Açaí, barcas e lanches'
)
on conflict (slug) do nothing;

create temporary table demo_store on commit drop as
select id from public.stores where slug = 'neguinhodoacai';

do $$ begin
  if (select count(*) from demo_store) <> 1 then
    raise exception 'Neguinho demo seed aborted: slug resolution is not unique';
  end if;
end $$;

update public.stores s
set is_demo = true,
    banner_url = coalesce(s.banner_url, 'asset:demo/neguinhodoacai/banner'),
    updated_at = now()
from demo_store ds where s.id = ds.id;

insert into public.store_settings (
  id, store_id, address, opening_hours, delivery_time, delivery_fee,
  minimum_order_value, service_mode, extra
)
select pg_temp.demo_uuid('neguinhodoacai_demo_v1:settings'), ds.id,
  'Rua das Palmeiras, 220 - Centro, Campos dos Goytacazes',
  'Segunda a domingo, 14h às 23h', '35-50 min', 5, 0,
  'delivery_pickup', jsonb_build_object('fallbackInitials','NA','demoSeed','neguinhodoacai_demo_v1')
from demo_store ds
on conflict (store_id) do update set
  extra = case when coalesce(public.store_settings.extra,'{}'::jsonb) ? 'fallbackInitials'
    then public.store_settings.extra
    else coalesce(public.store_settings.extra,'{}'::jsonb) || jsonb_build_object('fallbackInitials','NA') end;

insert into public.payment_methods (id, store_id, type, label, active)
select pg_temp.demo_uuid('neguinhodoacai_demo_v1:payment:'||v.type), ds.id, v.type, v.label, true
from demo_store ds cross join (values ('pix','Pix'),('card','Cartão'),('cash','Dinheiro')) v(type,label)
on conflict (store_id,type) do nothing;

create temporary table demo_categories on commit drop as select * from (values
  ('acai','Açaí',10),('barcas','Barcas',20),('milkshakes','Milk-shakes',30),
  ('bebidas','Bebidas',40),('combos','Combos',50)
) v(key,name,sort_order);

insert into public.categories (id,store_id,name,active,sort_order)
select pg_temp.demo_uuid('neguinhodoacai_demo_v1:category:'||c.key),s.id,c.name,true,c.sort_order
from demo_categories c cross join demo_store s
where not exists (select 1 from public.categories x where x.store_id=s.id and lower(x.name)=lower(c.name))
on conflict (id) do nothing;

create temporary table demo_category_map on commit drop as
select c.key, x.id from demo_categories c cross join demo_store s cross join lateral (
  select id from public.categories where store_id=s.id and lower(name)=lower(c.name)
  order by (id=pg_temp.demo_uuid('neguinhodoacai_demo_v1:category:'||c.key)) desc, created_at limit 1
) x;

create temporary table demo_products on commit drop as select * from (values
 ('acai-300','acai','Açaí 300ml','Açaí cremoso com até 3 acompanhamentos à sua escolha.',13.90::numeric,10),
 ('acai-500','acai','Açaí 500ml','Copo médio com açaí batido na hora e camadas caprichadas.',18.90,20),
 ('acai-700','acai','Açaí 700ml','Tamanho família para quem quer reforçar o pedido.',24.90,30),
 ('barca-acai','barcas','Barca de Açaí','Barca montada com frutas, leite em pó, granola e caldas.',44.90,10),
 ('milk-morango','milkshakes','Milk-shake de Morango','Milk-shake cremoso com calda de morango.',16.90,10),
 ('milk-chocolate','milkshakes','Milk-shake de Chocolate','Milk-shake encorpado com chocolate e chantilly.',17.90,20),
 ('combo-casal','combos','Combo Casal','Dois açaís 500ml com adicionais selecionados.',39.90,10),
 ('coca-lata','bebidas','Coca-Cola lata','Lata 350ml gelada.',6.00,10),
 ('agua','bebidas','Água mineral','Garrafa 500ml sem gás.',4.00,20)
) v(key,category_key,name,description,price,sort_order);

insert into public.products (id,store_id,category_id,name,description,price,image_url,active,sort_order)
select pg_temp.demo_uuid('neguinhodoacai_demo_v1:product:'||p.key),s.id,c.id,p.name,p.description,p.price,null,true,p.sort_order
from demo_products p join demo_category_map c on c.key=p.category_key cross join demo_store s
where not exists (select 1 from public.products x where x.store_id=s.id and lower(x.name)=lower(p.name))
on conflict (id) do nothing;

create temporary table demo_product_map on commit drop as
select p.key, x.id from demo_products p cross join demo_store s cross join lateral (
 select id from public.products where store_id=s.id and lower(name)=lower(p.name)
 order by (id=pg_temp.demo_uuid('neguinhodoacai_demo_v1:product:'||p.key)) desc,created_at limit 1
) x;

create temporary table demo_groups on commit drop as select * from (values
 ('acompanhamentos','Acompanhamentos','Escolha até 3 acompanhamentos para montar seu açaí.',false,0,3,'multiple',10),
 ('caldas','Calda especial','Escolha uma calda para finalizar.',false,0,1,'single',20)
) v(key,name,description,required,min_choices,max_choices,selection_type,sort_order);

insert into public.additional_groups (id,store_id,name,description,required,min_choices,max_choices,selection_type,active,sort_order)
select pg_temp.demo_uuid('neguinhodoacai_demo_v1:group:'||g.key),s.id,g.name,g.description,g.required,g.min_choices,g.max_choices,g.selection_type,true,g.sort_order
from demo_groups g cross join demo_store s
where not exists (select 1 from public.additional_groups x where x.store_id=s.id and lower(x.name)=lower(g.name))
on conflict (id) do nothing;

create temporary table demo_group_map on commit drop as
select g.key,x.id from demo_groups g cross join demo_store s cross join lateral (
 select id from public.additional_groups where store_id=s.id and lower(name)=lower(g.name)
 order by (id=pg_temp.demo_uuid('neguinhodoacai_demo_v1:group:'||g.key)) desc,created_at limit 1
) x;

create temporary table demo_options on commit drop as select * from (values
 ('leite-po','acompanhamentos','Leite em pó',0::numeric,10),('leite-condensado','acompanhamentos','Leite condensado',0,20),
 ('granola','acompanhamentos','Granola',0,30),('banana','acompanhamentos','Banana',0,40),
 ('morango','acompanhamentos','Morango',2,50),('nutella','acompanhamentos','Nutella',4,60),
 ('chocolate','caldas','Chocolate',0,10),('calda-morango','caldas','Morango',0,20),('nutella-extra','caldas','Nutella extra',5,30)
) v(key,group_key,name,price,sort_order);

insert into public.additional_options (id,store_id,additional_group_id,name,price,active,sort_order)
select pg_temp.demo_uuid('neguinhodoacai_demo_v1:option:'||o.key),s.id,g.id,o.name,o.price,true,o.sort_order
from demo_options o join demo_group_map g on g.key=o.group_key cross join demo_store s
where not exists (select 1 from public.additional_options x where x.store_id=s.id and x.additional_group_id=g.id and lower(x.name)=lower(o.name))
on conflict (id) do nothing;

create temporary table demo_links on commit drop as
select 'acompanhamentos'::text group_key,key product_key from demo_product_map where key in ('acai-300','acai-500','acai-700','barca-acai','combo-casal')
union all select 'caldas',key from demo_product_map where key in ('acai-500','acai-700','barca-acai');

insert into public.additional_group_products (id,store_id,additional_group_id,product_id)
select pg_temp.demo_uuid('neguinhodoacai_demo_v1:link:'||l.group_key||':'||l.product_key),s.id,g.id,p.id
from demo_links l join demo_group_map g on g.key=l.group_key join demo_product_map p on p.key=l.product_key cross join demo_store s
on conflict (additional_group_id,product_id) do nothing;

commit;
