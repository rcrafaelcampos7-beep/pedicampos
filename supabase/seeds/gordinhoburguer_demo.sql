-- Optional, idempotent demo seed for slug gordinhoburguer.
-- Run manually after migration 014. It does not create Auth/store_users.
-- The legacy mock has one local banner and no product-specific images.

begin;
create or replace function pg_temp.demo_uuid(p_key text) returns uuid language sql immutable strict as $$
 select (substr(md5(p_key),1,8)||'-'||substr(md5(p_key),9,4)||'-4'||substr(md5(p_key),14,3)||'-8'||substr(md5(p_key),18,3)||'-'||substr(md5(p_key),21,12))::uuid
$$;

insert into public.stores (id,plan_key,name,slug,segment,active,open,primary_color,whatsapp,logo,banner_url,is_demo,demo_featured,demo_order,demo_label)
values (pg_temp.demo_uuid('gordinhoburguer_demo_v1:store'),'premium','Gordinho Burguer','gordinhoburguer','Hamburgueria',true,true,'#ef4444','559999200200',null,'asset:demo/gordinhoburguer/banner',true,false,null,'Hambúrgueres artesanais e combos')
on conflict (slug) do nothing;
create temporary table demo_store on commit drop as select id from public.stores where slug='gordinhoburguer';
do $$ begin if (select count(*) from demo_store)<>1 then raise exception 'Gordinho demo seed aborted: slug resolution is not unique'; end if; end $$;
update public.stores s set is_demo=true,banner_url=coalesce(s.banner_url,'asset:demo/gordinhoburguer/banner'),updated_at=now() from demo_store d where s.id=d.id;

insert into public.store_settings (id,store_id,address,opening_hours,delivery_time,delivery_fee,minimum_order_value,service_mode,extra)
select pg_temp.demo_uuid('gordinhoburguer_demo_v1:settings'),d.id,'Av. Alberto Torres, 1180 - Parque Leopoldina, Campos dos Goytacazes','Terça a domingo, 18h às 00h','40-60 min',7,0,'delivery_pickup',jsonb_build_object('fallbackInitials','GB','demoSeed','gordinhoburguer_demo_v1') from demo_store d
on conflict (store_id) do update set extra=case when coalesce(public.store_settings.extra,'{}'::jsonb)?'fallbackInitials' then public.store_settings.extra else coalesce(public.store_settings.extra,'{}'::jsonb)||jsonb_build_object('fallbackInitials','GB') end;
insert into public.payment_methods (id,store_id,type,label,active)
select pg_temp.demo_uuid('gordinhoburguer_demo_v1:payment:'||v.type),d.id,v.type,v.label,true from demo_store d cross join (values ('pix','Pix'),('card','Cartão'),('cash','Dinheiro')) v(type,label)
on conflict (store_id,type) do nothing;

create temporary table demo_categories on commit drop as select * from (values
 ('artesanais','Artesanais',10),('smash','Smash',20),('hotdog','Hot Dog',30),('combos','Combos',40),('bebidas','Bebidas',50)
)v(key,name,sort_order);
insert into public.categories(id,store_id,name,active,sort_order)
select pg_temp.demo_uuid('gordinhoburguer_demo_v1:category:'||c.key),s.id,c.name,true,c.sort_order from demo_categories c cross join demo_store s
where not exists(select 1 from public.categories x where x.store_id=s.id and lower(x.name)=lower(c.name)) on conflict(id) do nothing;
create temporary table demo_category_map on commit drop as select c.key,x.id from demo_categories c cross join demo_store s cross join lateral(
 select id from public.categories where store_id=s.id and lower(name)=lower(c.name) order by (id=pg_temp.demo_uuid('gordinhoburguer_demo_v1:category:'||c.key)) desc,created_at limit 1)x;

