-- Catálogo de servicios (lista de precios) persistido en Supabase

create table if not exists public.store_service_catalog (
  id text primary key,
  code text not null,
  name text not null,
  category_id text not null references public.store_service_categories (id),
  description text not null default '',
  prices jsonb not null default '{"public":0,"tecnico":0,"mayorista":0,"distribuidor":0}'::jsonb,
  active boolean not null default true,
  modalidad text check (modalidad in ('presencial', 'remoto', 'mixto')),
  tipo text check (tipo in ('unico', 'mensual', 'proyecto')),
  estado text check (estado in ('activo', 'programado', 'pausado', 'archivado')),
  cobertura text,
  responsable_name text,
  responsable_title text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_service_catalog_category_idx
  on public.store_service_catalog (category_id, sort_order);

create index if not exists store_service_catalog_active_idx
  on public.store_service_catalog (active, updated_at desc);

alter table public.store_service_catalog enable row level security;

create policy "Catálogo servicio visible"
  on public.store_service_catalog for select
  using (active = true or public.is_admin());

create policy "Admins gestionan catálogo servicio"
  on public.store_service_catalog for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.store_service_catalog (
  id,
  code,
  name,
  category_id,
  description,
  prices,
  active,
  modalidad,
  tipo,
  estado,
  sort_order
)
values
  (
    'sp-001',
    'SRV-MF-TRIM',
    'Mantenimiento preventivo multifuncional',
    'cat-mantenimiento',
    'Limpieza, rodillos y contador; hasta 1 equipo en sitio.',
    '{"public":280,"tecnico":240,"mayorista":220,"distribuidor":200}'::jsonb,
    true,
    'presencial',
    'unico',
    'activo',
    1
  ),
  (
    'sp-002',
    'SRV-CORR-URG',
    'Correctivo urgente (misma ciudad)',
    'cat-correctivo',
    'Visita técnica prioritaria y diagnóstico en campo.',
    '{"public":180,"tecnico":150,"mayorista":140,"distribuidor":125}'::jsonb,
    true,
    'presencial',
    'unico',
    'activo',
    2
  ),
  (
    'sp-003',
    'SRV-INST-BASE',
    'Instalación y puesta en marcha',
    'cat-instalacion',
    'Conexión red/USB, drivers y prueba de impresión.',
    '{"public":220,"tecnico":190,"mayorista":175,"distribuidor":160}'::jsonb,
    true,
    'mixto',
    'unico',
    'activo',
    3
  ),
  (
    'sp-004',
    'SRV-REM-60',
    'Soporte remoto (hasta 60 min)',
    'cat-remoto',
    'Asistencia remota con registro de ticket.',
    '{"public":95,"tecnico":80,"mayorista":75,"distribuidor":70}'::jsonb,
    true,
    'remoto',
    'unico',
    'activo',
    4
  )
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  category_id = excluded.category_id,
  description = excluded.description,
  prices = excluded.prices,
  active = excluded.active,
  modalidad = excluded.modalidad,
  tipo = excluded.tipo,
  estado = excluded.estado,
  sort_order = excluded.sort_order,
  updated_at = now();

do $$
begin
  alter publication supabase_realtime add table public.store_service_catalog;
exception when duplicate_object then null;
end $$;

comment on table public.store_service_catalog is
  'Catálogo de servicios y lista de precios (PEN por rol). Fuente compartida del admin HaiStore.';
