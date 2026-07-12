-- PediCampos - allow the validated public order RPC to perform its atomic writes.
-- Direct table SELECT remains unavailable to anon; only the RPC's limited JSON result is exposed.

begin;

alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)
  security definer;

alter function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb)
  set search_path = public;

revoke all on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) from public;
grant execute on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) to anon, authenticated;

comment on function public.create_public_order(uuid, jsonb, text, jsonb, text, text, jsonb) is
  'Creates one public order atomically from server-validated store, catalog, additional and payment data. Runs as definer so anon never receives direct customer/order table SELECT access.';

commit;
