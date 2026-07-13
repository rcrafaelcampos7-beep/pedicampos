-- PediCampos - enforce additional-group selection rules inside public order RPC.
-- All validation happens before the first INSERT, preserving atomic failures.

begin;

create or replace function public.create_public_order(
  p_store_id uuid,
  p_customer jsonb,
  p_fulfillment text,
  p_address jsonb,
  p_notes text,
  p_payment_method text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_token uuid := gen_random_uuid();
  v_number text := upper(substr(replace(v_token::text, '-', ''), 1, 8));
  v_item jsonb;
  v_additional jsonb;
  v_selected_additionals jsonb;
  v_product public.products;
  v_option record;
  v_group record;
  v_product_id uuid;
  v_option_id uuid;
  v_payload_group_id uuid;
  v_quantity integer;
  v_selected_count integer;
  v_required_min integer;
  v_additional_total numeric(10,2);
  v_item_total numeric(10,2);
  v_subtotal numeric(10,2) := 0;
  v_delivery_fee numeric(10,2) := 0;
  v_minimum numeric(10,2) := 0;
  v_service_mode text := 'delivery_pickup';
  v_order_item_id uuid;
  v_seen_options uuid[];
  v_store_slug text;
  v_store_name text;
begin
  select slug, name into v_store_slug, v_store_name
  from public.stores where id = p_store_id and active = true;
  if v_store_slug is null then raise exception 'Store unavailable' using errcode = '23514'; end if;
  if p_fulfillment not in ('delivery', 'pickup') then raise exception 'Invalid fulfillment' using errcode = '23514'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Invalid order items payload' using errcode = '23514';
  end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'Order has no items' using errcode = '23514'; end if;

  select delivery_fee, minimum_order_value, service_mode
  into v_delivery_fee, v_minimum, v_service_mode
  from public.store_settings where store_id = p_store_id;
  v_delivery_fee := coalesce(v_delivery_fee, 0);
  v_minimum := coalesce(v_minimum, 0);
  v_service_mode := coalesce(v_service_mode, 'delivery_pickup');
  if p_fulfillment = 'delivery' and v_service_mode not in ('delivery', 'delivery_pickup') then raise exception 'Delivery unavailable' using errcode = '23514'; end if;
  if p_fulfillment = 'pickup' and v_service_mode not in ('pickup', 'delivery_pickup') then raise exception 'Pickup unavailable' using errcode = '23514'; end if;
  if p_fulfillment = 'pickup' then v_delivery_fee := 0; end if;

  if not exists (
    select 1 from public.payment_methods
    where store_id = p_store_id and type = p_payment_method and active = true
  ) then raise exception 'Payment method unavailable' using errcode = '23514'; end if;

  -- Validate the complete cart and calculate trusted totals before any write.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Invalid order item payload' using errcode = '23514';
    end if;

    begin
      v_product_id := nullif(v_item->>'productId', '')::uuid;
      v_quantity := greatest(1, least(100, coalesce((v_item->>'quantity')::integer, 1)));
    exception
      when invalid_text_representation or numeric_value_out_of_range then
        raise exception 'Invalid product or quantity' using errcode = '23514';
    end;

    select * into v_product from public.products
    where id = v_product_id and store_id = p_store_id and active = true;
    if v_product.id is null then raise exception 'Invalid product' using errcode = '23514'; end if;

    v_selected_additionals := coalesce(v_item->'selectedAdditionals', '[]'::jsonb);
    if jsonb_typeof(v_selected_additionals) <> 'array' then
      raise exception 'Invalid additional selections payload' using errcode = '23514';
    end if;

    v_additional_total := 0;
    v_seen_options := array[]::uuid[];

    for v_additional in select value from jsonb_array_elements(v_selected_additionals)
    loop
      if jsonb_typeof(v_additional) <> 'object' then
        raise exception 'Invalid additional selection payload' using errcode = '23514';
      end if;

      begin
        v_option_id := nullif(v_additional->>'optionId', '')::uuid;
        v_payload_group_id := nullif(v_additional->>'groupId', '')::uuid;
      exception
        when invalid_text_representation then
          raise exception 'Invalid additional option or group identifier' using errcode = '23514';
      end;

      if v_option_id is null or v_payload_group_id is null then
        raise exception 'Additional option and group are required' using errcode = '23514';
      end if;
      if v_option_id = any(v_seen_options) then
        raise exception 'Duplicate additional option' using errcode = '23514';
      end if;

      select ao.id, ao.additional_group_id, ao.name, ao.price, ag.name as group_name
      into v_option
      from public.additional_options ao
      join public.additional_groups ag
        on ag.id = ao.additional_group_id
       and ag.store_id = ao.store_id
      where ao.id = v_option_id
        and ao.store_id = p_store_id
        and ao.active = true
        and ag.active = true;

      if v_option.id is null then
        raise exception 'Additional option or group unavailable' using errcode = '23514';
      end if;
      if v_option.additional_group_id <> v_payload_group_id then
        raise exception 'Additional option does not belong to the informed group' using errcode = '23514';
      end if;
      if not exists (
        select 1
        from public.additional_group_products agp
        where agp.store_id = p_store_id
          and agp.additional_group_id = v_option.additional_group_id
          and agp.product_id = v_product.id
      ) then
        raise exception 'Additional group is not linked to the product' using errcode = '23514';
      end if;

      v_seen_options := array_append(v_seen_options, v_option.id);
      v_additional_total := v_additional_total + v_option.price;
    end loop;

    -- Only active groups linked to this product participate in requirements.
    for v_group in
      select ag.id, ag.name, ag.required, ag.min_choices, ag.max_choices, ag.selection_type
      from public.additional_groups ag
      join public.additional_group_products agp
        on agp.additional_group_id = ag.id
       and agp.store_id = ag.store_id
      where ag.store_id = p_store_id
        and agp.product_id = v_product.id
        and ag.active = true
    loop
      select count(*)::integer into v_selected_count
      from unnest(v_seen_options) as selected(option_id)
      join public.additional_options ao on ao.id = selected.option_id
      where ao.additional_group_id = v_group.id;

      v_required_min := greatest(
        coalesce(v_group.min_choices, 0),
        case when v_group.required then 1 else 0 end
      );

      if v_group.required and v_selected_count < v_required_min then
        raise exception 'Required additional group minimum not met: %', v_group.name using errcode = '23514';
      end if;
      if not v_group.required
        and v_selected_count > 0
        and v_selected_count < coalesce(v_group.min_choices, 0) then
        raise exception 'Additional group minimum not met: %', v_group.name using errcode = '23514';
      end if;
      if coalesce(v_group.max_choices, 0) > 0
        and v_selected_count > v_group.max_choices then
        raise exception 'Additional group maximum exceeded: %', v_group.name using errcode = '23514';
      end if;
      if v_group.selection_type = 'single' and v_selected_count > 1 then
        raise exception 'Single-choice additional group accepts only one option: %', v_group.name using errcode = '23514';
      end if;
    end loop;

    -- The selected set is per logical item; product quantity only scales price.
    v_subtotal := v_subtotal + ((v_product.price + v_additional_total) * v_quantity);
  end loop;

  if v_subtotal < v_minimum then raise exception 'Order below minimum value' using errcode = '23514'; end if;

  insert into public.customers (store_id, name, phone, email, last_address)
  values (
    p_store_id,
    trim(p_customer->>'name'),
    trim(p_customer->>'phone'),
    nullif(trim(p_customer->>'email'), ''),
    case when p_fulfillment = 'delivery' then p_address else null end
  ) returning id into v_customer_id;

  insert into public.orders (
    id, public_token, store_id, customer_id, number, fulfillment, address, notes,
    payment_method, payment_status, order_status, subtotal, delivery_fee, discount,
    total, source, metadata
  ) values (
    gen_random_uuid(), v_token, p_store_id, v_customer_id, v_number, p_fulfillment,
    case when p_fulfillment = 'delivery' then p_address else null end,
    p_notes, p_payment_method, 'Pendente', 'Pedido recebido', v_subtotal, v_delivery_fee, 0,
    v_subtotal + v_delivery_fee, 'site', jsonb_build_object('storeSlug', v_store_slug, 'storeName', v_store_name)
  ) returning id into v_order_id;

  -- Persist the already validated cart as immutable order snapshots.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'productId')::uuid;
    v_quantity := greatest(1, least(100, coalesce((v_item->>'quantity')::integer, 1)));
    v_selected_additionals := coalesce(v_item->'selectedAdditionals', '[]'::jsonb);

    select * into v_product from public.products
    where id = v_product_id and store_id = p_store_id and active = true;
    if v_product.id is null then raise exception 'Invalid product' using errcode = '23514'; end if;

    v_additional_total := 0;
    for v_additional in select value from jsonb_array_elements(v_selected_additionals)
    loop
      v_option_id := (v_additional->>'optionId')::uuid;
      v_payload_group_id := (v_additional->>'groupId')::uuid;

      select ao.id, ao.additional_group_id, ao.name, ao.price, ag.name as group_name
      into v_option
      from public.additional_options ao
      join public.additional_groups ag
        on ag.id = ao.additional_group_id
       and ag.store_id = ao.store_id
      join public.additional_group_products agp
        on agp.additional_group_id = ag.id
       and agp.store_id = ag.store_id
       and agp.product_id = v_product.id
      where ao.id = v_option_id
        and ao.store_id = p_store_id
        and ao.additional_group_id = v_payload_group_id
        and ao.active = true
        and ag.active = true;

      if v_option.id is null then
        raise exception 'Additional selection changed while creating the order' using errcode = '23514';
      end if;
      v_additional_total := v_additional_total + v_option.price;
    end loop;

    v_item_total := (v_product.price + v_additional_total) * v_quantity;
    insert into public.order_items (
      order_id, store_id, product_id, product_name, unit_price, quantity, note, image_url, total
    ) values (
      v_order_id, p_store_id, v_product.id, v_product.name, v_product.price,
      v_quantity, coalesce(v_item->>'note', v_item->>'observation'), v_product.image_url, v_item_total
    ) returning id into v_order_item_id;

    for v_additional in select value from jsonb_array_elements(v_selected_additionals)
    loop
      v_option_id := (v_additional->>'optionId')::uuid;
      v_payload_group_id := (v_additional->>'groupId')::uuid;
      select ao.id, ao.additional_group_id, ao.name, ao.price, ag.name as group_name
      into v_option
      from public.additional_options ao
      join public.additional_groups ag
        on ag.id = ao.additional_group_id
       and ag.store_id = ao.store_id
      join public.additional_group_products agp
        on agp.additional_group_id = ag.id
       and agp.store_id = ag.store_id
       and agp.product_id = v_product.id
      where ao.id = v_option_id
        and ao.store_id = p_store_id
        and ao.additional_group_id = v_payload_group_id
        and ao.active = true
        and ag.active = true;

      if v_option.id is null then
        raise exception 'Additional selection changed while saving the order snapshot' using errcode = '23514';
      end if;

      insert into public.order_item_additionals (
        order_item_id, store_id, additional_group_id, additional_option_id,
        group_name, option_name, price
      ) values (
        v_order_item_id, p_store_id, v_option.additional_group_id, v_option.id,
        v_option.group_name, v_option.name, v_option.price
      );
    end loop;
  end loop;

  return jsonb_build_object('id', v_order_id, 'publicToken', v_token, 'number', v_number);
end;
$$;

alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)
  owner to postgres;
alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)
  security definer;
alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)
  set search_path = public;
revoke all on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) from public;
grant execute on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) to anon, authenticated;

comment on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) is
  'Only public order write boundary. Validates tenant, catalog, payment and all linked additional-group selection rules before atomic snapshot writes.';

commit;
