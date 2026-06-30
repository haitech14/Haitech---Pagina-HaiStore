import { useMemo, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';

import { CheckoutCartLinePricing } from '@/components/checkout/checkout-cart-line-pricing';
import { AddToCartButton, getAddToCartLabel } from '@/components/cart/add-to-cart-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import { useProductRelated } from '@/hooks/use-product-related';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import {
  buildHomeHighlightedPool,
  resolveHomeHighlightedDisplayProducts,
} from '@/lib/home-highlighted-selection';
import { ProductCardImage } from '@/components/product/product-card-image';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import {
  readRecentlyViewedProductIds,
  subscribeRecentlyViewedProducts,
} from '@/lib/recently-viewed-products';
import type { Product } from '@/types/product';

const MAX_SUGGESTIONS = 4;

interface CheckoutUpsellSectionProps {
  excludeProductIds: string[];
}

function CheckoutUpsellRow({ product }: { product: Product }) {
  const displayPrice = useCatalogDisplayPrice(product);
  const imageUrl = resolveProductImageUrl(product);

  return (
    <li className="flex gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
      <Link
        to={productPath(product)}
        className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-background p-0.5 sm:size-12"
        aria-label={`Ver ficha de ${product.name}`}
      >
        {imageUrl ? (
          <ProductCardImage
            src={imageUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-sm font-bold text-muted-foreground" aria-hidden="true">
            {product.name.charAt(0)}
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <div className="min-w-0 flex-1">
          <Link
            to={productPath(product)}
            className="line-clamp-2 text-xs font-semibold leading-snug text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm sm:line-clamp-3"
          >
            {product.name}
          </Link>
          <CheckoutCartLinePricing
            unitUsd={displayPrice.priceUsd}
            quantity={1}
            compact
            showTotal={false}
            className="mt-0.5"
          />
        </div>
        <AddToCartButton
          product={product}
          size="sm"
          className="h-11 min-h-11 w-full shrink-0 text-xs sm:w-auto sm:min-w-[6.5rem]"
          addOptions={{ openDrawer: false }}
        >
          {getAddToCartLabel(product, 'short')}
        </AddToCartButton>
      </div>
    </li>
  );
}

export function CheckoutUpsellSection({ excludeProductIds }: CheckoutUpsellSectionProps) {
  const excludeSet = useMemo(() => new Set(excludeProductIds), [excludeProductIds.join('|')]);
  const bundleQuery = useHomeCatalogBundle();
  const recentIds = useSyncExternalStore(
    subscribeRecentlyViewedProducts,
    readRecentlyViewedProductIds,
    () => [],
  );

  const primaryProductId = excludeProductIds[0];
  const { data: related = [] } = useProductRelated(primaryProductId, Boolean(primaryProductId));

  const suggestions = useMemo(() => {
    const picked: Product[] = [];
    const seen = new Set<string>();

    const tryAdd = (product: Product) => {
      if (excludeSet.has(product.id) || seen.has(product.id)) return;
      seen.add(product.id);
      picked.push(product);
    };

    if (bundleQuery.data) {
      const pool = buildHomeHighlightedPool(bundleQuery.data);
      const { products: recentProducts } = resolveHomeHighlightedDisplayProducts(pool, { recentIds });
      for (const product of recentProducts) {
        tryAdd(product);
        if (picked.length >= MAX_SUGGESTIONS) break;
      }
    }

    if (picked.length < MAX_SUGGESTIONS) {
      for (const product of related) {
        tryAdd(product);
        if (picked.length >= MAX_SUGGESTIONS) break;
      }
    }

    if (picked.length < MAX_SUGGESTIONS && bundleQuery.data) {
      const pool = buildHomeHighlightedPool(bundleQuery.data);
      for (const product of pool) {
        tryAdd(product);
        if (picked.length >= MAX_SUGGESTIONS) break;
      }
    }

    return picked;
  }, [bundleQuery.data, excludeSet, recentIds.join('|'), related]);

  if (suggestions.length === 0) return null;

  const hasRecent = recentIds.some((id) => !excludeSet.has(id) && suggestions.some((p) => p.id === id));
  const title = hasRecent ? 'No te olvides llevártelo' : 'También te podría interesar';
  const subtitle = hasRecent
    ? 'Productos que viste recientemente'
    : 'Complementa tu pedido con estos productos';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="size-4 text-red-600" aria-hidden="true" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="max-h-[min(24rem,45vh)] overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        <ul className="space-y-1.5" aria-label="Productos sugeridos">
          {suggestions.map((product) => (
            <CheckoutUpsellRow key={product.id} product={product} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
