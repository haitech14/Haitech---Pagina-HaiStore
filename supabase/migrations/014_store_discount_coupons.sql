-- Cupones de descuento HaiStore (checkout + ruleta del color)
-- Depende de: 003_store_customers_orders.sql

do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_coupon_discount_type') then
    create type public.store_coupon_discount_type as enum ('percent', 'fixed_usd', 'fixed_pen');
  end if;

  if not exists (select 1 from pg_type where typname = 'store_coupon_status') then
    create type public.store_coupon_status as enum ('active', 'used', 'expired', 'cancelled');
  end if;
end $$;

create table if not exists public.store_discount_coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  label text not null,
  description text,
  discount_type public.store_coupon_discount_type not null,
  discount_value numeric(12, 2) not null check (discount_value > 0),
  scope text not null default 'all',
  category_slug text,
  premio_id text,
  campaign text,
  assigned_email text,
  min_order_usd numeric(12, 2) not null default 0 check (min_order_usd >= 0),
  max_uses integer not null default 1 check (max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  status public.store_coupon_status not null default 'active',
  expires_at timestamptz not null,
  used_at timestamptz,
  order_id uuid references public.store_orders (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_discount_coupons_code_unique unique (code),
  constraint store_discount_coupons_used_lte_max check (used_count <= max_uses)
);

create index if not exists store_discount_coupons_code_idx
  on public.store_discount_coupons (upper(code));

create index if not exists store_discount_coupons_status_idx
  on public.store_discount_coupons (status);

create index if not exists store_discount_coupons_assigned_email_idx
  on public.store_discount_coupons (lower(assigned_email));

create index if not exists store_discount_coupons_campaign_idx
  on public.store_discount_coupons (campaign);

create index if not exists store_discount_coupons_expires_at_idx
  on public.store_discount_coupons (expires_at);

alter table public.store_discount_coupons enable row level security;

create policy "Admins gestionan cupones"
  on public.store_discount_coupons for all
  using (public.is_admin())
  with check (public.is_admin());

-- Pedidos: registrar descuento aplicado
alter table public.store_orders
  add column if not exists discount_usd numeric(12, 2) not null default 0 check (discount_usd >= 0);

alter table public.store_orders
  add column if not exists coupon_id uuid references public.store_discount_coupons (id) on delete set null;

alter table public.store_orders
  add column if not exists coupon_code text;

create index if not exists store_orders_coupon_id_idx on public.store_orders (coupon_id);

drop trigger if exists store_discount_coupons_updated_at on public.store_discount_coupons;
create trigger store_discount_coupons_updated_at
  before update on public.store_discount_coupons
  for each row execute function public.set_updated_at();
