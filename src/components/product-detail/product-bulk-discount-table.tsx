import { useId, useState } from 'react';
import { ChevronDown, Tag } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ensureFullPrices } from '@/lib/roles';
import {
  resolveBulkDiscountTierForQuantity,
  resolveEffectiveBulkDiscountTier,
} from '@/lib/bulk-discount-tiers';
import { cn } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductBulkDiscountTableProps {
  product: Product;
  tiers: BulkDiscountTier[];
  className?: string;
  defaultOpen?: boolean;
  /** Cantidad actual para resaltar el tramo aplicable. */
  quantity?: number;
  /** Sin borde/radio exterior; cabecera suave para incrustar en el bloque de compra. */
  embedded?: boolean;
}

export function ProductBulkDiscountTable({
  product,
  tiers,
  className,
  defaultOpen = false,
  quantity = 1,
  embedded = false,
}: ProductBulkDiscountTableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  if (tiers.length === 0) return null;

  const fullPrices = ensureFullPrices(
    product.prices ? product.prices : { public: product.price },
  );
  const basePriceUsd = fullPrices.public;
  const floorPriceUsd = fullPrices.tecnico;
  const activeTier = resolveBulkDiscountTierForQuantity(quantity, tiers);

  return (
    <div
      className={cn(
        'overflow-hidden text-xs sm:text-[0.8125rem]',
        embedded
          ? 'border-b border-border/60'
          : 'rounded-md border border-red-600/25',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
          embedded
            ? 'bg-red-50 text-red-600 hover:bg-red-100/80'
            : 'bg-red-600 text-white hover:bg-red-500',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {embedded ? (
            <Tag className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
          ) : null}
          <span className="text-[0.6875rem] font-bold tracking-wide sm:text-xs">
            Descuentos por volumen
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform',
            embedded ? 'text-red-600' : 'text-white',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <div id={panelId} hidden={!open} className={cn(!open && 'hidden')}>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Descuentos por volumen</caption>
          <thead className="bg-red-600 text-white">
            <tr>
              <th scope="col" className="px-3 py-2 text-[0.6875rem] font-bold sm:text-xs">
                Cantidad
              </th>
              <th scope="col" className="px-3 py-2 text-[0.6875rem] font-bold sm:text-xs">
                Descuento
              </th>
              <th scope="col" className="px-3 py-2 text-[0.6875rem] font-bold sm:text-xs">
                Precio por unidad
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => {
              const effective = resolveEffectiveBulkDiscountTier(
                tier,
                basePriceUsd,
                floorPriceUsd,
              );

              return (
                <tr
                  key={tier.range}
                  className={cn(
                    'bg-white text-red-600',
                    index > 0 && 'border-t border-red-600/20',
                    activeTier?.range === tier.range && 'bg-red-50',
                  )}
                >
                  <td className="px-3 py-2 font-semibold">{tier.range}</td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-red-600"
                      title={
                        effective.cappedByTecnico
                          ? 'Descuento limitado al precio técnico'
                          : undefined
                      }
                    >
                      {effective.discount}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-bold">
                    <DualPrice
                      usd={effective.unitUsd}
                      className="text-xs font-bold text-red-600 sm:text-[0.8125rem]"
                    />
                    <span className="sr-only">{effective.unitUsd} dólares por unidad</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
