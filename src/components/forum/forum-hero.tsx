import { Link } from 'react-router-dom';
import { MessageCircle, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatForumCount } from '@/lib/forum-utils';
import type { ForumStats } from '@/types/forum';

interface ForumHeroProps {
  stats?: ForumStats | undefined;
  onMarkAllRead?: () => void;
}

export function ForumHero({ stats, onMarkAllRead }: ForumHeroProps) {
  return (
    <section
      aria-labelledby="forum-hero-title"
      className="relative overflow-hidden border-b border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            'radial-gradient(circle at 70% 40%, hsl(var(--forum-accent) / 0.08), transparent 55%)',
        }}
      />
      <div className="container relative grid gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:py-10">
        <div>
          <h1 id="forum-hero-title" className="text-balance text-2xl font-bold sm:text-3xl">
            ¡Bienvenido al Foro HaiStore!
          </h1>
          <p className="mt-2 max-w-2xl text-pretty text-sm text-[hsl(var(--forum-muted))] sm:text-base">
            Soporte técnico Ricoh: resuelve dudas, aprende con tutoriales y encuentra firmware para tus
            equipos.
          </p>
          <ul className="mt-4 flex flex-wrap gap-4 text-sm" aria-label="Estadísticas del foro">
            <li>
              <span className="font-semibold text-[hsl(var(--forum-accent))]">
                {formatForumCount(stats?.members ?? 0)}
              </span>{' '}
              <span className="text-[hsl(var(--forum-muted))]">Miembros</span>
            </li>
            <li>
              <span className="font-semibold text-[hsl(var(--forum-accent))]">
                {formatForumCount(stats?.topics ?? 0)}
              </span>{' '}
              <span className="text-[hsl(var(--forum-muted))]">Temas</span>
            </li>
            <li>
              <span className="font-semibold text-[hsl(var(--forum-accent))]">
                {formatForumCount(stats?.replies ?? 0)}
              </span>{' '}
              <span className="text-[hsl(var(--forum-muted))]">Respuestas</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-end">
          <span
            className="hidden size-28 items-center justify-center rounded-2xl border border-[hsl(var(--forum-accent)/0.25)] bg-[hsl(var(--forum-accent)/0.08)] text-[hsl(var(--forum-accent))] shadow-sm lg:flex"
            aria-hidden="true"
          >
            <MessageCircle className="size-14" strokeWidth={1.25} />
          </span>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <Button
              asChild
              className="min-h-11 w-full bg-[hsl(var(--forum-accent))] text-white hover:bg-[hsl(var(--forum-accent)/0.9)] sm:w-auto"
            >
              <Link to="/foro/nuevo">
                <Plus className="size-4" aria-hidden="true" />
                Nuevo tema
              </Link>
            </Button>
            <button
              type="button"
              onClick={onMarkAllRead}
              className="min-h-10 text-left text-xs text-[hsl(var(--forum-muted))] underline-offset-4 hover:text-[hsl(var(--forum-fg))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
            >
              Marcar todos como leídos
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
