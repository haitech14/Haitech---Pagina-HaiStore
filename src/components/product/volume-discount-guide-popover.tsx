import { useState } from 'react';
import { Droplets, Headset, Package, X } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  DEFAULT_BULK_DISCOUNT_TIERS,
  parseBulkDiscountRange,
} from '@/lib/bulk-discount-tiers';
import { cn } from '@/lib/utils';

function formatQuantityLabel(range: string): string {
  const bounds = parseBulkDiscountRange(range);
  if (!bounds) return range;
  if (range.includes('+')) return `${bounds.min}+ unidades`;
  if (bounds.min === bounds.max) {
    return `${bounds.min} ${bounds.min === 1 ? 'unidad' : 'unidades'}`;
  }
  return `${bounds.min}–${bounds.max} unidades`;
}

/** Píldora roja (caja + gota) que abre la guía de descuentos por volumen. */
export function VolumeDiscountGuidePopover({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const settingsQuery = useCompanySettings();
  const tiers = settingsQuery.data?.bulkDiscountTiers ?? DEFAULT_BULK_DISCOUNT_TIERS;

  const rows = [
    { id: '1', quantityLabel: '1 unidad', discountPercent: 0 },
    ...tiers.map((tier) => ({
      id: tier.range,
      quantityLabel: formatQuantityLabel(tier.range),
      discountPercent: tier.discountPercent,
    })),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 items-center gap-1 rounded-full border border-[#E30613] bg-[#E30613] px-2.5 text-white shadow-sm sm:h-10 sm:px-3',
            'transition-colors hover:bg-[#c90511]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
            className,
          )}
          aria-label="Ver descuentos por volumen"
          title="Descuentos por volumen"
          aria-expanded={open}
        >
          <Package className="size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          <Droplets className="size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
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
                      <span className="text-[13px] font-semibold text-[#374151]">
                        {row.discountPercent > 0
                          ? 'Precio con descuento'
                          : 'Precio de lista'}
                      </span>
                      {row.discountPercent > 0 ? (
                        <span className="inline-flex rounded-full bg-[#E30613] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          -{Math.round(row.discountPercent)}%
                        </span>
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
