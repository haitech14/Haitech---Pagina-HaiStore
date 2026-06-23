import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ForumDiscussionsPanel } from '@/components/forum/forum-discussions-panel';
import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { useForumCategories, useForumThreads } from '@/hooks/use-forum';
import type { ForumSortValue } from '@/types/forum';

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
      <h1 className="text-2xl font-bold">{category?.name ?? 'Categoría'}</h1>
      {category?.description ? (
        <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">{category.description}</p>
      ) : null}
      <div className="mt-6">
        <ForumDiscussionsPanel
          threads={data?.threads ?? []}
          categories={categories}
          categoryFilter={slug ?? ''}
          sort={sort}
          onCategoryChange={() => undefined}
          onSortChange={setSort}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
