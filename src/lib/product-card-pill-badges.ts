import { inferColor, resolveFormatoPapel } from '@/lib/category-catalog-filters';
import {
  isConsumableProductForCardSpec,
} from '@/lib/format-consumable-product-spec-label';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import { resolveTonerColorLabel } from '@/lib/product-configure-toner';
import { isTonerOrRepuestosCategory } from '@/lib/pen-pricing';
import type { Product } from '@/types/product';

export type ProductCardPillVariant = 'primary' | 'secondary' | 'promo';

export interface ProductCardPillBadge {
  id: string;
  label: string;
  variant: ProductCardPillVariant;
}

function asProduct(product: ProductBadgeSource): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? null,
    brand: product.brand ?? null,
    code: product.code ?? null,
    attributes: product.attributes ?? [],
    price: 0,
    currency: 'USD',
    image_url: null,
    stock: 0,
    description: null,
    created_at: '',
  };
}

/** Pills de tarjeta: condición/Original (navy) + specs secundarias (B/N, A4, color tóner). */
export function buildProductCardPillBadges(
  product: ProductBadgeSource & { name: string; category?: string | null },
): ProductCardPillBadge[] {
  const badges: ProductCardPillBadge[] = [];

  const primaryLabel = resolveProductCardBadgeLabel(product);
  if (primaryLabel) {
    badges.push({ id: 'estado', label: primaryLabel, variant: 'primary' });
  }

  const isEquipment =
    isPrinterProduct(product) && !isTonerOrRepuestosCategory(product.category);

  if (isEquipment) {
    badges.push({
      id: 'color',
      label: inferColor(product) === 'Color' ? 'Color' : 'B/N',
      variant: 'secondary',
    });

    const formato = resolveFormatoPapel(product);
    if (formato) {
      badges.push({ id: 'formato', label: formato, variant: 'secondary' });
    }
  } else if (isConsumableProductForCardSpec(product)) {
    const tonerColor = resolveTonerColorLabel(asProduct(product), product.name);
    if (tonerColor) {
      badges.push({ id: 'toner-color', label: tonerColor, variant: 'secondary' });
    }
  }

  return badges;
}
