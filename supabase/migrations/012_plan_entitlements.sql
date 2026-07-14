-- PediCampos - centralized plan entitlements backed by plans.feature_flags.
-- Prices, plan activity and existing store assignments are intentionally unchanged.

begin;

-- Initial defaults are applied only while the plan still has the schema default
-- empty array. Reexecuting this migration does not overwrite non-empty custom flags.
update public.plans
set feature_flags = '["whatsapp_orders"]'::jsonb
where key = 'start'
  and feature_flags = '[]'::jsonb;

update public.plans
set feature_flags = '[
  "whatsapp_orders",
  "saved_orders",
  "order_tracking",
  "online_payment",
  "automatic_payment_confirmation",
  "simple_reports"
]'::jsonb
where key = 'pro'
  and feature_flags = '[]'::jsonb;

update public.plans
set feature_flags = '[
  "whatsapp_orders",
  "saved_orders",
  "order_tracking",
  "online_payment",
  "automatic_payment_confirmation",
  "whatsapp_automation",
  "automatic_status_messages",
  "simple_reports",
  "advanced_reports",
  "coupons",
  "loyalty",
  "ai_tools",
  "custom_domain",
  "api_access"
]'::jsonb
where key = 'premium'
  and feature_flags = '[]'::jsonb;

create or replace function public.store_has_feature(
  target_store_id uuid,
  target_feature text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stores s
    join public.plans p on p.key = s.plan_key
    where s.id = target_store_id
      and p.active = true
      and coalesce(p.feature_flags, '[]'::jsonb) ? target_feature
  );
$$;

alter function public.store_has_feature(uuid, text) owner to postgres;
revoke all on function public.store_has_feature(uuid, text) from public;
grant execute on function public.store_has_feature(uuid, text) to anon, authenticated;

create or replace function public.get_store_entitlements(p_store_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'storeId', s.id,
    'planKey', p.key,
    'planName', p.name,
    'planActive', p.active,
    'features', case when p.active then coalesce(p.feature_flags, '[]'::jsonb) else '[]'::jsonb end
  )
  from public.stores s
  join public.plans p on p.key = s.plan_key
  where s.id = p_store_id
    and (s.active = true or public.can_access_store(s.id));
$$;

alter function public.get_store_entitlements(uuid) owner to postgres;
revoke all on function public.get_store_entitlements(uuid) from public;
grant execute on function public.get_store_entitlements(uuid) to anon, authenticated;

-- Preserve idempotent retries when 012 is reexecuted. The v11 function keeps
-- all payload limits, locking and atomic creation implemented by migration 011.
do $$
begin
  if to_regprocedure('public.create_public_order_bounded_v11(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)') is null then
    if to_regprocedure('public.create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)') is null then
      raise exception 'Migration 011 create_public_order identity was not found';
    end if;
    execute 'alter function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb) rename to create_public_order_bounded_v11';
  elsif to_regprocedure('public.create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)') is not null then
    execute 'drop function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)';
  end if;
end
$$;

alter function public.create_public_order_bounded_v11(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  owner to postgres;
alter function public.create_public_order_bounded_v11(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  security definer;
alter function public.create_public_order_bounded_v11(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  set search_path = public;
revoke all on function public.create_public_order_bounded_v11(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  from public, anon, authenticated;

create or replace function public.create_public_order(
  p_store_id uuid,
  p_idempotency_key uuid,
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
  v_existing record;
begin
  -- A completed retry remains readable even if the store plan changed after
  -- the original commit. No new customer/order rows are created in this path.
  select id, public_token, number
  into v_existing
  from public.orders
  where store_id = p_store_id
    and idempotency_key = p_idempotency_key;

  if v_existing.id is not null then
    return jsonb_build_object(
      'id', v_existing.id,
      'publicToken', v_existing.public_token,
      'number', v_existing.number
    );
  end if;

  if not public.store_has_feature(p_store_id, 'saved_orders') then
    raise exception 'Store plan does not include saved orders' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.payment_methods pm
    where pm.store_id = p_store_id
      and pm.type = p_payment_method
      and pm.active = true
      and pm.online_enabled = true
  ) and not public.store_has_feature(p_store_id, 'online_payment') then
    raise exception 'Store plan does not include online payment' using errcode = '42501';
  end if;

  return public.create_public_order_bounded_v11(
    p_store_id,
    p_idempotency_key,
    p_customer,
    p_fulfillment,
    p_address,
    p_notes,
    p_payment_method,
    p_items
  );
end;
$$;

alter function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  owner to postgres;
revoke all on function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  from public;
grant execute on function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  to anon, authenticated;

comment on function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb) is
  'Public order boundary. Enforces plan entitlements before delegating to the private idempotent, bounded and validated v11 implementation.';

-- Tracking is a separate entitlement from saved order creation.
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
  where o.public_token = p_token
    and public.store_has_feature(o.store_id, 'order_tracking');
$$;

alter function public.get_public_order(uuid, text) owner to postgres;
revoke all on function public.get_public_order(uuid, text) from public;
grant execute on function public.get_public_order(uuid, text) to anon, authenticated;

-- Direct authenticated access to saved-order snapshots remains tenant-scoped
-- and now also requires the plan entitlement. Masters retain global access.
drop policy if exists "Store users can manage customers" on public.customers;
create policy "Store users can manage customers"
on public.customers for all to authenticated
using (public.can_access_store(store_id) and (public.is_master() or public.store_has_feature(store_id, 'saved_orders')))
with check (public.can_access_store(store_id) and (public.is_master() or public.store_has_feature(store_id, 'saved_orders')));

drop policy if exists "Store users can manage orders" on public.orders;
create policy "Store users can manage orders"
on public.orders for all to authenticated
using (public.can_access_store(store_id) and (public.is_master() or public.store_has_feature(store_id, 'saved_orders')))
with check (public.can_access_store(store_id) and (public.is_master() or public.store_has_feature(store_id, 'saved_orders')));

drop policy if exists "Store users can manage order items" on public.order_items;
create policy "Store users can manage order items"
on public.order_items for all to authenticated
using (public.can_access_store(store_id) and (public.is_master() or public.store_has_feature(store_id, 'saved_orders')))
with check (public.can_access_store(store_id) and (public.is_master() or public.store_has_feature(store_id, 'saved_orders')));

drop policy if exists "Store users can manage order item additionals" on public.order_item_additionals;
create policy "Store users can manage order item additionals"
on public.order_item_additionals for all to authenticated
using (public.can_access_store(store_id) and (public.is_master() or public.store_has_feature(store_id, 'saved_orders')))
with check (public.can_access_store(store_id) and (public.is_master() or public.store_has_feature(store_id, 'saved_orders')));

-- An online method cannot be enabled directly by an authenticated client when
-- the assigned plan does not include online_payment.
drop policy if exists "Store users can manage payment methods" on public.payment_methods;
create policy "Store users can manage payment methods"
on public.payment_methods for all to authenticated
using (public.can_access_store(store_id))
with check (
  public.can_access_store(store_id)
  and (online_enabled = false or public.is_master() or public.store_has_feature(store_id, 'online_payment'))
);

commit;
