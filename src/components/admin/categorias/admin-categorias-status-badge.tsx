import type { AdminCategoriaStatus } from '@/types/admin-categorias';
import { cn } from '@/lib/utils';

const statusStyles: Record<AdminCategoriaStatus, string> = {
  activa: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  destacada: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  borrador: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  archivada: 'bg-slate-100 text-slate-600 ring-slate-200/60',
};

const statusLabels: Record<AdminCategoriaStatus, string> = {
  activa: 'Activa',
  destacada: 'Destacada',
  borrador: 'Borrador',
  archivada: 'Archivada',
};

interface AdminCategoriasStatusBadgeProps {
  status: AdminCategoriaStatus;
  className?: string;
}

export function AdminCategoriasStatusBadge({ status, className }: AdminCategoriasStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[0.625rem] font-semibold ring-1 ring-inset',
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
