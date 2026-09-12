import { useDisplayCurrency } from '@/context/display-currency-context';
import { resolveVolumeBuyIncentiveLines } from '@/lib/volume-buy-incentive';
import { cn } from '@/lib/utils';

interface ProductVolumeBuyIncentiveProps {
  unitPriceUsd: number;
  isToner?: boolean;
  category?: string | null;
  wholesaleUsd?: number | null;
  align?: 'start' | 'center';
  className?: string;
}

/** Línea promocional bajo el precio en dólares (pack / mayorista). */
export function ProductVolumeBuyIncentive({
  unitPriceUsd,
  isToner = false,
  category,
  wholesaleUsd,
  align = 'center',
  className,
}: ProductVolumeBuyIncentiveProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const lines = resolveVolumeBuyIncentiveLines({
    unitPriceUsd,
    isToner,
    category,
    wholesaleUsd,
    displayCurrency,
    dualPriceOrder,
  });

  if (lines.length === 0) return null;

  return (
    <div
      className={cn(
        'mt-0.5 flex w-full flex-col gap-px text-[9px] font-semibold leading-snug text-[#E30613] sm:text-[10px]',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {lines.map((line) => (
        <p key={line.key} className="max-w-full text-pretty">
          {line.text}
        </p>
      ))}
    </div>
  );
}
