-- PediCampos - Supabase initial schema
-- Copy this file into the Supabase SQL Editor and run it inside the
-- pedicampos project.
--
-- This migration creates the first real online data model for PediCampos.
-- It does not connect the React app yet and it does not remove localStorage.
--
-- Security posture for this first step:
-- - RLS is enabled on every table.
-- - Public users can read only public/catalog data from active stores.
-- - Public users can create orders and order snapshots.
-- - Customer/order data is not publicly readable by default.
-- - Authenticated store/master policies are prepared for a later Auth step.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Stores commercial/platform configuration editable by PediCampos master.
create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'default',
  name text not null default 'PediCampos',
  logo text,
  whatsapp text,
  email text,
  instagram text,
  primary_color text,
  secondary_color text,
  slogan text,
  subtitle text,
  hero_title text,
  hero_subtitle text,
  hero_primary_button text,
  hero_secondary_button text,
  about text,
  implementation_price numeric(10,2) not null default 0,
  footer_text text,
  sections jsonb not null default '{}'::jsonb,
  feature_highlights jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  features_by_plan jsonb not null default '{}'::jsonb,
  how_it_works_title text,
  how_it_works_text text,
  how_it_works_steps jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.platform_settings is
  'Global PediCampos landing/commercial settings. Public fields only; do not store secrets here.';

-- Commercial plans and feature flags.
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  price numeric(10,2) not null default 0,
  price_label text,
  description text,
  features jsonb not null default '[]'::jsonb,
  feature_flags jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  highlighted boolean not null default false,
  badge text,
  comparison_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.plans is
  'PediCampos plans such as Start, Pro and Premium, including public prices and feature flags.';

-- Tenant/store root table. Admin credentials are not stored here.
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  plan_key text references public.plans(key) on update cascade on delete set null,
  name text not null,
  slug text not null unique,
  segment text,
  active boolean not null default true,
  open boolean not null default true,
  primary_color text,
  whatsapp text,
  logo text,
  banner_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.stores is
  'Tenant stores exposed by slug. Contains public storefront data, not admin passwords.';

-- Links Supabase Auth users to stores or master role.
create table if not exists public.store_users (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'store_admin'
    check (role in ('master', 'store_admin', 'store_staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, auth_user_id)
);

comment on table public.store_users is
  'Future Auth mapping for master and store users. Login fake/localStorage is still used by React for now.';

-- Store operational settings.
create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade unique,
  address text,
  opening_hours text,
  delivery_time text,
  delivery_fee numeric(10,2) not null default 0,
  pix_key text,
  minimum_order_value numeric(10,2) not null default 0,
  service_mode text not null default 'delivery_pickup',
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.store_settings is
  'Operational settings for one store, including delivery fee, address, hours and public Pix key.';

-- Public payment methods configured per store. Do not store provider secrets in provider_config.
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  type text not null check (type in ('pix', 'cash', 'card')),
  label text not null,
  active boolean not null default true,
  provider text,
  provider_config jsonb not null default '{}'::jsonb,
  manual boolean not null default true,
  online_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, type)
);

comment on table public.payment_methods is
  'Payment methods visible/usable by a store. Keep secrets in backend environment variables, not here.';

-- Product categories for one store.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is
  'Product categories that belong to one store.';

-- Products sold by a store.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is
  'Store products with price, category and public image URL.';

