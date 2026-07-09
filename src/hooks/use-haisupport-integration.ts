import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import type {
  HaiSupportIntegrationStatus,
  HaiSupportSyncResult,
  IntegrationsSyncAllResult,
} from '@/types/haisupport-integration';

export function useHaiSupportStatus() {
  const { isAdmin, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['haisupport-integration-status'],
    queryFn: () => apiFetch<HaiSupportIntegrationStatus>('/api/integrations/haisupport/status'),
    enabled: !authLoading && isAdmin,
    staleTime: 30_000,
  });
}

function invalidateIntegrationQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['haisupport-integration-status'] });
  void queryClient.invalidateQueries({ queryKey: ['haisales-integration-status'] });
  void queryClient.invalidateQueries({ queryKey: ['admin-store-customers'] });
}

export function useHaiSupportSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<HaiSupportSyncResult>('/api/integrations/haisupport/sync', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => invalidateIntegrationQueries(queryClient),
  });
}

export function useIntegrationsSyncAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { haisales?: boolean; haisupport?: boolean; mirrorRemote?: boolean }) =>
      apiFetch<IntegrationsSyncAllResult>('/api/integrations/sync-all', {
        method: 'POST',
        body: JSON.stringify({
          haisales: options?.haisales !== false,
          haisupport: options?.haisupport !== false,
          mirrorRemote: options?.mirrorRemote ?? false,
        }),
      }),
    onSuccess: () => invalidateIntegrationQueries(queryClient),
  });
}
