import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { ForumDiscussionRow } from '@/components/forum/forum-discussion-row';
import { Button } from '@/components/ui/button';
import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { useForumThreads } from '@/hooks/use-forum';
import type { ForumSortValue } from '@/types/forum';
import { cn } from '@/lib/utils';

export function ForumTutorialesPage() {
  const [sort, setSort] = useState<ForumSortValue>('popular');
  const { data, isLoading } = useForumThreads({
    kind: 'tutorial',
    sort,
    limit: 20,
  });
  const threads = data?.threads ?? [];

  useEffect(() => {
    document.title = `Tutoriales | ${FORUM_TITLE_SUFFIX}`;
  }, []);

  return (
    <div className="container px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link to="/foro" className="text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-accent))]">
          ← Foro
        </Link>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutoriales</h1>
          <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">
            Guías paso a paso para instalar drivers, configurar red y mantener tus equipos.
          </p>
        </div>
        <Button
          asChild
          className="min-h-11 shrink-0 bg-[hsl(var(--forum-accent))] hover:bg-[hsl(var(--forum-accent)/0.9)]"
        >
          <Link to="/foro/nuevo?tipo=tutorial">
            <Plus className="size-4" aria-hidden="true" />
            Publicar tutorial
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Ordenar tutoriales">
        {(
          [
            { value: 'popular' as const, label: 'Más útiles' },
            { value: 'recent' as const, label: 'Recientes' },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSort(value)}
            aria-pressed={sort === value}
            className={cn(
              'min-h-10 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]',
              sort === value
                ? 'bg-[hsl(var(--forum-accent))] text-white'
                : 'border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-fg))]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4 sm:p-5">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
            Cargando tutoriales…
          </p>
        ) : threads.length === 0 ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]">
            Aún no hay tutoriales publicados.
          </p>
        ) : (
          threads.map((thread) => <ForumDiscussionRow key={thread.id} thread={thread} showKind />)
        )}
      </div>
    </div>
  );
}
