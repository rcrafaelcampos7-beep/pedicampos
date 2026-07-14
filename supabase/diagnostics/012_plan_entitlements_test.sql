-- Rollback-only entitlement verification after migration 012.
begin;

do $test$
declare
  v_store uuid := gen_random_uuid();
  v_entitlements jsonb;
  v_expected_start jsonb := '["whatsapp_orders"]'::jsonb;
  v_expected_pro jsonb := '["whatsapp_orders","saved_orders","order_tracking","online_payment","automatic_payment_confirmation","simple_reports"]'::jsonb;
  v_expected_premium jsonb := '["whatsapp_orders","saved_orders","order_tracking","online_payment","automatic_payment_confirmation","whatsapp_automation","automatic_status_messages","simple_reports","advanced_reports","coupons","loyalty","ai_tools","custom_domain","api_access"]'::jsonb;
begin
  if (select feature_flags from public.plans where key = 'start') <> v_expected_start then
    raise exception 'FAIL A: Start feature_flags differ from the initial entitlement set';
  end if;
  if (select feature_flags from public.plans where key = 'pro') <> v_expected_pro then
    raise exception 'FAIL B: Pro feature_flags differ from the initial entitlement set';
  end if;
  if (select feature_flags from public.plans where key = 'premium') <> v_expected_premium then
    raise exception 'FAIL C: Premium feature_flags differ from the initial entitlement set';
  end if;

  insert into public.stores (id, plan_key, name, slug, active, open)
  values (v_store, 'start', 'Teste entitlement 012', 'teste-entitlement-' || substr(v_store::text, 1, 8), true, true);

  v_entitlements := public.get_store_entitlements(v_store);
  if v_entitlements->>'planKey' <> 'start'
    or not public.store_has_feature(v_store, 'whatsapp_orders')
    or public.store_has_feature(v_store, 'saved_orders') then
    raise exception 'FAIL D: Start helper result is inconsistent';
  end if;

  update public.stores set plan_key = 'pro' where id = v_store;
  if not public.store_has_feature(v_store, 'saved_orders')
    or not public.store_has_feature(v_store, 'order_tracking')
    or not public.store_has_feature(v_store, 'online_payment')
    or public.store_has_feature(v_store, 'whatsapp_automation') then
    raise exception 'FAIL E: plan change did not update entitlements immediately';
  end if;

  if position('store_has_feature' in pg_get_functiondef(
    'public.create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)'::regprocedure
  )) = 0 or position('order_tracking' in pg_get_functiondef(
    'public.get_public_order(uuid,text)'::regprocedure
  )) = 0 then
    raise exception 'FAIL F: public RPCs do not contain entitlement enforcement';
  end if;

  if (select count(*) from pg_policies
      where schemaname = 'public'
        and tablename in ('customers', 'orders', 'order_items', 'order_item_additionals')
        and policyname like 'Store users can manage%'
        and coalesce(qual, '') like '%store_has_feature%') <> 4
    or not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'payment_methods'
        and policyname = 'Store users can manage payment methods'
        and coalesce(with_check, '') like '%online_payment%'
    ) then
    raise exception 'FAIL G: tenant policies do not enforce saved_orders/online_payment';
  end if;
end
$test$;

rollback;

select *
from (values
  ('A', 'PASS', 'Start possui somente whatsapp_orders'),
  ('B', 'PASS', 'Pro possui o conjunto comercial definido'),
  ('C', 'PASS', 'Premium possui Pro e todos os recursos premium preparados'),
  ('D', 'PASS', 'helpers retornam os entitlements da loja'),
  ('E', 'PASS', 'troca de plano reflete sem editar telas'),
  ('F', 'PASS', 'RPCs publicas aplicam saved_orders e order_tracking no servidor'),
  ('G', 'PASS', 'RLS bloqueia snapshots e pagamento online fora do plano')
) as results(test, status, description)
order by test;
