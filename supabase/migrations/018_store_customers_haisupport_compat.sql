-- HaiStore store_customers (+ pedidos) en proyecto compartido HaiSupport.
-- No recrea public.store_product_categories: en HaiSupport es una tabla puente distinta.
-- Dependencias: public.profiles, auth.users (user_roles opcional si existe en HaiSupport).

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  has_role boolean := false;
begin
  if exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    return true;
  end if;

  -- Compat HaiSupport: solo si existe public.user_roles
  if to_regclass('public.user_roles') is not null then
    execute $q$
      select exists (
        select 1 from public.user_roles ur
        where ur.user_id = auth.uid()
          and ur.role::text in ('admin', 'superadmin', 'admin_empresa')
      )
    $q$ into has_role;
    return coalesce(has_role, false);
  end if;

  return false;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  price numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  category text,
  brand text,
  prices jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Catálogo público de lectura'
  ) then
    create policy "Catálogo público de lectura"
      on public.products for select
      using (true);
  end if;
end $$;

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
  nombre_contacto text,
  direccion text,
  ciudad text,
  tipo_cliente text default 'public',
  source text not null default 'haistore'
    check (source in ('haistore', 'haisupport')),
  haisupport_client_id uuid,
  persona_data jsonb not null default '{}'::jsonb,
  productos_interes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_customers_email_unique unique (email)
);

create index if not exists store_customers_profile_id_idx on public.store_customers (profile_id);
create index if not exists store_customers_email_idx on public.store_customers (email);
create index if not exists store_customers_created_at_idx on public.store_customers (created_at desc);
create index if not exists store_customers_haisupport_client_id_idx
  on public.store_customers (haisupport_client_id)
  where haisupport_client_id is not null;
create index if not exists store_customers_source_idx on public.store_customers (source);
create index if not exists store_customers_tax_id_idx
  on public.store_customers (tax_id)
  where tax_id is not null and tax_id <> '';

alter table public.store_customers enable row level security;

drop policy if exists "Usuarios leen su cliente" on public.store_customers;
create policy "Usuarios leen su cliente"
  on public.store_customers for select
  using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "Usuarios actualizan su cliente" on public.store_customers;
create policy "Usuarios actualizan su cliente"
  on public.store_customers for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists "Admins gestionan clientes" on public.store_customers;
create policy "Admins gestionan clientes"
  on public.store_customers for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.store_customers (profile_id, email, full_name, phone, created_at, updated_at)
select
  p.id,
  coalesce(nullif(trim(p.email), ''), p.id::text || '@local.haitech'),
  nullif(trim(coalesce(p.full_name, '')), ''),
  null,
  p.created_at,
  p.updated_at
from public.profiles p
where not exists (
  select 1 from public.store_customers c where c.profile_id = p.id
)
on conflict (profile_id) do nothing;

create or replace function public.sync_profile_to_store_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.store_customers (profile_id, email, full_name, phone, created_at, updated_at)
  values (
    new.id,
    coalesce(nullif(trim(new.email), ''), new.id::text || '@local.haitech'),
    nullif(trim(coalesce(new.full_name, '')), ''),
    null,
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

do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_order_status') then
    create type public.store_order_status as enum (
      'pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'store_payment_status') then
    create type public.store_payment_status as enum (
      'pending', 'paid', 'failed', 'refunded'
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
create index if not exists store_orders_created_at_idx on public.store_orders (created_at desc);

alter table public.store_orders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'store_orders' and policyname = 'Usuarios leen sus pedidos'
  ) then
    create policy "Usuarios leen sus pedidos"
      on public.store_orders for select
      using (user_id = auth.uid() or public.is_admin());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'store_orders' and policyname = 'Usuarios crean pedidos propios'
  ) then
    create policy "Usuarios crean pedidos propios"
      on public.store_orders for insert
      with check (user_id = auth.uid() or user_id is null);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'store_orders' and policyname = 'Admins gestionan pedidos'
  ) then
    create policy "Admins gestionan pedidos"
      on public.store_orders for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

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

alter table public.store_order_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'store_order_items' and policyname = 'Lectura ítems según pedido'
  ) then
    create policy "Lectura ítems según pedido"
      on public.store_order_items for select
      using (
        exists (
          select 1 from public.store_orders o
          where o.id = order_id
            and (o.user_id = auth.uid() or public.is_admin())
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'store_order_items' and policyname = 'Inserción ítems en pedido propio'
  ) then
    create policy "Inserción ítems en pedido propio"
      on public.store_order_items for insert
      with check (
        exists (
          select 1 from public.store_orders o
          where o.id = order_id
            and (o.user_id = auth.uid() or public.is_admin())
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'store_order_items' and policyname = 'Admins gestionan ítems'
  ) then
    create policy "Admins gestionan ítems"
      on public.store_order_items for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

drop trigger if exists store_customers_updated_at on public.store_customers;
create trigger store_customers_updated_at
  before update on public.store_customers
  for each row execute function public.set_updated_at();

drop trigger if exists store_orders_updated_at on public.store_orders;
create trigger store_orders_updated_at
  before update on public.store_orders
  for each row execute function public.set_updated_at();

create or replace view public.store_customers_with_profile
with (security_invoker = true)
as
select
  c.id,
  c.profile_id,
  c.email,
  coalesce(c.full_name, p.full_name) as full_name,
  c.phone,
  c.company_name,
  c.tax_id,
  p.role::text as profile_role,
  c.created_at,
  c.updated_at
from public.store_customers c
left join public.profiles p on p.id = c.profile_id;

grant select, insert, update, delete on table public.store_customers to anon, authenticated, service_role;
grant select, insert, update, delete on table public.store_orders to anon, authenticated, service_role;
grant select, insert, update, delete on table public.store_order_items to anon, authenticated, service_role;
grant select on table public.store_customers_with_profile to anon, authenticated, service_role;
grant select on table public.products to anon, authenticated, service_role;

notify pgrst, 'reload schema';

comment on column public.store_customers.productos_interes is 'Array JSON de UUIDs de productos de interés';
comment on table public.store_customers is 'Clientes de tienda HaiStore (Persona / cuentas / sync HaiSupport)';
