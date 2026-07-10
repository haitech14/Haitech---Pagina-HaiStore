import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getDefaultWarehouseId,
  normalizeProductStock,
  normalizeWarehouses,
} from '@/lib/inventory-stock';
import type { InventoryProduct, InventoryWarehouse } from '@/types/product';

interface InventoryInventorySectionProps {
  form: InventoryProduct;
  warehouses: InventoryWarehouse[];
  onChange: (next: Pick<InventoryProduct, 'stock' | 'stock_by_warehouse'>) => void;
}

export function InventoryInventorySection({
  form,
  warehouses,
  onChange,
}: InventoryInventorySectionProps) {
  const list = normalizeWarehouses(warehouses);
  const { stock_by_warehouse, stock } = normalizeProductStock(
    form.stock_by_warehouse,
    form.stock,
    list,
  );
  const defaultWarehouseId = getDefaultWarehouseId(list);
  const principalQty =
    stock_by_warehouse.find((row) => row.warehouse_id === defaultWarehouseId)?.quantity ?? 0;

  const applyStock = (totalRaw: string, principalRaw?: string) => {
    const total = Math.max(0, Math.floor(Number(totalRaw) || 0));
    const principal =
      principalRaw != null
        ? Math.max(0, Math.floor(Number(principalRaw) || 0))
        : total;

    const nextRows = list.map((warehouse) => ({
      warehouse_id: warehouse.id,
      quantity:
        warehouse.id === defaultWarehouseId
          ? principal
          : list.length === 1
            ? principal
            : 0,
    }));

    const normalized = normalizeProductStock(nextRows, total, list);
    onChange({
      stock: normalized.stock,
      stock_by_warehouse: normalized.stock_by_warehouse,
    });
  };

  const stockValue = list.length === 1 ? stock : principalQty;

  return (
    <div id="inv-stock-section" className="space-y-2">
      <Label htmlFor="inv-stock-total">Stock (unidades)</Label>
      <Input
        id="inv-stock-total"
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        className="h-10 bg-background"
        value={stockValue}
        onChange={(event) => {
          const principal = Math.max(0, Math.floor(Number(event.target.value) || 0));
          if (list.length === 1) {
            applyStock(String(principal), String(principal));
            return;
          }
          const otherQty = stock_by_warehouse
            .filter((row) => row.warehouse_id !== defaultWarehouseId)
            .reduce((sum, row) => sum + row.quantity, 0);
          applyStock(String(principal + otherQty), String(principal));
        }}
      />
    </div>
  );
}
