import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'admin-utility-panel-open';

interface AdminUtilityPanelContextValue {
  open: boolean;
  toggle: () => void;
}

const AdminUtilityPanelContext = createContext<AdminUtilityPanelContextValue | null>(null);

export function AdminUtilityPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'false') setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ open, toggle }), [open, toggle]);

  return (
    <AdminUtilityPanelContext.Provider value={value}>{children}</AdminUtilityPanelContext.Provider>
  );
}

export function useAdminUtilityPanel(): AdminUtilityPanelContextValue {
  const ctx = useContext(AdminUtilityPanelContext);
  if (!ctx) {
    throw new Error('useAdminUtilityPanel debe usarse dentro de AdminUtilityPanelProvider');
  }
  return ctx;
}
