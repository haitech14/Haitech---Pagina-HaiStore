import { catalogRowToFeatured, getCatalogRows } from '@/lib/catalog-featured';
import type { Product, ProductAttribute } from '@/types/product';

export interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  brand?: string | null;
  attributes?: ProductAttribute[];
  price: number;
  oldPrice?: number;
  discount?: number;
  isNew?: boolean;
  rating: number;
  reviews: number;
  image: string;
}

/** Orden del carrusel en inicio (debe existir en inventory-catalog.json). */
export const FEATURED_PRODUCT_IDS: string[] = [
  'ricoh-im-430f',
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
  'ricoh-im-c3000': { rating: 5, reviews: 36 },
  'ricoh-sp-330dn': { rating: 5, reviews: 52 },
  'konica-bizhub-c300i': { rating: 5, reviews: 29 },
  'canon-ir-advance': { rating: 5, reviews: 41 },
  'toner-ricoh-c6003-cyan': { rating: 5, reviews: 94 },
  'ricoh-toner-mp': { rating: 5, reviews: 67 },
  'hp-laserjet-m234': { rating: 4, reviews: 38 },
};

const catalogFeaturedProducts: FeaturedProduct[] = FEATURED_PRODUCT_IDS.map((id) => {
  const row = getCatalogRows().find((product) => product.id === id);
  if (!row) {
    throw new Error(`Producto destacado "${id}" no está en inventory-catalog.json`);
  }
  return catalogRowToFeatured(row, FEATURED_META[id]);
});

/** Respaldo estático si el API no está disponible. */
export const featuredProducts: FeaturedProduct[] = catalogFeaturedProducts;

export function getFeaturedProductById(id: string): FeaturedProduct | undefined {
  return catalogFeaturedProducts.find((product) => product.id === id);
}

export function featuredToProduct(featured: FeaturedProduct): Product {
  return {
    id: featured.id,
    name: featured.name,
    description: null,
    price: featured.price,
    currency: 'USD',
    image_url: featured.image,
    stock: 10,
    category: featured.category,
    created_at: new Date().toISOString(),
  };
}
