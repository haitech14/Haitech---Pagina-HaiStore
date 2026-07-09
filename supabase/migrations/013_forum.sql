-- Foro HaiStore: categorías, hilos, respuestas y eventos
-- Depende de: 001_profiles_auth.sql

-- ---------------------------------------------------------------------------
-- Perfiles: campos de gamificación del foro
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists forum_points integer not null default 0 check (forum_points >= 0),
  add column if not exists forum_level integer not null default 1 check (forum_level >= 1),
  add column if not exists forum_title text;

-- ---------------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------------
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon_key text not null default 'message-square',
  accent_class text not null default 'bg-sky-500',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists forum_categories_sort_idx
  on public.forum_categories (sort_order, name);

alter table public.forum_categories enable row level security;

create policy "Foro categorías visibles"
  on public.forum_categories for select
  to anon, authenticated
  using (true);

create policy "Admins gestionan categorías foro"
  on public.forum_categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Hilos
-- ---------------------------------------------------------------------------
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories (id) on delete restrict,
  author_id uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(trim(title)) >= 3),
  slug text not null unique,
  body text not null check (char_length(trim(body)) >= 10),
  tags text[] not null default '{}',
  view_count integer not null default 0 check (view_count >= 0),
  reply_count integer not null default 0 check (reply_count >= 0),
  is_pinned boolean not null default false,
  last_reply_at timestamptz,
  last_reply_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forum_threads_category_idx
  on public.forum_threads (category_id, created_at desc);

create index if not exists forum_threads_last_reply_idx
  on public.forum_threads (last_reply_at desc nulls last, created_at desc);

create index if not exists forum_threads_reply_count_idx
  on public.forum_threads (reply_count desc);

create index if not exists forum_threads_title_search_idx
  on public.forum_threads using gin (to_tsvector('spanish', title || ' ' || body));

alter table public.forum_threads enable row level security;

create policy "Foro hilos visibles"
  on public.forum_threads for select
  to anon, authenticated
  using (true);

create policy "Usuarios crean hilos"
  on public.forum_threads for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Autores actualizan sus hilos"
  on public.forum_threads for update
  to authenticated
  using ((select auth.uid()) = author_id or public.is_admin())
  with check ((select auth.uid()) = author_id or public.is_admin());

create policy "Autores o admins eliminan hilos"
  on public.forum_threads for delete
  to authenticated
  using ((select auth.uid()) = author_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Respuestas
-- ---------------------------------------------------------------------------
create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (char_length(trim(body)) >= 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forum_replies_thread_idx
  on public.forum_replies (thread_id, created_at asc);

create index if not exists forum_replies_created_idx
  on public.forum_replies (created_at desc);

alter table public.forum_replies enable row level security;

create policy "Foro respuestas visibles"
  on public.forum_replies for select
  to anon, authenticated
  using (true);

create policy "Usuarios crean respuestas"
  on public.forum_replies for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Autores actualizan sus respuestas"
  on public.forum_replies for update
  to authenticated
  using ((select auth.uid()) = author_id or public.is_admin())
  with check ((select auth.uid()) = author_id or public.is_admin());

create policy "Autores o admins eliminan respuestas"
  on public.forum_replies for delete
  to authenticated
  using ((select auth.uid()) = author_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Eventos (sidebar)
-- ---------------------------------------------------------------------------
create table if not exists public.forum_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  location text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists forum_events_starts_idx
  on public.forum_events (starts_at asc);

alter table public.forum_events enable row level security;

create policy "Foro eventos visibles"
  on public.forum_events for select
  to anon, authenticated
  using (true);

create policy "Admins gestionan eventos foro"
  on public.forum_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Triggers: respuestas → hilo + puntos
-- ---------------------------------------------------------------------------
create or replace function public.forum_on_reply_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.forum_threads
  set
    reply_count = reply_count + 1,
    last_reply_at = new.created_at,
    last_reply_by = new.author_id,
    updated_at = now()
  where id = new.thread_id;

  update public.profiles
  set
    forum_points = forum_points + 5,
    forum_level = greatest(1, 1 + (forum_points + 5) / 100),
    updated_at = now()
  where id = new.author_id;

  return new;
end;
$$;

drop trigger if exists forum_replies_after_insert on public.forum_replies;
create trigger forum_replies_after_insert
  after insert on public.forum_replies
  for each row execute function public.forum_on_reply_insert();

create or replace function public.forum_on_thread_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    forum_points = forum_points + 10,
    forum_level = greatest(1, 1 + (forum_points + 10) / 100),
    updated_at = now()
  where id = new.author_id;

  return new;
end;
$$;

drop trigger if exists forum_threads_after_insert on public.forum_threads;
create trigger forum_threads_after_insert
  after insert on public.forum_threads
  for each row execute function public.forum_on_thread_insert();

-- Incremento de vistas (solo vía service role / API)
create or replace function public.forum_increment_thread_views(p_thread_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.forum_threads
  set view_count = view_count + 1
  where id = p_thread_id;
end;
$$;

grant execute on function public.forum_increment_thread_views(uuid) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Grants Data API
-- ---------------------------------------------------------------------------
grant select on public.forum_categories to anon, authenticated;
grant select on public.forum_threads to anon, authenticated;
grant select on public.forum_replies to anon, authenticated;
grant select on public.forum_events to anon, authenticated;

grant insert, update, delete on public.forum_threads to authenticated;
grant insert, update, delete on public.forum_replies to authenticated;

-- ---------------------------------------------------------------------------
-- Seeds
-- ---------------------------------------------------------------------------
insert into public.forum_categories (slug, name, description, icon_key, accent_class, sort_order)
values
  ('inteligencia-artificial', 'Inteligencia Artificial', 'IA aplicada a impresión y oficina', 'brain', 'bg-sky-500', 1),
  ('programacion', 'Programación', 'Drivers, integraciones y desarrollo', 'code-2', 'bg-blue-600', 2),
  ('hardware', 'Hardware', 'Equipos Ricoh, plotters y multifuncionales', 'cpu', 'bg-violet-500', 3),
  ('ciberseguridad', 'Ciberseguridad', 'Protección de datos e impresión segura', 'shield', 'bg-emerald-500', 4),
  ('startups', 'Startups', 'Emprendimiento y digitalización', 'rocket', 'bg-orange-500', 5),
  ('noticias-tech', 'Noticias Tech', 'Novedades del ecosistema HaiTech', 'newspaper', 'bg-cyan-500', 6)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_key = excluded.icon_key,
  accent_class = excluded.accent_class,
  sort_order = excluded.sort_order;

