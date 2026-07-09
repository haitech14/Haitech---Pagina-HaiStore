import { cn } from '@/lib/utils';
import type { AdminListaPreciosStatus } from '@/types/admin-listas-precios';

const STATUS_LABELS: Record<AdminListaPreciosStatus, string> = {
  activa: 'Activa',
  borrador: 'Borrador',
  inactiva: 'Inactiva',
};

const STATUS_STYLES: Record<AdminListaPreciosStatus, string> = {
  activa: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  borrador: 'border-amber-200 bg-amber-50 text-amber-700',
  inactiva: 'border-border bg-muted text-muted-foreground',
};

interface AdminListasPreciosStatusBadgeProps {
  status: AdminListaPreciosStatus;
  className?: string;
}

export function AdminListasPreciosStatusBadge({
  status,
  className,
}: AdminListasPreciosStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
