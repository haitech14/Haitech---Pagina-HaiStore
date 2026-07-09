import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  ADMIN_WORKSPACE_BRANDS,
  type AdminWorkspaceBrand,
  type AdminWorkspaceBrandId,
} from '@/lib/admin-workspace-brands';

const STORAGE_KEY = 'admin-workspace-brand';

interface AdminWorkspaceContextValue {
  brandId: AdminWorkspaceBrandId;
  brand: AdminWorkspaceBrand;
  setBrandId: (id: AdminWorkspaceBrandId) => void;
}

const AdminWorkspaceContext = createContext<AdminWorkspaceContextValue | null>(null);

export function AdminWorkspaceProvider({ children }: { children: ReactNode }) {
  const [brandId, setBrandIdState] = useState<AdminWorkspaceBrandId>('haitech');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Solo Haitech en el panel; Printcore queda fuera del sidebar.
    if (stored === 'haitech') {
      setBrandIdState('haitech');
    } else if (stored) {
      localStorage.setItem(STORAGE_KEY, 'haitech');
    }
  }, []);

  const setBrandId = useCallback((id: AdminWorkspaceBrandId) => {
    setBrandIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const brand = ADMIN_WORKSPACE_BRANDS[brandId];

  const value = useMemo(
    () => ({
      brandId,
      brand,
      setBrandId,
    }),
    [brand, brandId, setBrandId],
  );

  return (
    <AdminWorkspaceContext.Provider value={value}>{children}</AdminWorkspaceContext.Provider>
  );
}

export function useAdminWorkspace(): AdminWorkspaceContextValue {
  const ctx = useContext(AdminWorkspaceContext);
  if (!ctx) {
    throw new Error('useAdminWorkspace debe usarse dentro de AdminWorkspaceProvider');
  }
  return ctx;
}
