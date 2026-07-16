import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import type {
  HaiSalesIntegrationStatus,
  HaiSalesResumen,
  HaiSalesSyncDatabaseResult,
  HaiSalesSyncSeedsResult,
} from '@/types/haisales-integration';

export function useHaiSalesStatus() {
  const { isAdmin, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['haisales-integration-status'],
    queryFn: () => apiFetch<HaiSalesIntegrationStatus>('/api/integrations/haisales/status'),
    enabled: !authLoading && isAdmin,
    staleTime: 30_000,
  });
}

export function useHaiSalesResumen(month = 'all') {
  const { isAdmin, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['haisales-resumen', month],
    queryFn: () =>
      apiFetch<HaiSalesResumen>(
        `/api/integrations/haisales/resumen?month=${encodeURIComponent(month)}`,
      ),
    enabled: !authLoading && isAdmin,
    staleTime: 60_000,
  });
}

function invalidateHaiSalesQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['haisales-integration-status'] });
  void queryClient.invalidateQueries({ queryKey: ['haisales-resumen'] });
  void queryClient.invalidateQueries({ queryKey: ['admin-imported-sales'] });
  void queryClient.invalidateQueries({ queryKey: ['admin-store-customers'] });
  void queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
  void queryClient.invalidateQueries({ queryKey: ['admin-proformas'] });
}

export function useHaiSalesSyncSeeds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<HaiSalesSyncSeedsResult>('/api/integrations/haisales/sync-seeds', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => invalidateHaiSalesQueries(queryClient),
  });
}

export function useHaiSalesSyncDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { mirrorRemote?: boolean }) =>
      apiFetch<HaiSalesSyncDatabaseResult>('/api/integrations/haisales/sync-database', {
        method: 'POST',
        body: JSON.stringify({ mirrorRemote: options?.mirrorRemote ?? false }),
      }),
    onSuccess: () => invalidateHaiSalesQueries(queryClient),
  });
}
