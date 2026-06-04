import { Outlet, useLocation } from 'react-router-dom';

import { AdminApiStatusBanner } from '@/components/admin/admin-api-status-banner';
import { AdminCatalogSubNav } from '@/components/admin/admin-catalog-subnav';
import { AdminServicesSubNav } from '@/components/admin/admin-services-subnav';
import { AdminSettingsSubNav } from '@/components/admin/admin-settings-subnav';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminDateRangeProvider } from '@/context/admin-date-range-context';
import { AdminSidebarProvider, useAdminSidebar } from '@/context/admin-sidebar-context';
import { AdminWorkspaceProvider } from '@/context/admin-workspace-context';
import { RequireAuth } from '@/components/auth/require-auth';
import { cn } from '@/lib/utils';
import {
  isAdminCatalogPath,
  isAdminServicesPath,
  isAdminSettingsPath,
} from '@/lib/admin-routes';

function AdminLayoutShell() {
  const { pathname } = useLocation();
  const { open: sidebarOpen } = useAdminSidebar();
  const showCatalogSubNav = isAdminCatalogPath(pathname);
  const showServicesSubNav = isAdminServicesPath(pathname);
  const showSettingsSubNav = isAdminSettingsPath(pathname);

  return (
    <div className="flex min-h-dvh bg-slate-50">
        <div className={cn('hidden shrink-0 lg:block', !sidebarOpen && 'lg:hidden')}>
          <AdminSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-30 bg-[hsl(var(--admin-topbar-bg))]">
            <AdminTopBar />
            <AdminApiStatusBanner />
            {showCatalogSubNav && <AdminCatalogSubNav />}
            {showServicesSubNav && <AdminServicesSubNav />}
            {showSettingsSubNav && <AdminSettingsSubNav />}
          </div>
          <main id="contenido" className="flex-1 overflow-x-hidden p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
  );
}

export function AdminLayout() {
  return (
    <RequireAuth adminOnly>
      <AdminWorkspaceProvider>
        <AdminSidebarProvider>
          <AdminDateRangeProvider>
            <AdminLayoutShell />
          </AdminDateRangeProvider>
        </AdminSidebarProvider>
      </AdminWorkspaceProvider>
    </RequireAuth>
  );
}
