import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';

export const PRODUCT_CARD_TITLE_SIZE = 'text-sm sm:text-[0.95rem]';

export const PRODUCT_CARD_BRAND_CLASS =
  'truncate text-[0.65rem] font-normal uppercase tracking-wider text-muted-foreground';

/** Marca en tarjetas de vitrina (rojo de marca, como el diseño de destacados). */
export const PRODUCT_CARD_BRAND_ACCENT_CLASS =
  'truncate text-[0.65rem] font-semibold uppercase tracking-wider text-red-600';

/** Título principal en tarjetas de catálogo (nombre del producto tal cual en inventario). */
export const PRODUCT_CARD_TITLE_MAIN_CLASS = `${PRODUCT_CARD_TITLE_SIZE} font-bold leading-snug text-foreground`;

/** Precio actual en tarjetas de catálogo (negrita, un poco más grande que el tachado). */
export const PRODUCT_CARD_PRICE_MAIN_CLASS =
  'text-sm font-bold tabular-nums text-foreground sm:text-[0.95rem]';

/** Precio actual en vitrina de destacados (más prominente, como el diseño de referencia). */
export const PRODUCT_CARD_PRICE_FEATURED_CLASS =
  'text-[0.95rem] font-bold tabular-nums text-foreground sm:text-base';

/** Precio anterior tachado (precio «normal»). */
export const PRODUCT_CARD_PRICE_COMPARE_CLASS =
  'text-xs font-normal tabular-nums text-muted-foreground line-through decoration-muted-foreground decoration-solid';

/** Badge de descuento (fondo verde claro, texto verde). */
export const PRODUCT_CARD_DISCOUNT_CLASS =
  'inline-flex shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700';

export interface ProductCardTitleContent {
  brand: string | null;
  title: string;
}

function isColorPrinter(product: ProductBadgeSource): boolean {
  const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
  return (
    haystack.includes('color') ||
    haystack.includes('a color') ||
    /\bim\s+c\d{3,4}/i.test(product.name) ||
    /\bbizhub\s+c/i.test(product.name)
  );
}

/** Añade «B/N» en equipos monocromáticos si el nombre aún no lo incluye. */
export function formatProductCardTitle(
  product: ProductBadgeSource & { name: string; category?: string | null },
): string {
  const title = product.name.trim();
  if (!isPrinterProduct(product) || isColorPrinter(product) || /\bB\/N\b/i.test(title)) {
    return title;
  }

  if (/^impresora\s+multifuncional\s+/i.test(title)) {
    return title.replace(/^impresora\s+multifuncional\s+/i, 'Impresora Multifuncional B/N ');
  }

  if (/^impresora\s+/i.test(title)) {
    return title.replace(/^impresora\s+/i, 'Impresora B/N ');
  }

  if (/^multifuncional\s+/i.test(title)) {
    return title.replace(/^multifuncional\s+/i, 'Multifuncional B/N ');
  }

  return `${title} B/N`;
}

export function getProductCardTitleContent(
  product: ProductBadgeSource & { name: string; category?: string | null },
): ProductCardTitleContent {
  const brand = product.brand?.trim() || null;

  return {
    brand: brand ? brand.toUpperCase() : null,
    title: formatProductCardTitle(product),
  };
}
