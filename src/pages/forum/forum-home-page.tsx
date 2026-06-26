import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ForumCategorySidebar } from '@/components/forum/forum-category-sidebar';
import { ForumDiscussionsPanel } from '@/components/forum/forum-discussions-panel';
import { ForumSidebar } from '@/components/forum/forum-sidebar';
import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import {
  useFeaturedForumMembers,
  useForumCategories,
  useForumManualsIndex,
  useForumThreads,
} from '@/hooks/use-forum';
import type { ForumThread, ForumThreadFilter } from '@/types/forum';

export function ForumHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('categoria') ?? '';
  const [filter, setFilter] = useState<ForumThreadFilter>('recent');
  const [categoryFilter, setCategoryFilter] = useState(categoryParam);

  useEffect(() => {
    document.title = `${FORUM_TITLE_SUFFIX} | Comunidad técnica`;
  }, []);

  useEffect(() => {
    setCategoryFilter(categoryParam);
  }, [categoryParam]);

  const sort = filter === 'popular' ? 'popular' : 'recent';

  const { data: categories = [] } = useForumCategories();
  const { data: threadsData, isLoading } = useForumThreads({
    ...(categoryFilter ? { category: categoryFilter } : {}),
    sort,
    ...(q ? { q } : {}),
    limit: 12,
  });
  const { data: featuredMembers = [] } = useFeaturedForumMembers();
  const { data: manuals = [], isLoading: isManualsLoading } = useForumManualsIndex(5);

  const threads = useMemo(() => {
    const list = threadsData?.threads ?? [];
    if (filter !== 'unanswered') return list;
    return list.filter((thread: ForumThread) => thread.replyCount === 0);
  }, [threadsData?.threads, filter]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      const next = value === 'all' ? '' : value;
      setCategoryFilter(next);
      const params = new URLSearchParams(searchParams);
      if (next) params.set('categoria', next);
      else params.delete('categoria');
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return (
    <div className="container px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(14rem,17rem)_minmax(0,1fr)_minmax(16rem,20rem)] lg:gap-6 xl:gap-8">
        <ForumCategorySidebar />

        <div className="min-w-0">
          <ForumDiscussionsPanel
            threads={threads}
            categories={categories}
            categoryFilter={categoryFilter}
            filter={filter}
            onCategoryChange={handleCategoryChange}
            onFilterChange={setFilter}
            isLoading={isLoading}
          />
        </div>

        <ForumSidebar
          featuredMembers={featuredMembers}
          manuals={manuals}
          isManualsLoading={isManualsLoading}
        />
      </div>
    </div>
  );
}
