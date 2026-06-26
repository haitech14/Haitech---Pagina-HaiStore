import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { ForumDiscussionRow } from '@/components/forum/forum-discussion-row';
import { Button } from '@/components/ui/button';
import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { useForumThreads } from '@/hooks/use-forum';
import type { ForumSolvedFilter } from '@/types/forum';
import { cn } from '@/lib/utils';

const TABS: { value: ForumSolvedFilter; label: string }[] = [
  { value: 'open', label: 'Abiertas' },
  { value: 'solved', label: 'Resueltas' },
  { value: 'all', label: 'Todas' },
];

export function ForumPreguntasPage() {
  const [tab, setTab] = useState<ForumSolvedFilter>('open');
  const { data, isLoading } = useForumThreads({
    kind: 'question',
    solved: tab,
    sort: 'recent',
    limit: 20,
  });
  const threads = data?.threads ?? [];

  useEffect(() => {
    document.title = `Preguntas técnicas | ${FORUM_TITLE_SUFFIX}`;
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
          <h1 className="text-2xl font-bold">Preguntas técnicas</h1>
          <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">
            Consultas sobre equipos, drivers, red y errores. Marca la mejor respuesta cuando se resuelva.
          </p>
        </div>
        <Button
          asChild
          className="min-h-11 shrink-0 bg-[hsl(var(--forum-accent))] hover:bg-[hsl(var(--forum-accent)/0.9)]"
        >
          <Link to="/foro/nuevo?tipo=question">
            <Plus className="size-4" aria-hidden="true" />
            Hacer pregunta
          </Link>
        </Button>
      </div>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filtrar preguntas"
      >
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              'min-h-10 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]',
              tab === value
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
            Cargando preguntas…
          </p>
        ) : threads.length === 0 ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]">
            No hay preguntas en esta sección. Sé el primero en publicar una.
          </p>
        ) : (
          threads.map((thread) => <ForumDiscussionRow key={thread.id} thread={thread} showKind />)
        )}
      </div>
    </div>
  );
}
