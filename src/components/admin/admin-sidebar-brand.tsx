import { Link } from 'react-router-dom';

import { useAdminWorkspace } from '@/context/admin-workspace-context';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

interface AdminSidebarBrandProps {
  variant?: 'stacked' | 'inline';
}

export function AdminSidebarBrand({ variant = 'stacked' }: AdminSidebarBrandProps) {
  const { brand } = useAdminWorkspace();
  const isInline = variant === 'inline';

  return (
    <Link
      to={ADMIN_ROUTES.DASHBOARD}
      className={cn(
        'shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-soft))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--admin-sidebar-bg))]',
        isInline
          ? 'flex w-[7.25rem] items-center justify-center py-1'
          : 'mx-auto flex w-full max-w-[11.5rem] flex-col items-center gap-1 px-2 py-2',
      )}
      aria-label={`${brand.companyName}, inicio del panel`}
    >
      <img
        src={brand.logoUrl}
        alt={brand.logoAlt}
        className={cn(
          'object-contain object-center',
          isInline ? 'h-auto max-h-[5.25rem] w-full' : 'mx-auto h-auto w-full max-h-12',
        )}
        width={isInline ? 116 : 184}
        height={isInline ? 84 : 48}
      />
      {!isInline && (
        <span className="text-center text-[0.6rem] font-medium uppercase tracking-wide text-[hsl(var(--admin-sidebar-fg-muted))]">
          {brand.legalName}
        </span>
      )}
    </Link>
  );
}
