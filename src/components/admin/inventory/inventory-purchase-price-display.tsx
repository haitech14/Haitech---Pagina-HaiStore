import { InventoryDualPrice } from '@/components/admin/inventory/inventory-dual-price';
import { InventoryHoverTooltip } from '@/components/admin/inventory/inventory-hover-tooltip';
import { InventorySuppliersTooltipContent } from '@/components/admin/inventory/inventory-suppliers-tooltip-content';
import type { InventoryProduct } from '@/types/product';

interface InventoryPurchasePriceDisplayProps {
  product: InventoryProduct;
  exchangeRate: number;
  compact?: boolean;
}

export function InventoryPurchasePriceDisplay({
  product,
  exchangeRate,
  compact = false,
}: InventoryPurchasePriceDisplayProps) {
  const suppliers = product.suppliers ?? [];
  const hasSuppliers = suppliers.some(
    (row) => row.name?.trim() || Number(row.purchase_price_usd) > 0,
  );

  const purchaseUsd = Number(product.purchase_price_usd) || 0;
  const specialPurchaseUsd = Number(product.special_purchase_price_usd) || 0;

  const priceDisplay = (
    <span className="inline-flex flex-col items-end gap-0.5">
      <InventoryDualPrice
        usd={purchaseUsd}
        exchangeRate={exchangeRate}
        useCharm={false}
        category={product.category}
        compact={compact}
      />
      {specialPurchaseUsd > 0 ? (
        <span className="text-[0.65rem] font-medium leading-none text-amber-700 dark:text-amber-400">
          Esp. ${specialPurchaseUsd.toFixed(2)}
        </span>
      ) : null}
    </span>
  );

  if (!hasSuppliers) {
    return <span className="inline-block">{priceDisplay}</span>;
  }

  return (
    <InventoryHoverTooltip
      side="top"
      align="end"
      ariaLabel="Ver proveedores y precios de compra"
      trigger={priceDisplay}
    >
      <InventorySuppliersTooltipContent
        suppliers={suppliers}
        referencePurchaseUsd={product.purchase_price_usd}
        exchangeRate={exchangeRate}
      />
    </InventoryHoverTooltip>
  );
}
