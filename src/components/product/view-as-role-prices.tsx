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

/** Precios por rol en fila: etiqueta a la izquierda, precio a la derecha. */
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
            'flex items-baseline justify-between gap-x-2',
            compact ? 'text-[0.625rem] leading-tight sm:text-[0.6875rem]' : 'text-[0.6875rem] sm:text-xs',
          )}
        >
          <span className="shrink-0 font-semibold uppercase tracking-wide text-muted-foreground">
            {line.label}
          </span>
          <DualPrice
            usd={line.priceUsd}
            alwaysBoth={alwaysBoth}
            className="min-w-0 shrink-0 font-bold tabular-nums text-right"
          />
        </li>
      ))}
    </ul>
  );
}
