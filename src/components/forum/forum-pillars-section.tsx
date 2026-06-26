import { Link } from 'react-router-dom';

import { FORUM_PILLARS } from '@/data/forum-pillars';
import { cn } from '@/lib/utils';

export function ForumPillarsSection() {
  return (
    <section
      aria-labelledby="forum-pillars-title"
      className="container px-4 py-8 sm:px-6"
    >
      <div className="mb-5">
        <h2 id="forum-pillars-title" className="text-balance text-lg font-bold sm:text-xl">
          Soporte técnico HaiStore
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--forum-muted))]">
          Preguntas, guías y firmware en un solo lugar.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {FORUM_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <li key={pillar.id}>
              <Link
                to={pillar.href}
                className={cn(
                  'flex h-full flex-col gap-4 rounded-xl border border-[hsl(var(--forum-border))]',
                  'bg-[hsl(var(--forum-card))] p-5 transition-colors',
                  'hover:border-[hsl(var(--forum-accent)/0.45)] hover:bg-[hsl(var(--forum-card-hover))]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]',
                )}
              >
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-lg text-white',
                    pillar.accentClass,
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </span>
                <span className="flex flex-1 flex-col gap-2">
                  <span className="text-base font-semibold">{pillar.title}</span>
                  <span className="text-sm leading-relaxed text-[hsl(var(--forum-muted))]">
                    {pillar.description}
                  </span>
                  <span className="mt-auto text-sm font-medium text-[hsl(var(--forum-accent))]">
                    {pillar.cta} →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
