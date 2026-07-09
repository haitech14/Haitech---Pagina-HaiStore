import type { AdminMarcaStatus } from '@/types/admin-marcas';
import { cn } from '@/lib/utils';

const statusStyles: Record<AdminMarcaStatus, string> = {
  activa: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  inactiva: 'bg-red-50 text-red-700 ring-red-200/60',
};

const statusLabels: Record<AdminMarcaStatus, string> = {
  activa: 'Activa',
  inactiva: 'Inactiva',
};

interface AdminMarcasStatusBadgeProps {
  status: AdminMarcaStatus;
  className?: string;
}

export function AdminMarcasStatusBadge({ status, className }: AdminMarcasStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
