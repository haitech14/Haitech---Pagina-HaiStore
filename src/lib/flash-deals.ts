import type { FeaturedProduct } from '@/data/featured-products';
import { shuffleProductsDaily } from '@/lib/daily-shuffle';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { productToFeatured } from '@/lib/store-products';
import type { Product } from '@/types/product';

/** Productos visibles por vista en el panel del carrusel. */
export const FLASH_DEALS_PER_VIEW = 4;

export function chunkFlashDealProducts<T>(
  items: readonly T[],
  size = FLASH_DEALS_PER_VIEW,
): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

export const FLASH_DEALS_LIMIT = 12;
export const MIN_FLASH_DEALS = 3;

/** Ofertas relámpago: solo productos del inventario en vivo con stock disponible. */
export function resolveFlashDealProducts(
  storeProducts: Product[] | undefined,
  limit = FLASH_DEALS_LIMIT,
): FeaturedProduct[] {
  if (!storeProducts?.length) return [];

  const inStock = storeProducts.filter((product) => product.stock > 0 && product.price > 0);
  if (inStock.length < MIN_FLASH_DEALS) return [];

  return shuffleProductsDaily(inStock)
    .slice(0, limit)
    .map((product) => enrichFeaturedFromCatalog(productToFeatured(product)));
}

/** Segundos hasta medianoche (America/Lima) para el contador diario. */
export function getSecondsUntilLimaMidnight(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const second = Number(parts.find((p) => p.type === 'second')?.value ?? 0);

  const elapsed = hour * 3600 + minute * 60 + second;
  return Math.max(0, 24 * 3600 - elapsed);
}

export function splitCountdown(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}
