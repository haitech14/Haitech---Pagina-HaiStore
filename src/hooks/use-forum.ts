import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type {
  ForumCategory,
  ForumEvent,
  ForumFirmwareIndex,
  ForumLatestPost,
  ForumManualItem,
  ForumMember,
  ForumPopularTopic,
  ForumReply,
  ForumSolvedFilter,
  ForumSortValue,
  ForumStats,
  ForumThread,
  ForumThreadKind,
} from '@/types/forum';

const forumKeys = {
  all: ['forum'] as const,
  stats: () => [...forumKeys.all, 'stats'] as const,
  categories: () => [...forumKeys.all, 'categories'] as const,
  threads: (params: Record<string, string | number | undefined>) =>
    [...forumKeys.all, 'threads', params] as const,
  thread: (slug: string) => [...forumKeys.all, 'thread', slug] as const,
  firmware: (params: Record<string, string | number | undefined>) =>
    [...forumKeys.all, 'firmware', params] as const,
  manuals: () => [...forumKeys.all, 'manuals'] as const,
  popular: () => [...forumKeys.all, 'popular'] as const,
  featuredMembers: () => [...forumKeys.all, 'featured-members'] as const,
  members: () => [...forumKeys.all, 'members'] as const,
  events: () => [...forumKeys.all, 'events'] as const,
  latest: () => [...forumKeys.all, 'latest'] as const,
  pinned: () => [...forumKeys.all, 'pinned'] as const,
};

export function useForumStats() {
  return useQuery({
    queryKey: forumKeys.stats(),
    queryFn: () => apiFetch<ForumStats>('/api/forum/stats'),
    staleTime: 60_000,
  });
}

export function useForumCategories() {
  return useQuery({
    queryKey: forumKeys.categories(),
    queryFn: async () => {
      const data = await apiFetch<{ categories: ForumCategory[] }>('/api/forum/categories');
      return data.categories;
    },
    staleTime: 60_000,
  });
}

export function useForumThreads(options: {
  category?: string;
  kind?: ForumThreadKind;
  solved?: ForumSolvedFilter;
  sort?: ForumSortValue;
  q?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (options.category) params.set('category', options.category);
  if (options.kind) params.set('kind', options.kind);
  if (options.solved && options.solved !== 'all') params.set('solved', options.solved);
  if (options.sort) params.set('sort', options.sort);
  if (options.q?.trim()) params.set('q', options.q.trim());
  if (options.limit) params.set('limit', String(options.limit));

  const queryString = params.toString();

  return useQuery({
    queryKey: forumKeys.threads({
      category: options.category,
      kind: options.kind,
      solved: options.solved,
      sort: options.sort,
      q: options.q,
      limit: options.limit,
    }),
    queryFn: () =>
      apiFetch<{ threads: ForumThread[]; total: number }>(
        `/api/forum/threads${queryString ? `?${queryString}` : ''}`,
      ),
    staleTime: 15_000,
  });
}

export function useForumThread(slug: string | undefined) {
  return useQuery({
    queryKey: forumKeys.thread(slug ?? ''),
    queryFn: () =>
      apiFetch<{ thread: ForumThread; replies: ForumReply[] }>(`/api/forum/threads/${slug}`),
    enabled: Boolean(slug),
    staleTime: 10_000,
  });
}

export function useForumFirmwareIndex(options: { q?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (options.q?.trim()) params.set('q', options.q.trim());
  if (options.limit) params.set('limit', String(options.limit));

  const queryString = params.toString();

  return useQuery({
    queryKey: forumKeys.firmware({ q: options.q, limit: options.limit }),
    queryFn: () =>
      apiFetch<ForumFirmwareIndex>(`/api/forum/firmware${queryString ? `?${queryString}` : ''}`),
    staleTime: 30_000,
  });
}

export function useForumManualsIndex(limit = 6) {
  return useQuery({
    queryKey: forumKeys.manuals(),
    queryFn: async () => {
      const data = await apiFetch<{ manuals: ForumManualItem[] }>(
        `/api/forum/manuals?limit=${limit}`,
      );
      return data.manuals;
    },
    staleTime: 60_000,
  });
}

export function usePopularForumTopics() {
  return useQuery({
    queryKey: forumKeys.popular(),
    queryFn: async () => {
      const data = await apiFetch<{ topics: ForumPopularTopic[] }>('/api/forum/popular');
      return data.topics;
    },
    staleTime: 60_000,
  });
}

export function useFeaturedForumMembers() {
  return useQuery({
    queryKey: forumKeys.featuredMembers(),
    queryFn: async () => {
      const data = await apiFetch<{ members: ForumMember[] }>('/api/forum/members/featured');
      return data.members;
    },
    staleTime: 60_000,
  });
}

export function useForumMembers() {
  return useQuery({
    queryKey: forumKeys.members(),
    queryFn: async () => {
      const data = await apiFetch<{ members: ForumMember[] }>('/api/forum/members');
      return data.members;
    },
    staleTime: 60_000,
  });
}

export function useForumEvents() {
  return useQuery({
    queryKey: forumKeys.events(),
    queryFn: async () => {
      const data = await apiFetch<{ events: ForumEvent[] }>('/api/forum/events');
      return data.events;
    },
    staleTime: 60_000,
  });
}

export function useLatestForumPosts() {
  return useQuery({
    queryKey: forumKeys.latest(),
    queryFn: async () => {
      const data = await apiFetch<{ posts: ForumLatestPost[] }>('/api/forum/latest');
      return data.posts;
    },
    staleTime: 30_000,
  });
}

export function usePinnedForumThreads() {
  return useQuery({
    queryKey: forumKeys.pinned(),
    queryFn: async () => {
      const data = await apiFetch<{ threads: ForumThread[] }>('/api/forum/pinned');
      return data.threads;
    },
    staleTime: 60_000,
  });
}

export function useCreateForumThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      categorySlug: string;
      title: string;
      body: string;
      tags?: string[];
      kind?: ForumThreadKind;
    }) =>
      apiFetch<{ thread: ForumThread }>('/api/forum/threads', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
}

export function useCreateForumReply(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch<{ reply: ForumReply }>(`/api/forum/threads/${slug}/replies`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: forumKeys.thread(slug) });
      void queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
}

export function useMarkForumThreadSolved(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) =>
      apiFetch<{ thread: ForumThread }>(`/api/forum/threads/${slug}/solve`, {
        method: 'POST',
        body: JSON.stringify({ replyId }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: forumKeys.thread(slug) });
      void queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
}
