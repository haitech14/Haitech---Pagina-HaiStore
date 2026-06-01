import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { normalizeUsdToPenRate, setExchangeRates } from '@/lib/exchange-rate';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';

function normalizeCompanySettings(data: CompanySettings): CompanySettings {
  const sale = normalizeUsdToPenRate(data.usdToPenExchangeRate);
  return {
    ...data,
    usdToPenExchangeRate: sale,
    usdToPenPurchaseExchangeRate: normalizeUsdToPenRate(
      data.usdToPenPurchaseExchangeRate ?? sale,
    ),
  };
}

export function useCompanySettings() {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      try {
        const data = await apiFetch<CompanySettings>('/api/settings/company');
        return normalizeCompanySettings(data);
      } catch {
        return DEFAULT_COMPANY_SETTINGS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanySettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompanySettings) =>
      apiFetch<CompanySettings>('/api/settings/company', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      setExchangeRates(data.usdToPenExchangeRate, data.usdToPenPurchaseExchangeRate);
      queryClient.setQueryData(['company-settings'], data);
    },
  });
}
