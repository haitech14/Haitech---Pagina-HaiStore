import * as React from 'react';

import {
  readDisplayCurrency,
  readDualPriceOrder,
  writeDisplayCurrency,
  writeDualPriceOrder,
} from '@/lib/display-currency-storage';
import type { DisplayCurrency, DualPriceOrder } from '@/types/display-currency';

interface DisplayCurrencyContextValue {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  dualPriceOrder: DualPriceOrder;
  toggleDualPriceOrder: () => void;
}

const DisplayCurrencyContext = React.createContext<DisplayCurrencyContextValue | null>(null);

export function DisplayCurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = React.useState<DisplayCurrency>(() =>
    readDisplayCurrency(),
  );
  const [dualPriceOrder, setDualPriceOrderState] = React.useState<DualPriceOrder>(() =>
    readDualPriceOrder(),
  );

  const setDisplayCurrency = React.useCallback((currency: DisplayCurrency) => {
    setDisplayCurrencyState(currency);
    writeDisplayCurrency(currency);
  }, []);

  const toggleDualPriceOrder = React.useCallback(() => {
    setDualPriceOrderState((current) => {
      const next: DualPriceOrder = current === 'pen-usd' ? 'usd-pen' : 'pen-usd';
      writeDualPriceOrder(next);
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ displayCurrency, setDisplayCurrency, dualPriceOrder, toggleDualPriceOrder }),
    [displayCurrency, setDisplayCurrency, dualPriceOrder, toggleDualPriceOrder],
  );

  return (
    <DisplayCurrencyContext.Provider value={value}>{children}</DisplayCurrencyContext.Provider>
  );
}

export function useDisplayCurrency(): DisplayCurrencyContextValue {
  const context = React.useContext(DisplayCurrencyContext);
  if (!context) {
    throw new Error('useDisplayCurrency debe usarse dentro de DisplayCurrencyProvider');
  }
  return context;
}
