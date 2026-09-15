import { useMemo, useState } from 'react';
import { Building2, Droplets, Headset, Info, Package, X } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  DEFAULT_BULK_DISCOUNT_TIERS,
  formatUsdLessPerUnit,
  parseBulkDiscountRange,
  resolveEffectiveBulkDiscountTier,
} from '@/lib/bulk-discount-tiers';
import { resolveProductBulkDiscountTiers } from '@/lib/product-bulk-discount';
import { formatDisplayPriceFromUsd } from '@/lib/display-price';
import { ensureFullPrices } from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductVolumeDiscountPopoverProps {
  product: Product;
  tiers?: BulkDiscountTier[];
  className?: string;
  /** Disparador compacto (píldora roja con iconos) o barra «precios especiales». */
  triggerVariant?: 'pill' | 'banner';
}

function formatQuantityLabel(range: string): string {
  const bounds = parseBulkDiscountRange(range);
  if (!bounds) return range;
  if (range.includes('+')) {
    return `${bounds.min}+ unidades`;
  }
  if (bounds.min === bounds.max) {
    return `${bounds.min} ${bounds.min === 1 ? 'unidad' : 'unidades'}`;
  }
  return `${bounds.min}–${bounds.max} unidades`;
}

export function ProductVolumeDiscountPopover({
  product,
  tiers: tiersProp,
  className,
  triggerVariant = 'pill',
}: ProductVolumeDiscountPopoverProps) {
  const [open, setOpen] = useState(false);
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const settingsQuery = useCompanySettings();
  const tiers =
    tiersProp ??
    resolveProductBulkDiscountTiers(product, settingsQuery.data?.bulkDiscountTiers ?? DEFAULT_BULK_DISCOUNT_TIERS);

  const fullPrices = ensureFullPrices(
    product.prices ? product.prices : { public: product.price },
  );
  const basePriceUsd = fullPrices.public;
  const floorPriceUsd = fullPrices.tecnico;

  const rows = useMemo(() => {
    const baseRow = {
      id: '1',
      quantityLabel: '1 unidad',
      unitLabel: formatDisplayPriceFromUsd(basePriceUsd, displayCurrency, dualPriceOrder),
      savingsLabel: null as string | null,
    };

    const tierRows = tiers.map((tier) => {
      const effective = resolveEffectiveBulkDiscountTier(tier, basePriceUsd, floorPriceUsd);
      const savingsUsd = Math.max(0, Math.round((basePriceUsd - effective.unitUsd) * 100) / 100);
      return {
        id: tier.range,
        quantityLabel: formatQuantityLabel(tier.range),
        unitLabel: formatDisplayPriceFromUsd(effective.unitUsd, displayCurrency, dualPriceOrder),
        savingsLabel: savingsUsd > 0.001 ? formatUsdLessPerUnit(savingsUsd) : null,
      };
    });

    return [baseRow, ...tierRows];
  }, [tiers, basePriceUsd, floorPriceUsd, displayCurrency, dualPriceOrder]);

  if (tiers.length === 0 || basePriceUsd <= 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerVariant === 'banner' ? (
          <button
            type="button"
            className={cn(
              'inline-flex w-full max-w-full items-center gap-2 rounded-lg bg-[#FFF1F2] px-2.5 py-2 text-left',
              'transition-colors hover:bg-[#FFE4E6]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
              className,
            )}
            aria-label="Ver descuentos por volumen"
          >
            <Building2 className="size-4 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden />
            <span className="min-w-0 flex-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#E30613] sm:text-[11px]">
              Precios especiales por volumen
            </span>
            <Info className="size-4 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-full bg-[#E30613] px-2.5 text-white shadow-sm',
              'transition-colors hover:bg-[#c90511]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
              className,
            )}
            aria-label="Ver descuentos por volumen"
            title="Descuentos por volumen"
          >
            <Package className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
            <Droplets className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="center"
        side="top"
        sideOffset={8}
        className="w-[min(100vw-1.5rem,22rem)] border-[#E5E7EB] p-0 shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#F3F4F6] px-4 pb-3 pt-4">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[#111]">Descuentos por volumen</h3>
            <p className="mt-1 text-[12px] leading-snug text-[#6B7280]">
              Aprovecha nuestros precios especiales para compras corporativas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40"
            aria-label="Cerrar descuentos por volumen"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="px-4 py-3">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Tabla de descuentos por volumen</caption>
            <thead>
              <tr className="border-b border-[#F3F4F6] text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                <th scope="col" className="pb-2 pr-2 font-semibold">
                  Cantidad
                </th>
                <th scope="col" className="pb-2 text-right font-semibold">
                  Precio por unidad
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#F3F4F6] last:border-0">
                  <td className="py-2.5 pr-2 text-[13px] font-semibold text-[#111]">
                    {row.quantityLabel}
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
                      <span className="text-[13px] font-bold tabular-nums text-[#111]">
                        {row.unitLabel}
                      </span>
                      {row.savingsLabel ? (
                        <span className="text-[10px] font-bold text-[#E30613]">{row.savingsLabel}</span>
                      ) : null}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-xl bg-[#FFF1F2] px-3 py-2.5">
          <Headset className="mt-0.5 size-4 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden />
          <p className="text-[12px] leading-snug text-[#374151]">
            ¿Necesitas una cotización personalizada? Contáctanos y te asesoramos.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
