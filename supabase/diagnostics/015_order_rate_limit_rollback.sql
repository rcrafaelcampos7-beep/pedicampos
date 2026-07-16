-- Emergency rollback only: restores the pre-015 direct RPC route.
-- It does not drop rate-limit data or weaken table RLS.
begin;
grant execute on function public.create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)
  to anon, authenticated;
commit;
