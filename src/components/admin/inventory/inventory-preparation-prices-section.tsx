import { Layers } from 'lucide-react';

import { InventoryPricesGrid } from '@/components/admin/inventory/inventory-prices-grid';
import {
  normalizePreparationPrices,
  productQualifiesForSeminuevaPreparation,
  resolvePreparationRolePrices,
  SEMINUEVA_PREPARATION_LABELS,
  SEMINUEVA_PREPARATION_PRICE_TYPES,
  type SeminuevaPreparationPriceType,
  type SeminuevaPreparationPrices,
} from '@/lib/seminueva-preparation';
import { ensureFullPrices, type PriceRole, type ProductRolePrices } from '@/lib/roles';
import type { InventoryProduct } from '@/types/product';

interface InventoryPreparationPricesSectionProps {
  form: InventoryProduct;
  onChange: (preparation_prices: SeminuevaPreparationPrices | undefined) => void;
}

export function InventoryPreparationPricesSection({
  form,
  onChange,
}: InventoryPreparationPricesSectionProps) {
  if (!productQualifiesForSeminuevaPreparation(form)) {
    return null;
  }

  const updateVariantPrice = (
    type: SeminuevaPreparationPriceType,
    role: PriceRole,
    value: string,
  ) => {
    const current = resolvePreparationRolePrices(type, form);
    const nextTypePrices = ensureFullPrices({
      ...current,
      [role]: Number(value) || 0,
    });
    const next: SeminuevaPreparationPrices = {
      ...normalizePreparationPrices(form.preparation_prices),
      [type]: nextTypePrices,
    };
    onChange(normalizePreparationPrices(next));
  };

  return (
    <div className="space-y-3 rounded-md border border-border/60 bg-muted/5 p-3">
      <div className="flex items-start gap-2">
        <Layers className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Precios de variantes (tipo de preparado)
          </p>
          <p className="text-xs text-muted-foreground">
            Acondicionado usa los precios de venta de arriba. Define Semi repotenciado y
            Remanufacturado con la misma grilla por rol.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {SEMINUEVA_PREPARATION_PRICE_TYPES.map((type) => {
          const prices: ProductRolePrices = resolvePreparationRolePrices(type, form);
          return (
            <InventoryPricesGrid
              key={type}
              saleOnly
              idPrefix={`prep-${type}`}
              saleLabel={SEMINUEVA_PREPARATION_LABELS[type]}
              prices={prices}
              onPriceChange={(role, value) => updateVariantPrice(type, role, value)}
            />
          );
        })}
      </div>
    </div>
  );
}
