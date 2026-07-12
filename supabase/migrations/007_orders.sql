-- PediCampos - atomic orders and secure public tracking.
-- Prices and totals are calculated from server-side catalog data.

begin;

alter table public.orders add column if not exists public_token uuid not null default gen_random_uuid();
alter table public.orders add column if not exists discount numeric(10,2) not null default 0;
create unique index if not exists idx_orders_public_token on public.orders(public_token);

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
security invoker
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_token uuid := gen_random_uuid();
  v_number text := upper(substr(replace(v_token::text, '-', ''), 1, 8));
  v_item jsonb;
  v_additional jsonb;
  v_product public.products;
  v_option record;
  v_quantity integer;
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
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then raise exception 'Order has no items' using errcode = '23514'; end if;

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

  -- Validate the complete cart and calculate the trusted subtotal before inserting rows.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := greatest(1, least(100, coalesce((v_item->>'quantity')::integer, 1)));
    select * into v_product from public.products
    where id = (v_item->>'productId')::uuid and store_id = p_store_id and active = true;
    if v_product.id is null then raise exception 'Invalid product' using errcode = '23514'; end if;
    v_additional_total := 0;
    v_seen_options := array[]::uuid[];
    for v_additional in select value from jsonb_array_elements(coalesce(v_item->'selectedAdditionals', '[]'::jsonb))
    loop
      if (v_additional->>'optionId')::uuid = any(v_seen_options) then raise exception 'Duplicate additional option' using errcode = '23514'; end if;
      select ao.id, ao.additional_group_id, ao.name, ao.price, ag.name as group_name
      into v_option from public.additional_options ao
      join public.additional_groups ag on ag.id = ao.additional_group_id and ag.store_id = ao.store_id
      join public.additional_group_products agp on agp.additional_group_id = ag.id and agp.store_id = ag.store_id
      where ao.id = (v_additional->>'optionId')::uuid
        and ao.store_id = p_store_id and ao.active = true and ag.active = true
        and agp.product_id = v_product.id;
      if v_option.id is null then raise exception 'Invalid additional option' using errcode = '23514'; end if;
      v_seen_options := array_append(v_seen_options, v_option.id);
      v_additional_total := v_additional_total + v_option.price;
    end loop;
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

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := greatest(1, least(100, coalesce((v_item->>'quantity')::integer, 1)));
    select * into v_product from public.products
    where id = (v_item->>'productId')::uuid and store_id = p_store_id and active = true;
    if v_product.id is null then raise exception 'Invalid product' using errcode = '23514'; end if;

    v_additional_total := 0;
    v_seen_options := array[]::uuid[];
    for v_additional in select value from jsonb_array_elements(coalesce(v_item->'selectedAdditionals', '[]'::jsonb))
    loop
      if (v_additional->>'optionId')::uuid = any(v_seen_options) then raise exception 'Duplicate additional option' using errcode = '23514'; end if;
      select ao.id, ao.additional_group_id, ao.name, ao.price, ag.name as group_name
      into v_option
      from public.additional_options ao
      join public.additional_groups ag on ag.id = ao.additional_group_id and ag.store_id = ao.store_id
      join public.additional_group_products agp on agp.additional_group_id = ag.id and agp.store_id = ag.store_id
      where ao.id = (v_additional->>'optionId')::uuid
        and ao.store_id = p_store_id and ao.active = true and ag.active = true
        and agp.product_id = v_product.id;
      if v_option.id is null then raise exception 'Invalid additional option' using errcode = '23514'; end if;
      v_seen_options := array_append(v_seen_options, v_option.id);
      v_additional_total := v_additional_total + v_option.price;
    end loop;

    v_item_total := (v_product.price + v_additional_total) * v_quantity;
    insert into public.order_items (
      order_id, store_id, product_id, product_name, unit_price, quantity, note, image_url, total
    ) values (
      v_order_id, p_store_id, v_product.id, v_product.name, v_product.price,
      v_quantity, coalesce(v_item->>'note', v_item->>'observation'), v_product.image_url, v_item_total
    ) returning id into v_order_item_id;

    for v_additional in select value from jsonb_array_elements(coalesce(v_item->'selectedAdditionals', '[]'::jsonb))
    loop
      select ao.id, ao.additional_group_id, ao.name, ao.price, ag.name as group_name
      into v_option from public.additional_options ao
      join public.additional_groups ag on ag.id = ao.additional_group_id
      where ao.id = (v_additional->>'optionId')::uuid and ao.store_id = p_store_id;
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

create or replace function public.get_public_order(p_token uuid, p_store_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id, 'publicToken', o.public_token, 'number', o.number,
    'storeId', o.store_id, 'storeSlug', s.slug, 'storeName', s.name,
    'createdAt', o.created_at, 'updatedAt', o.updated_at,
    'customer', jsonb_build_object('name', c.name),
    'fulfillment', o.fulfillment, 'address', o.address, 'notes', o.notes,
    'paymentMethod', o.payment_method, 'paymentStatus', o.payment_status,
    'orderStatus', o.order_status, 'subtotal', o.subtotal,
    'deliveryFee', o.delivery_fee, 'discount', o.discount, 'total', o.total,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'productId', oi.product_id, 'name', oi.product_name, 'unitPrice', oi.unit_price,
        'quantity', oi.quantity, 'note', oi.note, 'image', oi.image_url, 'total', oi.total,
        'selectedAdditionals', coalesce((
          select jsonb_agg(jsonb_build_object(
            'groupId', oia.additional_group_id, 'groupName', oia.group_name,
            'optionId', oia.additional_option_id, 'optionName', oia.option_name,
            'name', oia.option_name, 'price', oia.price
          )) from public.order_item_additionals oia where oia.order_item_id = oi.id
        ), '[]'::jsonb)
      ) order by oi.created_at) from public.order_items oi where oi.order_id = o.id
    ), '[]'::jsonb)
  )
  from public.orders o
  join public.stores s on s.id = o.store_id and s.slug = p_store_slug
  left join public.customers c on c.id = o.customer_id
  where o.public_token = p_token;
$$;

revoke all on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) from public;
grant execute on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) to anon, authenticated;
revoke all on function public.get_public_order(uuid, text) from public;
grant execute on function public.get_public_order(uuid, text) to anon, authenticated;

commit;
