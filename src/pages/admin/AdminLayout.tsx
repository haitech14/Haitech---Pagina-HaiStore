import { Outlet, useLocation } from 'react-router-dom';

import { AdminApiStatusBanner } from '@/components/admin/admin-api-status-banner';
import { AdminLayoutNavAccess } from '@/components/admin/admin-layout-nav-access';
import { AdminServicesSubNav } from '@/components/admin/admin-services-subnav';
import { AdminSettingsSubNav } from '@/components/admin/admin-settings-subnav';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDateRangeProvider } from '@/context/admin-date-range-context';
import { AdminSidebarProvider, useAdminSidebar } from '@/context/admin-sidebar-context';
import { AdminUtilityPanelProvider } from '@/context/admin-utility-panel-context';
import { AdminWorkspaceProvider } from '@/context/admin-workspace-context';
import { RequireAuth } from '@/components/auth/require-auth';
import { useSeo } from '@/hooks/use-seo';
import { cn } from '@/lib/utils';
import {
  ADMIN_ROUTES,
  isAdminServicesPath,
  isAdminServiciosMockupView,
  isAdminSettingsPath,
} from '@/lib/admin-routes';

function AdminLayoutShell() {
  const { pathname, search } = useLocation();
  const { open: sidebarOpen } = useAdminSidebar();
  useSeo({
    title: 'Panel administrativo | Haitech',
    robots: 'noindex,nofollow',
  });
  const showServicesSubNav = isAdminServicesPath(pathname);
  const showSettingsSubNav = isAdminSettingsPath(pathname);
  const isServiciosMockup =
    pathname === ADMIN_ROUTES.SERVICES && isAdminServiciosMockupView(search);
  const hideServicesSubNav = isServiciosMockup;
  const showSubNavStrip =
    (showServicesSubNav && !hideServicesSubNav) || showSettingsSubNav;

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
          <AdminLayoutNavAccess />
          {showSubNavStrip ? (
            <div className="sticky top-0 z-30 border-b border-[hsl(var(--admin-topbar-border))] bg-[hsl(var(--admin-topbar-bg))]">
              {showServicesSubNav && !hideServicesSubNav ? <AdminServicesSubNav /> : null}
              {showSettingsSubNav ? <AdminSettingsSubNav /> : null}
            </div>
          ) : null}
          <AdminApiStatusBanner />
          <main
            id="contenido"
            className="flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-5"
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
          <AdminUtilityPanelProvider>
            <AdminDateRangeProvider>
              <AdminLayoutShell />
            </AdminDateRangeProvider>
          </AdminUtilityPanelProvider>
        </AdminSidebarProvider>
      </AdminWorkspaceProvider>
    </RequireAuth>
  );
}
