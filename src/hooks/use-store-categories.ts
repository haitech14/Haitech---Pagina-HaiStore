import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetchWithRetry } from '@/lib/api';
import {
  fetchStoreCategoriesTreeLive,
  fetchStoreCategoriesTreeWithFallback,
  patchCategoryTreeAfterDelete,
  readRemovedStaticSlugs,
  STORE_CATEGORIES_QUERY_KEY,
  storeCategoriesTree,
  storeRemovedStaticSlugs,
  subscribeStoreCategoriesLiveTree,
} from '@/lib/store-categories-fetch';
import {
  buildStaticStoreCategoryTree,
  enrichStoreCategoryTree,
  pruneRemovedCategorySlugs,
  removeCategoryFromTree,
} from '@/lib/static-store-category-tree';
import type {
  StoreCategory,
  StoreCategoryReorderItem,
  StoreCategoryTreeNode,
} from '@/types/store-category';

/** Referencia estable para evitar bucles de render cuando la query aún no tiene datos. */
export const EMPTY_STORE_CATEGORY_TREE: StoreCategoryTreeNode[] = [];

function applyLiveTree(
  queryClient: ReturnType<typeof useQueryClient>,
  tree: StoreCategoryTreeNode[],
  options: { finalized?: boolean } = {},
) {
  const removed = readRemovedStaticSlugs();
  const finalized = options.finalized
    ? tree
    : pruneRemovedCategorySlugs(enrichStoreCategoryTree(tree, removed), removed);
  storeCategoriesTree(finalized);
  queryClient.setQueryData([STORE_CATEGORIES_QUERY_KEY], finalized);
}

function patchQueryTreeAfterDelete(
  queryClient: ReturnType<typeof useQueryClient>,
  input: { id: string; slug?: string },
) {
  const patchedCache = patchCategoryTreeAfterDelete(input);
  const removedList = readRemovedStaticSlugs();

  queryClient.setQueryData<StoreCategoryTreeNode[]>(
    [STORE_CATEGORIES_QUERY_KEY],
    (current) => {
      const source = current?.length ? current : patchedCache;
      if (!source?.length) return source;
      const next = pruneRemovedCategorySlugs(
        removeCategoryFromTree(source, input.id, input.slug),
        removedList,
      );
      storeCategoriesTree(next);
      return next;
    },
  );
}

export function useStoreCategoriesTree() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeStoreCategoriesLiveTree((tree) => {
      applyLiveTree(queryClient, tree, { finalized: true });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: [STORE_CATEGORIES_QUERY_KEY],
    queryFn: fetchStoreCategoriesTreeWithFallback,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
    placeholderData: (previous) =>
      previous ?? buildStaticStoreCategoryTree(readRemovedStaticSlugs()),
  });
}

export function useStoreCategoriesMutations() {
  const queryClient = useQueryClient();

  const refreshTree = async () => {
    try {
      const tree = await fetchStoreCategoriesTreeLive();
      applyLiveTree(queryClient, tree, { finalized: true });
    } catch {
      await queryClient.invalidateQueries({ queryKey: [STORE_CATEGORIES_QUERY_KEY] });
    }
  };

  const syncFromInventory = useMutation({
    mutationFn: () =>
      apiFetchWithRetry<{ ok: boolean; tree: StoreCategoryTreeNode[] }>(
        '/api/categories/sync-inventory',
        { method: 'POST' },
      ),
    onSuccess: async (result) => {
      if (result.tree?.length) {
        applyLiveTree(queryClient, result.tree);
      } else {
        await refreshTree();
      }
    },
  });

  const syncFromCatalog = useMutation({
    mutationFn: () =>
      apiFetchWithRetry<{
        ok: boolean;
        tree: StoreCategoryTreeNode[];
        removedStaticSlugs?: string[];
      }>('/api/categories/sync-catalog', { method: 'POST' }),
    onSuccess: async (result) => {
      if (Array.isArray(result.removedStaticSlugs)) {
        storeRemovedStaticSlugs(result.removedStaticSlugs);
      }
      if (result.tree?.length) {
        applyLiveTree(queryClient, result.tree, { finalized: true });
      } else {
        await refreshTree();
      }
    },
  });

  const createCategory = useMutation({
    mutationFn: (payload: Partial<StoreCategory>) =>
      apiFetchWithRetry<StoreCategory>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => refreshTree(),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StoreCategory> }) =>
      apiFetchWithRetry<StoreCategory>(`/api/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => refreshTree(),
  });

  const deleteCategory = useMutation({
    mutationFn: (input: { id: string; slug?: string }) =>
      apiFetchWithRetry<{ ok: boolean; removedStatic?: boolean }>(`/api/categories/${input.id}`, {
        method: 'DELETE',
      }),
    onSuccess: async (_result, input) => {
      patchQueryTreeAfterDelete(queryClient, input);
      await refreshTree();
    },
  });

  const reorderCategories = useMutation({
    mutationFn: (items: StoreCategoryReorderItem[]) =>
      apiFetchWithRetry<{ ok: boolean; tree: StoreCategoryTreeNode[] }>('/api/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),
    onSuccess: async (result) => {
      if (result.tree?.length) {
        applyLiveTree(queryClient, result.tree);
      } else {
        await refreshTree();
      }
    },
  });

  return {
    syncFromInventory,
    syncFromCatalog,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
