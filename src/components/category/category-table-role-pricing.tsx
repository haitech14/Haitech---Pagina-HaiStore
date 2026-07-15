import { cn, formatPenFromUsdPrecise, formatUsd } from '@/lib/utils';
import { CONSULTAR_PRECIO_LABEL, isPriceOnRequest } from '@/lib/display-price';

interface CategoryTableRolePricingProps {
  priceUsd: number;
  className?: string;
}

/** Precio compacto por rol: solo USD y PEN actuales (sin precio comparación tachado). */
export function CategoryTableRolePricing({ priceUsd, className }: CategoryTableRolePricingProps) {
  if (isPriceOnRequest(priceUsd)) {
    return (
      <div className={cn('space-y-0.5 text-right leading-tight', className)}>
        <p className="text-xs font-bold text-foreground">{CONSULTAR_PRECIO_LABEL}</p>
      </div>
    );
  }

  const usd = Math.max(0, priceUsd);

  return (
    <div className={cn('space-y-0.5 text-right tabular-nums leading-tight', className)}>
      <p className="text-xs font-bold text-foreground">{formatUsd(usd)}</p>
      <p className="text-[0.65rem] font-medium text-muted-foreground">
        {formatPenFromUsdPrecise(usd)}
      </p>
    </div>
  );
}
