import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  CalendarRange,
  ContactRound,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Palette,
  Settings,
  ShoppingBag,
  Tags,
  Truck,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { AdminSidebarHeader } from '@/components/admin/admin-sidebar-header';
import { AdminSidebarVentasGroup } from '@/components/admin/admin-sidebar-ventas-group';
import { useAuth } from '@/context/auth-context';
import { ADMIN_NAV_MAIN, ADMIN_ROUTES, TECHNICIAN_NAV_KEYS } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'contact-round': ContactRound,
  'shopping-bag': ShoppingBag,
  package: Package,
  warehouse: Warehouse,
  users: Users,
  megaphone: Megaphone,
  'bar-chart': BarChart3,
  settings: Settings,
  'credit-card': CreditCard,
  wrench: Wrench,
  'calendar-range': CalendarRange,
  truck: Truck,
  tags: Tags,
  palette: Palette,
};

interface AdminSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ mobile = false, onNavigate }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isTechnician = user?.role === 'tecnico';
  const navItems = isTechnician
    ? ADMIN_NAV_MAIN.filter((item) =>
        TECHNICIAN_NAV_KEYS.includes(item.key as (typeof TECHNICIAN_NAV_KEYS)[number]),
      )
    : ADMIN_NAV_MAIN;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-soft))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
      isActive
        ? 'bg-[hsl(var(--admin-sidebar-active-bg))] text-[hsl(var(--admin-sidebar-active-fg))] shadow-md shadow-black/40'
        : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
    );

  const sidebarActionClass = cn(
    'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
    'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-soft))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
  );

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-[hsl(var(--admin-sidebar-border))]/50 bg-gradient-to-b from-[hsl(var(--admin-sidebar-bg-top))] to-[hsl(var(--admin-sidebar-bg))] text-[hsl(var(--admin-sidebar-fg))]',
        mobile && 'w-full',
      )}
      aria-label="Navegación del panel administrativo"
    >
      <AdminSidebarHeader />

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          if (item.key === 'VENTAS') {
            return (
              <AdminSidebarVentasGroup
                key={item.key}
                navLinkClass={navLinkClass}
                onNavigate={onNavigate}
              />
            );
          }

          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const isActive =
            location.pathname === item.href ||
            (item.key === 'SETTINGS' && location.pathname.startsWith(ADMIN_ROUTES.SETTINGS));
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === ADMIN_ROUTES.DASHBOARD}
              className={() => navLinkClass({ isActive })}
              aria-current={isActive ? 'page' : undefined}
              onClick={onNavigate}
            >
              <Icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[hsl(var(--admin-sidebar-border))]/40 p-3">
        <Link to="/" className={sidebarActionClass} onClick={onNavigate}>
          <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
          <span>Ver sitio</span>
        </Link>
        <button
          type="button"
          className={cn(
            sidebarActionClass,
            'w-full hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
          )}
          onClick={() => void logout()}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
