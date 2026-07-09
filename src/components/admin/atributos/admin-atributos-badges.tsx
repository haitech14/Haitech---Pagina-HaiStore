import { cn } from '@/lib/utils';
import type { AdminAtributoStatus, AdminAtributoVisibility } from '@/types/admin-atributos';
import {
  ATRIBUTO_STATUS_LABELS,
  ATRIBUTO_VISIBILITY_LABELS,
} from '@/lib/admin-atributos-utils';

const visibilityStyles: Record<AdminAtributoVisibility, string> = {
  publica: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  privada: 'bg-rose-50 text-rose-700 ring-rose-100',
};

const statusStyles: Record<AdminAtributoStatus, string> = {
  activo: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  inactivo: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function AdminAtributosVisibilityBadge({
  visibility,
}: {
  visibility: AdminAtributoVisibility;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
        visibilityStyles[visibility],
      )}
    >
      {ATRIBUTO_VISIBILITY_LABELS[visibility]}
    </span>
  );
}

export function AdminAtributosStatusBadge({ status }: { status: AdminAtributoStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
        statusStyles[status],
      )}
    >
      {ATRIBUTO_STATUS_LABELS[status]}
    </span>
  );
}

export function AdminAtributosTipoBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
        className,
      )}
    >
      {label}
    </span>
  );
}
