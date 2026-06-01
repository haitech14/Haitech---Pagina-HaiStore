import { Outlet, useLocation } from 'react-router-dom';

import { AdminApiStatusBanner } from '@/components/admin/admin-api-status-banner';
import { AdminCatalogSubNav } from '@/components/admin/admin-catalog-subnav';
import { AdminSettingsSubNav } from '@/components/admin/admin-settings-subnav';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { RequireAuth } from '@/components/auth/require-auth';
import { isAdminCatalogPath, isAdminSettingsPath } from '@/lib/admin-routes';

export function AdminLayout() {
  const { pathname } = useLocation();
  const showCatalogSubNav = isAdminCatalogPath(pathname);
  const showSettingsSubNav = isAdminSettingsPath(pathname);

  return (
    <RequireAuth adminOnly>
      <div className="flex min-h-dvh bg-slate-50">
        <div className="hidden shrink-0 lg:block">
          <AdminSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-30 bg-background">
            <AdminTopBar />
            <AdminApiStatusBanner />
            {showCatalogSubNav && <AdminCatalogSubNav />}
            {showSettingsSubNav && <AdminSettingsSubNav />}
          </div>
          <main id="contenido" className="flex-1 overflow-x-hidden p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
