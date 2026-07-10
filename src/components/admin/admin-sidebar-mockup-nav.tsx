import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  Inbox,
  Image,
  LayoutDashboard,
  Layers,
  Newspaper,
  PackagePlus,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Tag,
  Tags,
  Truck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { useAdminOrdersList } from '@/hooks/use-admin-orders';
import {
  ADMIN_ROUTES,
  ADMIN_SIDEBAR_DASHBOARD_GROUP,
  ADMIN_SIDEBAR_MURAL,
  ADMIN_SIDEBAR_PRODUCTOS_GROUP,
  ADMIN_SIDEBAR_SECTIONS,
  type AdminSidebarMockupNavItem,
} from '@/lib/admin-routes';
import { ADMIN_RESUMEN_RECORDS } from '@/data/admin-resumen-data';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'shopping-bag': ShoppingBag,
  tags: Tags,
  'badge-check': BadgeCheck,
  'sliders-horizontal': SlidersHorizontal,
  layers: Layers,
  tag: Tag,
  'calendar-days': CalendarDays,
  inbox: Inbox,
  image: Image,
  newspaper: Newspaper,
  users: Users,
  'file-text': FileText,
  star: Star,
  'package-plus': PackagePlus,
  'building-2': Building2,
  truck: Truck,
  user: User,
  settings: Settings,
};

function inventoryVista(search: string): string | null {
  const match = search.match(/[?&]vista=([^&]+)/);
  return match?.[1] ?? null;
}

