import type { AdminInventarioStockStatus } from '@/types/admin-inventario';
import { cn } from '@/lib/utils';

const statusStyles: Record<AdminInventarioStockStatus, string> = {
  en_stock: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  stock_bajo: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  stock_critico: 'bg-red-50 text-red-700 ring-red-200/60',
};

const statusLabels: Record<AdminInventarioStockStatus, string> = {
  en_stock: 'En stock',
  stock_bajo: 'Stock bajo',
  stock_critico: 'Stock crítico',
};

interface AdminInventarioStatusBadgeProps {
  status: AdminInventarioStockStatus;
  className?: string;
}

export function AdminInventarioStatusBadge({ status, className }: AdminInventarioStatusBadgeProps) {
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
