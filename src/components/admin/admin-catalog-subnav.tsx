import { NavLink } from 'react-router-dom';

import { ADMIN_CATALOG_NAV } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

export function AdminCatalogSubNav() {
  return (
    <nav
      aria-label="Secciones de inventario, categorías y precios"
      className="border-b bg-background px-4 sm:px-6"
    >
      <ul className="flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_CATALOG_NAV.map((item) => (
          <li key={item.href} className="shrink-0">
            <NavLink
              to={item.href}
              end
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
                  isActive
                    ? 'bg-[hsl(var(--admin-accent))]/10 text-[hsl(var(--admin-accent))]'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
