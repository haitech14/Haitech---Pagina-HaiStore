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

  const priceDisplay = (
    <InventoryDualPrice
      usd={product.purchase_price_usd}
      exchangeRate={exchangeRate}
      useCharm={false}
      category={product.category}
      compact={compact}
    />
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
