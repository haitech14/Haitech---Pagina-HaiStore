import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ForumCategoryGrid } from '@/components/forum/forum-category-grid';
import { ForumDiscussionsPanel } from '@/components/forum/forum-discussions-panel';
import { ForumHero } from '@/components/forum/forum-hero';
import { ForumSidebar } from '@/components/forum/forum-sidebar';
import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import {
  useFeaturedForumMembers,
  useForumCategories,
  useForumEvents,
  useForumStats,
  useForumThreads,
  useLatestForumPosts,
  usePopularForumTopics,
} from '@/hooks/use-forum';
import type { ForumSortValue } from '@/types/forum';

const READ_STORAGE_KEY = 'haistore-forum-read-at';

export function ForumHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('categoria') ?? '';
  const [sort, setSort] = useState<ForumSortValue>('recent');
  const [categoryFilter, setCategoryFilter] = useState(categoryParam);

  useEffect(() => {
    document.title = `${FORUM_TITLE_SUFFIX} | Comunidad técnica`;
  }, []);

  useEffect(() => {
    setCategoryFilter(categoryParam);
  }, [categoryParam]);

  const { data: stats } = useForumStats();
  const { data: categories = [] } = useForumCategories();
  const { data: threadsData, isLoading } = useForumThreads({
    ...(categoryFilter ? { category: categoryFilter } : {}),
    sort,
    ...(q ? { q } : {}),
    limit: 15,
  });
  const { data: popularTopics = [] } = usePopularForumTopics();
  const { data: featuredMembers = [] } = useFeaturedForumMembers();
  const { data: events = [] } = useForumEvents();
  const { data: latestPosts = [] } = useLatestForumPosts();

  const threads = threadsData?.threads ?? [];

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

  const handleMarkAllRead = useCallback(() => {
    localStorage.setItem(READ_STORAGE_KEY, new Date().toISOString());
  }, []);

  const unreadNotice = useMemo(() => {
    const lastRead = localStorage.getItem(READ_STORAGE_KEY);
    if (!lastRead) return null;
    return `Marcados como leídos · ${new Date(lastRead).toLocaleString('es-PE')}`;
  }, []);

  return (
    <div>
      <ForumHero {...(stats ? { stats } : {})} onMarkAllRead={handleMarkAllRead} />
      {unreadNotice ? (
        <p className="container px-4 pt-2 text-xs text-[hsl(var(--forum-muted))] sm:px-6" role="status">
          {unreadNotice}
        </p>
      ) : null}
      <ForumCategoryGrid categories={categories} />
      <div className="container grid gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)] lg:gap-8">
        <ForumDiscussionsPanel
          threads={threads}
          categories={categories}
          categoryFilter={categoryFilter}
          sort={sort}
          onCategoryChange={handleCategoryChange}
          onSortChange={setSort}
          isLoading={isLoading}
        />
        <ForumSidebar
          popularTopics={popularTopics}
          featuredMembers={featuredMembers}
          events={events}
          latestPosts={latestPosts}
        />
      </div>
    </div>
  );
}
