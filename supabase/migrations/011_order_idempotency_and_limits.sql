-- PediCampos - public order idempotency and bounded request payloads.
-- Real IP/user rate limiting remains an edge/gateway responsibility.

begin;

alter table public.orders
  add column if not exists idempotency_key uuid;

create unique index if not exists idx_orders_store_idempotency_key
  on public.orders(store_id, idempotency_key)
  where idempotency_key is not null;

comment on column public.orders.idempotency_key is
  'Opaque client-generated UUID used to make public order creation idempotent per store. Contains no personal data.';

-- Preserve migration 010 as a private implementation. On reexecution the
-- internal identity already exists, so the rename is skipped.
do $$
begin
  if to_regprocedure('public.create_public_order_validated_v10(uuid,jsonb,text,jsonb,text,text,jsonb)') is null then
    if to_regprocedure('public.create_public_order(uuid,jsonb,text,jsonb,text,text,jsonb)') is null then
      raise exception 'Migration 010 create_public_order identity was not found';
    end if;
    execute 'alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) rename to create_public_order_validated_v10';
  elsif to_regprocedure('public.create_public_order(uuid,jsonb,text,jsonb,text,text,jsonb)') is not null then
    -- A historical migration may have been reapplied out of order. Remove the
    -- obsolete public overload so limits/idempotency cannot be bypassed.
    execute 'drop function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)';
  end if;
end
$$;

alter function public.create_public_order_validated_v10(uuid, jsonb, text, jsonb, text, text, jsonb)
  owner to postgres;
alter function public.create_public_order_validated_v10(uuid, jsonb, text, jsonb, text, text, jsonb)
  security definer;
alter function public.create_public_order_validated_v10(uuid, jsonb, text, jsonb, text, text, jsonb)
  set search_path = public;
revoke all on function public.create_public_order_validated_v10(uuid, jsonb, text, jsonb, text, text, jsonb)
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
  c_max_items constant integer := 50;
  c_max_quantity constant integer := 100;
  c_max_options_per_item constant integer := 30;
  c_max_item_note_chars constant integer := 500;
  c_max_order_note_chars constant integer := 1000;
  c_max_customer_name_chars constant integer := 120;
  c_max_phone_chars constant integer := 32;
  c_max_address_bytes constant integer := 8192;
  c_max_payload_bytes constant integer := 262144;
  v_item jsonb;
  v_options jsonb;
  v_quantity integer;
  v_payload_bytes integer;
  v_existing record;
  v_created jsonb;
begin
  if p_idempotency_key is null then
    raise exception 'Idempotency key is required' using errcode = '23514';
  end if;

  if p_customer is null or jsonb_typeof(p_customer) <> 'object' then
    raise exception 'Invalid customer payload' using errcode = '23514';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Invalid order items payload' using errcode = '23514';
  end if;

  v_payload_bytes :=
    octet_length(p_customer::text)
    + octet_length(coalesce(p_address, 'null'::jsonb)::text)
    + octet_length(p_items::text)
    + octet_length(coalesce(p_notes, ''))
    + octet_length(coalesce(p_fulfillment, ''))
    + octet_length(coalesce(p_payment_method, ''));

  if v_payload_bytes > c_max_payload_bytes then
    raise exception 'Order payload exceeds 262144 bytes' using errcode = '23514';
  end if;
  if jsonb_array_length(p_items) > c_max_items then
    raise exception 'Order exceeds 50 items' using errcode = '23514';
  end if;
  if char_length(coalesce(p_customer->>'name', '')) = 0
    or char_length(p_customer->>'name') > c_max_customer_name_chars then
    raise exception 'Customer name must contain 1 to 120 characters' using errcode = '23514';
  end if;
  if char_length(coalesce(p_customer->>'phone', '')) = 0
    or char_length(p_customer->>'phone') > c_max_phone_chars then
    raise exception 'Customer phone must contain 1 to 32 characters' using errcode = '23514';
  end if;
  if char_length(coalesce(p_notes, '')) > c_max_order_note_chars then
    raise exception 'Order note exceeds 1000 characters' using errcode = '23514';
  end if;
  if octet_length(coalesce(p_address, 'null'::jsonb)::text) > c_max_address_bytes then
    raise exception 'Order address exceeds 8192 bytes' using errcode = '23514';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Invalid order item payload' using errcode = '23514';
    end if;
    begin
      v_quantity := coalesce((v_item->>'quantity')::integer, 1);
    exception
      when invalid_text_representation or numeric_value_out_of_range then
        raise exception 'Invalid item quantity' using errcode = '23514';
    end;
    if v_quantity < 1 or v_quantity > c_max_quantity then
      raise exception 'Item quantity must be between 1 and 100' using errcode = '23514';
    end if;

    v_options := coalesce(v_item->'selectedAdditionals', '[]'::jsonb);
    if jsonb_typeof(v_options) <> 'array' then
      raise exception 'Invalid additional selections payload' using errcode = '23514';
    end if;
    if jsonb_array_length(v_options) > c_max_options_per_item then
      raise exception 'Order item exceeds 30 additional options' using errcode = '23514';
    end if;
    if char_length(coalesce(v_item->>'note', v_item->>'observation', '')) > c_max_item_note_chars then
      raise exception 'Order item note exceeds 500 characters' using errcode = '23514';
    end if;
  end loop;

  -- Serialize concurrent retries for this store/key pair. Unlike IP-based
  -- throttling, this is deterministic and independent of proxy headers.
  perform pg_advisory_xact_lock(
    hashtextextended(p_store_id::text || ':' || p_idempotency_key::text, 0)
  );

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

  v_created := public.create_public_order_validated_v10(
    p_store_id,
    p_customer,
    p_fulfillment,
    p_address,
    p_notes,
    p_payment_method,
    p_items
  );

  update public.orders
  set idempotency_key = p_idempotency_key
  where id = (v_created->>'id')::uuid
    and store_id = p_store_id;

  if not found then
    raise exception 'Created order could not be linked to idempotency key' using errcode = '23514';
  end if;

  return v_created;
end;
$$;

alter function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  owner to postgres;
alter function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  security definer;
alter function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  set search_path = public;
revoke all on function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  from public;
grant execute on function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb)
  to anon, authenticated;

comment on function public.create_public_order(uuid, uuid, jsonb, text, jsonb, text, text, jsonb) is
  'Only public order write boundary. Enforces bounded payloads and per-store UUID idempotency before calling the private validated atomic implementation.';

commit;
