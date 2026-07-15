-- PediCampos demo seed: Brasa House Burger (store slug: lojateste)
--
-- This file is intentionally outside supabase/migrations. Run it manually in
-- the Supabase SQL Editor only when the lojateste tenant should be populated.
-- It never hardcodes a store UUID: every row is scoped to the store resolved by
-- slug. Stable UUIDs and guarded upserts make re-execution safe.
--
-- Existing records with the same name but a different ID are preserved and
-- reused where relationships require them. Existing logo/banner, plan, users,
-- Auth links and unrelated store data are not changed.

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
    raise exception 'Demo seed aborted: store slug lojateste was not found'
      using errcode = 'P0002';
  end if;
end
$$;

create temporary table demo_store on commit drop as
select id
from public.stores
where slug = 'lojateste';

update public.stores s
set name = 'Brasa House Burger',
    segment = 'Hamburgueria',
    active = true,
    open = true,
    updated_at = now()
from demo_store ds
where s.id = ds.id;

insert into public.store_settings (
  id, store_id, delivery_time, delivery_fee, minimum_order_value,
  service_mode, extra
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:store-settings'),
  ds.id,
  '35-50 min',
  5.00,
  15.00,
  'delivery_pickup',
  jsonb_build_object(
    'shortDescription', 'Hambúrgueres artesanais, combos e porções',
    'demoSeed', 'lojateste_demo_v1'
  )
from demo_store ds
on conflict (store_id) do update
set delivery_time = excluded.delivery_time,
    delivery_fee = excluded.delivery_fee,
    minimum_order_value = excluded.minimum_order_value,
    service_mode = excluded.service_mode,
    extra = coalesce(public.store_settings.extra, '{}'::jsonb) || excluded.extra,
    updated_at = now();

insert into public.payment_methods (id, store_id, type, label, active)
select
  pg_temp.demo_uuid('lojateste_demo_v1:payment:' || method.type),
  ds.id,
  method.type,
  method.label,
  true
from demo_store ds
cross join (values
  ('pix', 'Pix'),
  ('card', 'Cartão'),
  ('cash', 'Dinheiro')
) as method(type, label)
on conflict (store_id, type) do update
set label = excluded.label,
    active = true,
    updated_at = now();

create temporary table demo_categories on commit drop as
select * from (values
  ('hamburgueres', 'Hambúrgueres', 10),
  ('combos', 'Combos', 20),
  ('smash-burgers', 'Smash Burgers', 30),
  ('porcoes', 'Porções', 40),
  ('bebidas', 'Bebidas', 50),
  ('sobremesas', 'Sobremesas', 60)
) as value(key, name, sort_order);

insert into public.categories (id, store_id, name, active, sort_order)
select
  pg_temp.demo_uuid('lojateste_demo_v1:category:' || dc.key),
  ds.id,
  dc.name,
  true,
  dc.sort_order
from demo_categories dc
cross join demo_store ds
where not exists (
  select 1
  from public.categories existing
  where existing.store_id = ds.id
    and lower(existing.name) = lower(dc.name)
    and existing.id <> pg_temp.demo_uuid('lojateste_demo_v1:category:' || dc.key)
)
on conflict (id) do update
set name = excluded.name,
    active = true,
    sort_order = excluded.sort_order,
    updated_at = now();

create temporary table demo_category_map on commit drop as
select dc.key, resolved.id
from demo_categories dc
cross join demo_store ds
cross join lateral (
  select c.id
  from public.categories c
  where c.store_id = ds.id and lower(c.name) = lower(dc.name)
  order by (c.id = pg_temp.demo_uuid('lojateste_demo_v1:category:' || dc.key)) desc,
           c.created_at asc
  limit 1
) resolved;

create temporary table demo_products on commit drop as
select * from (values
  ('brasa-classico', 'hamburgueres', 'Brasa Clássico', 'Pão brioche, burger artesanal de 150 g, queijo, alface, tomate e molho da casa.', 22.90::numeric, 10),
  ('brasa-bacon', 'hamburgueres', 'Brasa Bacon', 'Burger artesanal, queijo, bacon crocante, cebola caramelizada e barbecue.', 27.90, 20),
  ('brasa-cheddar', 'hamburgueres', 'Brasa Cheddar', 'Burger artesanal, cheddar cremoso, cebola na chapa e molho especial.', 25.90, 30),
  ('brasa-salada', 'hamburgueres', 'Brasa Salada', 'Burger artesanal, queijo, alface, tomate, cebola roxa e maionese da casa.', 23.90, 40),
  ('brasa-duplo', 'hamburgueres', 'Brasa Duplo', 'Dois burgers artesanais, queijo duplo, picles e molho da casa.', 32.90, 50),
  ('brasa-especial', 'hamburgueres', 'Brasa Especial', 'Burger de 180 g, queijo, bacon, onion rings, barbecue e pão brioche.', 34.90, 60),
  ('combo-classico', 'combos', 'Combo Clássico', 'Brasa Clássico, batata P e refrigerante lata.', 32.90, 10),
  ('combo-bacon', 'combos', 'Combo Bacon', 'Brasa Bacon, batata P e refrigerante lata.', 37.90, 20),
  ('combo-duplo', 'combos', 'Combo Duplo', 'Brasa Duplo, batata P e refrigerante lata.', 42.90, 30),
  ('combo-familia', 'combos', 'Combo Família', 'Quatro burgers clássicos, duas batatas G e Coca-Cola 1L.', 79.90, 40),
  ('combo-casal', 'combos', 'Combo Casal', 'Dois burgers clássicos, batata G e Coca-Cola 1L.', 54.90, 50),
  ('smash-simples', 'smash-burgers', 'Smash Simples', 'Smash de 90 g, queijo, picles e molho da casa.', 16.90, 10),
  ('smash-duplo', 'smash-burgers', 'Smash Duplo', 'Dois smash burgers, queijo duplo, picles e molho da casa.', 23.90, 20),
  ('smash-triplo', 'smash-burgers', 'Smash Triplo', 'Três smash burgers, queijo triplo e molho especial.', 29.90, 30),
  ('smash-cheddar', 'smash-burgers', 'Smash Cheddar', 'Dois smash burgers, cheddar cremoso e cebola caramelizada.', 25.90, 40),
  ('smash-bacon', 'smash-burgers', 'Smash Bacon', 'Dois smash burgers, queijo, bacon crocante e barbecue.', 27.90, 50),
  ('batata-p', 'porcoes', 'Batata P', 'Porção individual de batatas fritas crocantes.', 9.90, 10),
  ('batata-g', 'porcoes', 'Batata G', 'Porção grande de batatas fritas crocantes.', 18.90, 20),
  ('batata-cheddar-bacon', 'porcoes', 'Batata com Cheddar e Bacon', 'Batata G coberta com cheddar cremoso e bacon crocante.', 27.90, 30),
  ('onion-rings', 'porcoes', 'Onion Rings', 'Anéis de cebola empanados e crocantes, com molho da casa.', 19.90, 40),
  ('nuggets', 'porcoes', 'Nuggets', 'Dez nuggets de frango dourados e crocantes.', 17.90, 50),
  ('coca-cola-lata', 'bebidas', 'Coca-Cola Lata', 'Coca-Cola gelada, lata 350 ml.', 6.00, 10),
  ('coca-cola-1l', 'bebidas', 'Coca-Cola 1L', 'Coca-Cola gelada, garrafa de 1 litro.', 12.00, 20),
  ('guarana-lata', 'bebidas', 'Guaraná Lata', 'Guaraná gelado, lata 350 ml.', 5.50, 30),
  ('agua-mineral', 'bebidas', 'Água Mineral', 'Água mineral sem gás, 500 ml.', 4.00, 40),
  ('suco-laranja', 'bebidas', 'Suco de Laranja', 'Suco de laranja natural, 400 ml.', 9.90, 50),
  ('brownie', 'sobremesas', 'Brownie', 'Brownie de chocolate com casquinha crocante e interior macio.', 11.90, 10),
  ('pudim', 'sobremesas', 'Pudim', 'Fatia de pudim de leite condensado com calda de caramelo.', 9.90, 20),
  ('mousse-chocolate', 'sobremesas', 'Mousse de Chocolate', 'Mousse de chocolate cremosa em porção individual.', 8.90, 30)
) as value(key, category_key, name, description, price, sort_order);

insert into public.products (
  id, store_id, category_id, name, description, price, image_url, active, sort_order
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:product:' || dp.key),
  ds.id,
  dcm.id,
  dp.name,
  dp.description,
  dp.price,
  null::text,
  true,
  dp.sort_order
from demo_products dp
join demo_category_map dcm on dcm.key = dp.category_key
cross join demo_store ds
where not exists (
  select 1
  from public.products existing
  where existing.store_id = ds.id
    and lower(existing.name) = lower(dp.name)
    and existing.id <> pg_temp.demo_uuid('lojateste_demo_v1:product:' || dp.key)
)
on conflict (id) do update
set category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    active = true,
    sort_order = excluded.sort_order,
    updated_at = now();

create temporary table demo_product_map on commit drop as
select dp.key, dp.category_key, resolved.id
from demo_products dp
cross join demo_store ds
cross join lateral (
  select p.id
  from public.products p
  where p.store_id = ds.id and lower(p.name) = lower(dp.name)
  order by (p.id = pg_temp.demo_uuid('lojateste_demo_v1:product:' || dp.key)) desc,
           p.created_at asc
  limit 1
) resolved;

create temporary table demo_groups on commit drop as
select * from (values
  ('ponto-carne', 'Ponto da carne', 'Escolha o ponto do burger.', true, 1, 1, 'single', 10),
  ('adicionais', 'Adicionais', 'Deixe seu lanche ainda mais completo.', false, 0, 4, 'multiple', 20),
  ('retirar', 'Retirar ingredientes', 'Retire ingredientes sem custo adicional.', false, 0, 4, 'multiple', 30),
  ('molhos', 'Molhos', 'Escolha seus molhos preferidos.', false, 0, 3, 'multiple', 40),
  ('tamanho-bebida', 'Tamanho da bebida', 'Escolha outro tamanho quando disponível.', false, 0, 1, 'single', 50)
) as value(key, name, description, required, min_choices, max_choices, selection_type, sort_order);

insert into public.additional_groups (
  id, store_id, name, description, required, min_choices, max_choices,
  selection_type, active, sort_order
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:group:' || dg.key),
  ds.id,
  dg.name,
  dg.description,
  dg.required,
  dg.min_choices,
  dg.max_choices,
  dg.selection_type,
  true,
  dg.sort_order
from demo_groups dg
cross join demo_store ds
where not exists (
  select 1
  from public.additional_groups existing
  where existing.store_id = ds.id
    and lower(existing.name) = lower(dg.name)
    and existing.id <> pg_temp.demo_uuid('lojateste_demo_v1:group:' || dg.key)
)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    required = excluded.required,
    min_choices = excluded.min_choices,
    max_choices = excluded.max_choices,
    selection_type = excluded.selection_type,
    active = true,
    sort_order = excluded.sort_order,
    updated_at = now();

create temporary table demo_group_map on commit drop as
select dg.key, resolved.id
from demo_groups dg
cross join demo_store ds
cross join lateral (
  select ag.id
  from public.additional_groups ag
  where ag.store_id = ds.id and lower(ag.name) = lower(dg.name)
  order by (ag.id = pg_temp.demo_uuid('lojateste_demo_v1:group:' || dg.key)) desc,
           ag.created_at asc
  limit 1
) resolved;

create temporary table demo_options on commit drop as
select * from (values
  ('mal-passada', 'ponto-carne', 'Mal passada', 0.00::numeric, 10),
  ('ao-ponto', 'ponto-carne', 'Ao ponto', 0.00, 20),
  ('bem-passada', 'ponto-carne', 'Bem passada', 0.00, 30),
  ('bacon-extra', 'adicionais', 'Bacon extra', 5.00, 10),
  ('cheddar-extra', 'adicionais', 'Cheddar extra', 4.00, 20),
  ('catupiry', 'adicionais', 'Catupiry', 4.00, 30),
  ('ovo', 'adicionais', 'Ovo', 3.00, 40),
  ('hamburguer-extra', 'adicionais', 'Hambúrguer extra', 8.00, 50),
  ('cebola-caramelizada', 'adicionais', 'Cebola caramelizada', 3.50, 60),
  ('sem-cebola', 'retirar', 'Sem cebola', 0.00, 10),
  ('sem-tomate', 'retirar', 'Sem tomate', 0.00, 20),
  ('sem-alface', 'retirar', 'Sem alface', 0.00, 30),
  ('sem-molho', 'retirar', 'Sem molho', 0.00, 40),
  ('maionese-casa', 'molhos', 'Maionese da casa', 0.00, 10),
  ('barbecue', 'molhos', 'Barbecue', 0.00, 20),
  ('molho-alho', 'molhos', 'Molho de alho', 1.00, 30),
  ('molho-picante', 'molhos', 'Molho picante', 1.50, 40),
  ('lata', 'tamanho-bebida', 'Lata', 0.00, 10),
  ('600ml', 'tamanho-bebida', '600 ml', 3.00, 20),
  ('1-litro', 'tamanho-bebida', '1 litro', 6.00, 30)
) as value(key, group_key, name, price, sort_order);

insert into public.additional_options (
  id, store_id, additional_group_id, name, price, active, sort_order
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:option:' || dop.key),
  ds.id,
  dgm.id,
  dop.name,
  dop.price,
  true,
  dop.sort_order
from demo_options dop
join demo_group_map dgm on dgm.key = dop.group_key
cross join demo_store ds
where not exists (
  select 1
  from public.additional_options existing
  where existing.store_id = ds.id
    and existing.additional_group_id = dgm.id
    and lower(existing.name) = lower(dop.name)
    and existing.id <> pg_temp.demo_uuid('lojateste_demo_v1:option:' || dop.key)
)
on conflict (id) do update
set additional_group_id = excluded.additional_group_id,
    name = excluded.name,
    price = excluded.price,
    active = true,
    sort_order = excluded.sort_order,
    updated_at = now();

create temporary table demo_option_map on commit drop as
select dop.key, dop.group_key, resolved.id
from demo_options dop
join demo_group_map dgm on dgm.key = dop.group_key
cross join demo_store ds
cross join lateral (
  select ao.id
  from public.additional_options ao
  where ao.store_id = ds.id
    and ao.additional_group_id = dgm.id
    and lower(ao.name) = lower(dop.name)
  order by (ao.id = pg_temp.demo_uuid('lojateste_demo_v1:option:' || dop.key)) desc,
           ao.created_at asc
  limit 1
) resolved;

create temporary table demo_links on commit drop as
select 'ponto-carne'::text as group_key, dpm.key as product_key
from demo_product_map dpm
where dpm.category_key in ('hamburgueres', 'smash-burgers')
union all
select 'adicionais', dpm.key
from demo_product_map dpm
where dpm.category_key in ('hamburgueres', 'smash-burgers')
union all
select 'retirar', dpm.key
from demo_product_map dpm
where dpm.category_key in ('hamburgueres', 'smash-burgers')
union all
select 'molhos', dpm.key
from demo_product_map dpm
where dpm.category_key in ('hamburgueres', 'smash-burgers', 'combos', 'porcoes')
union all
select 'tamanho-bebida', dpm.key
from demo_product_map dpm
where dpm.key in ('coca-cola-lata', 'guarana-lata');

insert into public.additional_group_products (
  id, store_id, additional_group_id, product_id
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:link:' || dl.group_key || ':' || dl.product_key),
  ds.id,
  dgm.id,
  dpm.id
from demo_links dl
join demo_group_map dgm on dgm.key = dl.group_key
join demo_product_map dpm on dpm.key = dl.product_key
cross join demo_store ds
on conflict (additional_group_id, product_id) do nothing;

-- Twenty-two deterministic orders provide enough volume for pagination and
-- dashboards. They use fake contacts and are marked in both source and metadata.
create temporary table demo_orders on commit drop as
select
  sequence_number,
  (array[
    'brasa-classico', 'brasa-bacon', 'brasa-cheddar', 'brasa-salada',
    'brasa-duplo', 'brasa-especial', 'smash-simples', 'smash-duplo',
    'smash-triplo', 'smash-cheddar', 'smash-bacon'
  ])[1 + ((sequence_number - 1) % 11)] as product_key,
  case
    when sequence_number between 1 and 4 then 'Pedido recebido'
    when sequence_number between 5 and 8 then 'Em preparo'
    when sequence_number between 9 and 12 then 'Pronto para retirada'
    when sequence_number between 13 and 16 then 'Saiu para entrega'
    else 'Finalizado'
  end as order_status,
  case
    when sequence_number between 9 and 12 then 'pickup'
    when sequence_number between 13 and 16 then 'delivery'
    when sequence_number % 2 = 0 then 'pickup'
    else 'delivery'
  end as fulfillment,
  now()
    - (((sequence_number - 1) % 7) * interval '1 day')
    - (((sequence_number % 8) + 1) * interval '1 hour') as created_at
from generate_series(1, 22) as series(sequence_number);

insert into public.customers (
  id, store_id, name, phone, email, last_address, created_at, updated_at
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:customer:' || demo.sequence_number),
  ds.id,
  'DEMO Cliente ' || lpad(demo.sequence_number::text, 2, '0'),
  '0000000' || lpad(demo.sequence_number::text, 4, '0'),
  null,
  case when demo.fulfillment = 'delivery' then
    jsonb_build_object(
      'street', 'Rua Demonstração',
      'number', demo.sequence_number::text,
      'neighborhood', 'Centro',
      'city', 'Campos dos Goytacazes'
    )
  else null end,
  demo.created_at,
  demo.created_at
from demo_orders demo
cross join demo_store ds
on conflict (id) do update
set name = excluded.name,
    phone = excluded.phone,
    last_address = excluded.last_address,
    updated_at = excluded.updated_at;

insert into public.orders (
  id, public_token, store_id, customer_id, number, fulfillment, address, notes,
  payment_method, payment_status, order_status, subtotal, delivery_fee,
  discount, total, source, metadata, idempotency_key, created_at, updated_at
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:order:' || demo.sequence_number),
  pg_temp.demo_uuid('lojateste_demo_v1:public-token:' || demo.sequence_number),
  ds.id,
  pg_temp.demo_uuid('lojateste_demo_v1:customer:' || demo.sequence_number),
  'DEMO-' || lpad(demo.sequence_number::text, 3, '0'),
  demo.fulfillment,
  case when demo.fulfillment = 'delivery' then
    jsonb_build_object(
      'street', 'Rua Demonstração',
      'number', demo.sequence_number::text,
      'neighborhood', 'Centro',
      'city', 'Campos dos Goytacazes'
    )
  else null end,
  'DEMO - pedido fictício para demonstração',
  case demo.sequence_number % 3 when 0 then 'cash' when 1 then 'pix' else 'card' end,
  case when demo.order_status = 'Pedido recebido' then 'Pendente' else 'Pagamento confirmado' end,
  demo.order_status,
  product.price + case when demo.sequence_number % 2 = 0 then 5.00 else 0.00 end,
  case when demo.fulfillment = 'delivery' then 5.00 else 0.00 end,
  0.00,
  product.price
    + case when demo.sequence_number % 2 = 0 then 5.00 else 0.00 end
    + case when demo.fulfillment = 'delivery' then 5.00 else 0.00 end,
  'demo_seed',
  jsonb_build_object(
    'demoSeed', 'lojateste_demo_v1',
    'demoIndex', demo.sequence_number,
    'storeSlug', 'lojateste'
  ),
  pg_temp.demo_uuid('lojateste_demo_v1:idempotency:' || demo.sequence_number),
  demo.created_at,
  demo.created_at
from demo_orders demo
join demo_product_map dpm on dpm.key = demo.product_key
join public.products product on product.id = dpm.id
cross join demo_store ds
where not exists (
  select 1
  from public.orders existing
  where existing.store_id = ds.id
    and existing.number = 'DEMO-' || lpad(demo.sequence_number::text, 3, '0')
    and existing.id <> pg_temp.demo_uuid('lojateste_demo_v1:order:' || demo.sequence_number)
)
on conflict (id) do update
set customer_id = excluded.customer_id,
    fulfillment = excluded.fulfillment,
    address = excluded.address,
    notes = excluded.notes,
    payment_method = excluded.payment_method,
    payment_status = excluded.payment_status,
    order_status = excluded.order_status,
    subtotal = excluded.subtotal,
    delivery_fee = excluded.delivery_fee,
    discount = excluded.discount,
    total = excluded.total,
    source = excluded.source,
    metadata = excluded.metadata,
    idempotency_key = excluded.idempotency_key,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at;

insert into public.order_items (
  id, order_id, store_id, product_id, product_name, unit_price, quantity,
  note, image_url, total, created_at
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:order-item:' || demo.sequence_number),
  pg_temp.demo_uuid('lojateste_demo_v1:order:' || demo.sequence_number),
  ds.id,
  product.id,
  product.name,
  product.price,
  1,
  'DEMO - item fictício',
  product.image_url,
  product.price + case when demo.sequence_number % 2 = 0 then 5.00 else 0.00 end,
  demo.created_at
from demo_orders demo
join demo_product_map dpm on dpm.key = demo.product_key
join public.products product on product.id = dpm.id
join public.orders seeded_order
  on seeded_order.id = pg_temp.demo_uuid('lojateste_demo_v1:order:' || demo.sequence_number)
cross join demo_store ds
on conflict (id) do update
set product_id = excluded.product_id,
    product_name = excluded.product_name,
    unit_price = excluded.unit_price,
    quantity = excluded.quantity,
    note = excluded.note,
    image_url = excluded.image_url,
    total = excluded.total,
    created_at = excluded.created_at;

-- Every order receives the free required option "Ao ponto".
insert into public.order_item_additionals (
  id, order_item_id, store_id, additional_group_id, additional_option_id,
  group_name, option_name, price, created_at
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:order-additional:point:' || demo.sequence_number),
  pg_temp.demo_uuid('lojateste_demo_v1:order-item:' || demo.sequence_number),
  ds.id,
  dgm.id,
  dom.id,
  'Ponto da carne',
  'Ao ponto',
  0.00,
  demo.created_at
from demo_orders demo
join demo_group_map dgm on dgm.key = 'ponto-carne'
join demo_option_map dom on dom.key = 'ao-ponto'
cross join demo_store ds
on conflict (id) do update
set additional_group_id = excluded.additional_group_id,
    additional_option_id = excluded.additional_option_id,
    group_name = excluded.group_name,
    option_name = excluded.option_name,
    price = excluded.price,
    created_at = excluded.created_at;

-- Even-numbered orders also receive one paid option.
insert into public.order_item_additionals (
  id, order_item_id, store_id, additional_group_id, additional_option_id,
  group_name, option_name, price, created_at
)
select
  pg_temp.demo_uuid('lojateste_demo_v1:order-additional:bacon:' || demo.sequence_number),
  pg_temp.demo_uuid('lojateste_demo_v1:order-item:' || demo.sequence_number),
  ds.id,
  dgm.id,
  dom.id,
  'Adicionais',
  'Bacon extra',
  5.00,
  demo.created_at
from demo_orders demo
join demo_group_map dgm on dgm.key = 'adicionais'
join demo_option_map dom on dom.key = 'bacon-extra'
cross join demo_store ds
where demo.sequence_number % 2 = 0
on conflict (id) do update
set additional_group_id = excluded.additional_group_id,
    additional_option_id = excluded.additional_option_id,
    group_name = excluded.group_name,
    option_name = excluded.option_name,
    price = excluded.price,
    created_at = excluded.created_at;

commit;

-- Expected maximum on a clean lojateste tenant:
-- 6 categories, 29 products, 5 groups, 20 options, 56 links,
-- 22 fake customers, 22 demo orders, 22 items and 33 item additionals.
