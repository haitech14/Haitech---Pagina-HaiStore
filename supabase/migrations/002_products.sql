-- Catálogo de productos (Haitech / HaiStore)
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

create index if not exists products_brand_idx on public.products (brand);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);

alter table public.products enable row level security;

-- Catálogo visible para visitantes y usuarios autenticados
create policy "Catálogo público de lectura"
  on public.products for select
  using (true);

-- Solo admins gestionan inventario desde el cliente (service role omite RLS)
create policy "Admins insertan productos"
  on public.products for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins actualizan productos"
  on public.products for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins eliminan productos"
  on public.products for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_products_updated_at();

-- Datos iniciales (idempotente)
insert into public.products (
  id, name, description, price, currency, image_url, stock, category, brand, prices, created_at
)
values
  (
    'ricoh-im-c3000',
    'RICOH IM C3000',
    'Multifuncional a color láser A3 para oficinas exigentes.',
    2499,
    'USD',
    null,
    8,
    'Multifuncionales',
    'Ricoh',
    '{"public":2499,"corporativo":2299,"tecnico":2199,"mayorista":2124,"distribuidor":1949,"vip":1799}'::jsonb,
    '2025-01-10T00:00:00.000Z'::timestamptz
  ),
  (
    'ricoh-sp-330dn',
    'RICOH SP 330DN',
    'Impresora monocromática compacta con duplex automático.',
    389,
    'USD',
    null,
    15,
    'Impresoras',
    'Ricoh',
    '{"public":389,"corporativo":358,"tecnico":342,"mayorista":331,"distribuidor":303,"vip":280}'::jsonb,
    '2025-01-09T00:00:00.000Z'::timestamptz
  ),
  (
    'konica-bizhub-c300i',
    'Konica Minolta bizhub C300i',
    'Multifuncional inteligente con conectividad cloud.',
    3199,
    'USD',
    null,
    5,
    'Multifuncionales',
    'Konica Minolta',
    '{"public":3199,"corporativo":2943,"tecnico":2815,"mayorista":2729,"distribuidor":2495,"vip":2303}'::jsonb,
    '2025-01-08T00:00:00.000Z'::timestamptz
  ),
  (
    'canon-lbp226dw',
    'Canon imageCLASS LBP226dw',
    'Impresora láser Wi-Fi con impresión dúplex.',
    279,
    'USD',
    null,
    22,
    'Impresoras',
    'Canon',
    '{"public":279,"corporativo":257,"tecnico":246,"mayorista":237,"distribuidor":218,"vip":201}'::jsonb,
    '2025-01-06T00:00:00.000Z'::timestamptz
  ),
  (
    'hp-toner-58a',
    'HP 58A Tóner Original',
    'Cartucho de tóner negro original HP 58A.',
    89,
    'USD',
    null,
    45,
    'Tóner y Suministros',
    'HP',
    '{"public":89,"corporativo":82,"tecnico":78,"mayorista":76,"distribuidor":69,"vip":64}'::jsonb,
    '2025-01-02T00:00:00.000Z'::timestamptz
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  currency = excluded.currency,
  stock = excluded.stock,
  category = excluded.category,
  brand = excluded.brand,
  prices = excluded.prices,
  updated_at = now();
