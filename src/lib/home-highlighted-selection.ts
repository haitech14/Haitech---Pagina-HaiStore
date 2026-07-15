import type { FeaturedProduct } from '@/data/featured-products';
import { FEATURED_PRODUCT_IDS } from '@/data/featured-products';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { shuffleProductsDaily } from '@/lib/daily-shuffle';
import type { HomeCatalogBundleResponse } from '@/lib/home-catalog-bundle';
import {
  HOME_HIGHLIGHTED_ROW_SIZE,
  MIN_HOME_FEATURED,
} from '@/lib/home-featured-products';
import { readRecentlyViewedProductIds } from '@/lib/recently-viewed-products';
import { ensureFullPrices } from '@/lib/roles';
import type { Product } from '@/types/product';
import { isHomeCarouselExcludedProduct } from '../../shared/home-excluded-products.js';

export const HOME_HIGHLIGHTED_DISPLAY_LIMIT = 10;

export type HomeHighlightedDisplayMode = 'recent' | 'suggested' | 'empty';

/** Activa vendible: incluye stock 0 («A pedido»). El bundle ya viene filtrado por status. */
function isEligibleHighlightProduct(product: Product): boolean {
  return product.price > 0 && !isHomeCarouselExcludedProduct(product);
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

/** Pool de productos vendibles del bundle de inicio (incluye «A pedido»). */
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

function compareByPopularity(a: Product, b: Product): number {
  const featuredDelta = Number(b.is_featured === true) - Number(a.is_featured === true);
  if (featuredDelta !== 0) return featuredDelta;
  return (b.view_count ?? 0) - (a.view_count ?? 0);
}

/** Productos sugeridos cuando no hay historial reciente: destacados, más vistos o aleatorio diario. */
function resolveHomeHighlightedFallbackProducts(pool: Product[], limit: number): Product[] {
  const eligible = pool.filter(isEligibleHighlightProduct);
  if (eligible.length === 0) return [];

  const byId = new Map(eligible.map((product) => [product.id, product]));
  const selected: Product[] = [];
  const selectedIds = new Set<string>();

  const add = (product: Product | undefined) => {
    if (!product || selectedIds.has(product.id)) return;
    selectedIds.add(product.id);
    selected.push(product);
  };

  for (const id of FEATURED_PRODUCT_IDS) {
    add(byId.get(id));
    if (selected.length >= limit) return selected;
  }

  const featured = [...eligible]
    .filter((product) => product.is_featured === true && !selectedIds.has(product.id))
    .sort(compareByPopularity);
  for (const product of featured) {
    add(product);
    if (selected.length >= limit) return selected;
  }

  const popular = [...eligible]
    .filter((product) => !selectedIds.has(product.id))
    .sort(compareByPopularity);
  for (const product of popular) {
    add(product);
    if (selected.length >= limit) return selected;
  }

  const remaining = shuffleProductsDaily(eligible.filter((product) => !selectedIds.has(product.id)));
  for (const product of remaining) {
    add(product);
    if (selected.length >= limit) break;
  }

  return selected.slice(0, limit);
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
  const eligible = pool.filter(isEligibleHighlightProduct);
  const byId = new Map(eligible.map((product) => [product.id, product]));

  const fromRecent: Product[] = [];
  for (const id of recentIds) {
    const product = byId.get(id);
    if (!product) continue;
    fromRecent.push(product);
    if (fromRecent.length >= limit) break;
  }

  if (fromRecent.length > 0) {
    return { products: fromRecent, mode: 'recent' };
  }

  const fallback = resolveHomeHighlightedFallbackProducts(pool, limit);
  if (fallback.length > 0) {
    return { products: fallback, mode: 'suggested' };
  }

  return { products: [], mode: 'empty' };
}

export function homeHighlightedSubtitle(mode: HomeHighlightedDisplayMode): string {
  if (mode === 'recent') {
    return 'Retoma donde lo dejaste';
  }
  if (mode === 'suggested') {
    return 'Productos destacados y populares para empezar a explorar';
  }
  return 'Cuando visites una ficha, la verás aquí para retomarla rápido';
}

export { HOME_HIGHLIGHTED_ROW_SIZE, MIN_HOME_FEATURED };
