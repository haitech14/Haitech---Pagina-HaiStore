import { useMemo } from 'react';

import { AdminExchangeRateControl } from '@/components/admin/admin-exchange-rate-control';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { useAdminWorkspace } from '@/context/admin-workspace-context';
import { useAdminProfiles } from '@/hooks/use-admin-dashboard';
import { ADMIN_WORKSPACE_BRAND_LIST } from '@/lib/admin-workspace-brands';
import { cn } from '@/lib/utils';

const DEFAULT_BRANCHES = [
  { id: 'principal', label: 'Principal' },
  { id: 'lima', label: 'Lima — Lince' },
  { id: 'norte', label: 'Sucursal Norte' },
] as const;

interface AdminWorkspaceFiltersProps {
  variant?: 'dark' | 'light';
  className?: string;
  layout?: 'row' | 'column' | 'sidebar';
}

export function AdminWorkspaceFilters({
  variant = 'light',
  className,
  layout = 'row',
}: AdminWorkspaceFiltersProps) {
  const isDark = variant === 'dark';
  const isSidebarInline = isDark && layout === 'sidebar';
  const isCompact = isDark && (layout === 'column' || isSidebarInline);
  const { user } = useAuth();
  const { brandId, brand, setBrandId } = useAdminWorkspace();
  const { data: profiles = [] } = useAdminProfiles();

  const userOptions = useMemo(() => {
    const fromProfiles = profiles
      .filter((p) => p.full_name || p.email)
      .map((p) => ({
        id: p.id,
        label: p.full_name ?? p.email ?? p.id,
      }));
    if (user?.id && !fromProfiles.some((p) => p.id === user.id)) {
      fromProfiles.unshift({
        id: user.id,
        label: user.name ?? user.email ?? 'Usuario actual',
      });
    }
    return fromProfiles;
  }, [profiles, user?.email, user?.id, user?.name]);

  const labelClass = cn(
    'font-medium uppercase tracking-wide leading-none',
    isSidebarInline ? 'text-[0.6rem]' : isCompact ? 'text-[0.6rem]' : 'text-xs',
    isDark ? 'text-[hsl(var(--admin-sidebar-fg-muted))]' : 'text-muted-foreground',
  );

  const triggerClass = cn(
    isSidebarInline ? 'h-8 px-2 text-xs' : isCompact ? 'h-7 px-2 text-xs' : 'h-9 text-sm',
    isDark &&
      'border-[hsl(var(--admin-sidebar-border))] bg-[hsl(var(--admin-sidebar-hover))] text-[hsl(var(--admin-sidebar-fg))]',
    (isCompact || isSidebarInline) && '[&>span]:line-clamp-1 [&>span]:text-left',
  );

  const fieldClass = cn(
    isSidebarInline ? 'min-w-0 space-y-0.5' : isCompact ? 'space-y-0.5' : 'space-y-1.5',
    !isSidebarInline && layout === 'row' && 'min-w-[7.5rem] flex-1 sm:max-w-[11rem]',
    !isSidebarInline && layout !== 'row' && 'w-full',
  );

  return (
    <div
      className={cn(
        'flex',
        isSidebarInline && 'grid grid-cols-2 gap-x-1.5 gap-y-2',
        isCompact && !isSidebarInline && 'flex-col gap-1.5',
        !isCompact && !isSidebarInline && 'gap-2',
        layout === 'column' && !isCompact && !isSidebarInline && 'flex-col',
        layout === 'row' && 'flex-wrap items-end',
        className,
      )}
      role="group"
      aria-label="Filtros de empresa, sucursal, usuario y tipo de cambio"
    >
      <div className={fieldClass}>
        <Label htmlFor="admin-filter-empresa" className={labelClass}>
          Empresa
        </Label>
        <Select
          value={brandId}
          onValueChange={(value) => {
            if (value === 'haitech' || value === 'printcore') setBrandId(value);
          }}
        >
          <SelectTrigger id="admin-filter-empresa" className={triggerClass} aria-label="Empresa">
            <SelectValue>{brand.companyName}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ADMIN_WORKSPACE_BRAND_LIST.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={fieldClass}>
        <Label htmlFor="admin-filter-sucursal" className={labelClass}>
          Sucursal
        </Label>
        <Select defaultValue={DEFAULT_BRANCHES[0].id}>
          <SelectTrigger id="admin-filter-sucursal" className={triggerClass} aria-label="Sucursal">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_BRANCHES.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={fieldClass}>
        <Label htmlFor="admin-filter-usuario" className={labelClass}>
          Usuario
        </Label>
        <Select defaultValue={user?.id ?? 'todos'}>
          <SelectTrigger id="admin-filter-usuario" className={triggerClass} aria-label="Usuario">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {userOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={fieldClass}>
        <Label htmlFor="admin-filter-tc" className={labelClass}>
          {isSidebarInline ? 'T. cambio' : 'Tipo de cambio'}
        </Label>
        <AdminExchangeRateControl
          variant={isSidebarInline ? 'sidebar' : 'topbar'}
          triggerId="admin-filter-tc"
          {...(!isSidebarInline
            ? {
                triggerClassName: triggerClass,
                className: 'inline-flex w-full min-w-[7.5rem] sm:max-w-[11rem]',
              }
            : {})}
        />
      </div>
    </div>
  );
}
