import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { StoreCustomerSearchResult } from '@/types/store-customer';

export function useTpvCustomerSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['tpv-customer-search', trimmed],
    queryFn: () =>
      apiFetch<{ customers: StoreCustomerSearchResult[] }>(
        `/api/customers/admin/search?q=${encodeURIComponent(trimmed)}`,
      ),
    enabled: trimmed.length >= 2,
    staleTime: 1000 * 30,
    select: (data) => data.customers ?? [],
  });
}
