-- Server-side abuse protection for the public order Edge Function.
-- Apply before deploying create-order: direct browser RPC execution is revoked.

begin;

create table if not exists public.order_rate_limit_attempts (
  id uuid primary key default gen_random_uuid(),
  subject_hash text not null check (subject_hash ~ '^[0-9a-f]{64}$'),
  store_id uuid not null references public.stores(id) on delete cascade,
  idempotency_hash text not null check (idempotency_hash ~ '^[0-9a-f]{64}$'),
  success boolean,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes')
);

alter table public.order_rate_limit_attempts enable row level security;
revoke all on public.order_rate_limit_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.order_rate_limit_attempts to service_role;

create index if not exists order_rate_limit_subject_created_idx
  on public.order_rate_limit_attempts (subject_hash, created_at desc);
create index if not exists order_rate_limit_store_key_created_idx
  on public.order_rate_limit_attempts (store_id, idempotency_hash, created_at desc);
create index if not exists order_rate_limit_expiry_idx
  on public.order_rate_limit_attempts (expires_at);

create or replace function public.consume_order_rate_limit(
  p_subject_hash text,
  p_store_id uuid,
  p_idempotency_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_minute_count integer;
  v_ten_minute_count integer;
  v_failure_count integer;
  v_oldest timestamptz;
  v_retry integer := 0;
  v_attempt_id uuid;
begin
  if p_subject_hash !~ '^[0-9a-f]{64}$' or p_idempotency_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid rate-limit fingerprint' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_subject_hash || ':' || p_store_id::text, 0));
  delete from public.order_rate_limit_attempts where id in (
    select id from public.order_rate_limit_attempts where expires_at <= v_now order by expires_at limit 100
  );
  delete from public.order_rate_limit_attempts
  where subject_hash = p_subject_hash and expires_at <= v_now;

  select count(*), min(created_at) into v_minute_count, v_oldest
  from public.order_rate_limit_attempts
  where subject_hash = p_subject_hash and created_at > v_now - interval '1 minute';
  if v_minute_count >= 10 then
    v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 minute' - v_now)))::integer);
    return jsonb_build_object('allowed', false, 'retryAfter', v_retry, 'reason', 'minute_limit');
  end if;

  select count(*), min(created_at) into v_ten_minute_count, v_oldest
  from public.order_rate_limit_attempts
  where subject_hash = p_subject_hash and created_at > v_now - interval '10 minutes';
  if v_ten_minute_count >= 30 then
    v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '10 minutes' - v_now)))::integer);
    return jsonb_build_object('allowed', false, 'retryAfter', v_retry, 'reason', 'ten_minute_limit');
  end if;

  select count(*) into v_failure_count
  from public.order_rate_limit_attempts attempt
  where attempt.store_id = p_store_id
    and attempt.idempotency_hash = p_idempotency_hash
    and attempt.success = false
    and attempt.created_at > v_now - interval '5 minutes'
    and attempt.created_at > coalesce((
      select max(successful.created_at)
      from public.order_rate_limit_attempts successful
      where successful.store_id = p_store_id
        and successful.idempotency_hash = p_idempotency_hash
        and successful.success = true
    ), '-infinity'::timestamptz);
  if v_failure_count >= 5 then
    return jsonb_build_object('allowed', false, 'retryAfter', 300, 'reason', 'consecutive_failures');
  end if;

  insert into public.order_rate_limit_attempts (subject_hash, store_id, idempotency_hash)
  values (p_subject_hash, p_store_id, p_idempotency_hash)
  returning id into v_attempt_id;
  return jsonb_build_object('allowed', true, 'retryAfter', 0, 'attemptId', v_attempt_id);
end;
$$;

create or replace function public.complete_order_rate_limit(p_attempt_id uuid, p_success boolean)
returns void language sql security definer set search_path = public as $$
  update public.order_rate_limit_attempts set success = p_success where id = p_attempt_id;
$$;

alter function public.consume_order_rate_limit(text,uuid,text) owner to postgres;
alter function public.complete_order_rate_limit(uuid,boolean) owner to postgres;
revoke all on function public.consume_order_rate_limit(text,uuid,text) from public, anon, authenticated;
revoke all on function public.complete_order_rate_limit(uuid,boolean) from public, anon, authenticated;
grant execute on function public.consume_order_rate_limit(text,uuid,text) to service_role;
grant execute on function public.complete_order_rate_limit(uuid,boolean) to service_role;

-- The Edge Function becomes the public HTTP boundary. Its server-side client
-- owns the only grant; the service_role key must never reach the browser.
revoke all on function public.create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)
  to service_role;

commit;
