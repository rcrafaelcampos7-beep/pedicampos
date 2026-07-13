-- Rollback-only integration test for 010_validate_order_additionals.sql.
-- Run after migrations 009 and 010. It creates isolated fixtures and rolls
-- everything back. Notices A-J must be PASS and no fixture remains persisted.

begin;

do $test$
declare
  v_store uuid := gen_random_uuid();
  v_product_required uuid := gen_random_uuid();
  v_product_min uuid := gen_random_uuid();
  v_product_max uuid := gen_random_uuid();
  v_product_single uuid := gen_random_uuid();
  v_product_unlinked uuid := gen_random_uuid();
  v_product_inactive uuid := gen_random_uuid();
  v_product_valid uuid := gen_random_uuid();
  v_product_none uuid := gen_random_uuid();
  v_group_required uuid := gen_random_uuid();
  v_group_min uuid := gen_random_uuid();
  v_group_max uuid := gen_random_uuid();
  v_group_single uuid := gen_random_uuid();
  v_group_unlinked uuid := gen_random_uuid();
  v_group_inactive uuid := gen_random_uuid();
  v_group_inactive_option uuid := gen_random_uuid();
  v_group_valid uuid := gen_random_uuid();
  v_req_option uuid := gen_random_uuid();
  v_min_option_1 uuid := gen_random_uuid();
  v_min_option_2 uuid := gen_random_uuid();
  v_max_option_1 uuid := gen_random_uuid();
  v_max_option_2 uuid := gen_random_uuid();
  v_max_option_3 uuid := gen_random_uuid();
  v_single_option_1 uuid := gen_random_uuid();
  v_single_option_2 uuid := gen_random_uuid();
  v_unlinked_option uuid := gen_random_uuid();
  v_inactive_option uuid := gen_random_uuid();
  v_disabled_option uuid := gen_random_uuid();
  v_valid_free uuid := gen_random_uuid();
  v_valid_paid uuid := gen_random_uuid();
  v_payload jsonb;
  v_result jsonb;
  v_error text;
  v_total numeric(10,2);
  v_count integer;
