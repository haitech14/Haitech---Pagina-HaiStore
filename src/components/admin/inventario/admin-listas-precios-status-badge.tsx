import { useEffect, useState } from 'react';
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
  const [localStatus, setLocalStatus] = useState<AdminListaPreciosStatus>(status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

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
      value={localStatus}
      disabled={saving}
      onValueChange={(value) => {
        const next = value as AdminListaPreciosStatus;
        if (next === localStatus) return;

        const previous = localStatus;
        setLocalStatus(next);
        setSaving(true);

        void (async () => {
          try {
            await onPatch({ status: next });
            toast.success(
              next === 'activa'
                ? 'Producto visible en la tienda'
                : next === 'inactiva'
                  ? 'Producto oculto en la tienda'
                  : 'Estado actualizado',
            );
          } catch (error) {
            setLocalStatus(previous);
            toast.error(
              error instanceof Error ? error.message : 'No se pudo actualizar el estado',
            );
          } finally {
            setSaving(false);
          }
        })();
      }}
    >
      <SelectTrigger
        className={cn(
          'h-6 w-auto min-w-0 border px-1.5 text-[0.625rem] font-semibold leading-none shadow-none',
          STATUS_STYLES[localStatus],
          className,
        )}
        aria-label={`Estado de ${product.name}`}
      >
        <SelectValue>{STATUS_LABELS[localStatus]}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="z-[300]">
        {(Object.keys(STATUS_LABELS) as AdminListaPreciosStatus[]).map((value) => (
          <SelectItem key={value} value={value} className="text-xs">
            {STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
