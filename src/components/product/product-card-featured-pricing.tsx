import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { useDisplayCurrency } from '@/context/display-currency-context';
import {
  CONSULTAR_PRECIO_LABEL,
  getDisplayPriceVisibility,
  isPriceOnRequest,
} from '@/lib/display-price';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';

const FEATURED_PRICE_COMPARE_CLASS =
  'text-[0.6875rem] font-normal tabular-nums text-[#9aa3b2] line-through decoration-[#9aa3b2] decoration-solid sm:text-[0.75rem]';

const FEATURED_PRICE_CURRENT_CLASS =
  'text-sm font-bold tabular-nums leading-tight text-[#111111] sm:text-base';
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
  className?: string;
}

/** Precio dual USD · PEN para vitrinas del home (línea tachada arriba + precio actual abajo). */
export function ProductCardFeaturedPricing({
  currentUsd,
  compareUsd,
  productId,
  showAccentBar = true,
  className,
}: ProductCardFeaturedPricingProps) {
  const { displayCurrency } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);

  if (isPriceOnRequest(currentUsd)) {
    return (
      <div className={cn('space-y-0.5', className)}>
        <p className={FEATURED_PRICE_CURRENT_CLASS}>{CONSULTAR_PRECIO_LABEL}</p>
      </div>
    );
  }

  const showBoth = showUsd && showPen;
  const hasDiscount = compareUsd > currentUsd && currentUsd > 0;

  const currentPrice = showBoth ? (
    <FeaturedDualCurrencyLine
      usd={currentUsd}
      usdClassName="text-[#111111]"
      penClassName="text-red-600"
      separatorClassName="font-normal text-[#888888]"
    />
  ) : (
    <FeaturedSingleCurrencyLine
      usd={currentUsd}
      className={showPen ? 'text-red-600' : 'text-[#111111]'}
    />
  );

  return (
    <div className={cn('space-y-0.5', className)}>
      <p className={FEATURED_PRICE_CURRENT_CLASS}>
        {productId ? (
          <AdminRolePricesTooltip productId={productId} displayUsd={currentUsd}>
            {currentPrice}
          </AdminRolePricesTooltip>
        ) : (
          currentPrice
        )}
      </p>
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
