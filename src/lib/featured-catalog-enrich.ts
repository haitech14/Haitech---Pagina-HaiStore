import type { FeaturedProduct } from '@/data/featured-products';
import { catalogRowToFeatured, getCatalogProductById } from '@/lib/catalog-featured';

export function enrichFeaturedFromCatalog(featured: FeaturedProduct): FeaturedProduct {
  const row = getCatalogProductById(featured.id);
  if (!row) return featured;

  const fromCatalog = catalogRowToFeatured(row);
  return {
    ...featured,
    ...(fromCatalog.isNew ? { isNew: true } : {}),
    ...(fromCatalog.oldPrice != null ? { oldPrice: fromCatalog.oldPrice } : {}),
    ...(fromCatalog.discount != null ? { discount: fromCatalog.discount } : {}),
  };
}
