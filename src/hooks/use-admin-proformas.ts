import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import type {
  CreateProformaPayload,
  ProformaRecord,
  UpdateProformaPayload,
} from '@/types/proforma';

export function useAdminProformas() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-proformas'],
    queryFn: () => apiFetch<{ proformas: ProformaRecord[] }>('/api/proformas'),
    enabled: isAdmin,
    select: (data) => data.proformas,
  });
}

export function useProformaMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-proformas'] });
  };

  const createProforma = useMutation({
    mutationFn: (payload: CreateProformaPayload) =>
      apiFetch<{ proforma: ProformaRecord }>('/api/proformas', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const updateProforma = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProformaPayload }) =>
      apiFetch<{ proforma: ProformaRecord }>(`/api/proformas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const deleteProforma = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/proformas/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { createProforma, updateProforma, deleteProforma };
}
