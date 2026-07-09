import { FEATURED_PRODUCT_IDS } from '@/data/featured-products';
import type { FeaturedProduct } from '@/data/featured-products';
import type { CatalogRow } from '@/lib/catalog-featured';
import { usdToPen } from '@/lib/utils';
import type { ProductAttribute } from '@/types/product';

/** Umbral de envío gratis en Lima (alineado con `HEADER_TOPBAR_PROMO_TEXT`). */
export const LIMA_FREE_SHIPPING_MIN_PEN = 299;

/** Reseñas mínimas en vitrina para considerar un producto «más vendido». */
const BEST_SELLER_MIN_REVIEWS = 20;

/** Visitas mínimas en catálogo para «más vendido» cuando hay datos reales. */
const BEST_SELLER_MIN_VIEW_COUNT = 5;

export type HomeLandingPromoBadgeId = 'free-shipping' | 'best-seller';

export const HOME_LANDING_PROMO_BADGE_LABELS: Record<HomeLandingPromoBadgeId, string> = {
  'free-shipping': 'ENVÍO GRATIS',
  'best-seller': 'MÁS VENDIDO',
};

function normalizeAttributeHaystack(attributes: ProductAttribute[] | undefined): string {
  if (!attributes?.length) return '';
  return attributes.map((attr) => `${attr.name} ${attr.value}`).join(' ').toLowerCase();
}

function attributeSignalsFreeShipping(attributes: ProductAttribute[] | undefined): boolean {
  const haystack = normalizeAttributeHaystack(attributes);
  if (!haystack) return false;
  return (
    haystack.includes('envío gratis') ||
    haystack.includes('envio gratis') ||
    haystack.includes('free shipping')
  );
}

function attributeSignalsBestSeller(attributes: ProductAttribute[] | undefined): boolean {
  const haystack = normalizeAttributeHaystack(attributes);
  if (!haystack) return false;
  return (
    haystack.includes('más vendido') ||
    haystack.includes('mas vendido') ||
    haystack.includes('best seller') ||
    haystack.includes('bestseller')
  );
}

export function productQualifiesForFreeShipping(
  priceUsd: number,
  catalogProduct?: Pick<CatalogRow, 'attributes'> | null,
): boolean {
  if (attributeSignalsFreeShipping(catalogProduct?.attributes)) return true;
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) return false;
  return usdToPen(priceUsd) >= LIMA_FREE_SHIPPING_MIN_PEN;
}

export function productQualifiesForBestSeller(
  product: Pick<FeaturedProduct, 'id' | 'reviews'>,
  catalogProduct?: Pick<CatalogRow, 'is_featured' | 'view_count' | 'attributes'> | null,
): boolean {
  if (attributeSignalsBestSeller(catalogProduct?.attributes)) return true;
  if (catalogProduct?.is_featured === true) return true;

  const viewCount = catalogProduct?.view_count ?? 0;
  if (viewCount >= BEST_SELLER_MIN_VIEW_COUNT) return true;

  const reviews = product.reviews ?? 0;
  if (reviews >= BEST_SELLER_MIN_REVIEWS) return true;

  const featuredIndex = FEATURED_PRODUCT_IDS.indexOf(product.id);
  return featuredIndex >= 0 && featuredIndex < 5 && reviews >= 15;
}

export function resolveHomeLandingProductBadges(input: {
  product: FeaturedProduct;
  priceUsd: number;
  catalogProduct?: CatalogRow | null;
}): HomeLandingPromoBadgeId[] {
  const badges: HomeLandingPromoBadgeId[] = [];

  if (productQualifiesForFreeShipping(input.priceUsd, input.catalogProduct)) {
    badges.push('free-shipping');
  }

  if (productQualifiesForBestSeller(input.product, input.catalogProduct)) {
    badges.push('best-seller');
  }

  return badges;
}
