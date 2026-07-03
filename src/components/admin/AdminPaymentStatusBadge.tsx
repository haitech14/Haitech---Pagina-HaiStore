import { cn } from '@/lib/utils';
import type { StorePaymentStatus } from '@/types/store';

const statusConfig: Record<StorePaymentStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  paid: { label: 'Pagado', className: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Fallido', className: 'bg-red-100 text-red-700' },
  refunded: { label: 'Reembolsado', className: 'bg-slate-100 text-slate-700' },
};

export function AdminPaymentStatusBadge({ status }: { status: StorePaymentStatus }) {
  const config = statusConfig[status] ?? statusConfig.pending;
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
