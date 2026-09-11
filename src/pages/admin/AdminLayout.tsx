import { Outlet, useLocation } from 'react-router-dom';

import { AdminApiStatusBanner } from '@/components/admin/admin-api-status-banner';
import { AdminServicesSubNav } from '@/components/admin/admin-services-subnav';
import { AdminSettingsSubNav } from '@/components/admin/admin-settings-subnav';
import { AppLayout } from '@/components/tiendanova/AppLayout';
import { AdminDateRangeProvider } from '@/context/admin-date-range-context';
import { AdminSidebarProvider } from '@/context/admin-sidebar-context';
import { AdminUtilityPanelProvider } from '@/context/admin-utility-panel-context';
import { AdminWorkspaceProvider } from '@/context/admin-workspace-context';
import { RequireAuth } from '@/components/auth/require-auth';
import { useSeo } from '@/hooks/use-seo';
import {
  ADMIN_ROUTES,
  isAdminServicesPath,
  isAdminServiciosMockupView,
  isAdminSettingsPath,
} from '@/lib/admin-routes';

function AdminChromeOutlet() {
  const { pathname, search } = useLocation();
  const showServicesSubNav = isAdminServicesPath(pathname);
  const showSettingsSubNav = isAdminSettingsPath(pathname);
  const isServiciosMockup =
    pathname === ADMIN_ROUTES.SERVICES && isAdminServiciosMockupView(search);
  const hideServicesSubNav = isServiciosMockup;
  const showSubNavStrip =
    (showServicesSubNav && !hideServicesSubNav) || showSettingsSubNav;

  return (
    <>
      {showSubNavStrip ? (
        <div className="border-b border-slate-100 bg-white">
          {showServicesSubNav && !hideServicesSubNav ? <AdminServicesSubNav /> : null}
          {showSettingsSubNav ? <AdminSettingsSubNav /> : null}
        </div>
      ) : null}
      <AdminApiStatusBanner />
      <Outlet />
    </>
  );
}

function AdminLayoutShell() {
  useSeo({
    title: 'Panel administrativo | Haitech',
    robots: 'noindex,nofollow',
  });

  return (
    <AppLayout>
      <AdminChromeOutlet />
    </AppLayout>
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
