import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { AdminListaPreciosStatus } from '@/types/admin-listas-precios';
import type { InventoryProduct } from '@/types/product';

const STATUS_LABELS: Record<AdminListaPreciosStatus, string> = {
  activa: 'Activa',
  borrador: 'Borrador',
  inactiva: 'Inactiva',
};

const STATUS_STYLES: Record<AdminListaPreciosStatus, string> = {
  activa: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  borrador: 'border-amber-200 bg-amber-50 text-amber-700',
  inactiva: 'border-border bg-muted text-muted-foreground',
};

interface AdminListasPreciosStatusBadgeProps {
  status: AdminListaPreciosStatus;
  product?: InventoryProduct;
  onPatch?: (patch: Partial<InventoryProduct>) => Promise<void>;
  className?: string;
}

export function AdminListasPreciosStatusBadge({
  status,
  product,
  onPatch,
  className,
}: AdminListasPreciosStatusBadgeProps) {
  if (!product || !onPatch) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold',
          STATUS_STYLES[status],
          className,
        )}
      >
        {STATUS_LABELS[status]}
      </span>
    );
  }

  return (
    <Select
      value={status}
      onValueChange={(value) => {
        void (async () => {
          try {
            await onPatch({ status: value as AdminListaPreciosStatus });
            toast.success(
              value === 'activa'
                ? 'Producto visible en la tienda'
                : value === 'inactiva'
                  ? 'Producto oculto en la tienda'
                  : 'Estado actualizado',
            );
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : 'No se pudo actualizar el estado',
            );
          }
        })();
      }}
    >
      <SelectTrigger
        className={cn(
          'h-7 w-auto min-w-0 border px-1.5 text-[0.625rem] font-semibold shadow-none',
          STATUS_STYLES[status],
          className,
        )}
        aria-label={`Estado de ${product.name}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABELS) as AdminListaPreciosStatus[]).map((value) => (
          <SelectItem key={value} value={value} className="text-xs">
            {STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
