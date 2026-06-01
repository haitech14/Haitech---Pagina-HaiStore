import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
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

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { ADMIN_NAV_MAIN, ADMIN_ROUTES, TECHNICIAN_NAV_KEYS } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'shopping-bag': ShoppingBag,
  package: Package,
  warehouse: Warehouse,
  users: Users,
  megaphone: Megaphone,
  'bar-chart': BarChart3,
  settings: Settings,
  'credit-card': CreditCard,
  wrench: Wrench,
  truck: Truck,
  tags: Tags,
  palette: Palette,
};

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

interface AdminSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ mobile = false, onNavigate }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (mobile) return;
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === 'true') setCollapsed(true);
  }, [mobile]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

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
      !mobile && collapsed && 'justify-center px-2',
    );

  const sidebarActionClass = cn(
    'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
    'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-soft))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
  );

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-[hsl(var(--admin-sidebar-border))]/50 bg-gradient-to-b from-[hsl(var(--admin-sidebar-bg-top))] to-[hsl(var(--admin-sidebar-bg))] text-[hsl(var(--admin-sidebar-fg))]',
        !mobile && collapsed ? 'w-[4.5rem]' : 'w-64',
      )}
      aria-label="Navegación del panel administrativo"
    >
      <div
        className={cn(
          'flex items-center gap-2 border-b border-[hsl(var(--admin-sidebar-border))]/40 p-4',
          collapsed && !mobile && 'justify-center',
        )}
      >
        <Link
          to={ADMIN_ROUTES.DASHBOARD}
          onClick={onNavigate}
          className="inline-flex items-center rounded-md bg-[hsl(var(--admin-sidebar-fg))]/95 px-2 py-1 shadow-sm"
        >
          <img
            src="/logo.png"
            alt="Haitech"
            className={cn('h-8 w-auto', collapsed && !mobile && 'h-7')}
          />
        </Link>
        {!mobile && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'ml-auto size-8 text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
              collapsed && 'ml-0',
            )}
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === ADMIN_ROUTES.DASHBOARD}
              className={navLinkClass}
              aria-current={location.pathname === item.href ? 'page' : undefined}
              onClick={onNavigate}
            >
              <Icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[hsl(var(--admin-sidebar-border))]/40 p-3">
        <Link
          to="/"
          className={cn(sidebarActionClass, collapsed && !mobile && 'justify-center px-2')}
        >
          <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
          {(!collapsed || mobile) && <span>Ver sitio</span>}
        </Link>
        <button
          type="button"
          className={cn(
            sidebarActionClass,
            'w-full hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
            collapsed && !mobile && 'justify-center px-2',
          )}
          onClick={() => void logout()}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          {(!collapsed || mobile) && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
