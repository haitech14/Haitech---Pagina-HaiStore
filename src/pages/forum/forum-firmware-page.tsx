import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

import { ForumDiscussionRow } from '@/components/forum/forum-discussion-row';
import { ForumFirmwareCatalogPanel } from '@/components/forum/forum-firmware-catalog-panel';
import { Button } from '@/components/ui/button';
import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { useForumFirmwareIndex } from '@/hooks/use-forum';

export function ForumFirmwarePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);

  const { data, isLoading } = useForumFirmwareIndex({
    ...(query ? { q: query } : {}),
    limit: 50,
  });

  useEffect(() => {
    document.title = `Firmware | ${FORUM_TITLE_SUFFIX}`;
  }, []);

  useEffect(() => {
    setSearch(initialQ);
    setQuery(initialQ);
  }, [initialQ]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const next = search.trim();
    setQuery(next);
    const params = new URLSearchParams(searchParams);
    if (next) params.set('q', next);
    else params.delete('q');
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="container px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link to="/foro" className="text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-accent))]">
          ← Foro
        </Link>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Firmware</h1>
          <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">
            Descargas del catálogo HaiStore y notas de versión de la comunidad.
          </p>
        </div>
        <Button
          asChild
          className="min-h-11 shrink-0 bg-[hsl(var(--forum-accent))] hover:bg-[hsl(var(--forum-accent)/0.9)]"
        >
          <Link to="/foro/nuevo?tipo=firmware">
            <Plus className="size-4" aria-hidden="true" />
            Reportar versión
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="relative mt-6 max-w-xl" role="search">
        <label htmlFor="firmware-search" className="sr-only">
          Buscar por modelo o marca
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--forum-muted))]"
          aria-hidden="true"
        />
        <input
          id="firmware-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por modelo, marca o categoría…"
          className="h-11 w-full rounded-lg border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
        />
      </form>

      <section className="mt-8" aria-labelledby="firmware-catalog-title">
        <h2 id="firmware-catalog-title" className="text-lg font-bold">
          Catálogo de descargas
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--forum-muted))]">
          Archivos de firmware vinculados a productos del inventario.
        </p>
        <div className="mt-4">
          <ForumFirmwareCatalogPanel items={data?.catalog ?? []} isLoading={isLoading} />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="firmware-threads-title">
        <h2 id="firmware-threads-title" className="text-lg font-bold">
          Notas y discusiones
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--forum-muted))]">
          Experiencias de instalación, compatibilidad y actualizaciones.
        </p>
        <div className="mt-4 rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4 sm:p-5">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
              Cargando notas…
            </p>
          ) : (data?.threads ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]">
              No hay notas de firmware publicadas.
            </p>
          ) : (
            (data?.threads ?? []).map((thread) => (
              <ForumDiscussionRow key={thread.id} thread={thread} showKind />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
