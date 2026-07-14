-- Rollback-only integration test for migration 011.
-- Run after migrations 009-011. Notices A-K (plus H2/I2-I4) must be PASS.

begin;

do $test$
declare
  v_store_a uuid := gen_random_uuid();
  v_store_b uuid := gen_random_uuid();
  v_product_a uuid := gen_random_uuid();
  v_product_b uuid := gen_random_uuid();
  v_shared_key uuid := gen_random_uuid();
  v_result_1 jsonb;
  v_result_2 jsonb;
  v_result_other jsonb;
  v_items jsonb;
  v_options jsonb;
  v_error text;
  v_before integer;
  v_after integer;
begin
  insert into public.stores (id, name, slug, active, open)
  values
    (v_store_a, 'Teste idempotencia A', 'teste-idem-a-' || substr(v_store_a::text, 1, 8), true, true),
    (v_store_b, 'Teste idempotencia B', 'teste-idem-b-' || substr(v_store_b::text, 1, 8), true, true);

  insert into public.store_settings (store_id, minimum_order_value, delivery_fee, service_mode)
  values (v_store_a, 0, 0, 'delivery_pickup'), (v_store_b, 0, 0, 'delivery_pickup');

  insert into public.payment_methods (store_id, type, label, active)
  values (v_store_a, 'pix', 'Pix', true), (v_store_b, 'pix', 'Pix', true);

  insert into public.products (id, store_id, name, price, active)
  values (v_product_a, v_store_a, 'Produto A', 10, true), (v_product_b, v_store_b, 'Produto B', 10, true);

  v_items := jsonb_build_array(jsonb_build_object(
    'productId', v_product_a,
    'quantity', 1,
    'selectedAdditionals', '[]'::jsonb
  ));

  -- A/B: retrying the same store/key returns the original snapshot.
  v_result_1 := public.create_public_order(
    v_store_a, v_shared_key, '{"name":"Teste","phone":"11999999999"}',
    'pickup', null, '', 'pix', v_items
  );
  v_result_2 := public.create_public_order(
    v_store_a, v_shared_key, '{"name":"Teste alterado","phone":"11888888888"}',
    'pickup', null, 'retry', 'pix', v_items
  );
  if v_result_1->>'id' <> v_result_2->>'id' then raise exception 'FAIL A: duplicate order ID'; end if;
  if v_result_1->>'number' <> v_result_2->>'number'
    or v_result_1->>'publicToken' <> v_result_2->>'publicToken' then
    raise exception 'FAIL B: retry did not preserve number/token';
  end if;
  select count(*) into v_after from public.orders where store_id = v_store_a and idempotency_key = v_shared_key;
  if v_after <> 1 then raise exception 'FAIL A: expected one order, got %', v_after; end if;
  select count(*) into v_after from public.customers where store_id = v_store_a;
  if v_after <> 1 then raise exception 'FAIL A: expected one customer, got %', v_after; end if;
  raise notice 'PASS A: same key created one order/customer';
  raise notice 'PASS B: retry returned original ID, number and token';

  -- C: the same opaque key is independent across stores.
  v_result_other := public.create_public_order(
    v_store_b, v_shared_key, '{"name":"Outra loja","phone":"11777777777"}',
    'pickup', null, '', 'pix', jsonb_build_array(jsonb_build_object(
      'productId', v_product_b, 'quantity', 1, 'selectedAdditionals', '[]'::jsonb
    ))
  );
  if v_result_other->>'id' = v_result_1->>'id' then raise exception 'FAIL C: stores shared an order'; end if;
  raise notice 'PASS C: same key is allowed in another store';

  -- D: a different key creates another order in the same store.
  v_result_other := public.create_public_order(
    v_store_a, gen_random_uuid(), '{"name":"Novo","phone":"11666666666"}',
    'pickup', null, '', 'pix', v_items
  );
  if v_result_other->>'id' = v_result_1->>'id' then raise exception 'FAIL D: different key reused order'; end if;
  raise notice 'PASS D: different key created a different order';

  select
    (select count(*) from public.customers where store_id = v_store_a)
    + (select count(*) from public.orders where store_id = v_store_a)
    + (select count(*) from public.order_items where store_id = v_store_a)
    + (select count(*) from public.order_item_additionals where store_id = v_store_a)
  into v_before;

  -- E: more than 50 logical items.
  select jsonb_agg(jsonb_build_object(
    'productId', v_product_a, 'quantity', 1, 'selectedAdditionals', '[]'::jsonb
  )) into v_items from generate_series(1, 51);
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(), '{"name":"E","phone":"1"}', 'pickup', null, '', 'pix', v_items);
    raise exception 'FAIL E: oversized item list accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Order exceeds 50 items' then raise exception 'FAIL E: %', v_error; end if;
    raise notice 'PASS E: item limit enforced';
  end;

  v_items := jsonb_build_array(jsonb_build_object(
    'productId', v_product_a, 'quantity', 1, 'selectedAdditionals', '[]'::jsonb
  ));

  -- F: quantity greater than 100.
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(), '{"name":"F","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_a, 'quantity', 101, 'selectedAdditionals', '[]'::jsonb)));
    raise exception 'FAIL F: oversized quantity accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Item quantity must be between 1 and 100' then raise exception 'FAIL F: %', v_error; end if;
    raise notice 'PASS F: quantity limit enforced';
  end;

  -- G: more than 30 options is rejected before catalog validation.
  select jsonb_agg(jsonb_build_object('groupId', gen_random_uuid(), 'optionId', gen_random_uuid()))
  into v_options from generate_series(1, 31);
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(), '{"name":"G","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_a, 'quantity', 1, 'selectedAdditionals', v_options)));
    raise exception 'FAIL G: oversized option list accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Order item exceeds 30 additional options' then raise exception 'FAIL G: %', v_error; end if;
    raise notice 'PASS G: option limit enforced';
  end;

  -- H: item and general notes.
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(), '{"name":"H","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_a, 'quantity', 1, 'note', repeat('x', 501), 'selectedAdditionals', '[]'::jsonb)));
    raise exception 'FAIL H: oversized item note accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Order item note exceeds 500 characters' then raise exception 'FAIL H: %', v_error; end if;
    raise notice 'PASS H: item note limit enforced';
  end;
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(), '{"name":"H2","phone":"1"}', 'pickup', null, repeat('x', 1001), 'pix', v_items);
    raise exception 'FAIL H2: oversized order note accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Order note exceeds 1000 characters' then raise exception 'FAIL H2: %', v_error; end if;
    raise notice 'PASS H2: order note limit enforced';
  end;

  -- I: customer/address/total JSON bounds.
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(), jsonb_build_object('name', repeat('n', 121), 'phone', '1'), 'pickup', null, '', 'pix', v_items);
    raise exception 'FAIL I: oversized name accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Customer name must contain 1 to 120 characters' then raise exception 'FAIL I: %', v_error; end if;
    raise notice 'PASS I: customer name limit enforced';
  end;
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(), jsonb_build_object('name', 'I2', 'phone', repeat('1', 33)), 'pickup', null, '', 'pix', v_items);
    raise exception 'FAIL I2: oversized phone accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Customer phone must contain 1 to 32 characters' then raise exception 'FAIL I2: %', v_error; end if;
    raise notice 'PASS I2: phone limit enforced';
  end;
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(), '{"name":"I3","phone":"1"}', 'delivery',
      jsonb_build_object('street', repeat('a', 8193)), '', 'pix', v_items);
    raise exception 'FAIL I3: oversized address accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Order address exceeds 8192 bytes' then raise exception 'FAIL I3: %', v_error; end if;
    raise notice 'PASS I3: address limit enforced';
  end;
  begin
    perform public.create_public_order(v_store_a, gen_random_uuid(),
      jsonb_build_object('name', 'I4', 'phone', '1', 'padding', repeat('p', 262145)),
      'pickup', null, '', 'pix', v_items);
    raise exception 'FAIL I4: oversized JSON accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Order payload exceeds 262144 bytes' then raise exception 'FAIL I4: %', v_error; end if;
    raise notice 'PASS I4: total payload limit enforced';
  end;

  -- K: all failed statements rolled back their subtransactions.
  select
    (select count(*) from public.customers where store_id = v_store_a)
    + (select count(*) from public.orders where store_id = v_store_a)
    + (select count(*) from public.order_items where store_id = v_store_a)
    + (select count(*) from public.order_item_additionals where store_id = v_store_a)
  into v_after;
  if v_after <> v_before then raise exception 'FAIL K: partial rows found (% -> %)', v_before, v_after; end if;
  raise notice 'PASS K: rejected payloads left no partial rows';

  -- J: a bounded valid order still succeeds.
  v_result_other := public.create_public_order(
    v_store_a, gen_random_uuid(), '{"name":"Valido","phone":"11999999999"}',
    'delivery', jsonb_build_object('street', 'Rua A', 'number', '10'), 'Sem cebola', 'pix', v_items
  );
  if v_result_other->>'id' is null then raise exception 'FAIL J: valid order was not created'; end if;
  raise notice 'PASS J: valid bounded order created';
end
$test$;

rollback;

-- Supabase SQL Editor does not always render RAISE NOTICE messages. This
-- result set is intentionally emitted after ROLLBACK, so it is visible while
-- every fixture remains discarded. It is reached only if the DO block above
-- completed all assertions without raising an exception.
select *
from (values
  ('A', 'PASS', 'mesma chave cria somente um pedido e um cliente'),
  ('B', 'PASS', 'retry retorna o mesmo ID, numero e token'),
  ('C', 'PASS', 'mesma chave pode ser usada por lojas diferentes'),
  ('D', 'PASS', 'chaves diferentes criam pedidos diferentes'),
  ('E', 'PASS', 'limite maximo de itens e aplicado'),
  ('F', 'PASS', 'limite de quantidade por item e aplicado'),
  ('G', 'PASS', 'limite de opcoes por item e aplicado'),
  ('H', 'PASS', 'limites das observacoes do item e do pedido sao aplicados'),
  ('I', 'PASS', 'limites de nome, telefone, endereco e JSON sao aplicados'),
  ('J', 'PASS', 'pedido valido continua sendo criado'),
  ('K', 'PASS', 'nenhuma gravacao parcial permanece apos falha')
) as results(test, status, description)
order by test;
