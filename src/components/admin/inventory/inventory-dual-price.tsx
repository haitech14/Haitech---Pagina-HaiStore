import { useDisplayCurrency } from '@/context/display-currency-context';
import { getDisplayPriceVisibility } from '@/lib/display-price';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import {
  formatPenInteger,
  formatPenWhole,
  isImpresoraOrMultifuncionalCategory,
  usdToPenCharm,
  usdToPenPrecise,
} from '@/lib/pen-pricing';
import { cn, formatUsd, formatUsdInteger } from '@/lib/utils';

interface InventoryDualPriceProps {
  usd: number;
  /** Si no se indica, usa el tipo de cambio de venta. */
  exchangeRate?: number;
  /** Precio de compra: conversión exacta sin redondeo comercial. */
  useCharm?: boolean;
  /** Categoría de inventario; impresoras y multifuncionales muestran precios sin centavos. */
  category?: string | null;
  /** Tipografía más compacta para tablas densas. */
  compact?: boolean;
}

export function InventoryDualPrice({
  usd,
  exchangeRate,
  useCharm = true,
  category,
  compact = false,
}: InventoryDualPriceProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const rate = exchangeRate ?? getUsdToPenSaleRate();
  const pen = useCharm ? usdToPenCharm(usd, rate) : usdToPenPrecise(usd, rate);
  const integerDisplay = isImpresoraOrMultifuncionalCategory(category);
  const penLabel = pen > 0 ? (integerDisplay ? formatPenWhole(pen) : formatPenInteger(pen)) : 'S/ —';
  const usdLabel = integerDisplay ? formatUsdInteger(usd) : formatUsd(usd);
  const penFirst = dualPriceOrder === 'pen-usd';

  const priceClass = compact ? 'text-xs leading-none' : 'leading-tight';
  const secondaryClass = compact ? 'text-[0.625rem] leading-none' : 'text-[0.65rem]';

  if (showPen && !showUsd) {
    return (
      <div className={cn('inline-block text-right tabular-nums', priceClass)}>
        <p className="whitespace-nowrap font-semibold text-foreground">{penLabel}</p>
      </div>
    );
  }

  if (showUsd && !showPen) {
    return (
      <div className={cn('inline-block text-right tabular-nums', priceClass)}>
        <p className="whitespace-nowrap font-semibold text-foreground">{usdLabel}</p>
      </div>
    );
  }

  const primaryLabel = penFirst ? penLabel : usdLabel;
  const secondaryLabel = penFirst ? usdLabel : penLabel;

  return (
    <div className={cn('inline-block text-right tabular-nums', priceClass)}>
      <p className="whitespace-nowrap font-semibold text-foreground">{primaryLabel}</p>
      <p className={cn('whitespace-nowrap text-muted-foreground', secondaryClass)}>{secondaryLabel}</p>
    </div>
  );
}
