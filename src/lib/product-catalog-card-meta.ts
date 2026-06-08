import {
  buildProductDetailBadges,
  formatBadgeDisplayValue,
  isPrinterProduct,
  productHasNuevoCornerBadge,
  type ProductBadgeSource,
} from '@/lib/product-detail-badges';
import { normalizeAttributes } from '@/lib/inventory-attributes';
import type { Product } from '@/types/product';
import { usdToPen } from '@/lib/utils';

export interface CatalogVolumeTier {
  range: string;
  discountPercent: number;
}

export const CATALOG_VOLUME_TIERS: readonly CatalogVolumeTier[] = [
  { range: '1 - 2 unidades', discountPercent: 0 },
  { range: '3 - 5 unidades', discountPercent: 5 },
  { range: '6+ unidades', discountPercent: 10 },
] as const;

function soldCountFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % 97;
  return 4 + (hash % 24);
}

export function getCatalogCardRating(product: Product): { rating: number; reviews: number; soldCount: number } {
  const soldCount = soldCountFromId(product.id);
  return {
    rating: 4.8,
    reviews: soldCount + 2,
    soldCount,
  };
}

export function getCatalogCardSubtitle(product: Product): string | null {
  const parts: string[] = [];
  if (product.category?.trim()) {
    parts.push(product.category.trim());
  }

  const velocidad = buildProductDetailBadges(product, { primaryOnly: true }).find(
    (badge) => badge.id === 'velocidad',
  );
  if (velocidad) {
    parts.push(formatBadgeDisplayValue(velocidad, { compact: true }));
  }

  return parts.length > 0 ? parts.join(' • ') : null;
}

export function getCatalogColorBadge(product: ProductBadgeSource): string | null {
  const attributes = normalizeAttributes(product.attributes);
  const colorAttr = attributes.find((row) => /color/i.test(row.name));
  if (colorAttr?.value?.trim()) {
    return colorAttr.value.trim();
  }

  if (isPrinterProduct(product)) {
    const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
    if (haystack.includes('color') || haystack.includes('a color')) return 'Color';
    return 'Negro';
  }

  return null;
}

export function productShowsBestPriceBadge(product: Product): boolean {
  return product.is_featured === true || (product.sort_order != null && product.sort_order <= 2);
}

export function productShowsNuevoBadge(product: ProductBadgeSource): boolean {
  return productHasNuevoCornerBadge(product);
}

export function formatCatalogVolumePricePen(unitPriceUsd: number, discountPercent: number): string {
  const pen = Math.round(usdToPen(unitPriceUsd) * (1 - discountPercent / 100));
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(pen);
}

export function productShowsExpressDelivery(product: Product, inStock: boolean): boolean {
  return inStock && isPrinterProduct(product);
}
