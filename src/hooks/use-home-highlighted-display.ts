import { useMemo, useSyncExternalStore } from 'react';

import type { FeaturedProduct } from '@/data/featured-products';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import {
  buildHomeHighlightedPool,
  homeHighlightedSubtitle,
  resolveHomeHighlightedDisplayProducts,
  type HomeHighlightedDisplayMode,
} from '@/lib/home-highlighted-selection';
import {
  readRecentlyViewedProductIds,
  subscribeRecentlyViewedProducts,
} from '@/lib/recently-viewed-products';
import { productToFeatured } from '@/lib/store-products';

export function useHomeHighlightedDisplay() {
  const query = useHomeCatalogBundle();
  const recentIds = useSyncExternalStore(
    subscribeRecentlyViewedProducts,
    readRecentlyViewedProductIds,
    () => [],
  );

  const resolved = useMemo(() => {
    if (!query.data) {
      return {
        products: [] as FeaturedProduct[],
        mode: 'empty' as HomeHighlightedDisplayMode,
        subtitle: homeHighlightedSubtitle('empty'),
      };
    }

    const pool = buildHomeHighlightedPool(query.data);
    const { products, mode } = resolveHomeHighlightedDisplayProducts(pool, { recentIds });

    return {
      products: products.map((product) =>
        enrichFeaturedFromCatalog({
          ...productToFeatured(product),
          code: product.code ?? null,
        }),
      ),
      mode,
      subtitle: homeHighlightedSubtitle(mode),
    };
  }, [query.data, recentIds.join('|')]);

  return {
    ...query,
    products: resolved.products,
    displayMode: resolved.mode,
    subtitle: resolved.subtitle,
  };
}
