import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CustomerEditFormValues } from '@/components/admin/customer-edit-dialog';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import type { AdminStoreCustomersPayload, StoreCustomerWithRole } from '@/types/store';

export function useAdminStoreCustomers() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-store-customers'],
    queryFn: () => apiFetch<AdminStoreCustomersPayload>('/api/customers/admin/all'),
    enabled: isAdmin,
    select: (data) => data.customers,
  });
}

export function useAdminStoreCustomersMutations() {
  const queryClient = useQueryClient();

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
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          company_name: values.company_name,
          tax_id: values.tax_id,
          notes: values.notes,
          profile_role: values.profile_role,
        }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<AdminStoreCustomersPayload>(
        ['admin-store-customers'],
        (current) => {
          if (!current) return current;
          return {
            ...current,
            customers: current.customers.map((customer) =>
              customer.id === data.customer.id ? data.customer : customer,
            ),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ['admin-store-customers'] });
    },
  });

  return { updateCustomer };
}
