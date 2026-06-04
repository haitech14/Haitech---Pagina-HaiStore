import { useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { MARKETING_INBOX_FILTERS, MARKETING_ONBOARDING } from '@/data/marketing-inbox-mock';
import { cn } from '@/lib/utils';

const INBOX_VIEW_LABELS: Record<string, string> = {
  assigned: 'Asignadas a mi',
  favorites: 'Favoritas',
  all: 'Todas',
  unassigned: 'Sin asignar',
  mentions: 'Menciones',
};

interface MarketingConversationListProps {
  inboxView: string;
}

export function MarketingConversationList({ inboxView }: MarketingConversationListProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('open');
  const title = INBOX_VIEW_LABELS[inboxView] ?? 'Inbox';

  return (
    <section
      className="flex w-[min(100%,18rem)] shrink-0 flex-col border-r border-border bg-card sm:w-72"
      aria-label={`Conversaciones: ${title}`}
    >
      <header className="space-y-3 border-b border-border px-3 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conversaciones…"
            className="h-9 pl-8 text-sm"
            aria-label="Buscar conversaciones"
          />
        </div>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filtrar conversaciones">
          {MARKETING_INBOX_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={cn(
                'min-h-8 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                filter === item.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <span
          className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
          aria-hidden="true"
        >
          <MessageSquare className="size-7" />
        </span>
        <p className="text-sm font-semibold text-foreground">{MARKETING_ONBOARDING.emptyInboxTitle}</p>
        <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-muted-foreground">
          {MARKETING_ONBOARDING.emptyInboxDescription}
        </p>
      </div>
    </section>
  );
}
