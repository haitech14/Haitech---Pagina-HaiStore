import { DualPrice } from '@/components/product/product-dual-price';
import type { CatalogRolePriceLine } from '@/hooks/use-catalog-display-price';
import { cn } from '@/lib/utils';

interface ViewAsRolePricesProps {
  rolePrices: readonly CatalogRolePriceLine[];
  className?: string;
  /** Vitrina destacada: USD y PEN con guion. */
  alwaysBoth?: boolean;
  /** Tipografía compacta para tarjetas pequeñas. */
  compact?: boolean;
}

/** Precios apilados por rol en vista previa admin (multi-selección). */
export function ViewAsRolePrices({
  rolePrices,
  className,
  alwaysBoth = false,
  compact = false,
}: ViewAsRolePricesProps) {
  if (rolePrices.length <= 1) return null;

  return (
    <ul className={cn('space-y-0.5', className)} aria-label="Precios por rol seleccionado">
      {rolePrices.map((line) => (
        <li
          key={line.role}
          className={cn(
            'flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0',
            compact ? 'text-[0.625rem] leading-tight sm:text-[0.6875rem]' : 'text-[0.6875rem] sm:text-xs',
          )}
        >
          <span className="shrink-0 font-semibold text-orange-800">{line.label}:</span>
          <DualPrice
            usd={line.priceUsd}
            alwaysBoth={alwaysBoth}
            className="min-w-0 font-bold tabular-nums text-foreground"
          />
        </li>
      ))}
    </ul>
  );
}
