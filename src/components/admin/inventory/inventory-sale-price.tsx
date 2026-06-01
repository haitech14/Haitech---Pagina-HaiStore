import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  getUsdToPenPurchaseRate,
  getUsdToPenSaleRate,
  normalizeUsdToPenRate,
} from '@/lib/exchange-rate';
import { usdToPenCharm } from '@/lib/pen-pricing';
import { cn } from '@/lib/utils';
import type { PriceRole } from '@/types/product';

import { InventoryDualPrice } from './inventory-dual-price';
import { InventoryHoverTooltip } from './inventory-hover-tooltip';
import { InventoryProfitTooltipContent } from './inventory-profit-tooltip-content';

export { MAYORISTA_ORDER_QUANTITIES } from './inventory-profit-tooltip-content';

interface InventorySalePriceProps {
  saleUsd: number;
  purchaseUsd: number;
  /** Rol de la columna; en mayorista el tooltip incluye márgenes por pedido. */
  priceRole?: PriceRole;
  /** En tabla inline: sin foco propio; el clic lo maneja la celda. */
  embedded?: boolean;
}

export function InventorySalePrice({
  saleUsd,
  purchaseUsd,
  priceRole,
  embedded = false,
}: InventorySalePriceProps) {
  const { data: company } = useCompanySettings();
  const saleRate = normalizeUsdToPenRate(
    company?.usdToPenExchangeRate ?? getUsdToPenSaleRate(),
  );
  const purchaseRate = normalizeUsdToPenRate(
    company?.usdToPenPurchaseExchangeRate ??
      company?.usdToPenExchangeRate ??
      getUsdToPenPurchaseRate(),
  );
  const sale = Number(saleUsd) || 0;
  const purchase = Number(purchaseUsd) || 0;
  const profitUsd = Math.round((sale - purchase) * 100) / 100;
  const salePen = usdToPenCharm(sale, saleRate);
  const purchasePen = usdToPenCharm(purchase, purchaseRate);
  const profitPen = salePen - purchasePen;

  const priceDisplay = <InventoryDualPrice usd={sale} exchangeRate={saleRate} />;

  return (
    <span
      className={cn(
        'inline-block',
        !embedded && 'rounded-sm outline-none focus-within:ring-2 focus-within:ring-ring',
      )}
    >
      <InventoryHoverTooltip
        side="top"
        align="end"
        ariaLabel="Ver ganancia al pasar el cursor"
        trigger={priceDisplay}
      >
        <InventoryProfitTooltipContent
          profitUsd={profitUsd}
          profitPen={profitPen}
          {...(priceRole ? { priceRole } : {})}
        />
      </InventoryHoverTooltip>
    </span>
  );
}
