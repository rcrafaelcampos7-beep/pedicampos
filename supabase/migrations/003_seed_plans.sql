-- PediCampos - initial seed for the official commercial plans.
-- This migration exists only to provide the initial rows required by stores.plan_key.
-- Future commercial changes must be made through the PediCampos master panel.
-- Re-running this migration must not overwrite prices or other existing plan data.

begin;

insert into public.plans (
  key,
  name,
  price,
  price_label,
  active,
  sort_order
)
values
  ('start', 'Start', 99.99, 'R$ 99,99/mês', true, 1),
  ('pro', 'Pro', 179.99, 'R$ 179,99/mês', true, 2),
  ('premium', 'Premium', 199.99, 'R$ 199,99/mês', true, 3)
on conflict (key) do nothing;

commit;
