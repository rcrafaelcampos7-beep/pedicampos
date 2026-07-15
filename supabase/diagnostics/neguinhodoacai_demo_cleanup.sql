-- Optional cleanup of deterministic catalog rows created by the Neguinho seed.
-- It deliberately keeps stores, store_settings, payment_methods, Storage,
-- Auth and store_users. It aborts if a seeded product acquired a manual image.
begin;
create or replace function pg_temp.demo_uuid(p_key text) returns uuid language sql immutable strict as $$
 select (substr(md5(p_key),1,8)||'-'||substr(md5(p_key),9,4)||'-4'||substr(md5(p_key),14,3)||'-8'||substr(md5(p_key),18,3)||'-'||substr(md5(p_key),21,12))::uuid $$;
do $$ begin
 if exists(select 1 from public.products p join public.stores s on s.id=p.store_id
   where s.slug='neguinhodoacai' and p.id in(
    select pg_temp.demo_uuid('neguinhodoacai_demo_v1:product:'||k) from unnest(array['acai-300','acai-500','acai-700','barca-acai','milk-morango','milk-chocolate','combo-casal','coca-lata','agua'])k
   ) and nullif(btrim(p.image_url),'') is not null)
 then raise exception 'Cleanup aborted: a seeded product has a manual image'; end if;
end $$;
delete from public.additional_group_products where id in(select pg_temp.demo_uuid('neguinhodoacai_demo_v1:link:'||g||':'||p) from (values
 ('acompanhamentos','acai-300'),('acompanhamentos','acai-500'),('acompanhamentos','acai-700'),('acompanhamentos','barca-acai'),('acompanhamentos','combo-casal'),('caldas','acai-500'),('caldas','acai-700'),('caldas','barca-acai'))v(g,p));
delete from public.additional_options where id in(select pg_temp.demo_uuid('neguinhodoacai_demo_v1:option:'||k) from unnest(array['leite-po','leite-condensado','granola','banana','morango','nutella','chocolate','calda-morango','nutella-extra'])k);
delete from public.additional_groups where id in(select pg_temp.demo_uuid('neguinhodoacai_demo_v1:group:'||k) from unnest(array['acompanhamentos','caldas'])k);
delete from public.products where id in(select pg_temp.demo_uuid('neguinhodoacai_demo_v1:product:'||k) from unnest(array['acai-300','acai-500','acai-700','barca-acai','milk-morango','milk-chocolate','combo-casal','coca-lata','agua'])k);
delete from public.categories where id in(select pg_temp.demo_uuid('neguinhodoacai_demo_v1:category:'||k) from unnest(array['acai','barcas','milkshakes','bebidas','combos'])k)
 and not exists(select 1 from public.products p where p.category_id=categories.id);
commit;
