import {
  discountedUsdPrice,
  getDisplayPriceVisibility,
  isPriceOnRequest,
} from '@/lib/display-price';
import {
  isTonerOrRepuestosCategory,
} from '@/lib/pen-pricing';
import { formatPenFromUsdDisplay, usdToPen } from '@/lib/utils';
import type { DisplayCurrency, DualPriceOrder } from '@/types/display-currency';

const EQUIPMENT_QTY = 2;
const EQUIPMENT_DISCOUNT_PERCENT = 5;
const TONER_QTY = 4;
const TONER_DISCOUNT_PERCENT = 5;
const WHOLESALE_FROM_UNITS = 2;

export type VolumeBuyIncentiveLine = {
  key: string;
  text: string;
};

function formatUsdLabel(usd: number, isToner: boolean): string {
  const amount = isToner ? Math.round(usd * 100) / 100 : Math.round(usd);
  const whole = !isToner || Math.abs(amount % 1) < 0.001;
  return `US$ ${amount.toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
}

function formatPenUsdPair(
  usd: number,
  displayCurrency: DisplayCurrency,
  isToner: boolean,
): string {
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const pen = formatPenFromUsdDisplay(usd, isToner ? 'toner' : 'equipos');
  const dollars = formatUsdLabel(usd, isToner);

  if (showPen && showUsd) return `${pen} (${dollars})`;
  if (showPen) return pen;
  return dollars;
}

function normalizeUnitUsd(usd: number, isToner: boolean): number {
  if (isToner) return Math.round(usd * 100) / 100;
  return Math.round(usd);
}

/**
 * Incentivo de compra bajo el precio en dólares.
 * Equipos: lleva 2 c/u con dscto. Tóner: pack de 4 y/o precio mayorista desde 2 unds.
 */
export function resolveVolumeBuyIncentiveLines(input: {
  unitPriceUsd: number;
  isToner?: boolean;
  category?: string | null;
  wholesaleUsd?: number | null;
  displayCurrency: DisplayCurrency;
  dualPriceOrder?: DualPriceOrder;
}): VolumeBuyIncentiveLine[] {
  void input.dualPriceOrder;
  const unitPriceUsd = input.unitPriceUsd;
  if (isPriceOnRequest(unitPriceUsd)) return [];

  const isToner = Boolean(input.isToner || isTonerOrRepuestosCategory(input.category));
  const lines: VolumeBuyIncentiveLine[] = [];

  if (isToner) {
    const packUnitUsd = normalizeUnitUsd(
      discountedUsdPrice(unitPriceUsd, TONER_DISCOUNT_PERCENT),
      true,
    );
    const packTotalUsd = Math.round(packUnitUsd * TONER_QTY * 100) / 100;
    if (packTotalUsd > 0 && packTotalUsd < unitPriceUsd * TONER_QTY) {
      lines.push({
        key: 'toner-pack',
        text: `Lleva ${TONER_QTY} por ${formatPenUsdPair(packTotalUsd, input.displayCurrency, true)}`,
      });
    }

    const wholesaleUsd =
      Number(input.wholesaleUsd ?? 0) > 0
        ? Number(input.wholesaleUsd)
        : Math.round(unitPriceUsd * 0.85 * 100) / 100;
    if (wholesaleUsd > 0 && wholesaleUsd < unitPriceUsd) {
      const wholesaleDisplay = normalizeUnitUsd(wholesaleUsd, true);
      lines.push({
        key: 'wholesale',
        text: `Por Mayor (desde ${WHOLESALE_FROM_UNITS} unds) ${formatPenUsdPair(
          wholesaleDisplay,
          input.displayCurrency,
          true,
        )}`,
      });
    }

    return lines;
  }

  const unitUsd = normalizeUnitUsd(
    discountedUsdPrice(unitPriceUsd, EQUIPMENT_DISCOUNT_PERCENT),
    false,
  );
  if (unitUsd <= 0 || unitUsd >= unitPriceUsd) return [];
  if (usdToPen(unitUsd) >= usdToPen(unitPriceUsd)) return [];

  lines.push({
    key: 'equipment-pack',
    text: `Lleva ${EQUIPMENT_QTY} por ${formatPenUsdPair(unitUsd, input.displayCurrency, false)} c/u · Dscto ${EQUIPMENT_DISCOUNT_PERCENT}%`,
  });

  return lines;
}
