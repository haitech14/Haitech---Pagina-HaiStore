import { cn } from '@/lib/utils';

type AdminClientesAccountStatus = 'activo' | 'sin_cuenta' | 'haisupport';

const statusStyles: Record<AdminClientesAccountStatus, string> = {
  activo: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  sin_cuenta: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  haisupport: 'bg-violet-50 text-violet-700 ring-violet-200/60',
};

const statusLabels: Record<AdminClientesAccountStatus, string> = {
  activo: 'Con cuenta',
  sin_cuenta: 'Sin cuenta',
  haisupport: 'HaiSupport',
};

interface AdminClientesStatusBadgeProps {
  status: AdminClientesAccountStatus;
  className?: string;
}

export function AdminClientesStatusBadge({ status, className }: AdminClientesStatusBadgeProps) {
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
