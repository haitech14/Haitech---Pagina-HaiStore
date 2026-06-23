import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { ForumDiscussionRow } from '@/components/forum/forum-discussion-row';
import { usePinnedForumThreads } from '@/hooks/use-forum';

export function ForumNovedadesPage() {
  const { data: threads = [], isLoading } = usePinnedForumThreads();

  useEffect(() => {
    document.title = `Novedades | ${FORUM_TITLE_SUFFIX}`;
  }, []);

  return (
    <div className="container px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link to="/foro" className="text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-accent))]">
          ← Foro
        </Link>
      </nav>
      <h1 className="text-2xl font-bold">Novedades</h1>
      <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">
        Temas fijados y anuncios destacados de la comunidad.
      </p>
      <div className="mt-6 rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4 sm:p-5">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
            Cargando…
          </p>
        ) : threads.length === 0 ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]">
            Aún no hay novedades fijadas.
          </p>
        ) : (
          threads.map((thread) => <ForumDiscussionRow key={thread.id} thread={thread} />)
        )}
      </div>
    </div>
  );
}
