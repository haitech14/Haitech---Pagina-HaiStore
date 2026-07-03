import type { AdminResumenPriority } from '@/types/admin-resumen';
import { cn } from '@/lib/utils';

const priorityStyles: Record<AdminResumenPriority, string> = {
  alta: 'text-red-600',
  media: 'text-amber-600',
  baja: 'text-teal-600',
};

const priorityLabels: Record<AdminResumenPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

interface AdminResumenPriorityBadgeProps {
  priority: AdminResumenPriority;
  className?: string;
}

export function AdminResumenPriorityBadge({ priority, className }: AdminResumenPriorityBadgeProps) {
  return (
    <span className={cn('text-sm font-semibold', priorityStyles[priority], className)}>
      {priorityLabels[priority]}
    </span>
  );
}
