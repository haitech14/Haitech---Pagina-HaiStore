import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type {
  StoreCategory,
  StoreCategoryReorderItem,
  StoreCategoryTreeNode,
} from '@/types/store-category';

export function useStoreCategoriesTree() {
  return useQuery({
    queryKey: ['store-categories'],
    queryFn: () => apiFetch<StoreCategoryTreeNode[]>('/api/categories'),
    staleTime: 1000 * 30,
  });
}

export function useStoreCategoriesMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['store-categories'] });
  };

  const syncFromInventory = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; tree: StoreCategoryTreeNode[] }>('/api/categories/sync-inventory', {
        method: 'POST',
      }),
    onSuccess: invalidate,
  });

  const createCategory = useMutation({
    mutationFn: (payload: Partial<StoreCategory>) =>
      apiFetch<StoreCategory>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StoreCategory> }) =>
      apiFetch<StoreCategory>(`/api/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const reorderCategories = useMutation({
    mutationFn: (items: StoreCategoryReorderItem[]) =>
      apiFetch<{ ok: boolean; tree: StoreCategoryTreeNode[] }>('/api/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),
    onSuccess: invalidate,
  });

  return {
    syncFromInventory,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
