-- Reporte Persona: columnas extendidas del Excel en JSON + búsqueda por documento

alter table public.store_customers
  add column if not exists persona_data jsonb not null default '{}'::jsonb;

create index if not exists store_customers_tax_id_idx
  on public.store_customers (tax_id)
  where tax_id is not null and tax_id <> '';
