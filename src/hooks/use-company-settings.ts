import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { normalizeBulkDiscountTiers } from '@/lib/bulk-discount-tiers';
import { normalizeUsdToPenRate, setExchangeRates } from '@/lib/exchange-rate';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';

export type SbsExchangeRates = {
  compra: number;
  venta: number;
  fecha: string | null;
  origen: string;
};

function normalizeCompanySettings(data: CompanySettings): CompanySettings {
  const sale = normalizeUsdToPenRate(data.usdToPenExchangeRate);
  return {
    ...DEFAULT_COMPANY_SETTINGS,
    ...data,
    usdToPenExchangeRate: sale,
    usdToPenPurchaseExchangeRate: normalizeUsdToPenRate(
      data.usdToPenPurchaseExchangeRate ?? sale,
    ),
    bankAccountsText: String(data.bankAccountsText ?? DEFAULT_COMPANY_SETTINGS.bankAccountsText),
    quoteTermsText: String(data.quoteTermsText ?? DEFAULT_COMPANY_SETTINGS.quoteTermsText),
    quoteFooterText: String(data.quoteFooterText ?? DEFAULT_COMPANY_SETTINGS.quoteFooterText),
    bulkDiscountTiers: normalizeBulkDiscountTiers(data.bulkDiscountTiers),
  };
}

export function useCompanySettings(options?: { enabled?: boolean }) {
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
    enabled: options?.enabled !== false,
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

export function useSyncSbsExchangeRateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<{ settings: CompanySettings; sbs: SbsExchangeRates }>(
        '/api/settings/company/exchange-rate/sync-sbs',
        { method: 'POST' },
      ),
    onSuccess: ({ settings }) => {
      const normalized = normalizeCompanySettings(settings);
      setExchangeRates(normalized.usdToPenExchangeRate, normalized.usdToPenPurchaseExchangeRate);
      queryClient.setQueryData(['company-settings'], normalized);
    },
  });
}
