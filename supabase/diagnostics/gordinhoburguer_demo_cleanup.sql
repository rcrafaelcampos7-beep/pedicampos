-- Optional cleanup of deterministic catalog rows created by the Gordinho seed.
-- It keeps the tenant, settings, payments, Storage, Auth and store_users.
begin;
create or replace function pg_temp.demo_uuid(p_key text) returns uuid language sql immutable strict as $$
 select (substr(md5(p_key),1,8)||'-'||substr(md5(p_key),9,4)||'-4'||substr(md5(p_key),14,3)||'-8'||substr(md5(p_key),18,3)||'-'||substr(md5(p_key),21,12))::uuid $$;
do $$ begin
 if exists(select 1 from public.products p join public.stores s on s.id=p.store_id
   where s.slug='gordinhoburguer' and p.id in(
    select pg_temp.demo_uuid('gordinhoburguer_demo_v1:product:'||k) from unnest(array['x-bacon','smash-duplo','gordinho-especial','hotdog-completo','combo-smash','combo-familia','batata','coca-1l','guarana-lata'])k
   ) and nullif(btrim(p.image_url),'') is not null)
 then raise exception 'Cleanup aborted: a seeded product has a manual image'; end if;
end $$;
delete from public.additional_group_products where id in(select pg_temp.demo_uuid('gordinhoburguer_demo_v1:link:'||g||':'||p) from(values
 ('adicionais','x-bacon'),('adicionais','smash-duplo'),('adicionais','gordinho-especial'),('adicionais','hotdog-completo'),('bebida-combo','combo-smash'),('bebida-combo','combo-familia'))v(g,p));
delete from public.additional_options where id in(select pg_temp.demo_uuid('gordinhoburguer_demo_v1:option:'||k) from unnest(array['bacon','cheddar','carne','cebola','catupiry','coca-lata','guarana-lata','coca-1l'])k);
delete from public.additional_groups where id in(select pg_temp.demo_uuid('gordinhoburguer_demo_v1:group:'||k) from unnest(array['adicionais','bebida-combo'])k);
delete from public.products where id in(select pg_temp.demo_uuid('gordinhoburguer_demo_v1:product:'||k) from unnest(array['x-bacon','smash-duplo','gordinho-especial','hotdog-completo','combo-smash','combo-familia','batata','coca-1l','guarana-lata'])k);
delete from public.categories where id in(select pg_temp.demo_uuid('gordinhoburguer_demo_v1:category:'||k) from unnest(array['artesanais','smash','hotdog','combos','bebidas'])k)
 and not exists(select 1 from public.products p where p.category_id=categories.id);
commit;