function isItemActive(
  pathname: string,
  search: string,
  href: string,
  key: string,
): boolean {
  if (key === 'dashboard') return pathname === ADMIN_ROUTES.DASHBOARD;
  if (key === 'resumen') {
    if (pathname === ADMIN_ROUTES.REPORTS) return true;
    if (pathname !== ADMIN_ROUTES.RESUMEN) return false;
    if (!search.includes('vista=')) return true;
    return /[?&]vista=(cotizaciones|visitantes|estadisticas)\b/.test(search);
  }
  if (key === 'reports') {
    return (
      pathname === ADMIN_ROUTES.REPORTS ||
      (pathname === ADMIN_ROUTES.RESUMEN && search.includes('vista=reportes'))
    );
  }
  if (key === 'catalog-products') {
    return pathname === ADMIN_ROUTES.INVENTORY && inventoryVista(search) === null;
  }
  if (key === 'products') {
    return pathname === ADMIN_ROUTES.INVENTORY && inventoryVista(search) === null;
  }
  if (key === 'attributes') {
    return pathname === ADMIN_ROUTES.ATTRIBUTES;
  }
  if (key === 'variants') {
    return pathname === ADMIN_ROUTES.VARIANTS;
  }
  if (key === 'labels') {
    return pathname === ADMIN_ROUTES.CATEGORIES && search.includes('vista=etiquetas');
  }
  if (key === 'mural') {
    return pathname.startsWith(ADMIN_ROUTES.MURAL);
  }
  if (key === 'bandeja') {
    return pathname.startsWith(ADMIN_ROUTES.BANDEJA);
  }
  if (key === 'inventory') {
    return pathname === ADMIN_ROUTES.INVENTORY && inventoryVista(search) === 'stock';
  }
  if (key === 'suppliers') {
    return pathname === ADMIN_ROUTES.INVENTORY && inventoryVista(search) === 'proveedores';
  }
  if (key === 'brands') {
    return pathname === ADMIN_ROUTES.CATEGORIES && search.includes('vista=marcas');
  }
  if (key === 'categories') {
    return (
      pathname === ADMIN_ROUTES.CATEGORIES &&
      !search.includes('vista=marcas') &&
      !search.includes('vista=etiquetas')
    );
  }
  if (key === 'customers') {
    return (
      pathname === ADMIN_ROUTES.CRM_CLIENTES ||
      pathname.startsWith(`${ADMIN_ROUTES.CRM_CLIENTES}/`)
    );
  }
  if (key === 'orders') {
    return pathname.startsWith(ADMIN_ROUTES.PEDIDOS);
  }
  if (key === 'quotes') {
    return pathname.startsWith(ADMIN_ROUTES.VENTAS) && search.includes('vista=cotizaciones');
  }
  if (key === 'discounts') {
    return pathname.startsWith(ADMIN_ROUTES.MARKETING_COUPONS);
  }
  if (key === 'users') return pathname.startsWith(ADMIN_ROUTES.SETTINGS_USUARIOS);
  if (key === 'settings') {
    return (
      pathname.startsWith(ADMIN_ROUTES.SETTINGS) &&
      !pathname.startsWith(ADMIN_ROUTES.SETTINGS_USUARIOS)
    );
  }

  const [hrefPath, hrefSearch = ''] = href.split('?');
  if (hrefSearch) {
    return pathname === hrefPath && search.includes(hrefSearch);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function resolveBadgeCount(
  item: AdminSidebarMockupNavItem,
  pendingOrders: number,
): number | null {
  if (item.badge === 'orders-pending' && pendingOrders > 0) {
    return pendingOrders;
  }

  if (item.badge === 'support-open') {
    const openTickets = ADMIN_RESUMEN_RECORDS.filter(
      (record) => record.module === 'soporte' && record.status !== 'resuelto',
    ).length;
    return openTickets > 0 ? openTickets : null;
  }

  return null;
}

interface AdminSidebarMockupNavProps {
  onNavigate?: () => void;
}

function NavItemLink({
  item,
  isActive,
  badgeCount,
  onNavigate,
}: {
  item: AdminSidebarMockupNavItem;
  isActive: boolean;
  badgeCount: number | null;
  onNavigate?: () => void;
}) {
  const Icon = ICONS[item.icon] ?? LayoutDashboard;

  return (
    <NavLink
      to={item.href}
      className={cn(
        'flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
        isActive
          ? 'bg-[hsl(var(--admin-sidebar-active-bg))] text-[hsl(var(--admin-sidebar-active-fg))] shadow-sm'
          : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
      )}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
    >
      <Icon
        className={cn('size-[1.125rem] shrink-0', isActive ? 'opacity-100' : 'opacity-85')}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badgeCount !== null ? (
        <span
          className={cn(
            'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold tabular-nums',
            isActive ? 'bg-white/20 text-white' : 'bg-[hsl(var(--admin-sidebar-active-bg))] text-white',
          )}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      ) : null}
    </NavLink>
  );
}

function DashboardCollapsibleGroup({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const group = ADMIN_SIDEBAR_DASHBOARD_GROUP;
  const Icon = ICONS[group.icon] ?? LayoutDashboard;

  const [open, setOpen] = useState(false);

  const parentActive = location.pathname === ADMIN_ROUTES.DASHBOARD;

  return (
    <div className="pb-1">
      <div
        className={cn(
          'flex items-center rounded-lg',
          parentActive && 'bg-[hsl(var(--admin-sidebar-active-bg))] shadow-sm',
        )}
      >
        <NavLink
          to={group.href ?? ADMIN_ROUTES.DASHBOARD}
          end
          className={cn(
            'flex min-h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
            parentActive
              ? 'text-[hsl(var(--admin-sidebar-active-fg))]'
              : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:text-[hsl(var(--admin-sidebar-fg))]',
          )}
          aria-current={parentActive ? 'page' : undefined}
          onClick={onNavigate}
        >
          <Icon className="size-[1.125rem] shrink-0 opacity-90" aria-hidden="true" />
          <span className="truncate">{group.label}</span>
        </NavLink>
        <button
          type="button"
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
          )}
          aria-expanded={open}
          aria-controls="admin-nav-dashboard-submenu"
          aria-label={open ? 'Contraer Dashboard' : 'Expandir Dashboard'}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown
            className={cn('size-4 transition-transform duration-200', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </div>

      {open ? (
        <div
          id="admin-nav-dashboard-submenu"
          className="relative ml-5 mt-0.5 border-l border-[hsl(var(--admin-sidebar-border))]/80 pl-3"
          role="group"
          aria-label="Secciones de Dashboard"
        >
          {group.items.map((item) => {
            const isActive = isItemActive(
              location.pathname,
              location.search,
              item.href,
              item.key,
            );

            return (
              <NavLink
                key={item.key}
                to={item.href}
                className={cn(
                  'flex min-h-8 items-center rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
                  isActive
                    ? 'bg-[hsl(var(--admin-sidebar-active-bg))] text-[hsl(var(--admin-sidebar-active-fg))]'
                    : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
                )}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ProductosCollapsibleGroup({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const group = ADMIN_SIDEBAR_PRODUCTOS_GROUP;
  const Icon = ICONS[group.icon] ?? ShoppingBag;

  const [open, setOpen] = useState(false);

  const parentActive =
    location.pathname === ADMIN_ROUTES.INVENTORY && inventoryVista(location.search) === null;

  return (
    <div className="pb-1">
      <div
        className={cn(
          'flex items-center rounded-lg',
          parentActive && 'bg-[hsl(var(--admin-sidebar-active-bg))] shadow-sm',
        )}
      >
        <NavLink
          to={group.href ?? ADMIN_ROUTES.INVENTORY}
          end
          className={cn(
            'flex min-h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
            parentActive
              ? 'text-[hsl(var(--admin-sidebar-active-fg))]'
              : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:text-[hsl(var(--admin-sidebar-fg))]',
          )}
          aria-current={parentActive ? 'page' : undefined}
          onClick={onNavigate}
        >
          <Icon className="size-[1.125rem] shrink-0 opacity-90" aria-hidden="true" />
          <span className="truncate">{group.label}</span>
        </NavLink>
        <button
          type="button"
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
          )}
          aria-expanded={open}
          aria-controls="admin-nav-productos-submenu"
          aria-label={open ? 'Contraer Productos' : 'Expandir Productos'}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown
            className={cn('size-4 transition-transform duration-200', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </div>

      {open ? (
        <div
          id="admin-nav-productos-submenu"
          className="relative ml-5 mt-0.5 border-l border-[hsl(var(--admin-sidebar-border))]/80 pl-3"
          role="group"
          aria-label="Secciones de Productos"
        >
          {group.items.map((item) => {
            const isActive = isItemActive(
              location.pathname,
              location.search,
              item.href,
              item.key,
            );

            return (
              <NavLink
                key={item.key}
                to={item.href}
                className={cn(
                  'flex min-h-8 items-center rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
                  isActive
                    ? 'bg-[hsl(var(--admin-sidebar-active-bg))] text-[hsl(var(--admin-sidebar-active-fg))]'
                    : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
                )}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AdminSidebarMockupNav({ onNavigate }: AdminSidebarMockupNavProps) {
  const location = useLocation();
  const { data: orders = [] } = useAdminOrdersList();
  const pendingOrders = orders.filter(
    (order) => order.payment_status === 'pending' || order.status === 'pending_payment',
  ).length;

  return (
    <div className="space-y-0.5">
      <DashboardCollapsibleGroup {...(onNavigate ? { onNavigate } : {})} />

      <NavItemLink
        item={ADMIN_SIDEBAR_MURAL}
        isActive={isItemActive(
          location.pathname,
          location.search,
          ADMIN_SIDEBAR_MURAL.href,
          ADMIN_SIDEBAR_MURAL.key,
        )}
        badgeCount={null}
        {...(onNavigate ? { onNavigate } : {})}
      />

      {ADMIN_SIDEBAR_SECTIONS.map((section) => (
        <div key={section.key} className="pt-3">
          <p className="px-3 pb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--admin-sidebar-fg-muted))]/70">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.key === 'catalog' ? (
              <ProductosCollapsibleGroup {...(onNavigate ? { onNavigate } : {})} />
            ) : null}
            {section.items.map((item) => {
              const isActive = isItemActive(
                location.pathname,
                location.search,
                item.href,
                item.key,
              );
              const badgeCount = resolveBadgeCount(item, pendingOrders);

              return (
                <NavItemLink
                  key={item.key}
                  item={item}
                  isActive={isActive}
                  badgeCount={badgeCount}
                  {...(onNavigate ? { onNavigate } : {})}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
