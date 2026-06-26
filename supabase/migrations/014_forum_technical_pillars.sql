-- Foro HaiStore: pilares técnicos (preguntas, tutoriales, firmware)
-- Depende de: 013_forum.sql

-- ---------------------------------------------------------------------------
-- Tipos de hilo y estado de resolución
-- ---------------------------------------------------------------------------
alter table public.forum_threads
  add column if not exists kind text not null default 'discussion'
    check (kind in ('discussion', 'question', 'tutorial', 'firmware')),
  add column if not exists is_solved boolean not null default false,
  add column if not exists accepted_reply_id uuid references public.forum_replies (id) on delete set null;

create index if not exists forum_threads_kind_created_idx
  on public.forum_threads (kind, created_at desc);

create index if not exists forum_threads_kind_solved_idx
  on public.forum_threads (kind, is_solved)
  where kind = 'question';

-- ---------------------------------------------------------------------------
-- Categoría firmware (7.ª categoría)
-- ---------------------------------------------------------------------------
insert into public.forum_categories (slug, name, description, icon_key, accent_class, sort_order)
values
  ('firmware', 'Firmware', 'Notas de versión, actualizaciones y compatibilidad', 'cpu', 'bg-amber-600', 7)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_key = excluded.icon_key,
  accent_class = excluded.accent_class,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Hilos demo por pilar (solo si hay al menos un perfil)
-- ---------------------------------------------------------------------------
do $$
declare
  v_author uuid;
  v_cat_hw uuid;
  v_cat_prog uuid;
  v_cat_firmware uuid;
begin
  select id into v_author from public.profiles order by created_at asc limit 1;
  select id into v_cat_hw from public.forum_categories where slug = 'hardware';
  select id into v_cat_prog from public.forum_categories where slug = 'programacion';
  select id into v_cat_firmware from public.forum_categories where slug = 'firmware';

  if v_author is null then
    return;
  end if;

  insert into public.forum_threads (
    category_id, author_id, title, slug, body, tags, kind,
    view_count, reply_count, is_pinned, last_reply_at, last_reply_by
  )
  values
    (
      v_cat_hw,
      v_author,
      'Error E3 en Ricoh IM C3010 al imprimir desde red',
      'error-e3-im-c3010-red',
      'El equipo muestra E3 al enviar trabajos desde Windows 11. Ya reinicié el servicio de impresión. ¿Alguien lo resolvió?',
      array['Ricoh', 'IM C3010', 'Error'],
      'question',
      312,
      8,
      false,
      now() - interval '3 hours',
      v_author
    ),
    (
      v_cat_prog,
      v_author,
      'Cómo instalar el driver Ricoh en Windows paso a paso',
      'tutorial-driver-ricoh-windows',
      '1. Descarga el driver desde la ficha del equipo o el portal Ricoh.
2. Ejecuta el instalador como administrador.
3. Selecciona conexión TCP/IP e ingresa la IP del multifuncional.
4. Imprime una página de prueba y verifica el contador en el panel.',
      array['Tutorial', 'Driver', 'Windows'],
      'tutorial',
      890,
      24,
      true,
      now() - interval '1 day',
      v_author
    ),
    (
      v_cat_firmware,
      v_author,
      'Firmware 1.12 para IM C4010 — notas de la actualización',
      'firmware-1-12-im-c4010-notas',
      'Versión 1.12 corrige problemas de escaneo a carpeta SMB y mejora la estabilidad de red. Recomendado para flotas con IM C4010 en producción.',
      array['Firmware', 'IM C4010', 'Actualización'],
      'firmware',
      445,
      5,
      false,
      now() - interval '2 days',
      v_author
    )
  on conflict (slug) do nothing;
end $$;
