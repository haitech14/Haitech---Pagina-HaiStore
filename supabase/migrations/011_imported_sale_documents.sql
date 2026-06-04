-- Comprobantes importados desde Reporte de Ventas (ERP).
create table if not exists public.imported_sale_documents (
  id uuid primary key default gen_random_uuid(),
  external_key text not null unique,
  invoice_date timestamptz not null,
  due_date timestamptz,
  document_type text not null,
  serie text not null default '',
  numero text not null default '',
  tax_id text,
  customer_name text not null default '',
  seller_name text,
  user_name text,
  currency text not null default 'USD',
  total numeric(14, 2) not null default 0,
  exchange_rate numeric(10, 4),
  total_pen numeric(14, 2),
  payment_date text,
  related_doc text,
  observations text,
  hora text,
  report_period_start date,
  report_period_end date,
  report_period_month date not null,
  customer_id uuid references public.store_customers (id) on delete set null,
  source_filename text,
  report_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists imported_sale_documents_period_month_idx
  on public.imported_sale_documents (report_period_month desc);

create index if not exists imported_sale_documents_invoice_date_idx
  on public.imported_sale_documents (invoice_date desc);

create index if not exists imported_sale_documents_tax_id_idx
  on public.imported_sale_documents (tax_id)
  where tax_id is not null and tax_id <> '';

create index if not exists imported_sale_documents_seller_name_idx
  on public.imported_sale_documents (seller_name)
  where seller_name is not null and seller_name <> '';

comment on table public.imported_sale_documents is 'Ventas históricas importadas desde Excel Reporte de Ventas';

alter table public.imported_sale_documents enable row level security;

create policy "Admins gestionan ventas importadas"
  on public.imported_sale_documents for all
  using (public.is_admin())
  with check (public.is_admin());
