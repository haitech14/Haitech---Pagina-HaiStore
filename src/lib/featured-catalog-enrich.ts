import type { FeaturedProduct } from '@/data/featured-products';
import { catalogRowToFeatured } from '@/lib/catalog-featured';
import { resolveCatalogRowForProduct, resolveCatalogStock } from '@/lib/catalog-row-lookup';

export function enrichFeaturedFromCatalog(featured: FeaturedProduct): FeaturedProduct {
  const row = resolveCatalogRowForProduct(featured);
  if (!row) return featured;

  const fromCatalog = catalogRowToFeatured(row);
  return {
    ...featured,
    id: row.id,
    ...(fromCatalog.code ? { code: fromCatalog.code } : {}),
    ...(fromCatalog.isNew ? { isNew: true } : {}),
    ...(fromCatalog.oldPrice != null ? { oldPrice: fromCatalog.oldPrice } : {}),
    ...(fromCatalog.discount != null ? { discount: fromCatalog.discount } : {}),
    stock: resolveCatalogStock(row, featured.stock),
  };
}
