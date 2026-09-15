import { useId, useMemo, useState } from 'react';
import { ChevronDown, Tag } from 'lucide-react';

import { formatPenUsdParenthetical } from '@/lib/display-price';
import {
  parseBulkDiscountRange,
  resolveBulkDiscountPricing,
} from '@/lib/bulk-discount-tiers';
import { cn } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';

interface ProductDetailVolumePurchaseHintProps {
  quantity: number;
  basePriceUsd: number;
  bulkDiscountTiers: BulkDiscountTier[];
  floorPriceUsd?: number;
  equipmentExtrasUsd?: number;
  className?: string;
}

interface VolumeRow {
  key: string;
  label: string;
  priceLabel: string;
  isQuote: boolean;
}

function formatTierQuantityLabel(bounds: { min: number; max: number }, range: string): string {
  if (bounds.max === Number.POSITIVE_INFINITY) {
    return `${bounds.min} o más`;
  }
  if (bounds.min === bounds.max) {
    return `${bounds.min} ${bounds.min === 1 ? 'unidad' : 'unidades'}`;
  }
  if (range.includes('+')) {
    return `${bounds.min} o más`;
  }
  return `${bounds.min} a ${bounds.max} unidades`;
}

function buildVolumeRows(
  basePriceUsd: number,
  tiers: BulkDiscountTier[],
  floorPriceUsd: number,
  equipmentExtrasUsd: number,
): VolumeRow[] {
  const rows: VolumeRow[] = [
    {
      key: '1',
      label: '1 unidad',
      priceLabel: formatPenUsdParenthetical(basePriceUsd + equipmentExtrasUsd),
      isQuote: false,
    },
  ];

  const sorted = [...tiers].sort((a, b) => {
    const aMin = parseBulkDiscountRange(a.range)?.min ?? 0;
    const bMin = parseBulkDiscountRange(b.range)?.min ?? 0;
    return aMin - bMin;
  });

  for (const tier of sorted) {
    const bounds = parseBulkDiscountRange(tier.range);
    if (!bounds) continue;

    const sampleQty = bounds.min;
    const isOpenEnded = bounds.max === Number.POSITIVE_INFINITY || tier.range.includes('+');

    if (isOpenEnded && sampleQty >= 10) {
      rows.push({
        key: tier.range,
        label: `${bounds.min} o más`,
        priceLabel: 'solicitar cotización',
        isQuote: true,
      });
      continue;
    }

    const pricing = resolveBulkDiscountPricing(sampleQty, basePriceUsd, tiers, {
      floorPriceUsd,
    });
    const unitUsd = pricing.unitUsd + equipmentExtrasUsd;

    rows.push({
      key: tier.range,
      label: formatTierQuantityLabel(bounds, tier.range),
      priceLabel: `${formatPenUsdParenthetical(unitUsd)} c/u`,
      isQuote: false,
    });
  }

  return rows;
}

export function ProductDetailVolumePurchaseHint({
  quantity: _quantity,
  basePriceUsd,
  bulkDiscountTiers,
  floorPriceUsd = 0,
  equipmentExtrasUsd = 0,
  className,
}: ProductDetailVolumePurchaseHintProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const rows = useMemo(() => {
    if (bulkDiscountTiers.length === 0) return [];
    return buildVolumeRows(basePriceUsd, bulkDiscountTiers, floorPriceUsd, equipmentExtrasUsd);
  }, [bulkDiscountTiers, basePriceUsd, floorPriceUsd, equipmentExtrasUsd]);

  if (rows.length <= 1) return null;

  const minTier = bulkDiscountTiers
    .map((tier) => parseBulkDiscountRange(tier.range)?.min ?? Number.POSITIVE_INFINITY)
    .reduce((min, value) => Math.min(min, value), Number.POSITIVE_INFINITY);
  const fromQty = Number.isFinite(minTier) ? minTier : 2;

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[0.6875rem] font-medium text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <Tag className="size-3 shrink-0 text-neutral-500" aria-hidden="true" />
        Descuento desde {fromQty} unidades
        <ChevronDown
          className={cn('size-3 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label="Precios por volumen"
          className="absolute left-0 top-full z-20 mt-1.5 w-72 rounded-lg border border-neutral-100 bg-white p-2.5 shadow-md"
        >
          <ul className="space-y-1.5 text-xs text-neutral-700">
            {rows.map((row) => (
              <li key={row.key} className="flex items-baseline justify-between gap-2">
                <span>{row.label}:</span>
                <span
                  className={cn(
                    'shrink-0 font-semibold tabular-nums',
                    row.isQuote ? 'font-normal text-neutral-500' : 'text-[#0f1f3d]',
                  )}
                >
                  {row.priceLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
