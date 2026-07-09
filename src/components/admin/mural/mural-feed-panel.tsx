import { useMemo, useState } from 'react';
import { ArrowDownUp, SlidersHorizontal } from 'lucide-react';

import { MuralPostCard } from '@/components/admin/mural/mural-post-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MURAL_BLOG_POSTS, MURAL_BLOG_TAB_LABELS } from '@/data/mural-blog-mock';
import { computeMuralBlogTabCounts, filterMuralBlogPosts } from '@/lib/mural-blog-utils';
import { cn } from '@/lib/utils';
import type { MuralBlogPost, MuralBlogSort, MuralBlogTab } from '@/types/mural-blog';

const TABS: MuralBlogTab[] = [
  'todas',
  'rrhh',
  'comercial',
  'operaciones',
  'ti',
  'cumpleanos',
  'reconocimientos',
];

const SORT_OPTIONS: Array<{ value: MuralBlogSort; label: string }> = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguos', label: 'Más antiguos' },
  { value: 'mas_vistas', label: 'Más vistas' },
  { value: 'mas_interacciones', label: 'Más interacciones' },
];

interface MuralFeedPanelProps {
  posts?: MuralBlogPost[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  search?: string;
}

export function MuralFeedPanel({
  posts = MURAL_BLOG_POSTS,
  selectedId,
  onSelect,
  search = '',
}: MuralFeedPanelProps) {
  const [activeTab, setActiveTab] = useState<MuralBlogTab>('todas');
  const [sort, setSort] = useState<MuralBlogSort>('recientes');

  const tabCounts = useMemo(() => computeMuralBlogTabCounts(posts), [posts]);

  const filteredPosts = useMemo(
    () =>
      filterMuralBlogPosts(posts, {
        tab: activeTab,
        search,
        sort,
      }),
    [activeTab, posts, search, sort],
  );

  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div
            role="tablist"
            aria-label="Filtrar publicaciones por área"
            className="flex flex-wrap gap-1"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const count = tabCounts[tab];
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    'relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-[hsl(var(--admin-accent))]'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  {MURAL_BLOG_TAB_LABELS[tab]}
                  {tab !== 'todas' && count > 0 ? (
                    <span className="text-xs text-muted-foreground">({count})</span>
                  ) : null}
                  {isActive ? (
                    <span className="absolute inset-x-2 -bottom-3 h-0.5 rounded-full bg-[hsl(var(--admin-accent))]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" className="h-8 gap-1.5 bg-background text-xs">
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              Más filtros
            </Button>

            <Select value={sort} onValueChange={(value) => setSort(value as MuralBlogSort)}>
              <SelectTrigger className="h-8 w-[9.5rem] gap-1.5 bg-background text-xs" aria-label="Ordenar publicaciones">
                <ArrowDownUp className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          {filteredPosts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay publicaciones en esta categoría.
            </p>
          ) : (
            filteredPosts.map((post) => (
              <MuralPostCard
                key={post.id}
                post={post}
                isSelected={selectedId === post.id}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
