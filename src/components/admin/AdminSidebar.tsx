import { AdminSidebarHeader } from '@/components/admin/admin-sidebar-header';
import { AdminSidebarMockupNav } from '@/components/admin/admin-sidebar-mockup-nav';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav';
import { AdminSidebarProfile } from '@/components/admin/admin-sidebar-profile';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ mobile = false, onNavigate }: AdminSidebarProps) {
  const { user } = useAuth();
  const isTechnician = user?.role === 'tecnico';

  return (
    <aside
      className={cn(
        'relative flex h-full w-[15.5rem] flex-col border-r border-[hsl(var(--admin-sidebar-border))]/50 bg-[hsl(var(--admin-sidebar-bg))] text-[hsl(var(--admin-sidebar-fg))]',
        mobile && 'w-full',
      )}
      aria-label="Navegación del panel administrativo"
    >
      <AdminSidebarHeader showCollapse={!mobile} />

      <nav className="scrollbar-minimal flex-1 overflow-y-auto px-3 py-2">
        {isTechnician ? (
          <AdminSidebarNav
            isTechnician={isTechnician}
            {...(onNavigate ? { onNavigate } : {})}
          />
        ) : (
          <AdminSidebarMockupNav {...(onNavigate ? { onNavigate } : {})} />
        )}
      </nav>

      <AdminSidebarProfile />
    </aside>
  );
}
