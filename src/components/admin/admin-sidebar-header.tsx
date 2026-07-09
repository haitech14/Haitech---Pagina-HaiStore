import { Link } from 'react-router-dom';
import { Building2, ChevronLeft } from 'lucide-react';

import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { useAdminWorkspace } from '@/context/admin-workspace-context';
import { ADMIN_ROUTES } from '@/lib/admin-routes';

interface AdminSidebarHeaderProps {
  showCollapse?: boolean;
}

export function AdminSidebarHeader({ showCollapse = false }: AdminSidebarHeaderProps) {
  const { toggle: toggleSidebar } = useAdminSidebar();
  const { brand } = useAdminWorkspace();

  return (
    <div className="border-b border-[hsl(var(--admin-sidebar-border))]/50 px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={ADMIN_ROUTES.DASHBOARD}
          className="flex min-w-0 flex-1 flex-col gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]"
          aria-label="HaiStore, inicio del panel"
        >
          <img
            src={brand.logoUrl}
            alt={brand.logoAlt}
            className="h-11 w-auto max-w-[11rem] shrink-0 object-contain object-left"
            width={176}
            height={46}
            loading="eager"
            decoding="async"
          />
        </Link>

        {showCollapse ? (
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--admin-sidebar-border))]/70 bg-[hsl(var(--admin-sidebar-hover))]/60 text-[hsl(var(--admin-sidebar-fg-muted))] transition-colors hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]"
            onClick={toggleSidebar}
            aria-label="Ocultar barra lateral"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex h-9 w-full items-center gap-2 rounded-lg border border-[hsl(var(--admin-sidebar-border))]/60 bg-[hsl(var(--admin-sidebar-hover))]/40 px-2.5 text-[0.8125rem] font-medium text-[hsl(var(--admin-sidebar-fg))]">
        <Building2
          className="size-4 shrink-0 text-[hsl(var(--admin-sidebar-fg-muted))]"
          aria-hidden="true"
        />
        <span className="min-w-0 truncate">{brand.legalName}</span>
      </div>
    </div>
  );
}
