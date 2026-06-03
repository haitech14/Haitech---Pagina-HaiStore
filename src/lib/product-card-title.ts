import { inferProductConditionFromText } from '@/lib/product-condition';
import {
  buildProductDetailBadges,
  isPrinterProduct,
  type ProductBadgeSource,
} from '@/lib/product-detail-badges';

export const PRODUCT_CARD_TITLE_SIZE = 'text-sm sm:text-[0.95rem]';

export const PRODUCT_CARD_BRAND_CLASS =
  'truncate text-[0.65rem] font-normal uppercase tracking-wider text-muted-foreground';

/** Título principal en tarjetas de catálogo. */
export const PRODUCT_CARD_TITLE_MAIN_CLASS = `${PRODUCT_CARD_TITLE_SIZE} font-bold leading-snug text-foreground`;

/** Precio actual en tarjetas de catálogo (más pequeño que el título). */
export const PRODUCT_CARD_PRICE_MAIN_CLASS =
  'text-xs font-semibold tabular-nums text-foreground sm:text-sm';

/** Precio anterior tachado. */
export const PRODUCT_CARD_PRICE_COMPARE_CLASS =
  'text-xs font-normal tabular-nums text-muted-foreground line-through';

/** Badge de descuento junto al precio. */
export const PRODUCT_CARD_DISCOUNT_CLASS = 'text-xs font-semibold text-green-600';

export interface ProductCardTitleContent {
  brand: string | null;
  title: string;
}

function conditionFromBadge(product: ProductBadgeSource): string | null {
  const badge = buildProductDetailBadges(product, { primaryOnly: true }).find(
    (row) => row.id === 'condicion',
  );
  if (!badge?.value.trim()) return null;

  const value = badge.value.trim().toLowerCase();
  if (value === 'nuevo') return 'NUEVA';
  if (value.includes('seminueva')) return 'SEMINUEVA';
  if (value.includes('remanufactur')) return 'REMANUFACTURADA';
  return badge.value.trim().toUpperCase();
}

function resolveConditionLabel(product: ProductBadgeSource): string {
  const fromName = inferProductConditionFromText(product.name);
  if (fromName === 'seminuevas') return 'SEMINUEVA';
  if (fromName === 'remanufacturadas') return 'REMANUFACTURADA';
  if (fromName === 'nuevas') return 'NUEVA';

  return conditionFromBadge(product) ?? 'NUEVA';
}

function stripPrinterPrefix(name: string): string {
  return name
    .trim()
    .replace(/^impresora\s+multifuncional\s+/i, '')
    .replace(/^impresora\s+/i, '')
    .replace(/^multifuncional\s+/i, '')
    .trim();
}

function stripConditionPrefix(name: string): string {
  return name
    .replace(/^(nueva|nuevo|seminueva|semi-nueva|semi\s+nueva|remanufacturada|reacondicionada)\s+/gi, '')
    .trim();
}

function stripBrandPrefix(name: string, brand: string): string {
  if (!brand.trim()) return name;
  const pattern = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i');
  return name.replace(pattern, '').trim();
}

function buildPrinterTitle(product: ProductBadgeSource): string {
  const brand = product.brand?.trim() ?? '';
  const condition = resolveConditionLabel(product);

  let model = stripPrinterPrefix(product.name);
  model = stripConditionPrefix(model);
  if (brand) model = stripBrandPrefix(model, brand);

  return `${condition} ${model}`.replace(/\s+/g, ' ').trim().toUpperCase();
}

export function getProductCardTitleContent(
  product: ProductBadgeSource & { name: string; category?: string | null },
): ProductCardTitleContent {
  const brand = product.brand?.trim() || null;

  if (isPrinterProduct(product)) {
    return {
      brand: brand ? brand.toUpperCase() : null,
      title: buildPrinterTitle(product),
    };
  }

  let title = product.name.trim();
  if (brand) title = stripBrandPrefix(title, brand);

  return {
    brand: brand ? brand.toUpperCase() : null,
    title,
  };
}