create temporary table demo_products on commit drop as select * from(values
 ('x-bacon','artesanais','X-Bacon Artesanal','Blend 160g, bacon crocante, queijo, alface, tomate e molho da casa.',28.90::numeric,10),
 ('smash-duplo','smash','Smash Duplo','Dois smash burgers, cheddar derretido, picles e molho especial.',26.90,10),
 ('gordinho-especial','artesanais','Gordinho Especial','Burger alto com carne 180g, cheddar, cebola caramelizada e bacon.',34.90,20),
 ('hotdog-completo','hotdog','Hot Dog Completo','Salsicha, milho, batata palha, queijo, molhos e purê cremoso.',19.90,10),
 ('combo-smash','combos','Combo Smash + Batata','Smash duplo, batata frita individual e refrigerante lata.',39.90,10),
 ('combo-familia','combos','Combo Família','Quatro burgers artesanais, batata grande e Coca-Cola 1L.',109.90,20),
 ('batata','combos','Batata Frita','Porção crocante com sal da casa.',14.90,30),
 ('coca-1l','bebidas','Coca-Cola 1L','Garrafa 1L gelada.',12.00,10),
 ('guarana-lata','bebidas','Guaraná lata','Lata 350ml gelada.',6.00,20)
)v(key,category_key,name,description,price,sort_order);
insert into public.products(id,store_id,category_id,name,description,price,image_url,active,sort_order)
select pg_temp.demo_uuid('gordinhoburguer_demo_v1:product:'||p.key),s.id,c.id,p.name,p.description,p.price,null,true,p.sort_order from demo_products p join demo_category_map c on c.key=p.category_key cross join demo_store s
where not exists(select 1 from public.products x where x.store_id=s.id and lower(x.name)=lower(p.name)) on conflict(id) do nothing;
create temporary table demo_product_map on commit drop as select p.key,x.id from demo_products p cross join demo_store s cross join lateral(
 select id from public.products where store_id=s.id and lower(name)=lower(p.name) order by(id=pg_temp.demo_uuid('gordinhoburguer_demo_v1:product:'||p.key))desc,created_at limit 1)x;

create temporary table demo_groups on commit drop as select * from(values
 ('adicionais','Adicionais do lanche','Turbine seu lanche com extras.',false,0,4,'multiple',10),
 ('bebida-combo','Escolha sua bebida','Selecione a bebida do combo.',true,1,1,'single',20)
)v(key,name,description,required,min_choices,max_choices,selection_type,sort_order);
insert into public.additional_groups(id,store_id,name,description,required,min_choices,max_choices,selection_type,active,sort_order)
select pg_temp.demo_uuid('gordinhoburguer_demo_v1:group:'||g.key),s.id,g.name,g.description,g.required,g.min_choices,g.max_choices,g.selection_type,true,g.sort_order from demo_groups g cross join demo_store s
where not exists(select 1 from public.additional_groups x where x.store_id=s.id and lower(x.name)=lower(g.name)) on conflict(id) do nothing;
create temporary table demo_group_map on commit drop as select g.key,x.id from demo_groups g cross join demo_store s cross join lateral(
 select id from public.additional_groups where store_id=s.id and lower(name)=lower(g.name) order by(id=pg_temp.demo_uuid('gordinhoburguer_demo_v1:group:'||g.key))desc,created_at limit 1)x;

create temporary table demo_options on commit drop as select * from(values
 ('bacon','adicionais','Bacon extra',4::numeric,10),('cheddar','adicionais','Cheddar',3,20),('carne','adicionais','Carne extra',7,30),('cebola','adicionais','Cebola caramelizada',0,40),('catupiry','adicionais','Catupiry',4,50),
 ('coca-lata','bebida-combo','Coca-Cola lata',0,10),('guarana-lata','bebida-combo','Guaraná lata',0,20),('coca-1l','bebida-combo','Coca-Cola 1L',5,30)
)v(key,group_key,name,price,sort_order);
insert into public.additional_options(id,store_id,additional_group_id,name,price,active,sort_order)
select pg_temp.demo_uuid('gordinhoburguer_demo_v1:option:'||o.key),s.id,g.id,o.name,o.price,true,o.sort_order from demo_options o join demo_group_map g on g.key=o.group_key cross join demo_store s
where not exists(select 1 from public.additional_options x where x.store_id=s.id and x.additional_group_id=g.id and lower(x.name)=lower(o.name)) on conflict(id) do nothing;

create temporary table demo_links on commit drop as
select 'adicionais'::text group_key,key product_key from demo_product_map where key in('x-bacon','smash-duplo','gordinho-especial','hotdog-completo')
union all select 'bebida-combo',key from demo_product_map where key in('combo-smash','combo-familia');
insert into public.additional_group_products(id,store_id,additional_group_id,product_id)
select pg_temp.demo_uuid('gordinhoburguer_demo_v1:link:'||l.group_key||':'||l.product_key),s.id,g.id,p.id from demo_links l join demo_group_map g on g.key=l.group_key join demo_product_map p on p.key=l.product_key cross join demo_store s
on conflict(additional_group_id,product_id) do nothing;
commit;
