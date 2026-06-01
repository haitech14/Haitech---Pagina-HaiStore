import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  getDefaultWarehouseId,
  normalizeProductStock,
  normalizeWarehouses,
} from '@/lib/inventory-stock';
import type { InventoryProduct, InventoryWarehouse } from '@/types/product';

interface InventoryStockFieldsetProps {
  form: InventoryProduct;
  warehouses: InventoryWarehouse[];
  onChange: (next: Pick<InventoryProduct, 'stock' | 'stock_by_warehouse'>) => void;
}

export function InventoryStockFieldset({
  form,
  warehouses,
  onChange,
}: InventoryStockFieldsetProps) {
  const list = normalizeWarehouses(warehouses);
  const { stock_by_warehouse, stock } = normalizeProductStock(
    form.stock_by_warehouse,
    form.stock,
    list,
  );

  const updateWarehouseQty = (warehouseId: string, raw: string) => {
    const quantity = Math.max(0, Math.floor(Number(raw) || 0));
    const nextRows = stock_by_warehouse.map((row) =>
      row.warehouse_id === warehouseId ? { ...row, quantity } : row,
    );
    const normalized = normalizeProductStock(nextRows, 0, list);
    onChange({
      stock: normalized.stock,
      stock_by_warehouse: normalized.stock_by_warehouse,
    });
  };

  const updateTotal = (raw: string) => {
    const defaultId = getDefaultWarehouseId(list);
    const qty = Math.max(0, Math.floor(Number(raw) || 0));
    const nextRows = list.map((warehouse) => ({
      warehouse_id: warehouse.id,
      quantity: warehouse.id === defaultId ? qty : 0,
    }));
    const normalized = normalizeProductStock(nextRows, qty, list);
    onChange({
      stock: normalized.stock,
      stock_by_warehouse: normalized.stock_by_warehouse,
    });
  };

  return (
    <fieldset className="space-y-3 sm:col-span-2">
      <legend className="text-sm font-medium leading-none">Stock</legend>
      {list.length === 1 ? (
        <div className="space-y-2">
          <Label htmlFor="inv-stock-total">Unidades</Label>
          <Input
            id="inv-stock-total"
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(event) => updateTotal(event.target.value)}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((warehouse) => {
              const row = stock_by_warehouse.find((r) => r.warehouse_id === warehouse.id);
              return (
                <div key={warehouse.id} className="space-y-2">
                  <Label htmlFor={`inv-stock-${warehouse.id}`}>{warehouse.name}</Label>
                  <Input
                    id={`inv-stock-${warehouse.id}`}
                    type="number"
                    min={0}
                    step={1}
                    value={row?.quantity ?? 0}
                    onChange={(event) =>
                      updateWarehouseQty(warehouse.id, event.target.value)
                    }
                  />
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Total: <span className="font-semibold tabular-nums text-foreground">{stock}</span>
          </p>
        </>
      )}
    </fieldset>
  );
}
