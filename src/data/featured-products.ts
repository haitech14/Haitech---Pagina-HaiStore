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
  /** Galería adicional (hover de tarjeta); la principal va en `image`. */
  gallery?: string[];
  /** Stock en inventario (desde bundle API o índice de catálogo). */
  stock?: number;
  /** Tiempo de entrega del almacén con stock (si está configurado). */
  delivery_time?: string | null;
}

/** Orden del carrusel en inicio (debe existir en inventory-index.json). */
export const FEATURED_PRODUCT_IDS: string[] = [
  'ricoh-im-430f',
  'bfb264b8-70dc-4ad4-9686-2df02df8c75e',
  '481dbc77-436b-464d-b76f-930f7d79f4ff',
  'cb1e47b2-d784-4bef-ae18-d4dae08723e4',
  'ab878d89-61e0-4e51-a941-03455e1da407',
  '328f41ef-d935-4807-85d0-e1db5bdf73fb',
  'e8f574f7-c70c-44b6-8d28-95023f47f72d',
  '189620fe-a5e5-4526-a399-8aa6a308bd1d',
  'dd5efa36-73f6-4241-b2ad-6e74ef058733',
  '03b408ff-0b06-4ec5-90ed-94dcb40fd67c',
  '71289ec2-dbca-4780-b319-eb3d259fadb5',
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
  'e8f574f7-c70c-44b6-8d28-95023f47f72d': { rating: 5, reviews: 36 },
  '189620fe-a5e5-4526-a399-8aa6a308bd1d': { rating: 5, reviews: 28 },
  'dd5efa36-73f6-4241-b2ad-6e74ef058733': { rating: 5, reviews: 19 },
  '03b408ff-0b06-4ec5-90ed-94dcb40fd67c': { rating: 5, reviews: 15, isNew: true },
  '71289ec2-dbca-4780-b319-eb3d259fadb5': { rating: 4, reviews: 24 },
};

function buildFeaturedProductsFromRows(): FeaturedProduct[] {
  return FEATURED_PRODUCT_IDS.flatMap((id) => {
    const row = getCatalogRows().find((product) => product.id === id);
    if (!row) return [];
    return [catalogRowToFeatured(row, FEATURED_META[id])];
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
  try {
    return resolveFeaturedProducts();
  } catch {
    return [];
  }
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
