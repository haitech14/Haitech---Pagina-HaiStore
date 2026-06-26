import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { ForumDiscussionRow } from '@/components/forum/forum-discussion-row';
import { ForumSectionTitle } from '@/components/forum/forum-section-title';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ForumCategory, ForumThread, ForumThreadFilter } from '@/types/forum';

const FILTER_TABS: { value: ForumThreadFilter; label: string }[] = [
  { value: 'recent', label: 'Recientes' },
  { value: 'unanswered', label: 'Sin respuesta' },
  { value: 'popular', label: 'Más vistos' },
];

interface ForumDiscussionsPanelProps {
  threads: ForumThread[];
  categories: ForumCategory[];
  categoryFilter: string;
  filter: ForumThreadFilter;
  onCategoryChange: (value: string) => void;
  onFilterChange: (value: ForumThreadFilter) => void;
  isLoading?: boolean;
}

export function ForumDiscussionsPanel({
  threads,
  categories,
  categoryFilter,
  filter,
  onCategoryChange,
  onFilterChange,
  isLoading,
}: ForumDiscussionsPanelProps) {
  return (
    <section aria-labelledby="forum-discussions-title">
      <ForumSectionTitle
        id="forum-discussions-title"
        action={
          <Select value={categoryFilter || 'all'} onValueChange={onCategoryChange}>
            <SelectTrigger
              className="h-9 min-w-[10rem] border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] text-sm"
              aria-label="Filtrar por categoría"
            >
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        Temas recientes
      </ForumSectionTitle>

      <div
        className="mb-4 flex flex-wrap gap-2 border-b border-[hsl(var(--forum-border))] pb-3"
        role="tablist"
        aria-label="Filtrar temas"
      >
        {FILTER_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => onFilterChange(value)}
            className={cn(
              'min-h-9 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]',
              filter === value
                ? 'bg-[hsl(var(--forum-accent))] text-white'
                : 'text-[hsl(var(--forum-muted))] hover:bg-[hsl(var(--forum-card))] hover:text-[hsl(var(--forum-fg))]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] px-4 sm:px-5">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
            Cargando temas…
          </p>
        ) : threads.length === 0 ? (
          <p className="py-10 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
            No hay temas que coincidan con tu búsqueda.
          </p>
        ) : (
          threads.map((thread) => (
            <ForumDiscussionRow key={thread.id} thread={thread} variant="home" />
          ))
        )}

        <div className="border-t border-[hsl(var(--forum-border))] py-4 text-center">
          <Link
            to="/foro"
            className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[hsl(var(--forum-accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
          >
            Ver más temas
            <ChevronDown className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
