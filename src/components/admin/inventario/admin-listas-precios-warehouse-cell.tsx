import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  assignProductStockToWarehouse,
  getProductPrimaryWarehouseId,
  normalizeWarehouses,
} from '@/lib/inventory-stock';
import { isBundleProduct } from '@/lib/product-bundle';
import { cn } from '@/lib/utils';
import type { InventoryProduct, InventoryWarehouse } from '@/types/product';

interface AdminListasPreciosWarehouseCellProps {
  product: InventoryProduct;
  warehouses: InventoryWarehouse[];
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
  className?: string;
}

export function AdminListasPreciosWarehouseCell({
  product,
  warehouses,
  onPatch,
  className,
}: AdminListasPreciosWarehouseCellProps) {
  const list = useMemo(() => normalizeWarehouses(warehouses), [warehouses]);
  const resolvedId = getProductPrimaryWarehouseId(product, list);
  const [warehouseId, setWarehouseId] = useState(resolvedId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWarehouseId(resolvedId);
  }, [resolvedId]);

  if (isBundleProduct(product)) {
    return (
      <span className="text-[0.6875rem] text-muted-foreground" title="Pack: stock derivado">
        —
      </span>
    );
  }

  const selected = list.find((entry) => entry.id === warehouseId) ?? list[0];
  const deliveryHint = selected?.delivery_time?.trim();

  return (
    <div className={cn('min-w-[7.5rem] max-w-[10rem]', className)}>
      <Select
        value={warehouseId}
        disabled={saving || list.length === 0}
        onValueChange={(nextId) => {
          if (nextId === warehouseId) return;
          const previous = warehouseId;
          setWarehouseId(nextId);
          setSaving(true);
          const stockPatch = assignProductStockToWarehouse(product, nextId, list);
          void (async () => {
            try {
              await onPatch({
                stock: stockPatch.stock,
                stock_by_warehouse: stockPatch.stock_by_warehouse,
              });
            } catch (error) {
              setWarehouseId(previous);
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'No se pudo asignar el almacén',
              );
            } finally {
              setSaving(false);
            }
          })();
        }}
      >
        <SelectTrigger
          className="h-7 w-full border-border/70 bg-card px-1.5 text-[0.6875rem] shadow-none"
          aria-label={`Almacén de ${product.name}`}
        >
          <SelectValue placeholder="Almacén" />
        </SelectTrigger>
        <SelectContent position="popper" className="z-[300]">
          {list.map((warehouse) => (
            <SelectItem key={warehouse.id} value={warehouse.id} className="text-xs">
              <span className="flex flex-col gap-0.5">
                <span>{warehouse.name}</span>
                {warehouse.delivery_time?.trim() ? (
                  <span className="text-[0.625rem] text-muted-foreground">
                    Entrega: {warehouse.delivery_time.trim()}
                  </span>
                ) : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {deliveryHint ? (
        <p className="mt-0.5 truncate text-[0.6rem] leading-tight text-muted-foreground">
          Entrega: {deliveryHint}
        </p>
      ) : null}
    </div>
  );
}
