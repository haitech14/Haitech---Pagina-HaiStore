import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { DualPrice } from '@/components/product-showcase-card';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import {
  PRODUCT_CARD_DISCOUNT_CLASS,
  PRODUCT_CARD_PRICE_COMPARE_CLASS,
  PRODUCT_CARD_PRICE_FEATURED_CLASS,
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
  /** Vitrina de productos destacados (tipografía de precio más grande). */
  featured?: boolean;
}

export function ProductCardPricing({
  productId,
  priceUsd,
  oldPriceUsd,
  discountPercent,
  penOnly = false,
  featured = false,
}: ProductCardPricingProps) {
  const pricing = resolveProductCardPricing(productId, priceUsd, {
    ...(oldPriceUsd != null ? { oldPrice: oldPriceUsd } : {}),
    ...(discountPercent != null ? { discount: discountPercent } : {}),
  });

  const priceMainClass = featured ? PRODUCT_CARD_PRICE_FEATURED_CLASS : PRODUCT_CARD_PRICE_MAIN_CLASS;

  return (
    <div className="space-y-1">
      <p className={PRODUCT_CARD_PRICE_COMPARE_CLASS}>
        {penOnly ? (
          formatPenStrike(pricing.compareUsd)
        ) : (
          <DualPrice usd={pricing.compareUsd} strikethrough />
        )}
      </p>
      <p className={priceMainClass}>
        {penOnly ? (
          formatPenFromUsd(pricing.currentUsd)
        ) : (
          <AdminRolePricesTooltip
            productId={productId}
            displayUsd={pricing.currentUsd}
            className={priceMainClass}
          />
        )}
      </p>
      <p>
        <span className={PRODUCT_CARD_DISCOUNT_CLASS}>{pricing.discountPercent}% DSCTO</span>
      </p>
    </div>
  );
}
