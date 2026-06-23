import type { ReactNode } from 'react';

import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ViewAsRoleBadge } from '@/components/product/view-as-role-badge';
import { ViewAsRolePrices } from '@/components/product/view-as-role-prices';
import type { CatalogDisplayPrice } from '@/hooks/use-catalog-display-price';

interface CatalogPreviewPriceBlockProps {
  productId: string;
  displayPrice: CatalogDisplayPrice;
  featured?: boolean;
  penOnly?: boolean;
  variant?: 'card' | 'table';
  oldPriceUsd?: number;
  discountPercent?: number;
  badgeClassName?: string;
  rolePricesClassName?: string;
}

/** Precio de tarjeta con soporte para vista previa multi-rol (admin). */
export function CatalogPreviewPriceBlock({
  productId,
  displayPrice,
  featured = false,
  penOnly = false,
  variant = 'card',
  oldPriceUsd,
  discountPercent,
  badgeClassName,
  rolePricesClassName,
}: CatalogPreviewPriceBlockProps) {
  if (displayPrice.viewAsRolePrices.length > 1) {
    return (
      <>
        <ViewAsRoleBadge
          labels={displayPrice.viewAsRolePrices.map((line) => line.label)}
          {...(badgeClassName ? { className: badgeClassName } : {})}
        />
        <ViewAsRolePrices
          rolePrices={displayPrice.viewAsRolePrices}
          alwaysBoth={featured}
          compact
          {...(rolePricesClassName ? { className: rolePricesClassName } : {})}
        />
      </>
    );
  }

  return (
    <>
      {displayPrice.viewAsLabel ? (
        <ViewAsRoleBadge
          label={displayPrice.viewAsLabel}
          {...(badgeClassName ? { className: badgeClassName } : {})}
        />
      ) : null}
      <ProductCardPricing
        productId={productId}
        priceUsd={displayPrice.priceUsd}
        featured={featured}
        penOnly={penOnly}
        variant={variant}
        {...(oldPriceUsd != null ? { oldPriceUsd } : {})}
        {...(discountPercent != null ? { discountPercent } : {})}
      />
    </>
  );
}

interface CatalogPreviewDualPriceBlockProps {
  displayPrice: CatalogDisplayPrice;
  alwaysBoth?: boolean;
  priceClassName?: string;
  badgeClassName?: string;
  children: (priceUsd: number) => ReactNode;
}

/** Bloque con precios multi-rol o un único precio renderizado por el padre. */
export function CatalogPreviewDualPriceBlock({
  displayPrice,
  alwaysBoth = false,
  priceClassName,
  badgeClassName,
  children,
}: CatalogPreviewDualPriceBlockProps) {
  if (displayPrice.viewAsRolePrices.length > 1) {
    return (
      <>
        <ViewAsRoleBadge
          labels={displayPrice.viewAsRolePrices.map((line) => line.label)}
          {...(badgeClassName ? { className: badgeClassName } : {})}
        />
        <ViewAsRolePrices
          rolePrices={displayPrice.viewAsRolePrices}
          alwaysBoth={alwaysBoth}
          compact
          {...(priceClassName ? { className: priceClassName } : {})}
        />
      </>
    );
  }

  return (
    <>
      {displayPrice.viewAsLabel ? (
        <ViewAsRoleBadge
          label={displayPrice.viewAsLabel}
          {...(badgeClassName ? { className: badgeClassName } : {})}
        />
      ) : null}
      {children(displayPrice.priceUsd)}
    </>
  );
}
