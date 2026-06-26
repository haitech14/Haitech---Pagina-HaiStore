import { catalogRowToFeatured, getCatalogProductById, getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import type { Product, ProductAttribute, PriceRole, ProductRolePrices } from '@/types/product';

export interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  brand?: string | null;
  code?: string | null;
  attributes?: ProductAttribute[];
  price: number;
  prices?: ProductRolePrices;
  price_role?: PriceRole;
  oldPrice?: number;
  discount?: number;
  isNew?: boolean;
  rating: number;
  reviews: number;
  image: string | null;
}

/** Orden del carrusel en inicio (debe existir en inventory-index.json). */
export const FEATURED_PRODUCT_IDS: string[] = [
  'ricoh-im-430f',
  'bfb264b8-70dc-4ad4-9686-2df02df8c75e',
  '481dbc77-436b-464d-b76f-930f7d79f4ff',
  'cb1e47b2-d784-4bef-ae18-d4dae08723e4',
  'ab878d89-61e0-4e51-a941-03455e1da407',
  '328f41ef-d935-4807-85d0-e1db5bdf73fb',
  'ricoh-im-c3000',
  'ricoh-sp-330dn',
  'konica-bizhub-c300i',
  'canon-ir-advance',
  'toner-ricoh-c6003-cyan',
  'ricoh-toner-mp',
  'hp-laserjet-m234',
];

const FEATURED_META: Record<
  string,
  Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'>
> = {
  'ricoh-im-430f': { rating: 5, reviews: 48 },
  'bfb264b8-70dc-4ad4-9686-2df02df8c75e': { rating: 5, reviews: 12, isNew: true },
  '481dbc77-436b-464d-b76f-930f7d79f4ff': { rating: 5, reviews: 14, isNew: true },
  'cb1e47b2-d784-4bef-ae18-d4dae08723e4': { rating: 5, reviews: 11, isNew: true },
  'ab878d89-61e0-4e51-a941-03455e1da407': { rating: 5, reviews: 9, isNew: true },
  '328f41ef-d935-4807-85d0-e1db5bdf73fb': { rating: 5, reviews: 22, isNew: true },
  'ricoh-im-c3000': { rating: 5, reviews: 36 },
  'ricoh-sp-330dn': { rating: 5, reviews: 52 },
  'konica-bizhub-c300i': { rating: 5, reviews: 29 },
  'canon-ir-advance': { rating: 5, reviews: 41 },
  'toner-ricoh-c6003-cyan': { rating: 5, reviews: 94 },
  'ricoh-toner-mp': { rating: 5, reviews: 67 },
  'hp-laserjet-m234': { rating: 4, reviews: 38 },
};

function buildFeaturedProductsFromRows(): FeaturedProduct[] {
  return FEATURED_PRODUCT_IDS.map((id) => {
    const row = getCatalogRows().find((product) => product.id === id);
    if (!row) {
      throw new Error(`Producto destacado "${id}" no está en inventory-index.json`);
    }
    return catalogRowToFeatured(row, FEATURED_META[id]);
  });
}

let featuredProductsCache: FeaturedProduct[] | null = null;

function resolveFeaturedProducts(): FeaturedProduct[] {
  if (!featuredProductsCache) {
    featuredProductsCache = buildFeaturedProductsFromRows();
  }
  return featuredProductsCache;
}

/** Respaldo estático si el API no está disponible. */
export function getFeaturedProducts(): FeaturedProduct[] {
  return resolveFeaturedProducts();
}

/** @deprecated Usar getFeaturedProducts() */
export const featuredProducts: FeaturedProduct[] = [];

export async function ensureFeaturedProductsLoaded(): Promise<FeaturedProduct[]> {
  await loadCatalogIndex();
  featuredProductsCache = buildFeaturedProductsFromRows();
  return featuredProductsCache;
}

export function getFeaturedProductById(id: string): FeaturedProduct | undefined {
  try {
    return resolveFeaturedProducts().find((product) => product.id === id);
  } catch {
    return undefined;
  }
}

/** Solo metadatos de vitrina (sin precios del JSON estático). */
export function getFeaturedDisplayMeta(
  id: string,
): Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'> | undefined {
  const meta = FEATURED_META[id];
  if (!meta) return undefined;
  return meta;
}

export function featuredToProduct(featured: FeaturedProduct): Product {
  const catalogRow = getCatalogProductById(featured.id);
  const prices = featured.prices ?? catalogRow?.prices;
  const attributes = featured.attributes ?? catalogRow?.attributes;

  return {
    id: featured.id,
    code: featured.code ?? catalogRow?.code ?? null,
    name: featured.name,
    description: catalogRow?.description ?? null,
    price: featured.price,
    ...(prices ? { prices } : {}),
    currency: catalogRow?.currency ?? 'USD',
    image_url: featured.image ?? catalogRow?.image_url ?? null,
    gallery: catalogRow?.gallery ?? [],
    stock: catalogRow?.stock ?? 0,
    category: featured.category ?? catalogRow?.category ?? null,
    brand: featured.brand ?? catalogRow?.brand ?? null,
    created_at: catalogRow?.created_at ?? new Date().toISOString(),
    ...(attributes ? { attributes } : {}),
  };
}
