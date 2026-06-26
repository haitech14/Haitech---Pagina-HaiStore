import { Link } from 'react-router-dom';

import { ForumSectionTitle } from '@/components/forum/forum-section-title';
import { FORUM_HOME_CATEGORIES } from '@/data/forum-home-layout';
import { cn } from '@/lib/utils';

export function ForumCategorySidebar() {
  return (
    <aside
      aria-labelledby="forum-categories-title"
      className="lg:sticky lg:top-[7.5rem] lg:self-start"
    >
      <ForumSectionTitle id="forum-categories-title">Categorías</ForumSectionTitle>
      <nav aria-label="Categorías del foro">
        <ul className="space-y-2" role="list">
          {FORUM_HOME_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <li key={category.id}>
                <Link
                  to={category.href}
                  className={cn(
                    'flex gap-3 rounded-xl border border-[hsl(var(--forum-border))]',
                    'bg-[hsl(var(--forum-card))] p-3 transition-all',
                    'hover:border-[hsl(var(--forum-accent)/0.45)] hover:shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                      category.iconClass,
                    )}
                    aria-hidden="true"
                  >
                    {category.brandInitial ? (
                      category.brandInitial
                    ) : (
                      <Icon className="size-5" strokeWidth={1.75} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-snug text-[hsl(var(--forum-fg))]">
                      {category.title}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-[hsl(var(--forum-muted))]">
                      {category.description}
                    </span>
                    <span className="mt-1.5 block text-[0.65rem] font-semibold text-[hsl(var(--forum-accent))]">
                      {category.topicCount}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
