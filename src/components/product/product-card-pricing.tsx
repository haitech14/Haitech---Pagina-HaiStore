import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { DualPrice } from '@/components/product-showcase-card';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import {
  PRODUCT_CARD_DISCOUNT_CLASS,
  PRODUCT_CARD_PRICE_COMPARE_CLASS,
  PRODUCT_CARD_PRICE_MAIN_CLASS,
} from '@/lib/product-card-title';
import { formatPenFromUsd, usdToPen } from '@/lib/utils';

function formatPenStrike(usd: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdToPen(usd));
}

interface ProductCardPricingProps {
  productId: string;
  priceUsd: number;
  oldPriceUsd?: number;
  discountPercent?: number;
  /** Solo soles (ofertas relámpago). */
  penOnly?: boolean;
}

export function ProductCardPricing({
  productId,
  priceUsd,
  oldPriceUsd,
  discountPercent,
  penOnly = false,
}: ProductCardPricingProps) {
  const pricing = resolveProductCardPricing(productId, priceUsd, {
    ...(oldPriceUsd != null ? { oldPrice: oldPriceUsd } : {}),
    ...(discountPercent != null ? { discount: discountPercent } : {}),
  });

  return (
    <div className="space-y-0.5">
      <p className={PRODUCT_CARD_PRICE_COMPARE_CLASS}>
        {penOnly ? formatPenStrike(pricing.compareUsd) : <DualPrice usd={pricing.compareUsd} />}
      </p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className={PRODUCT_CARD_PRICE_MAIN_CLASS}>
          {penOnly ? (
            formatPenFromUsd(pricing.currentUsd)
          ) : (
            <AdminRolePricesTooltip
              productId={productId}
              displayUsd={pricing.currentUsd}
              className={PRODUCT_CARD_PRICE_MAIN_CLASS}
            />
          )}
        </p>
        <span className={PRODUCT_CARD_DISCOUNT_CLASS}>{pricing.discountPercent}% DSCTO</span>
      </div>
    </div>
  );
}
