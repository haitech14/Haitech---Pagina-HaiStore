import type { FeaturedProduct } from '@/data/featured-products';
import { getCatalogProductById } from '@/lib/catalog-featured';
import type { HomeCatalogBundleResponse } from '@/lib/home-catalog-bundle';
import {
  HOME_HIGHLIGHTED_ROW_SIZE,
  MIN_HOME_FEATURED,
} from '@/lib/home-featured-products';
import { readRecentlyViewedProductIds } from '@/lib/recently-viewed-products';
import { ensureFullPrices } from '@/lib/roles';
import type { Product } from '@/types/product';
// @ts-expect-error módulo JS compartido sin declaración de tipos
import { isHomeCarouselExcludedProduct } from '../../shared/home-excluded-products.js';

export const HOME_HIGHLIGHTED_DISPLAY_LIMIT = 10;

export type HomeHighlightedDisplayMode = 'recent' | 'empty';

function isEligibleHighlightProduct(product: Product): boolean {
  return (
    product.stock > 0 &&
    product.price > 0 &&
    !isHomeCarouselExcludedProduct(product)
  );
}

function featuredToPoolProduct(featured: FeaturedProduct): Product {
  const catalog = getCatalogProductById(featured.id);
  const stock = catalog?.stock ?? 0;
  const prices = featured.prices ?? catalog?.prices ?? ensureFullPrices({ public: featured.price });

  const product: Product = {
    id: featured.id,
    name: featured.name,
    code: featured.code ?? catalog?.code ?? null,
    description: catalog?.description ?? null,
    price: featured.price,
    prices,
    currency: 'USD',
    image_url: featured.image,
    stock,
    category: featured.category,
    brand: featured.brand ?? catalog?.brand ?? null,
    attributes: featured.attributes ?? catalog?.attributes ?? [],
    sort_order: catalog?.sort_order ?? 0,
    is_featured: catalog?.is_featured === true,
    view_count: catalog?.view_count ?? 0,
    price_role: featured.price_role ?? 'public',
    created_at: catalog?.created_at ?? new Date(0).toISOString(),
  };

  if (catalog?.gallery?.length) {
    product.gallery = catalog.gallery;
  }

  return product;
}

/** Pool de productos en stock del bundle de inicio (todas las familias). */
export function buildHomeHighlightedPool(bundle: HomeCatalogBundleResponse): Product[] {
  const byId = new Map<string, Product>();

  for (const product of bundle.featured) {
    if (isEligibleHighlightProduct(product)) {
      byId.set(product.id, product);
    }
  }

  for (const section of bundle.sections) {
    for (const items of Object.values(section.productsByCondition)) {
      for (const featured of items ?? []) {
        if (byId.has(featured.id)) continue;
        const product = featuredToPoolProduct(featured);
        if (isEligibleHighlightProduct(product)) {
          byId.set(product.id, product);
        }
      }
    }
  }

  return [...byId.values()];
}

export function resolveHomeHighlightedDisplayProducts(
  pool: Product[],
  {
    limit = HOME_HIGHLIGHTED_DISPLAY_LIMIT,
    recentIds = readRecentlyViewedProductIds(),
  }: {
    limit?: number;
    recentIds?: string[];
  } = {},
): { products: Product[]; mode: HomeHighlightedDisplayMode } {
  if (recentIds.length === 0) {
    return { products: [], mode: 'empty' };
  }

  const eligible = pool.filter(isEligibleHighlightProduct);
  const byId = new Map(eligible.map((product) => [product.id, product]));

  const fromRecent: Product[] = [];
  for (const id of recentIds) {
    const product = byId.get(id);
    if (!product) continue;
    fromRecent.push(product);
    if (fromRecent.length >= limit) break;
  }

  if (fromRecent.length === 0) {
    return { products: [], mode: 'empty' };
  }

  return { products: fromRecent, mode: 'recent' };
}

export function homeHighlightedSubtitle(mode: HomeHighlightedDisplayMode): string {
  if (mode === 'recent') {
    return 'Retoma donde lo dejaste';
  }
  return 'Cuando visites una ficha, la verás aquí para retomarla rápido';
}

export { HOME_HIGHLIGHTED_ROW_SIZE, MIN_HOME_FEATURED };
