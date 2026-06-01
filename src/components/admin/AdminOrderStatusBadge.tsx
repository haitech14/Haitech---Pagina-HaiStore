import { cn } from '@/lib/utils';

export type OrderStatus = 'entregado' | 'enviado' | 'procesando' | 'cancelado';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  entregado: { label: 'Entregado', className: 'bg-emerald-100 text-emerald-700' },
  enviado: { label: 'Enviado', className: 'bg-sky-100 text-sky-700' },
  procesando: { label: 'Procesando', className: 'bg-amber-100 text-amber-800' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

export function AdminOrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
