import { ChevronLeft } from 'lucide-react';

import { AdminSidebarHeader } from '@/components/admin/admin-sidebar-header';
import { AdminSidebarHelpCard } from '@/components/admin/admin-sidebar-help-card';
import { AdminSidebarMockupNav } from '@/components/admin/admin-sidebar-mockup-nav';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav';
import { AdminSidebarProfile } from '@/components/admin/admin-sidebar-profile';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ mobile = false, onNavigate }: AdminSidebarProps) {
  const { user } = useAuth();
  const { toggle: toggleSidebar } = useAdminSidebar();
  const isTechnician = user?.role === 'tecnico';

  return (
    <aside
      className={cn(
        'relative flex h-full w-[15.5rem] flex-col border-r border-[hsl(var(--admin-sidebar-border))]/50 bg-[hsl(var(--admin-sidebar-bg))] text-[hsl(var(--admin-sidebar-fg))]',
        mobile && 'w-full',
      )}
      aria-label="Navegación del panel administrativo"
    >
      <AdminSidebarHeader />
      <AdminSidebarProfile />

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {isTechnician ? (
          <AdminSidebarNav
            isTechnician={isTechnician}
            {...(onNavigate ? { onNavigate } : {})}
          />
        ) : (
          <AdminSidebarMockupNav {...(onNavigate ? { onNavigate } : {})} />
        )}
      </nav>

      <AdminSidebarHelpCard />

      {!mobile ? (
        <div className="flex justify-end px-3 pb-3 pt-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md border border-[hsl(var(--admin-sidebar-border))]/70 bg-[hsl(var(--admin-sidebar-hover))]/60 text-[hsl(var(--admin-sidebar-fg-muted))] transition-colors hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]"
            onClick={toggleSidebar}
            aria-label="Ocultar barra lateral"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </aside>
  );
}
