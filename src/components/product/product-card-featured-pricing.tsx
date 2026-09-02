import { useDisplayCurrency } from '@/context/display-currency-context';
import {
  CONSULTAR_PRECIO_LABEL,
  getDisplayPriceVisibility,
  isPriceOnRequest,
} from '@/lib/display-price';
import { cn, formatPenFromUsd, formatUsd, formatEquipmentUsd } from '@/lib/utils';

const FEATURED_PRICE_COMPARE_CLASS =
  'text-[0.75rem] font-normal tabular-nums text-[#9aa3b2] line-through decoration-[#9aa3b2] decoration-solid sm:text-[0.8125rem]';

const FEATURED_PRICE_CURRENT_CLASS =
  'text-sm font-semibold tabular-nums leading-tight text-[#111111] sm:text-[0.9375rem]';

const FEATURED_PRICE_CURRENT_ACCENT_CLASS =
  'text-sm font-semibold tabular-nums leading-tight text-[#E30613] sm:text-[0.9375rem]';

function formatFeaturedUsdLabel(usd: number): string {
  const normalized = Math.round(usd * 100) / 100;
  if (Math.abs(normalized % 1) < 0.001) {
    return formatEquipmentUsd(normalized).replace('$', 'US$ ');
  }
  return `US$ ${normalized.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function FeaturedDualCurrencyLine({
  usd,
  usdClassName,
  penClassName,
  separatorClassName = 'text-[#888888]',
  strikethrough = false,
}: {
  usd: number;
  usdClassName: string;
  penClassName: string;
  separatorClassName?: string;
  strikethrough?: boolean;
}) {
  const { dualPriceOrder } = useDisplayCurrency();
  const penFirst = dualPriceOrder === 'pen-usd';
  const strike = strikethrough
    ? 'line-through decoration-[#888888] decoration-solid'
    : undefined;

  const usdSpan = (
    <span className={cn(usdClassName, strike)}>{formatUsd(usd)}</span>
  );
  const penSpan = (
    <span className={cn(penClassName, strike)}>{formatPenFromUsd(usd)}</span>
  );
  const separator = (
    <span className={cn('font-normal', separatorClassName)} aria-hidden="true">
      ·
    </span>
  );

  return (
    <span className="inline-flex flex-nowrap items-baseline gap-2 whitespace-nowrap">
      {penFirst ? (
        <>
          {penSpan}
          {separator}
          {usdSpan}
        </>
      ) : (
        <>
          {usdSpan}
          {separator}
          {penSpan}
        </>
      )}
    </span>
  );
}

function FeaturedSingleCurrencyLine({
  usd,
  className,
  strikethrough = false,
}: {
  usd: number;
  className: string;
  strikethrough?: boolean;
}) {
  const { displayCurrency } = useDisplayCurrency();
  const { showPen } = getDisplayPriceVisibility(displayCurrency);
  const strike = strikethrough
    ? 'line-through decoration-[#888888] decoration-solid'
    : undefined;

  return (
    <span className={cn(className, strike)}>
      {showPen ? formatPenFromUsd(usd) : formatUsd(usd)}
    </span>
  );
}

export interface ProductCardFeaturedPricingProps {
  currentUsd: number;
  compareUsd: number;
  productId?: string;
  /** Barra verde bajo el precio cuando hay descuento. */
  showAccentBar?: boolean;
  /** Precio vigente en US$ rojo (vitrina / mockup). */
  accentUsd?: boolean;
  className?: string;
}

/** Precio dual USD · PEN para vitrinas del home (línea tachada arriba + precio actual abajo). */
export function ProductCardFeaturedPricing({
  currentUsd,
  compareUsd,
  productId,
  showAccentBar = true,
  accentUsd = false,
  className,
}: ProductCardFeaturedPricingProps) {
  const { displayCurrency } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);

  if (isPriceOnRequest(currentUsd)) {
    return (
      <div className={cn('space-y-0.5', className)}>
        <p className="text-xs font-semibold leading-tight text-[#6B7280] sm:text-sm">
          {CONSULTAR_PRECIO_LABEL}
        </p>
      </div>
    );
  }

  const hasDiscount = compareUsd > currentUsd && currentUsd > 0;

  if (accentUsd) {
    const discountPct = hasDiscount
      ? Math.round((1 - currentUsd / compareUsd) * 100)
      : 0;
    const currentPrice = (
      <span className="text-[#E30613]">{formatFeaturedUsdLabel(currentUsd)}</span>
    );
    return (
      <div className={cn('space-y-0.5', className)}>
        {hasDiscount ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.75rem] font-normal tabular-nums text-[#9aa3b2] line-through decoration-[#9aa3b2] sm:text-[0.8125rem]">
              {formatFeaturedUsdLabel(compareUsd)}
            </span>
            {discountPct > 0 ? (
              <span className="inline-flex rounded-full bg-[#E30613] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                {discountPct}% DSCT
              </span>
            ) : null}
          </div>
        ) : null}
        <p className={FEATURED_PRICE_CURRENT_ACCENT_CLASS}>{currentPrice}</p>
        {hasDiscount && showAccentBar ? (
          <span
            className="mt-1 block h-0.5 w-8 rounded-full bg-[#16A34A]"
            aria-hidden="true"
          />
        ) : null}
      </div>
    );
  }

  const showBoth = showUsd && showPen;

  const currentPrice = showBoth ? (
    <FeaturedDualCurrencyLine
      usd={currentUsd}
      usdClassName="text-[#111111]"
      penClassName="text-[#111111]"
      separatorClassName="font-normal text-[#888888]"
    />
  ) : (
    <FeaturedSingleCurrencyLine
      usd={currentUsd}
      className="text-[#111111]"
    />
  );

  return (
    <div className={cn('space-y-0.5', className)}>
      <p className={FEATURED_PRICE_CURRENT_CLASS}>{currentPrice}</p>
      {hasDiscount ? (
        <p className={FEATURED_PRICE_COMPARE_CLASS}>
          {showBoth ? (
            <FeaturedDualCurrencyLine
              usd={compareUsd}
              usdClassName="text-[#888888]"
              penClassName="text-[#888888]"
              strikethrough
            />
          ) : (
            <FeaturedSingleCurrencyLine
              usd={compareUsd}
              className="text-[#888888]"
              strikethrough
            />
          )}
        </p>
      ) : null}
      {hasDiscount && showAccentBar ? (
        <span
          className="mt-1 block h-0.5 w-8 rounded-full bg-[#16A34A]"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
