-- Separates store availability from optional public demo featuring.
-- Run before deploying the frontend that reads these columns.

begin;

alter table public.stores add column if not exists is_demo boolean not null default false;
alter table public.stores add column if not exists demo_featured boolean not null default false;
alter table public.stores add column if not exists demo_order integer;
alter table public.stores add column if not exists demo_label text;

alter table public.stores drop constraint if exists stores_demo_feature_requires_demo;
alter table public.stores add constraint stores_demo_feature_requires_demo
  check (demo_featured is not true or is_demo is true);

alter table public.stores drop constraint if exists stores_demo_order_nonnegative;
alter table public.stores add constraint stores_demo_order_nonnegative
  check (demo_order is null or demo_order >= 0);

alter table public.stores drop constraint if exists stores_demo_label_length;
alter table public.stores add constraint stores_demo_label_length
  check (demo_label is null or char_length(demo_label) <= 80);

create index if not exists stores_featured_demo_order_idx
  on public.stores (demo_order, name)
  where active = true and is_demo = true and demo_featured = true;

comment on column public.stores.is_demo is 'Identifies an optional demonstration tenant without changing active status.';
comment on column public.stores.demo_featured is 'Controls whether an active demo is shown on the public landing page.';
comment on column public.stores.demo_order is 'Optional public landing order for featured demos.';
comment on column public.stores.demo_label is 'Optional public label for a demonstration store.';

-- Direct store mutations stay master-only. Store admins update their public
-- profile through the constrained RPC and cannot set demo metadata.
drop policy if exists "Store users can update their stores" on public.stores;
drop policy if exists "Masters can update stores" on public.stores;
create policy "Masters can update stores"
on public.stores for update to authenticated
using (public.is_master())
with check (public.is_master());

commit;
