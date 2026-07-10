import { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { InventorySupplierCombobox } from '@/components/admin/inventory/inventory-supplier-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useSupplierCatalog } from '@/hooks/use-supplier-catalog';
import { createEmptySupplier } from '@/lib/inventory-suppliers';
import { getUsdToPenPurchaseRate, normalizeUsdToPenRate } from '@/lib/exchange-rate';
import { formatPenInteger, usdToPenPrecise } from '@/lib/pen-pricing';
import type { InventorySupplier } from '@/types/product';

interface InventorySuppliersFieldsetProps {
  suppliers: InventorySupplier[];
  onChange: (suppliers: InventorySupplier[]) => void;
  embedded?: boolean;
}

export function InventorySuppliersFieldset({
  suppliers,
  onChange,
  embedded = false,
}: InventorySuppliersFieldsetProps) {
  const supplierCatalog = useSupplierCatalog();
  const mergedCatalog = useMemo(() => {
    const names = new Set(supplierCatalog);
    for (const row of suppliers) {
      const name = row.name?.trim();
      if (name) names.add(name);
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'es'));
  }, [supplierCatalog, suppliers]);
  const { data: company } = useCompanySettings();
  const exchangeRate = normalizeUsdToPenRate(
    company?.usdToPenPurchaseExchangeRate ??
      company?.usdToPenExchangeRate ??
      getUsdToPenPurchaseRate(),
  );

  const updateSupplier = (id: string, patch: Partial<InventorySupplier>) => {
    onChange(suppliers.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeSupplier = (id: string) => {
    onChange(suppliers.filter((row) => row.id !== id));
  };

  const addSupplier = () => {
    onChange([...suppliers, createEmptySupplier()]);
  };

  const content = (
    <>
      {!embedded ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Registra uno o más proveedores con su precio de compra. El costo de referencia usa el menor
          precio.
        </p>
      ) : null}

      <div className={embedded ? 'space-y-2' : 'mt-3 space-y-2'}>
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin proveedores registrados.</p>
        ) : (
          <ul className="space-y-2">
            {suppliers.map((supplier, index) => {
              const usd = Number(supplier.purchase_price_usd) || 0;
              const nameId = `supplier-name-${supplier.id}`;
              const priceId = `supplier-price-${supplier.id}`;

              return (
                <li
                  key={supplier.id}
                  className="grid gap-2 rounded-md border bg-muted/30 p-2 sm:grid-cols-[1fr_minmax(7rem,9rem)_auto]"
                >
                  <InventorySupplierCombobox
                    id={nameId}
                    label={index === 0 ? 'Proveedor principal' : `Proveedor ${index + 1}`}
                    value={supplier.name}
                    onChange={(name) => updateSupplier(supplier.id, { name })}
                    options={mergedCatalog}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={priceId} className="text-xs">
                      Precio compra (USD)
                    </Label>
                    <Input
                      id={priceId}
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      className="h-9 tabular-nums"
                      value={supplier.purchase_price_usd || ''}
                      onChange={(event) =>
                        updateSupplier(supplier.id, {
                          purchase_price_usd: Number(event.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-[0.65rem] text-muted-foreground tabular-nums">
                      {usd > 0 ? formatPenInteger(usdToPenPrecise(usd, exchangeRate)) : 'S/ —'}
                    </p>
                  </div>
                  <div className="flex items-end sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 text-destructive hover:text-destructive"
                      aria-label={`Quitar proveedor ${supplier.name || index + 1}`}
                      onClick={() => removeSupplier(supplier.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5" onClick={addSupplier}>
          <Plus className="size-4" aria-hidden="true" />
          Agregar proveedor
        </Button>
      </div>
    </>
  );

  if (embedded) return content;

  return (
    <fieldset className="rounded-lg border p-3">
      <legend className="px-1 text-sm font-medium">Proveedores</legend>
      {content}
    </fieldset>
  );
}
