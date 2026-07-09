import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type {
  StoreBrandInput,
  StoreBrandWithCount,
  StoreBrandsCatalogResponse,
} from '@/types/store-brand';

export const STORE_BRANDS_QUERY_KEY = 'store-brands';

export function useStoreBrandsCatalog() {
  return useQuery({
    queryKey: [STORE_BRANDS_QUERY_KEY],
    queryFn: () => apiFetch<StoreBrandsCatalogResponse>('/api/brands'),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

export function useStoreBrandsMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [STORE_BRANDS_QUERY_KEY] });
  };

  const createBrand = useMutation({
    mutationFn: (payload: StoreBrandInput) =>
      apiFetch<StoreBrandWithCount>('/api/brands', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const updateBrand = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StoreBrandInput> }) =>
      apiFetch<StoreBrandWithCount>(`/api/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const deleteBrand = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: boolean }>(`/api/brands/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const syncFromInventory = useMutation({
    mutationFn: () =>
      apiFetch<StoreBrandsCatalogResponse & { ok: boolean }>('/api/brands/sync-inventory', {
        method: 'POST',
      }),
    onSuccess: invalidate,
  });

  return {
    createBrand,
    updateBrand,
    deleteBrand,
    syncFromInventory,
  };
}
