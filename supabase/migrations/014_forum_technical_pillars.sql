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

