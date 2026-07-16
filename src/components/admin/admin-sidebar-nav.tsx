import { NavLink, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  CreditCard,
  FileText,
  Image,
  LayoutDashboard,
  Layers,
  ListTree,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  Percent,
  ScrollText,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Tags,
  Ticket,
  Truck,
  Undo2,
  UserCog,
  Users,
  Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useAdminOrdersList } from '@/hooks/use-admin-orders';
import {
  ADMIN_ROUTES,
  ADMIN_SIDEBAR_DASHBOARD,
  ADMIN_SIDEBAR_GROUPS,
  type AdminSidebarNavItem,
} from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  store: Store,
  'shopping-cart': ShoppingCart,
  users: Users,
  'undo-2': Undo2,
  'file-text': FileText,
  package: Package,
  tags: Tags,
  'badge-check': BadgeCheck,
  'list-tree': ListTree,
  layers: Layers,
  ticket: Ticket,
  image: Image,
  warehouse: Warehouse,
  'building-2': Building2,
  'arrow-left-right': ArrowLeftRight,
  truck: Truck,
  megaphone: Megaphone,
  'message-square': MessageSquare,
  mail: Mail,
  'user-cog': UserCog,
  shield: Shield,
  settings: Settings,
  'credit-card': CreditCard,
  percent: Percent,
  'scroll-text': ScrollText,
};

function isNavItemActive(pathname: string, search: string, href: string, key: string): boolean {
  if (href === ADMIN_ROUTES.DASHBOARD) return pathname === ADMIN_ROUTES.DASHBOARD;
  if (key === 'customers') {
    return pathname === ADMIN_ROUTES.CRM_CLIENTES || pathname.startsWith(`${ADMIN_ROUTES.CRM_CLIENTES}/`);
  }
  if (key === 'orders') {
    return (
      pathname.startsWith(ADMIN_ROUTES.VENTAS) &&
      !search.includes('vista=listado') &&
      !search.includes('vista=cotizaciones') &&
      !search.includes('vista=historico') &&
      !search.includes('vista=tpv') &&
      !search.includes('nuevo=1')
    );
  }
  if (key === 'quotes') {
    return pathname.startsWith(ADMIN_ROUTES.VENTAS) && search.includes('vista=cotizaciones');
  }
  if (key === 'settings' || key === 'roles' || key === 'users' || key === 'payments' || key === 'taxes') {
    return pathname.startsWith(ADMIN_ROUTES.SETTINGS);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AdminSidebarNavProps {
  isTechnician?: boolean;
  onNavigate?: () => void;
}

export function AdminSidebarNav({ isTechnician = false, onNavigate }: AdminSidebarNavProps) {
  const location = useLocation();
  const { data: orders = [] } = useAdminOrdersList();
  const pendingOrders = orders.filter(
    (order) => order.payment_status === 'pending' || order.status === 'pending_payment',
  ).length;

  const navLinkClass = (isActive: boolean) =>
    cn(
      'flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
      isActive
        ? 'bg-[hsl(var(--admin-sidebar-active-bg))] text-[hsl(var(--admin-sidebar-active-fg))] shadow-sm'
        : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
    );

  const renderItem = (item: AdminSidebarNavItem) => {
    if (isTechnician && !item.technicianAllowed && item.key !== 'inventory') {
      const allowedKeys = new Set(['inventory', 'warehouses', 'movements', 'transfers', 'settings']);
      if (!allowedKeys.has(item.key)) return null;
    }

    const Icon = ICONS[item.icon] ?? LayoutDashboard;
    const isActive = isNavItemActive(location.pathname, location.search, item.href, item.key);
    const badgeCount = item.badge === 'orders-pending' && pendingOrders > 0 ? pendingOrders : null;

    return (
      <NavLink
        key={item.key}
        to={item.href}
        end={item.href === ADMIN_ROUTES.DASHBOARD}
        className={() => navLinkClass(isActive)}
        aria-current={isActive ? 'page' : undefined}
        onClick={onNavigate}
      >
        <Icon className="size-[1.125rem] shrink-0 opacity-90" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {badgeCount !== null ? (
          <span
            className={cn(
              'ml-auto inline-flex min-w-[1.375rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.6875rem] font-bold tabular-nums',
              isActive ? 'bg-white/20 text-white' : 'bg-[hsl(var(--admin-sidebar-active-bg))] text-white',
            )}
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        ) : (
          <ChevronRight
            className={cn('ml-auto size-3.5 shrink-0 opacity-40', isActive && 'opacity-70')}
            aria-hidden="true"
          />
        )}
      </NavLink>
    );
  };

  const dashboardActive = location.pathname === ADMIN_ROUTES.DASHBOARD;
  const DashboardIcon = ICONS[ADMIN_SIDEBAR_DASHBOARD.icon] ?? LayoutDashboard;

  const visibleGroups = isTechnician
    ? ADMIN_SIDEBAR_GROUPS.filter((group) => group.label === 'INVENTARIO' || group.label === 'CONFIGURACIÓN')
    : ADMIN_SIDEBAR_GROUPS;

  return (
    <div className="space-y-1">
      <NavLink
        to={ADMIN_SIDEBAR_DASHBOARD.href}
        end
        className={() => navLinkClass(dashboardActive)}
        aria-current={dashboardActive ? 'page' : undefined}
        onClick={onNavigate}
      >
        <DashboardIcon className="size-[1.125rem] shrink-0" aria-hidden="true" />
        <span>{ADMIN_SIDEBAR_DASHBOARD.label}</span>
      </NavLink>

      {visibleGroups.map((group) => (
        <div key={group.label} className="pt-3">
          <p className="px-3 pb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--admin-sidebar-fg-muted))]/80">
            {group.label}
          </p>
          <div className="space-y-0.5">{group.items.map(renderItem)}</div>
        </div>
      ))}
    </div>
  );
}