begin
  insert into public.stores (id, name, slug, active, open)
  values (v_store, 'Teste RPC adicionais', 'teste-rpc-add-' || substr(v_store::text, 1, 8), true, true);

  insert into public.store_settings (store_id, minimum_order_value, delivery_fee, service_mode)
  values (v_store, 0, 0, 'pickup');

  insert into public.payment_methods (store_id, type, label, active)
  values (v_store, 'pix', 'Pix', true);

  insert into public.products (id, store_id, name, price, active)
  values
    (v_product_required, v_store, 'Produto obrigatorio', 10, true),
    (v_product_min, v_store, 'Produto minimo', 10, true),
    (v_product_max, v_store, 'Produto maximo', 10, true),
    (v_product_single, v_store, 'Produto unico', 10, true),
    (v_product_unlinked, v_store, 'Produto sem vinculo', 10, true),
    (v_product_inactive, v_store, 'Produto grupo inativo', 10, true),
    (v_product_valid, v_store, 'Produto valido', 10, true),
    (v_product_none, v_store, 'Produto sem grupos', 10, true);

  insert into public.additional_groups (
    id, store_id, name, required, min_choices, max_choices, selection_type, active
  ) values
    (v_group_required, v_store, 'Obrigatorio', true, 0, 0, 'multiple', true),
    (v_group_min, v_store, 'Minimo dois', true, 2, 3, 'multiple', true),
    (v_group_max, v_store, 'Maximo dois', false, 0, 2, 'multiple', true),
    (v_group_single, v_store, 'Selecao unica', false, 0, 0, 'single', true),
    (v_group_unlinked, v_store, 'Nao vinculado', false, 0, 0, 'multiple', true),
    (v_group_inactive, v_store, 'Grupo inativo', false, 0, 0, 'multiple', false),
    (v_group_inactive_option, v_store, 'Opcao inativa', false, 0, 0, 'multiple', true),
    (v_group_valid, v_store, 'Grupo valido', true, 1, 2, 'multiple', true);

  insert into public.additional_group_products (store_id, additional_group_id, product_id)
  values
    (v_store, v_group_required, v_product_required),
    (v_store, v_group_min, v_product_min),
    (v_store, v_group_max, v_product_max),
    (v_store, v_group_single, v_product_single),
    (v_store, v_group_inactive, v_product_inactive),
    (v_store, v_group_inactive_option, v_product_inactive),
    (v_store, v_group_valid, v_product_valid);

  insert into public.additional_options (
    id, store_id, additional_group_id, name, price, active
  ) values
    (v_req_option, v_store, v_group_required, 'Opcao obrigatoria', 0, true),
    (v_min_option_1, v_store, v_group_min, 'Min 1', 0, true),
    (v_min_option_2, v_store, v_group_min, 'Min 2', 1, true),
    (v_max_option_1, v_store, v_group_max, 'Max 1', 0, true),
    (v_max_option_2, v_store, v_group_max, 'Max 2', 1, true),
    (v_max_option_3, v_store, v_group_max, 'Max 3', 2, true),
    (v_single_option_1, v_store, v_group_single, 'Unica 1', 0, true),
    (v_single_option_2, v_store, v_group_single, 'Unica 2', 1, true),
    (v_unlinked_option, v_store, v_group_unlinked, 'Sem vinculo', 0, true),
    (v_inactive_option, v_store, v_group_inactive, 'Grupo inativo', 0, true),
    (v_disabled_option, v_store, v_group_inactive_option, 'Opcao inativa', 0, false),
    (v_valid_free, v_store, v_group_valid, 'Gratis', 0, true),
    (v_valid_paid, v_store, v_group_valid, 'Pago', 2, true);

  -- A: required with implicit minimum 1 and no option.
  begin
    perform public.create_public_order(v_store, '{"name":"A","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_required, 'quantity', 1, 'selectedAdditionals', '[]'::jsonb)));
    raise exception 'FAIL A: invalid order was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error not like 'Required additional group minimum not met:%' then raise exception 'FAIL A: %', v_error; end if;
    raise notice 'PASS A: required group without option rejected';
  end;

  -- B: required min 2 with one option.
  begin
    perform public.create_public_order(v_store, '{"name":"B","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_min, 'quantity', 1, 'selectedAdditionals',
        jsonb_build_array(jsonb_build_object('groupId', v_group_min, 'optionId', v_min_option_1)))));
    raise exception 'FAIL B: invalid order was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error not like 'Required additional group minimum not met:%' then raise exception 'FAIL B: %', v_error; end if;
    raise notice 'PASS B: group minimum enforced';
  end;

  -- C: max 2 with three options.
  begin
    perform public.create_public_order(v_store, '{"name":"C","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_max, 'quantity', 1, 'selectedAdditionals', jsonb_build_array(
        jsonb_build_object('groupId', v_group_max, 'optionId', v_max_option_1),
        jsonb_build_object('groupId', v_group_max, 'optionId', v_max_option_2),
        jsonb_build_object('groupId', v_group_max, 'optionId', v_max_option_3)))));
    raise exception 'FAIL C: invalid order was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error not like 'Additional group maximum exceeded:%' then raise exception 'FAIL C: %', v_error; end if;
    raise notice 'PASS C: group maximum enforced';
  end;

  -- D: single-choice with two options.
  begin
    perform public.create_public_order(v_store, '{"name":"D","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_single, 'quantity', 1, 'selectedAdditionals', jsonb_build_array(
        jsonb_build_object('groupId', v_group_single, 'optionId', v_single_option_1),
        jsonb_build_object('groupId', v_group_single, 'optionId', v_single_option_2)))));
    raise exception 'FAIL D: invalid order was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error not like 'Single-choice additional group accepts only one option:%' then raise exception 'FAIL D: %', v_error; end if;
    raise notice 'PASS D: single-choice limit enforced';
  end;

  begin
    perform public.create_public_order(v_store, '{"name":"D2","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_max, 'quantity', 1, 'selectedAdditionals', jsonb_build_array(
        jsonb_build_object('groupId', v_group_max, 'optionId', v_max_option_1),
        jsonb_build_object('groupId', v_group_max, 'optionId', v_max_option_1)))));
    raise exception 'FAIL D2: duplicate option was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Duplicate additional option' then raise exception 'FAIL D2: %', v_error; end if;
    raise notice 'PASS D2: duplicate option rejected';
  end;

  -- E: valid option whose group is not linked to the product.
  begin
    perform public.create_public_order(v_store, '{"name":"E","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_unlinked, 'quantity', 1, 'selectedAdditionals',
        jsonb_build_array(jsonb_build_object('groupId', v_group_unlinked, 'optionId', v_unlinked_option)))));
    raise exception 'FAIL E: invalid order was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Additional group is not linked to the product' then raise exception 'FAIL E: %', v_error; end if;
    raise notice 'PASS E: unlinked group rejected';
  end;

  begin
    perform public.create_public_order(v_store, '{"name":"E2","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_max, 'quantity', 1, 'selectedAdditionals',
        jsonb_build_array(jsonb_build_object('groupId', v_group_single, 'optionId', v_max_option_1)))));
    raise exception 'FAIL E2: mismatched option/group was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Additional option does not belong to the informed group' then raise exception 'FAIL E2: %', v_error; end if;
    raise notice 'PASS E2: option/group mismatch rejected';
  end;

  -- F: inactive group/option path.
  begin
    perform public.create_public_order(v_store, '{"name":"F","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_inactive, 'quantity', 1, 'selectedAdditionals',
        jsonb_build_array(jsonb_build_object('groupId', v_group_inactive, 'optionId', v_inactive_option)))));
    raise exception 'FAIL F: invalid order was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Additional option or group unavailable' then raise exception 'FAIL F: %', v_error; end if;
    raise notice 'PASS F: inactive group rejected';
  end;

  begin
    perform public.create_public_order(v_store, '{"name":"F2","phone":"1"}', 'pickup', null, '', 'pix',
      jsonb_build_array(jsonb_build_object('productId', v_product_inactive, 'quantity', 1, 'selectedAdditionals',
        jsonb_build_array(jsonb_build_object('groupId', v_group_inactive_option, 'optionId', v_disabled_option)))));
    raise exception 'FAIL F2: invalid order was accepted';
  exception when sqlstate '23514' then
    get stacked diagnostics v_error = message_text;
    if v_error <> 'Additional option or group unavailable' then raise exception 'FAIL F2: %', v_error; end if;
    raise notice 'PASS F2: inactive option rejected';
  end;

  -- J: every invalid RPC ran in a subtransaction and left no partial snapshot.
  select count(*) into v_count from public.customers where store_id = v_store;
  if v_count <> 0 then raise exception 'FAIL J: partial customer rows found'; end if;
  select count(*) into v_count from public.orders where store_id = v_store;
  if v_count <> 0 then raise exception 'FAIL J: partial order rows found'; end if;
  select count(*) into v_count from public.order_items where store_id = v_store;
  if v_count <> 0 then raise exception 'FAIL J: partial item rows found'; end if;
  select count(*) into v_count from public.order_item_additionals where store_id = v_store;
  if v_count <> 0 then raise exception 'FAIL J: partial additional rows found'; end if;
  raise notice 'PASS J: invalid orders left no partial rows';

  -- G: valid free + paid options.
  v_payload := jsonb_build_array(jsonb_build_object('productId', v_product_valid, 'quantity', 1, 'selectedAdditionals', jsonb_build_array(
    jsonb_build_object('groupId', v_group_valid, 'optionId', v_valid_free),
    jsonb_build_object('groupId', v_group_valid, 'optionId', v_valid_paid))));
  v_result := public.create_public_order(v_store, '{"name":"G","phone":"1"}', 'pickup', null, '', 'pix', v_payload);
  select total into v_total from public.orders where id = (v_result->>'id')::uuid;
  if v_total <> 12 then raise exception 'FAIL G: expected total 12, got %', v_total; end if;
  raise notice 'PASS G: valid free + paid order created';

  -- H: product without linked groups.
  v_result := public.create_public_order(v_store, '{"name":"H","phone":"1"}', 'pickup', null, '', 'pix',
    jsonb_build_array(jsonb_build_object('productId', v_product_none, 'quantity', 1, 'selectedAdditionals', '[]'::jsonb)));
  if v_result->>'id' is null then raise exception 'FAIL H: valid order was not created'; end if;
  raise notice 'PASS H: product without required groups accepted';

  -- I: quantity scales price, not selected-option count.
  v_result := public.create_public_order(v_store, '{"name":"I","phone":"1"}', 'pickup', null, '', 'pix',
    jsonb_build_array(jsonb_build_object('productId', v_product_valid, 'quantity', 3, 'selectedAdditionals',
      jsonb_build_array(jsonb_build_object('groupId', v_group_valid, 'optionId', v_valid_free)))));
  select total into v_total from public.orders where id = (v_result->>'id')::uuid;
  if v_total <> 30 then raise exception 'FAIL I: expected total 30, got %', v_total; end if;
  raise notice 'PASS I: product quantity does not multiply selection count';
end
$test$;

rollback;
