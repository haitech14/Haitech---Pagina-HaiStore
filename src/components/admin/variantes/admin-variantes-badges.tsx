import { cn } from '@/lib/utils';
import {
  PRODUCT_OPTION_SOURCE_LABELS,
  PRODUCT_OPTION_TYPE_LABELS,
  VARIANTE_STATUS_LABELS,
} from '@/lib/admin-variantes-utils';
import type {
  AdminProductOptionSource,
  AdminProductOptionType,
  AdminVarianteStatus,
} from '@/types/admin-variantes';

const statusStyles: Record<AdminVarianteStatus, string> = {
  activa: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  stock_bajo: 'bg-orange-50 text-orange-700 ring-orange-100',
  agotada: 'bg-rose-50 text-rose-700 ring-rose-100',
  inactiva: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const optionTypeStyles: Record<AdminProductOptionType, string> = {
  cross_sell: 'bg-blue-50 text-blue-700 ring-blue-100',
  upsell: 'bg-violet-50 text-violet-700 ring-violet-100',
};

const optionSourceStyles: Record<AdminProductOptionSource, string> = {
  inventory: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  optional: 'bg-amber-50 text-amber-700 ring-amber-100',
};

export function AdminVariantesStatusBadge({ status }: { status: AdminVarianteStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
        statusStyles[status],
      )}
    >
      {VARIANTE_STATUS_LABELS[status]}
    </span>
  );
}

export function AdminProductOptionTypeBadge({ type }: { type: AdminProductOptionType }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
        optionTypeStyles[type],
      )}
    >
      {PRODUCT_OPTION_TYPE_LABELS[type]}
    </span>
  );
}

export function AdminProductOptionSourceBadge({ source }: { source: AdminProductOptionSource }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
        optionSourceStyles[source],
      )}
    >
      {PRODUCT_OPTION_SOURCE_LABELS[source]}
    </span>
  );
}
