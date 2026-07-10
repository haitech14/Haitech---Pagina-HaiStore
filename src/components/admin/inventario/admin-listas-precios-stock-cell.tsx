import { toast } from 'sonner';

import { InventoryInlineField } from '@/components/admin/inventory/inventory-inline-field';
import { InventoryStockBadge } from '@/components/admin/inventory/inventory-stock-badge';
import { Input } from '@/components/ui/input';
import { isBundleProduct } from '@/lib/product-bundle';
import { stockFromTotal } from '@/lib/inventory-stock';
import type { InventoryProduct, InventoryWarehouse } from '@/types/product';

interface AdminListasPreciosStockCellProps {
  product: InventoryProduct;
  warehouses: InventoryWarehouse[];
  activeFieldId: string | null;
  onActivate: (fieldId: string) => void;
  onClose: () => void;
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
}

function fieldKey(productId: string) {
  return `${productId}:stock`;
}

export function AdminListasPreciosStockCell({
  product,
  warehouses,
  activeFieldId,
  onActivate,
  onClose,
  onPatch,
}: AdminListasPreciosStockCellProps) {
  const key = fieldKey(product.id);
  const bundleProduct = isBundleProduct(product);

  const saveStock = async (value: string) => {
    const next = Math.max(0, Math.floor(Number(value) || 0));
    if (next === product.stock) {
      onClose();
      return;
    }

    const stockPatch = stockFromTotal(next, warehouses);
    try {
      await onPatch({
        stock: stockPatch.stock,
        stock_by_warehouse: stockPatch.stock_by_warehouse,
      });
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar el stock del producto',
      );
    }
  };

  if (bundleProduct) {
    return (
      <div className="flex justify-center" title="Stock derivado de los componentes del pack">
        <InventoryStockBadge product={product} warehouses={warehouses} />
      </div>
    );
  }

  return (
    <InventoryInlineField
      fieldId={key}
      activeFieldId={activeFieldId}
      onActivate={() => onActivate(key)}
      onClose={onClose}
      display={
        <div className="flex justify-center">
          <InventoryStockBadge product={product} warehouses={warehouses} />
        </div>
      }
      edit={
        <Input
          type="number"
          min={0}
          step={1}
          className="h-8 w-20 text-xs tabular-nums"
          defaultValue={product.stock}
          aria-label="Stock del producto"
          autoFocus
          onBlur={(event) => void saveStock(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void saveStock(event.currentTarget.value);
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              onClose();
            }
          }}
        />
      }
    />
  );
}
