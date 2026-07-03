import { Outlet, useLocation } from 'react-router-dom';

import { AdminApiStatusBanner } from '@/components/admin/admin-api-status-banner';
import { useSeo } from '@/hooks/use-seo';
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
  ADMIN_ROUTES,
} from '@/lib/admin-routes';

function AdminLayoutShell() {
  const { pathname } = useLocation();
  const { open: sidebarOpen } = useAdminSidebar();
  useSeo({
    title: 'Panel administrativo | Haitech',
    robots: 'noindex,nofollow',
  });
  const showCatalogSubNav = isAdminCatalogPath(pathname);
  const showServicesSubNav = isAdminServicesPath(pathname);
  const showSettingsSubNav = isAdminSettingsPath(pathname);
  const isDashboard = pathname === ADMIN_ROUTES.DASHBOARD;
  const isInventarioMockup = pathname === ADMIN_ROUTES.INVENTORY;
  const hideDesktopTopBar = isDashboard || isInventarioMockup;

  return (
    <div className="flex min-h-dvh bg-[hsl(var(--admin-dashboard-bg))]">
        <div
          className={cn(
            'hidden shrink-0 lg:sticky lg:top-0 lg:block lg:h-dvh',
            !sidebarOpen && 'lg:hidden',
          )}
        >
          <AdminSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className={cn('sticky top-0 z-30 bg-[hsl(var(--admin-topbar-bg))]', hideDesktopTopBar && 'lg:hidden')}>
            <AdminTopBar />
            <AdminApiStatusBanner />
            {showCatalogSubNav && !isInventarioMockup && <AdminCatalogSubNav />}
            {showServicesSubNav && <AdminServicesSubNav />}
            {showSettingsSubNav && <AdminSettingsSubNav />}
          </div>
          <main
            id="contenido"
            className={cn(
              'flex-1 overflow-x-hidden',
              hideDesktopTopBar ? 'p-4 sm:p-6 lg:p-8' : 'p-4 sm:p-6',
            )}
          >
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
