import type { AdminResumenStatus } from '@/types/admin-resumen';
import { cn } from '@/lib/utils';

const statusStyles: Record<AdminResumenStatus, string> = {
  pendiente: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  en_proceso: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  resuelto: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  cancelado: 'bg-slate-100 text-slate-600 ring-slate-200/60',
};

const statusLabels: Record<AdminResumenStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  cancelado: 'Cancelado',
};

interface AdminResumenStatusBadgeProps {
  status: AdminResumenStatus;
  className?: string;
}

export function AdminResumenStatusBadge({ status, className }: AdminResumenStatusBadgeProps) {
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
