import {
  inferAdf,
  inferColor,
  resolveFormatoPapelBadgeLabels,
} from '@/lib/category-catalog-filters';
import {
  isConsumableProductForCardSpec,
} from '@/lib/format-consumable-product-spec-label';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import {
  isPrinterProduct,
  isSupplyBadgeProduct,
  type ProductBadgeSource,
} from '@/lib/product-detail-badges';
import { resolveTonerColorLabel } from '@/lib/product-configure-toner';
import { isTonerOrRepuestosCategory } from '@/lib/pen-pricing';
import type { Product } from '@/types/product';

export type ProductCardPillVariant = 'primary' | 'secondary' | 'promo';

export interface ProductCardPillBadge {
  id: string;
  label: string;
  variant: ProductCardPillVariant;
}

/** Señales explícitas de SPDF (no plantillas de descripción). */
const SPDF_SIGNAL_RE = /\bspdf\b|single\s*pass|doble\s*scan/i;

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

/**
 * Modelos con SPDF de fábrica (paridad con inferAdf / badges de ficha IM 430/460/550/600).
 * No usar description: muchas fichas repiten «SPDF — …» aunque el ADF sea Estándar.
 */
function isKnownSpdfEquipmentModel(product: ProductBadgeSource): boolean {
  if (
    product.id === 'ricoh-im-430f' ||
    product.id === '328f41ef-d935-4807-85d0-e1db5bdf73fb' ||
    product.id === 'b32a43a1-09e4-49f6-8950-3639c9534700'
  ) {
    return true;
  }
  const name = product.name;
  return (
    /\bim\s*430\s*f\b/i.test(name) ||
    /\bim\s*460\s*f\b/i.test(name) ||
    /\bim\s*550\s*f\b/i.test(name) ||
    /\bim\s*600\s*f\b/i.test(name)
  );
}

/** True solo si el equipo tiene SPDF (atributo, nombre o modelo conocido / Doble Scan). */
export function productHasSpdf(product: ProductBadgeSource): boolean {
  if (!isPrinterProduct(product)) return false;
  if (isTonerOrRepuestosCategory(product.category)) return false;
  if (isSupplyBadgeProduct(product)) return false;

  for (const attr of product.attributes ?? []) {
    const name = attr.name?.trim() ?? '';
    const value = attr.value?.trim() ?? '';
    if (!name && !value) continue;
    if (SPDF_SIGNAL_RE.test(`${name} ${value}`)) return true;
    if (/^spdf$/i.test(name) && value && !/^(no|false|0|n\/a|-|—)$/i.test(value)) {
      return true;
    }
  }

  if (SPDF_SIGNAL_RE.test(`${product.name} ${product.code ?? ''}`)) return true;
  if (inferAdf(product) === 'Doble Scan') return true;
  if (isKnownSpdfEquipmentModel(product)) return true;

  return false;
}

/** Pills de tarjeta: condición/Original (navy) + specs secundarias (B/N, A4, SPDF, color tóner). */
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

    for (const [index, label] of resolveFormatoPapelBadgeLabels(product).entries()) {
      badges.push({
        id: index === 0 ? 'formato' : `formato-${label.toLowerCase()}`,
        label,
        variant: 'secondary',
      });
    }

    if (productHasSpdf(product)) {
      badges.push({ id: 'spdf', label: 'SPDF', variant: 'secondary' });
    }
  } else if (isConsumableProductForCardSpec(product)) {
    const tonerColor = resolveTonerColorLabel(asProduct(product), product.name);
    if (tonerColor) {
      badges.push({ id: 'toner-color', label: tonerColor, variant: 'secondary' });
    }
  }

  return badges;
}
