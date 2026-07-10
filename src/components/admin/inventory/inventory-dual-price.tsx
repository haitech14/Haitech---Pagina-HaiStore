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
import { formatUsd, formatUsdInteger } from '@/lib/utils';

interface InventoryDualPriceProps {
  usd: number;
  /** Si no se indica, usa el tipo de cambio de venta. */
  exchangeRate?: number;
  /** Precio de compra: conversión exacta sin redondeo comercial. */
  useCharm?: boolean;
  /** Categoría de inventario; impresoras y multifuncionales muestran precios sin centavos. */
  category?: string | null;
}

export function InventoryDualPrice({
  usd,
  exchangeRate,
  useCharm = true,
  category,
}: InventoryDualPriceProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const rate = exchangeRate ?? getUsdToPenSaleRate();
  const pen = useCharm ? usdToPenCharm(usd, rate) : usdToPenPrecise(usd, rate);
  const integerDisplay = isImpresoraOrMultifuncionalCategory(category);
  const penLabel = pen > 0 ? (integerDisplay ? formatPenWhole(pen) : formatPenInteger(pen)) : 'S/ —';
  const usdLabel = integerDisplay ? formatUsdInteger(usd) : formatUsd(usd);
  const penFirst = dualPriceOrder === 'pen-usd';

  if (showPen && !showUsd) {
    return (
      <div className="inline-block text-right leading-tight tabular-nums">
        <p className="whitespace-nowrap font-semibold text-foreground">{penLabel}</p>
      </div>
    );
  }

  if (showUsd && !showPen) {
    return (
      <div className="inline-block text-right leading-tight tabular-nums">
        <p className="whitespace-nowrap font-semibold text-foreground">{usdLabel}</p>
      </div>
    );
  }

  const primaryLabel = penFirst ? penLabel : usdLabel;
  const secondaryLabel = penFirst ? usdLabel : penLabel;

  return (
    <div className="inline-block text-right leading-tight tabular-nums">
      <p className="whitespace-nowrap font-semibold text-foreground">{primaryLabel}</p>
      <p className="whitespace-nowrap text-[0.65rem] text-muted-foreground">{secondaryLabel}</p>
    </div>
  );
}
