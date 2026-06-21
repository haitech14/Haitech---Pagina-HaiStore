import { useEffect, useState } from 'react';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import {
  ADMIN_ROUTES,
  ADMIN_VENTAS_NAV,
  isAdminVentasChildActive,
  isAdminVentasNavPath,
} from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

interface AdminSidebarVentasGroupProps {
  navLinkClass: (options: { isActive: boolean }) => string;
  onNavigate?: (() => void) | undefined;
}

export function AdminSidebarVentasGroup({ navLinkClass, onNavigate }: AdminSidebarVentasGroupProps) {
  const location = useLocation();
  const isSectionActive = isAdminVentasNavPath(location.pathname);
  const isVentasPageActive =
    location.pathname.startsWith(ADMIN_ROUTES.VENTAS) ||
    location.pathname.startsWith('/admin/pedidos');
  const [open, setOpen] = useState(isSectionActive);

  useEffect(() => {
    if (isSectionActive) setOpen(true);
  }, [isSectionActive]);

  const parentClass = navLinkClass({ isActive: isVentasPageActive });

  const subLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex min-h-10 items-center gap-2.5 rounded-lg py-2 pl-9 pr-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-soft))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
      isActive
        ? 'bg-[hsl(var(--admin-sidebar-active-bg))] text-[hsl(var(--admin-sidebar-active-fg))] shadow-md shadow-black/40'
        : 'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
    );

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-lg',
          isVentasPageActive && 'bg-[hsl(var(--admin-sidebar-active-bg))] shadow-md shadow-black/40',
        )}
      >
        <NavLink
          to={ADMIN_ROUTES.VENTAS}
          className={cn(parentClass, 'min-w-0 flex-1 shadow-none', isVentasPageActive && 'bg-transparent shadow-none')}
          aria-current={isVentasPageActive ? 'page' : undefined}
          onClick={onNavigate}
        >
          <ShoppingBag className="size-[1.125rem] shrink-0" aria-hidden="true" />
          <span className="truncate">Ventas</span>
        </NavLink>
        <button
          type="button"
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors',
            'text-[hsl(var(--admin-sidebar-fg-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-sidebar-fg))]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-soft))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
          )}
          aria-expanded={open}
          aria-controls="admin-nav-ventas-submenu"
          aria-label={open ? 'Contraer sección Ventas' : 'Expandir sección Ventas'}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown
            className={cn('size-4 transition-transform duration-200', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </div>

      {open ? (
        <div id="admin-nav-ventas-submenu" className="space-y-0.5" role="group" aria-label="Secciones de Ventas">
          {ADMIN_VENTAS_NAV.map((item) => {
            const isActive = isAdminVentasChildActive(location.pathname, item.key);
            return (
              <NavLink
                key={item.key}
                to={item.href}
                className={() => subLinkClass({ isActive })}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
              >
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
