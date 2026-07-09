-- Comercio HaiStore: categorías normalizadas, clientes y pedidos
-- Depende de: 001_profiles_auth.sql, 002_products.sql

-- ---------------------------------------------------------------------------
-- Utilidad: comprobar si el usuario autenticado es admin
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Categorías de producto (normalización del catálogo)
-- ---------------------------------------------------------------------------
create table if not exists public.store_product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_product_categories_slug_idx
  on public.store_product_categories (slug);

alter table public.store_product_categories enable row level security;

create policy "Categorías visibles para todos"
  on public.store_product_categories for select
  using (is_active = true or public.is_admin());

create policy "Admins gestionan categorías"
  on public.store_product_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Vincular products.category (texto) → category_id
alter table public.products
  add column if not exists category_id uuid references public.store_product_categories (id) on delete set null;

create index if not exists products_category_id_idx on public.products (category_id);

-- Poblar categorías desde valores existentes en products.category
-- (una fila por slug: nombres con distinta capitalización comparten slug y no pueden ir en el mismo INSERT)
insert into public.store_product_categories (slug, name, sort_order)
select
  slug,
  name,
  row_number() over (order by name)::integer as sort_order
from (
  select distinct on (
    lower(regexp_replace(trim(category), '\s+', '-', 'g'))
  )
    lower(regexp_replace(trim(category), '\s+', '-', 'g')) as slug,
    trim(category) as name
  from public.products
  where category is not null and trim(category) <> ''
  order by
    lower(regexp_replace(trim(category), '\s+', '-', 'g')),
    trim(category)
) as categories_by_slug
on conflict (slug) do update set
  name = excluded.name,
  updated_at = now();

update public.products p
set category_id = c.id
from public.store_product_categories c
where p.category is not null
  and lower(regexp_replace(trim(p.category), '\s+', '-', 'g')) = c.slug
  and p.category_id is null;

-- ---------------------------------------------------------------------------
-- Clientes (perfil de compra; opcionalmente vinculado a auth/profiles)
-- ---------------------------------------------------------------------------
create table if not exists public.store_customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  email text not null,
  full_name text,
  phone text,
  company_name text,
  tax_id text,
  default_shipping jsonb,
  default_billing jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_customers_email_unique unique (email)
);

create index if not exists store_customers_profile_id_idx on public.store_customers (profile_id);
create index if not exists store_customers_email_idx on public.store_customers (email);
create index if not exists store_customers_created_at_idx on public.store_customers (created_at desc);

alter table public.store_customers enable row level security;

create policy "Usuarios leen su cliente"
  on public.store_customers for select
  using (profile_id = auth.uid() or public.is_admin());

create policy "Usuarios actualizan su cliente"
  on public.store_customers for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Admins gestionan clientes"
  on public.store_customers for all
  using (public.is_admin())
  with check (public.is_admin());

-- Sincronizar perfiles existentes → clientes
insert into public.store_customers (profile_id, email, full_name, created_at, updated_at)
select
  p.id,
  coalesce(nullif(trim(p.email), ''), p.id::text || '@local.haitech'),
  p.full_name,
  p.created_at,
  p.updated_at
from public.profiles p
where not exists (
  select 1 from public.store_customers c where c.profile_id = p.id
)
on conflict (profile_id) do nothing;

-- Nuevos perfiles generan registro de cliente
create or replace function public.sync_profile_to_store_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.store_customers (profile_id, email, full_name, created_at, updated_at)
  values (
    new.id,
    coalesce(nullif(trim(new.email), ''), new.id::text || '@local.haitech'),
    new.full_name,
    coalesce(new.created_at, now()),
    coalesce(new.updated_at, now())
  )
  on conflict (profile_id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, store_customers.full_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_sync_store_customer on public.profiles;
create trigger profiles_sync_store_customer
  after insert or update of email, full_name on public.profiles
  for each row execute function public.sync_profile_to_store_customer();

-- ---------------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_order_status') then
    create type public.store_order_status as enum (
      'pending_payment',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'store_payment_status') then
    create type public.store_payment_status as enum (
      'pending',
      'paid',
      'failed',
      'refunded'
    );
  end if;
end $$;

create sequence if not exists public.store_order_number_seq start 1000;

create or replace function public.generate_store_order_number()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
  year_part text;
begin
  seq_val := nextval('public.store_order_number_seq');
  year_part := to_char(now(), 'YYYY');
  return 'HS-' || year_part || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_store_order_number(),
  customer_id uuid references public.store_customers (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  status public.store_order_status not null default 'pending_payment',
  payment_status public.store_payment_status not null default 'pending',
  payment_method text,
  currency text not null default 'USD',
  subtotal_usd numeric(12, 2) not null default 0 check (subtotal_usd >= 0),
  tax_usd numeric(12, 2) not null default 0 check (tax_usd >= 0),
  total_usd numeric(12, 2) not null default 0 check (total_usd >= 0),
  total_pen numeric(12, 2) check (total_pen is null or total_pen >= 0),
  exchange_rate numeric(10, 4),
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_orders_customer_id_idx on public.store_orders (customer_id);
create index if not exists store_orders_user_id_idx on public.store_orders (user_id);
create index if not exists store_orders_status_idx on public.store_orders (status);
create index if not exists store_orders_payment_status_idx on public.store_orders (payment_status);
create index if not exists store_orders_created_at_idx on public.store_orders (created_at desc);

alter table public.store_orders enable row level security;

create policy "Usuarios leen sus pedidos"
  on public.store_orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Usuarios crean pedidos propios"
  on public.store_orders for insert
  with check (user_id = auth.uid() or user_id is null);

create policy "Admins gestionan pedidos"
  on public.store_orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Líneas de pedido (snapshot de producto al momento de la compra)
-- ---------------------------------------------------------------------------
create table if not exists public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders (id) on delete cascade,
  product_id text references public.products (id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price_usd numeric(12, 2) not null check (unit_price_usd >= 0),
  line_total_usd numeric(12, 2) not null check (line_total_usd >= 0),
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists store_order_items_order_id_idx on public.store_order_items (order_id);
create index if not exists store_order_items_product_id_idx on public.store_order_items (product_id);

alter table public.store_order_items enable row level security;

create policy "Lectura ítems según pedido"
  on public.store_order_items for select
  using (
    exists (
      select 1 from public.store_orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Inserción ítems en pedido propio"
  on public.store_order_items for insert
  with check (
    exists (
      select 1 from public.store_orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Admins gestionan ítems"
  on public.store_order_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists store_product_categories_updated_at on public.store_product_categories;
create trigger store_product_categories_updated_at
  before update on public.store_product_categories
  for each row execute function public.set_updated_at();

drop trigger if exists store_customers_updated_at on public.store_customers;
create trigger store_customers_updated_at
  before update on public.store_customers
  for each row execute function public.set_updated_at();

drop trigger if exists store_orders_updated_at on public.store_orders;
create trigger store_orders_updated_at
  before update on public.store_orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Vista: clientes con email (admin / reportes)
-- ---------------------------------------------------------------------------
create or replace view public.store_customers_with_profile as
select
  c.id,
  c.profile_id,
  c.email,
  coalesce(c.full_name, p.full_name) as full_name,
  c.phone,
  c.company_name,
  c.tax_id,
  p.role as profile_role,
  c.created_at,
  c.updated_at
from public.store_customers c
left join public.profiles p on p.id = c.profile_id;

