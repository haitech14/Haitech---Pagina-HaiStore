import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { useForumEvents } from '@/hooks/use-forum';
import { formatForumEventDate } from '@/lib/forum-utils';

export function ForumEventosPage() {
  const { data: events = [], isLoading } = useForumEvents();

  useEffect(() => {
    document.title = `Eventos | ${FORUM_TITLE_SUFFIX}`;
  }, []);

  return (
    <div className="container px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link to="/foro" className="text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-accent))]">
          ← Foro
        </Link>
      </nav>
      <h1 className="text-2xl font-bold">Eventos</h1>
      <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">
        Webinars, talleres y encuentros de la comunidad.
      </p>
      <ul className="mt-6 space-y-4" role="list">
        {isLoading ? (
          <li className="text-sm text-[hsl(var(--forum-muted))]" role="status">
            Cargando eventos…
          </li>
        ) : events.length === 0 ? (
          <li className="rounded-xl border border-dashed border-[hsl(var(--forum-border))] p-8 text-center text-sm text-[hsl(var(--forum-muted))]">
            No hay eventos programados por ahora.
          </li>
        ) : (
          events.map((event) => {
            const { month, day } = formatForumEventDate(event.startsAt);
            return (
              <li
                key={event.id}
                className="flex gap-4 rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4"
              >
                <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-bg))]">
                  <span className="text-xs uppercase text-[hsl(var(--forum-muted))]">{month}</span>
                  <span className="text-lg font-bold">{day}</span>
                </div>
                <div>
                  <h2 className="font-semibold">{event.title}</h2>
                  <p className="mt-1 text-sm text-[hsl(var(--forum-muted))]">{event.location}</p>
                  <p className="mt-1 text-xs text-[hsl(var(--forum-muted))]">
                    {new Date(event.startsAt).toLocaleString('es-PE')}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
