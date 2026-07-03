import { Link } from 'react-router-dom';

import { ADMIN_ROUTES } from '@/lib/admin-routes';

export function AdminSidebarHeader() {
  return (
    <div className="border-b border-[hsl(var(--admin-sidebar-border))]/50 px-4 py-4">
      <Link
        to={ADMIN_ROUTES.DASHBOARD}
        className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]"
        aria-label="HaiStore, inicio del panel"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--admin-sidebar-active-bg))] text-base font-bold text-white shadow-[0_0_0_3px_hsl(var(--admin-sidebar-active-bg)/0.25)]">
          H
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-bold tracking-tight text-[hsl(var(--admin-sidebar-fg))]">
            HaiStore
          </span>
          <span className="block truncate text-xs text-[hsl(var(--admin-sidebar-fg-muted))]">
            Administración
          </span>
        </span>
      </Link>
    </div>
  );
}
