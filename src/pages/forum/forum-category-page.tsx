import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ForumDiscussionRow } from '@/components/forum/forum-discussion-row';
import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { useForumCategories, useForumThreads } from '@/hooks/use-forum';
import type { ForumSortValue } from '@/types/forum';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ForumCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [] } = useForumCategories();
  const category = categories.find((entry) => entry.slug === slug);
  const [sort, setSort] = useState<ForumSortValue>('recent');
  const { data, isLoading } = useForumThreads({
    ...(slug ? { category: slug } : {}),
    sort,
    limit: 20,
  });

  useEffect(() => {
    document.title = category
      ? `${category.name} | ${FORUM_TITLE_SUFFIX}`
      : `Categoría | ${FORUM_TITLE_SUFFIX}`;
  }, [category]);

  return (
    <div className="container px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link to="/foro" className="text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-accent))]">
          ← Foro
        </Link>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{category?.name ?? 'Categoría'}</h1>
          {category?.description ? (
            <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">{category.description}</p>
          ) : null}
        </div>
        <Select value={sort} onValueChange={(value) => setSort(value as ForumSortValue)}>
          <SelectTrigger className="h-10 min-w-[9rem] border-[hsl(var(--forum-border))]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="popular">Más populares</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-6 rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4 sm:p-5">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
            Cargando…
          </p>
        ) : (data?.threads ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]">
            No hay temas en esta categoría.
          </p>
        ) : (
          (data?.threads ?? []).map((thread) => (
            <ForumDiscussionRow key={thread.id} thread={thread} showKind />
          ))
        )}
      </div>
    </div>
  );
}
