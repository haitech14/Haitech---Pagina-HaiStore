import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getDefaultAdminDateRange,
  type AdminDateRange,
} from '@/lib/admin-date-range-presets';

interface AdminDateRangeContextValue {
  range: AdminDateRange;
  setRange: (range: AdminDateRange) => void;
}

const AdminDateRangeContext = createContext<AdminDateRangeContextValue | null>(null);

export function AdminDateRangeProvider({ children }: { children: ReactNode }) {
  const [range, setRangeState] = useState<AdminDateRange>(() =>
    getDefaultAdminDateRange('month'),
  );

  const setRange = useCallback((next: AdminDateRange) => {
    setRangeState(next);
  }, []);

  const value = useMemo(() => ({ range, setRange }), [range, setRange]);

  return (
    <AdminDateRangeContext.Provider value={value}>{children}</AdminDateRangeContext.Provider>
  );
}

export function useAdminDateRange(): AdminDateRangeContextValue {
  const ctx = useContext(AdminDateRangeContext);
  if (!ctx) {
    throw new Error('useAdminDateRange debe usarse dentro de AdminDateRangeProvider');
  }
  return ctx;
}
