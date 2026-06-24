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

export type HomeHighlightedDisplayMode = 'recent' | 'random';

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }
  return copy;
}

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

/** Pool de multifuncionales en stock a partir del bundle de inicio. */
export function buildHomeHighlightedPool(bundle: HomeCatalogBundleResponse): Product[] {
  const byId = new Map<string, Product>();

  for (const product of bundle.featured) {
    if (isEligibleHighlightProduct(product)) {
      byId.set(product.id, product);
    }
  }

  const multifuncionales = bundle.sections.find((section) => section.id === 'multifuncionales');
  if (multifuncionales) {
    for (const items of Object.values(multifuncionales.productsByCondition)) {
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
  const eligible = pool.filter(isEligibleHighlightProduct);
  if (eligible.length < MIN_HOME_FEATURED) {
    return { products: [], mode: 'random' };
  }

  const safeLimit = Math.min(Math.max(limit, MIN_HOME_FEATURED), eligible.length);
  const byId = new Map(eligible.map((product) => [product.id, product]));

  const fromRecent: Product[] = [];
  for (const id of recentIds) {
    const product = byId.get(id);
    if (!product) continue;
    fromRecent.push(product);
    if (fromRecent.length >= safeLimit) break;
  }

  if (fromRecent.length > 0) {
    const used = new Set(fromRecent.map((product) => product.id));
    const filler = shuffleArray(eligible.filter((product) => !used.has(product.id)));
    return {
      products: [...fromRecent, ...filler].slice(0, safeLimit),
      mode: 'recent',
    };
  }

  return {
    products: shuffleArray(eligible).slice(0, safeLimit),
    mode: 'random',
  };
}

export function homeHighlightedSubtitle(mode: HomeHighlightedDisplayMode): string {
  if (mode === 'recent') {
    return 'Basado en tus últimas visitas y equipos disponibles';
  }
  return 'Equipos en stock con cotización inmediata';
}

export { HOME_HIGHLIGHTED_ROW_SIZE, MIN_HOME_FEATURED };
