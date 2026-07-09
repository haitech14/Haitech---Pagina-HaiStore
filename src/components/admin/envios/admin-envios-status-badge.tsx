import { cn } from '@/lib/utils';
import { getEnviosStatusColor, getEnviosStatusLabel } from '@/lib/admin-envios-utils';
import type { ShipmentStatus } from '@/types/shipping';

const badgeTone: Record<ShipmentStatus, string> = {
  pending_pickup: 'bg-sky-50 text-sky-700 ring-sky-200/80',
  in_transit: 'bg-blue-50 text-blue-700 ring-blue-200/80',
  out_for_delivery: 'bg-blue-50 text-blue-700 ring-blue-200/80',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  failed: 'bg-red-50 text-red-700 ring-red-200/80',
};

interface AdminEnviosStatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

export function AdminEnviosStatusBadge({ status, className }: AdminEnviosStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        badgeTone[status],
        className,
      )}
      style={{ borderColor: getEnviosStatusColor(status) }}
    >
      {getEnviosStatusLabel(status)}
    </span>
  );
}
