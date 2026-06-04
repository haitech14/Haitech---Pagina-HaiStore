import { NavLink } from 'react-router-dom';

import { ADMIN_CRM_NAV } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

interface AdminCrmSubNavProps {
  /** En barra superior: pestañas al lado del título CRM. */
  variant?: 'inline' | 'bar';
}

export function AdminCrmSubNav({ variant = 'bar' }: AdminCrmSubNavProps) {
  const isInline = variant === 'inline';

  return (
    <nav
      aria-label="Secciones de CRM"
      className={cn(!isInline && 'border-b bg-background px-4 sm:px-6')}
    >
      <ul
        className={cn(
          'flex gap-1',
          isInline
            ? 'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : 'overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {ADMIN_CRM_NAV.map((item) => (
          <li key={item.href} className="shrink-0">
            <NavLink
              to={item.href}
              end
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]',
                  isActive
                    ? 'bg-[hsl(var(--admin-accent))]/10 font-semibold text-[hsl(var(--admin-accent))]'
                    : 'text-slate-500 hover:text-foreground',
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
