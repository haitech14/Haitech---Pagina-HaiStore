import { useEffect, useState } from 'react';

import { useCompanySettings } from '@/hooks/use-company-settings';
import { setExchangeRates } from '@/lib/exchange-rate';

/** Sincroniza tipos de cambio tras idle (no compite con LCP en la home). */
export function ExchangeRateSync() {
  const [enabled, setEnabled] = useState(false);
  const { data } = useCompanySettings({ enabled });

  useEffect(() => {
    const enable = () => setEnabled(true);

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(enable, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }

    const timer = window.setTimeout(enable, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!data) return;
    setExchangeRates(data.usdToPenExchangeRate, data.usdToPenPurchaseExchangeRate);
  }, [data?.usdToPenExchangeRate, data?.usdToPenPurchaseExchangeRate, data]);

  return null;
}
