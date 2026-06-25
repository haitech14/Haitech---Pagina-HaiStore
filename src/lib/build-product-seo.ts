import { resolveAbsoluteImageUrl } from '../../shared/seo/meta.js';
import { buildProductOgProductMeta } from '../../shared/seo/product-seo.js';

import { buildProductPath } from '@/lib/product-slug';
import {
  buildProductJsonLd,
  buildProductMetaDescriptionSeo,
  formatProductPageTitleSeo,
} from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import type { FeaturedProduct } from '@/data/featured-products';
import type { ProductBreadcrumb } from '@/types/product-detail';
import type { Product } from '@/types/product';

export interface ProductSeoOptions {
  featuredMeta?:
    | FeaturedProduct
    | Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'>
    | undefined;
}

export function buildProductSeoConfig(
  product: Product,
  breadcrumbs: ProductBreadcrumb[] = [],
  options: ProductSeoOptions = {},
) {
  const pathname = buildProductPath(product);
  const canonical = buildAbsoluteUrl(pathname);
  const image = resolveAbsoluteImageUrl(product.image_url, SITE_ORIGIN);
  const featuredMeta = options.featuredMeta;

  const jsonLdOptions =
    featuredMeta && featuredMeta.reviews > 0
      ? { rating: featuredMeta.rating, reviewCount: featuredMeta.reviews }
      : {};

  return {
    title: formatProductPageTitleSeo(product),
    description: buildProductMetaDescriptionSeo(product),
    canonical,
    image,
    imageAlt: product.name,
    ogType: 'product' as const,
    robots: 'index,follow' as const,
    ogProduct: buildProductOgProductMeta(product),
    jsonLd: buildProductJsonLd(product, SITE_ORIGIN, breadcrumbs, jsonLdOptions),
  };
}
