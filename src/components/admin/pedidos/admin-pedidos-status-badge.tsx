import type { AdminPedidosTab } from '@/types/admin-pedidos';
import { cn } from '@/lib/utils';

const statusStyles: Record<Exclude<AdminPedidosTab, 'todos'>, string> = {
  pendiente: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  en_proceso: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  entregado: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  cancelado: 'bg-slate-100 text-slate-600 ring-slate-200/60',
};

const statusLabels: Record<Exclude<AdminPedidosTab, 'todos'>, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

interface AdminPedidosStatusBadgeProps {
  status: Exclude<AdminPedidosTab, 'todos'>;
  className?: string;
}

export function AdminPedidosStatusBadge({ status, className }: AdminPedidosStatusBadgeProps) {
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
