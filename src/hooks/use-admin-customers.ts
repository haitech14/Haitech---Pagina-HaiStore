import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CustomerEditFormValues } from '@/components/admin/customer-edit-dialog';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { personaFormToApiBody } from '@/lib/persona-customer-payload';
import type { UserRole } from '@/types/product';
import type { AdminStoreCustomersPayload, StoreCustomerWithRole } from '@/types/store';

export interface PersonaImportResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  errors: Array<{ row: number; message: string }>;
}

export function useAdminStoreCustomers() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-store-customers'],
    queryFn: () => apiFetch<AdminStoreCustomersPayload>('/api/customers/admin/all'),
    enabled: isAdmin,
    select: (data) => data,
    refetchInterval: isAdmin ? 8000 : false,
  });
}

export function useAdminStoreCustomersMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-store-customers'] });
  };

  const updateCustomer = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CustomerEditFormValues;
    }) =>
      apiFetch<{ customer: StoreCustomerWithRole }>(`/api/customers/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(personaFormToApiBody(values)),
      }),
    onSuccess: () => invalidate(),
  });

  const createCustomer = useMutation({
    mutationFn: (body: ReturnType<typeof personaFormToApiBody>) =>
      apiFetch<{ customer: StoreCustomerWithRole }>('/api/customers/admin', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => invalidate(),
  });

  const importPersonaExcel = useMutation({
    mutationFn: (fileBase64: string) =>
      apiFetch<PersonaImportResult>('/api/customers/admin/import-persona', {
        method: 'POST',
        body: JSON.stringify({ fileBase64 }),
      }),
    onSuccess: () => invalidate(),
  });

  const patchCustomerField = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { profile_role?: UserRole; productos_interes?: string[] };
    }) =>
      apiFetch<{ customer: StoreCustomerWithRole }>(`/api/customers/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => invalidate(),
  });

  const deleteCustomer = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean; id: string }>(`/api/customers/admin/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => invalidate(),
  });

  return {
    updateCustomer,
    createCustomer,
    importPersonaExcel,
    patchCustomerField,
    deleteCustomer,
  };
}