-- Additional groups, such as toppings or drink choices.
create table if not exists public.additional_groups (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text,
  required boolean not null default false,
  min_choices integer not null default 0,
  max_choices integer not null default 0,
  selection_type text not null default 'multiple'
    check (selection_type in ('single', 'multiple')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.additional_groups is
  'Configurable additional groups for a store, linked to products through additional_group_products.';

-- Options inside an additional group.
create table if not exists public.additional_options (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  additional_group_id uuid not null references public.additional_groups(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.additional_options is
  'Selectable options within an additional group, with optional extra price.';

-- Many-to-many link between products and additional groups.
create table if not exists public.additional_group_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  additional_group_id uuid not null references public.additional_groups(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (additional_group_id, product_id)
);

comment on table public.additional_group_products is
  'Bridge table linking additional groups to products.';

-- Customers created from checkout orders.
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  last_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customers is
  'Customer contact data captured during checkout. Not publicly readable.';

-- Orders created from the public store or later by admin integrations.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  number text not null,
  fulfillment text not null default 'delivery'
    check (fulfillment in ('delivery', 'pickup')),
  address jsonb,
  notes text,
  payment_method text,
  payment_status text not null default 'Pendente',
  order_status text not null default 'Pedido recebido',
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  pix_code text,
  pix_key text,
  source text not null default 'site',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, number)
);

comment on table public.orders is
  'Order header with customer, delivery, payment and status snapshot. Public insert only; public read should use a future safe RPC.';

-- Items inside an order.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  note text,
  image_url text,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.order_items is
  'Order item snapshot. Product name and price are copied to preserve history.';

-- Selected additionals inside one order item.
create table if not exists public.order_item_additionals (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  additional_group_id uuid references public.additional_groups(id) on delete set null,
  additional_option_id uuid references public.additional_options(id) on delete set null,
  group_name text,
  option_name text not null,
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.order_item_additionals is
  'Snapshot of additional options selected for an order item.';

-- Future Auth helpers. They are safe to create now and only become useful
-- after Supabase Auth users are linked in store_users.
create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.store_users su
    where su.auth_user_id = auth.uid()
      and su.role = 'master'
      and su.active = true
  );
$$;

create or replace function public.can_access_store(target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_master()
    or exists (
      select 1
      from public.store_users su
      where su.auth_user_id = auth.uid()
        and su.store_id = target_store_id
        and su.role in ('store_admin', 'store_staff')
        and su.active = true
    );
$$;

create or replace function public.is_store_active(target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stores s
    where s.id = target_store_id
      and s.active = true
  );
$$;

create or replace function public.is_product_public(target_product_id uuid, target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id = target_product_id
      and p.store_id = target_store_id
      and p.active = true
      and s.active = true
  );
$$;

create or replace function public.is_additional_group_public(target_group_id uuid, target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.additional_groups ag
    join public.stores s on s.id = ag.store_id
    where ag.id = target_group_id
      and ag.store_id = target_store_id
      and ag.active = true
      and s.active = true
  );
$$;

create or replace function public.is_additional_option_public(target_option_id uuid, target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.additional_options ao
    join public.additional_groups ag on ag.id = ao.additional_group_id
    join public.stores s on s.id = ao.store_id
    where ao.id = target_option_id
      and ao.store_id = target_store_id
      and ao.active = true
      and ag.active = true
      and s.active = true
  );
$$;

create or replace function public.customer_belongs_to_store(target_customer_id uuid, target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.customers c
    where c.id = target_customer_id
      and c.store_id = target_store_id
  );
$$;

create or replace function public.order_belongs_to_store(target_order_id uuid, target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = target_order_id
      and o.store_id = target_store_id
  );
$$;

create or replace function public.order_item_belongs_to_store(target_order_item_id uuid, target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.order_items oi
    where oi.id = target_order_item_id
      and oi.store_id = target_store_id
  );
$$;

-- Indexes for public lookup, tenant filtering and order details.
create index if not exists idx_stores_slug on public.stores(slug);
create index if not exists idx_stores_plan_key on public.stores(plan_key);
create index if not exists idx_store_users_auth_user on public.store_users(auth_user_id);
create index if not exists idx_store_users_store on public.store_users(store_id);
create index if not exists idx_store_settings_store on public.store_settings(store_id);
create index if not exists idx_payment_methods_store on public.payment_methods(store_id);
create index if not exists idx_categories_store on public.categories(store_id);
create index if not exists idx_categories_store_active_sort on public.categories(store_id, active, sort_order);
create index if not exists idx_products_store on public.products(store_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_store_active on public.products(store_id, active);
create index if not exists idx_additional_groups_store on public.additional_groups(store_id);
create index if not exists idx_additional_groups_store_active on public.additional_groups(store_id, active);
create index if not exists idx_additional_options_store on public.additional_options(store_id);
create index if not exists idx_additional_options_group on public.additional_options(additional_group_id);
create index if not exists idx_additional_group_products_store on public.additional_group_products(store_id);
create index if not exists idx_additional_group_products_group on public.additional_group_products(additional_group_id);
create index if not exists idx_additional_group_products_product on public.additional_group_products(product_id);
create index if not exists idx_customers_store on public.customers(store_id);
create index if not exists idx_customers_store_phone on public.customers(store_id, phone);
create index if not exists idx_orders_store_created on public.orders(store_id, created_at desc);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_store on public.order_items(store_id);
create index if not exists idx_order_item_additionals_item on public.order_item_additionals(order_item_id);
create index if not exists idx_order_item_additionals_store on public.order_item_additionals(store_id);

-- Updated_at triggers.
drop trigger if exists trg_platform_settings_updated_at on public.platform_settings;
create trigger trg_platform_settings_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_plans_updated_at on public.plans;
create trigger trg_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

drop trigger if exists trg_stores_updated_at on public.stores;
create trigger trg_stores_updated_at
before update on public.stores
for each row execute function public.set_updated_at();

drop trigger if exists trg_store_users_updated_at on public.store_users;
create trigger trg_store_users_updated_at
before update on public.store_users
for each row execute function public.set_updated_at();

drop trigger if exists trg_store_settings_updated_at on public.store_settings;
create trigger trg_store_settings_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_payment_methods_updated_at on public.payment_methods;
create trigger trg_payment_methods_updated_at
before update on public.payment_methods
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_additional_groups_updated_at on public.additional_groups;
create trigger trg_additional_groups_updated_at
before update on public.additional_groups
for each row execute function public.set_updated_at();

drop trigger if exists trg_additional_options_updated_at on public.additional_options;
create trigger trg_additional_options_updated_at
before update on public.additional_options
for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- Enable RLS on every table.
alter table public.platform_settings enable row level security;
alter table public.plans enable row level security;
alter table public.stores enable row level security;
alter table public.store_users enable row level security;
alter table public.store_settings enable row level security;
alter table public.payment_methods enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.additional_groups enable row level security;
alter table public.additional_options enable row level security;
alter table public.additional_group_products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_additionals enable row level security;

-- Grants required by PostgREST. RLS policies still decide which rows are visible/writable.
grant usage on schema public to anon, authenticated;

grant select on public.platform_settings to anon, authenticated;
grant select on public.plans to anon, authenticated;
grant select on public.stores to anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant select on public.payment_methods to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.additional_groups to anon, authenticated;
grant select on public.additional_options to anon, authenticated;
grant select on public.additional_group_products to anon, authenticated;

grant insert on public.customers to anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant insert on public.order_items to anon, authenticated;
grant insert on public.order_item_additionals to anon, authenticated;

grant select, insert, update, delete on public.platform_settings to authenticated;
grant select, insert, update, delete on public.plans to authenticated;
grant select, insert, update, delete on public.stores to authenticated;
grant select, insert, update, delete on public.store_users to authenticated;
grant select, insert, update, delete on public.store_settings to authenticated;
grant select, insert, update, delete on public.payment_methods to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.additional_groups to authenticated;
grant select, insert, update, delete on public.additional_options to authenticated;
grant select, insert, update, delete on public.additional_group_products to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.order_item_additionals to authenticated;

-- Public/catalog read policies.
drop policy if exists "Public can read platform settings" on public.platform_settings;
create policy "Public can read platform settings"
on public.platform_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Masters can manage platform settings" on public.platform_settings;
create policy "Masters can manage platform settings"
on public.platform_settings
for all
to authenticated
using (public.is_master())
with check (public.is_master());

drop policy if exists "Public can read active plans" on public.plans;
create policy "Public can read active plans"
on public.plans
for select
to anon, authenticated
using (active = true);

drop policy if exists "Masters can manage plans" on public.plans;
create policy "Masters can manage plans"
on public.plans
for all
to authenticated
using (public.is_master())
with check (public.is_master());

drop policy if exists "Public can read active stores" on public.stores;
create policy "Public can read active stores"
on public.stores
for select
to anon, authenticated
using (active = true);

drop policy if exists "Store users can read their stores" on public.stores;
create policy "Store users can read their stores"
on public.stores
for select
to authenticated
using (public.can_access_store(id));

drop policy if exists "Store users can update their stores" on public.stores;
create policy "Store users can update their stores"
on public.stores
for update
to authenticated
using (public.can_access_store(id))
with check (public.can_access_store(id));

drop policy if exists "Masters can insert stores" on public.stores;
create policy "Masters can insert stores"
on public.stores
for insert
to authenticated
with check (public.is_master());

drop policy if exists "Masters can delete stores" on public.stores;
create policy "Masters can delete stores"
on public.stores
for delete
to authenticated
using (public.is_master());

drop policy if exists "Store users can read their own user rows" on public.store_users;
create policy "Store users can read their own user rows"
on public.store_users
for select
to authenticated
using (auth_user_id = auth.uid() or public.is_master());

drop policy if exists "Masters can manage store users" on public.store_users;
create policy "Masters can manage store users"
on public.store_users
for all
to authenticated
using (public.is_master())
with check (public.is_master());

drop policy if exists "Public can read settings for active stores" on public.store_settings;
create policy "Public can read settings for active stores"
on public.store_settings
for select
to anon, authenticated
using (public.is_store_active(store_id));

drop policy if exists "Store users can manage store settings" on public.store_settings;
create policy "Store users can manage store settings"
on public.store_settings
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can read active payment methods" on public.payment_methods;
create policy "Public can read active payment methods"
on public.payment_methods
for select
to anon, authenticated
using (active = true and public.is_store_active(store_id));

drop policy if exists "Store users can manage payment methods" on public.payment_methods;
create policy "Store users can manage payment methods"
on public.payment_methods
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (active = true and public.is_store_active(store_id));

drop policy if exists "Store users can manage categories" on public.categories;
create policy "Store users can manage categories"
on public.categories
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (active = true and public.is_store_active(store_id));

drop policy if exists "Store users can manage products" on public.products;
create policy "Store users can manage products"
on public.products
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can read active additional groups" on public.additional_groups;
create policy "Public can read active additional groups"
on public.additional_groups
for select
to anon, authenticated
using (active = true and public.is_store_active(store_id));

drop policy if exists "Store users can manage additional groups" on public.additional_groups;
create policy "Store users can manage additional groups"
on public.additional_groups
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can read active additional options" on public.additional_options;
create policy "Public can read active additional options"
on public.additional_options
for select
to anon, authenticated
using (
  active = true
  and public.is_additional_group_public(additional_group_id, store_id)
);

drop policy if exists "Store users can manage additional options" on public.additional_options;
create policy "Store users can manage additional options"
on public.additional_options
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can read active additional product links" on public.additional_group_products;
create policy "Public can read active additional product links"
on public.additional_group_products
for select
to anon, authenticated
using (
  public.is_additional_group_public(additional_group_id, store_id)
  and public.is_product_public(product_id, store_id)
);

drop policy if exists "Store users can manage additional product links" on public.additional_group_products;
create policy "Store users can manage additional product links"
on public.additional_group_products
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

-- Customer/order policies.
drop policy if exists "Public can create customers for active stores" on public.customers;
create policy "Public can create customers for active stores"
on public.customers
for insert
to anon, authenticated
with check (public.is_store_active(store_id));

drop policy if exists "Store users can manage customers" on public.customers;
create policy "Store users can manage customers"
on public.customers
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can create orders for active stores" on public.orders;
create policy "Public can create orders for active stores"
on public.orders
for insert
to anon, authenticated
with check (
  public.is_store_active(store_id)
  and (
    customer_id is null
    or public.customer_belongs_to_store(customer_id, store_id)
  )
);

drop policy if exists "Store users can manage orders" on public.orders;
create policy "Store users can manage orders"
on public.orders
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can create order items" on public.order_items;
create policy "Public can create order items"
on public.order_items
for insert
to anon, authenticated
with check (
  public.is_store_active(store_id)
  and public.order_belongs_to_store(order_id, store_id)
  and (
    product_id is null
    or public.is_product_public(product_id, store_id)
  )
);

drop policy if exists "Store users can manage order items" on public.order_items;
create policy "Store users can manage order items"
on public.order_items
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));

drop policy if exists "Public can create order item additionals" on public.order_item_additionals;
create policy "Public can create order item additionals"
on public.order_item_additionals
for insert
to anon, authenticated
with check (
  public.is_store_active(store_id)
  and public.order_item_belongs_to_store(order_item_id, store_id)
  and (
    additional_group_id is null
    or public.is_additional_group_public(additional_group_id, store_id)
  )
  and (
    additional_option_id is null
    or public.is_additional_option_public(additional_option_id, store_id)
  )
);

drop policy if exists "Store users can manage order item additionals" on public.order_item_additionals;
create policy "Store users can manage order item additionals"
on public.order_item_additionals
for all
to authenticated
using (public.can_access_store(store_id))
with check (public.can_access_store(store_id));
