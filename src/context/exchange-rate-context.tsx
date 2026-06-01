import { useEffect } from 'react';

import { useCompanySettings } from '@/hooks/use-company-settings';
import { setExchangeRates } from '@/lib/exchange-rate';

/** Sincroniza los tipos de cambio globales con la configuración de la empresa. */
export function ExchangeRateSync() {
  const { data } = useCompanySettings();

  useEffect(() => {
    if (!data) return;
    setExchangeRates(data.usdToPenExchangeRate, data.usdToPenPurchaseExchangeRate);
  }, [data?.usdToPenExchangeRate, data?.usdToPenPurchaseExchangeRate, data]);

  return null;
}
