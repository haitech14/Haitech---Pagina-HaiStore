import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { RequireAuth } from '@/components/auth/require-auth';
import { InventoryPanel } from '@/components/admin/inventory-panel';
import { UsersRolesPanel } from '@/components/admin/users-roles-panel';
import { cn } from '@/lib/utils';

type AdminTab = 'inventario' | 'usuarios';

export function AdminInventoryPage() {
  const location = useLocation();
  const initialTab: AdminTab = location.pathname.includes('usuarios') ? 'usuarios' : 'inventario';
  const [tab, setTab] = useState<AdminTab>(initialTab);

  useEffect(() => {
    setTab(location.pathname.includes('usuarios') ? 'usuarios' : 'inventario');
  }, [location.pathname]);

  return (
    <RequireAuth adminOnly>
      <div className="container py-8">
        <nav
          aria-label="Secciones del panel"
          className="mb-8 flex flex-wrap gap-2 border-b pb-4"
        >
          <Link
            to="/panel/inventario"
            onClick={() => setTab('inventario')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'inventario'
                ? 'bg-red-600 text-white'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            Inventario
          </Link>
          <Link
            to="/panel/usuarios"
            onClick={() => setTab('usuarios')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'usuarios'
                ? 'bg-red-600 text-white'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            Roles de usuario
          </Link>
        </nav>

        {tab === 'inventario' ? <InventoryPanel /> : <UsersRolesPanel />}
      </div>
    </RequireAuth>
  );
}
