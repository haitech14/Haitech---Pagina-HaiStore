-- Productos de interés de compra por cliente (ids del catálogo).
alter table store_customers
  add column if not exists productos_interes jsonb not null default '[]'::jsonb;

comment on column store_customers.productos_interes is 'Array JSON de UUIDs de productos de interés';
