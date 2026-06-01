-- Campos de vitrina y snapshot de inventario para admin/API en serverless
alter table public.products
  add column if not exists gallery text[] not null default array[]::text[],
  add column if not exists sort_order integer not null default 0,
  add column if not exists attributes jsonb not null default '[]'::jsonb,
  add column if not exists inventory_snapshot jsonb;

create index if not exists products_sort_order_idx on public.products (sort_order);

comment on column public.products.inventory_snapshot is
  'Copia completa del producto de inventario (admin); la API pública usa columnas escalares.';
