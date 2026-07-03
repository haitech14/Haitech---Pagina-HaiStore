import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Home,
  KeyRound,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  TrendingUp,
  User,
  Users,
  Warehouse,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import {
  ADMIN_ROUTES,
  ADMIN_SIDEBAR_MOCKUP_GROUPS,
  ADMIN_SIDEBAR_MOCKUP_MAIN,
  type AdminSidebarMockupNavGroup,
  type AdminSidebarMockupNavItem,
} from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  users: Users,
  user: User,
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  warehouse: Warehouse,
  'bar-chart-3': BarChart3,
  settings: Settings,
  'trending-up': TrendingUp,
  package: Package,
  wrench: Wrench,
  shield: Shield,
  'key-round': KeyRound,
  'sliders-horizontal': SlidersHorizontal,
};

function isItemActive(pathname: string, href: string, key: string): boolean {
  if (key === 'dashboard') return pathname === ADMIN_ROUTES.DASHBOARD;
  if (key === 'customers') {
    return pathname === ADMIN_ROUTES.CRM_CLIENTES || pathname.startsWith(`${ADMIN_ROUTES.CRM_CLIENTES}/`);
  }
  if (key === 'sales') return pathname.startsWith(ADMIN_ROUTES.VENTAS);
  if (key === 'purchases') return pathname.startsWith(ADMIN_ROUTES.PEDIDOS);
  if (key === 'inventory') return pathname.startsWith(ADMIN_ROUTES.INVENTORY);
  if (key === 'users') return pathname.startsWith(ADMIN_ROUTES.SETTINGS_USUARIOS);
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, group: AdminSidebarMockupNavGroup): boolean {
  return group.items.some((item) => isItemActive(pathname, item.href, item.key));
}

interface AdminSidebarMockupNavProps {
  onNavigate?: () => void;
}

export function AdminSidebarMockupNav({ onNavigate }: AdminSidebarMockupNavProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ADMIN_SIDEBAR_MOCKUP_GROUPS.map((group) => [group.key, true])),
  );

  const navLinkClass = (isActive: boolean) =>
    cn(
      'flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
      isActive
        ? 'bg-[hsl(var(--admin-sidebar-active-bg))] text-[hsl(var(--admin-sidebar-active-fg))] shadow-sm'
        : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
    );

  const renderMainItem = (item: AdminSidebarMockupNavItem) => {
    const Icon = ICONS[item.icon] ?? Home;
    const isActive = isItemActive(location.pathname, item.href, item.key);

    return (
      <NavLink
        key={item.key}
        to={item.href}
        end={item.key === 'dashboard'}
        className={() => navLinkClass(isActive)}
        aria-current={isActive ? 'page' : undefined}
        onClick={onNavigate}
      >
        <Icon
          className={cn('size-[1.125rem] shrink-0', isActive ? 'opacity-100' : 'opacity-90')}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronRight
          className={cn(
            'size-4 shrink-0',
            isActive ? 'text-white/80' : 'text-[hsl(var(--admin-sidebar-fg-muted))]/60',
          )}
          aria-hidden="true"
        />
      </NavLink>
    );
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-0.5">
      {ADMIN_SIDEBAR_MOCKUP_MAIN.map(renderMainItem)}

      {ADMIN_SIDEBAR_MOCKUP_GROUPS.map((group) => {
        const GroupIcon = ICONS[group.icon] ?? Settings;
        const isOpen = openGroups[group.key] ?? true;
        const childActive = group.items.some((item) =>
          isItemActive(location.pathname, item.href, item.key),
        );

        return (
          <div key={group.key} className="pt-0.5">
            <button
              type="button"
              className={cn(
                navLinkClass(false),
                childActive && !isOpen && 'text-[hsl(var(--admin-sidebar-fg))]',
                'w-full',
              )}
              aria-expanded={isOpen}
              onClick={() => toggleGroup(group.key)}
            >
              <GroupIcon className="size-[1.125rem] shrink-0 opacity-90" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-left">{group.label}</span>
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-[hsl(var(--admin-sidebar-fg-muted))]/60 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>

            {isOpen ? (
              <div className="ml-[1.625rem] mt-0.5 space-y-0.5 border-l border-[hsl(var(--admin-sidebar-border))]/50 pl-3">
                {group.items.map((item) => {
                  const isActive = isItemActive(location.pathname, item.href, item.key);

                  return (
                    <NavLink
                      key={item.key}
                      to={item.href}
                      className={() =>
                        cn(
                          'flex min-h-9 items-center gap-2 rounded-md py-1.5 pl-1 pr-2 text-[0.8125rem] font-medium transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
                          isActive
                            ? 'text-[hsl(var(--admin-sidebar-fg))]'
                            : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:text-[hsl(var(--admin-sidebar-fg))]',
                        )
                      }
                      aria-current={isActive ? 'page' : undefined}
                      onClick={onNavigate}
                    >
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full',
                          isActive
                            ? 'bg-[hsl(var(--admin-sidebar-active-bg))]'
                            : 'bg-[hsl(var(--admin-sidebar-fg-muted))]/70',
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
