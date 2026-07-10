import type { FeaturedProduct } from '@/data/featured-products';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { compareProductsBySortOrder } from '@/lib/inventory-product-order';
import {
  isPrinterEquipmentProduct,
  productMatchesCatalogFamily,
  productMatchesCondition,
  type CatalogFamilySlug,
  type ProductCondition,
} from '@/lib/product-condition';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import type { Product } from '@/types/product';
// @ts-expect-error módulo JS compartido sin declaración de tipos
import { isHomeCarouselExcludedProduct } from '../../shared/home-excluded-products.js';

export const FEATURED_CAROUSEL_LIMIT = 8;

export function productToFeatured(product: Product): FeaturedProduct {
  const featured: FeaturedProduct = {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    code: product.code ?? null,
    ...(product.attributes?.length ? { attributes: product.attributes } : {}),
    price: product.price,
    ...(product.prices ? { prices: product.prices } : {}),
    ...(product.price_role ? { price_role: product.price_role } : {}),
    stock: product.stock,
    image: resolveProductImageUrl(product),
    rating: 5,
    reviews: 0,
  };

  const row = product as Product & {
    isNew?: boolean;
    oldPrice?: number;
    discount?: number;
    is_new?: boolean;
    compare_at_price_usd?: number;
  };

  if (row.isNew === true || row.is_new === true) {
    featured.isNew = true;
  }
  const compareAt = row.oldPrice ?? row.compare_at_price_usd;
  if (compareAt != null && compareAt > product.price) {
    featured.oldPrice = compareAt;
    featured.discount = row.discount ?? Math.round((1 - product.price / compareAt) * 100);
  }

  return featured;
}

export function filterStoreProductsByCategories(
  products: Product[],
  categoryLabels: readonly string[],
  limit = 10,
): FeaturedProduct[] {
  return [...products]
    .filter((product) =>
      categoryLabels.some((label) => productMatchesCategoryFilter(product, label)),
    )
    .sort(compareProductsBySortOrder)
    .slice(0, limit)
    .map(productToFeatured);
}

export function filterStoreProductsForHomeSection(
  products: Product[],
  family: CatalogFamilySlug,
  categoryLabels: readonly string[],
  condition: ProductCondition,
  limit = 10,
): FeaturedProduct[] {
  return [...products]
    .filter((product) => {
      if (isHomeCarouselExcludedProduct(product)) return false;
      if (family === 'repuestos' && isPrinterEquipmentProduct(product)) {
        return false;
      }
      const inFamily =
        productMatchesCatalogFamily(product, family) ||
        categoryLabels.some((label) => productMatchesCategoryFilter(product, label));
      return inFamily && productMatchesCondition(product, condition, family);
    })
    .sort(compareProductsBySortOrder)
    .slice(0, limit)
    .map(productToFeatured);
}

export function pickFeaturedByIds(
  products: Product[],
  orderedIds: readonly string[],
): FeaturedProduct[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return orderedIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => product != null)
    .map(productToFeatured);
}

/** Mezcla Fisher–Yates (copia el array de entrada). */
export function shuffleProducts<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Destacados del inicio: `is_featured`, ids configurados y, si faltan,
 * relleno aleatorio con productos reales del catálogo hasta `limit`.
 */
export function resolveStoreFeaturedProducts(
  products: Product[],
  featuredIds: readonly string[],
  limit = FEATURED_CAROUSEL_LIMIT,
): FeaturedProduct[] {
  if (!products.length) return [];

  const byId = new Map(products.map((product) => [product.id, product]));
  const pool: Product[] = [];
  const selectedIds = new Set<string>();

  const addProduct = (product: Product) => {
    if (selectedIds.has(product.id)) return;
    selectedIds.add(product.id);
    pool.push(product);
  };

  for (const product of products) {
    if (product.is_featured === true) addProduct(product);
  }

  for (const id of featuredIds) {
    const product = byId.get(id);
    if (product) addProduct(product);
  }

  if (pool.length < limit) {
    const rest = shuffleProducts(products.filter((product) => !selectedIds.has(product.id)));
    for (const product of rest) {
      if (pool.length >= limit) break;
      addProduct(product);
    }
  }

  return shuffleProducts(pool)
    .slice(0, limit)
    .map(productToFeatured);
}
