import { formatProductNameSentenceCase } from '@/lib/format-product-name-sentence-case';
import {
  inferColor,
  inferFormatoPapelFromModel,
  resolveProductSpeedPpm,
} from '@/lib/category-catalog-filters';
import { resolveHomeLandingConsumableSubtitle } from '@/lib/home-featured-product-filter';
import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import { formatInventoryProductName } from '@/lib/inventory-product-name';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import { resolveProductCardConditionLabel } from '@/lib/product-card-condition';

/** Título en grilla de catálogo (5 columnas en desktop). */
export const PRODUCT_CARD_TITLE_SIZE = 'text-[0.84rem] leading-[1.2] sm:text-[0.9rem]';

/** Título en vitrina destacada / carrusel (fichas estrechas, 5 por fila; máx. 3 líneas). */
export const PRODUCT_CARD_TITLE_FEATURED_CLASS =
  'text-[0.8125rem] font-semibold leading-[1.2] text-foreground sm:text-[0.875rem]';

export const PRODUCT_CARD_BRAND_CLASS =
  'truncate text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[0.625rem]';

/** Alias de marca en vitrina destacada (mismo estilo gris compacto). */
export const PRODUCT_CARD_BRAND_ACCENT_CLASS = PRODUCT_CARD_BRAND_CLASS;

/** Código SKU / inventario junto a la marca. */
export const PRODUCT_CARD_CODE_CLASS =
  'shrink-0 font-mono text-[0.62rem] font-medium normal-case tracking-normal text-muted-foreground sm:text-[0.65rem]';

/** Stock disponible junto al código en tarjetas de catálogo (mismo tono gris, sin badge). */
export const PRODUCT_CARD_STOCK_CLASS =
  'shrink-0 text-[0.62rem] font-medium normal-case tracking-normal text-muted-foreground sm:text-[0.65rem]';

/** Título principal en tarjetas de catálogo (nombre del producto tal cual en inventario). */
export const PRODUCT_CARD_TITLE_MAIN_CLASS = `${PRODUCT_CARD_TITLE_SIZE} font-semibold text-foreground`;

/** Máximo 3 líneas en ficha de producto. */
export const PRODUCT_CARD_TITLE_CLAMP_CLASS =
  'line-clamp-3 break-words text-pretty hyphens-auto';

/** Precio actual en tarjetas de catálogo (negrita, un poco más grande que el tachado). */
export const PRODUCT_CARD_PRICE_MAIN_CLASS =
  'text-sm font-bold tabular-nums sm:text-[0.95rem]';

/** Precio actual en vitrina de destacados (más prominente, como el diseño de referencia). */
export const PRODUCT_CARD_PRICE_FEATURED_CLASS =
  'text-[0.95rem] font-bold tabular-nums text-foreground sm:text-base';

/** Precio anterior tachado (debajo del precio actual). */
export const PRODUCT_CARD_PRICE_COMPARE_CLASS =
  'text-[0.65rem] font-normal tabular-nums text-muted-foreground line-through decoration-muted-foreground decoration-solid sm:text-xs';

/** Badge de descuento (fondo verde claro, texto verde). */
export const PRODUCT_CARD_DISCOUNT_CLASS =
  'inline-flex shrink-0 rounded px-1 py-px text-[0.6rem] font-semibold leading-none bg-green-50 text-green-700 sm:text-[0.65rem]';

export interface ProductCardTitleContent {
  brand: string | null;
  code: string | null;
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

/** Palabras descriptivas de equipos con mayúscula inicial fija en títulos de catálogo. */
function capitalizeEquipmentDescriptorWords(text: string): string {
  return text
    .replace(/\bmultifuncional\b/gi, 'Multifuncional')
    .replace(/\bseminueva\b/gi, 'Seminueva')
    .replace(/\bnueva\b/gi, 'Nueva')
    .replace(/\bimpresora\b/gi, 'Impresora')
    .replace(/\bl[aá]ser\b/gi, 'Láser')
    .replace(/\bmonocrom[aá]tica\b/gi, 'Monocromática');
}

function resolveSubtitleFormatoLabel(
  product: ProductBadgeSource & { name: string },
): string | null {
  for (const attr of product.attributes ?? []) {
    const name = attr.name?.trim() ?? '';
    if (!/^formato(\s+papel)?$/i.test(name)) continue;
    const value = attr.value?.trim() ?? '';
    if (/^a4$/i.test(value)) return 'A4';
    if (/^a3$/i.test(value)) return 'A3';
  }

  const fromModel = inferFormatoPapelFromModel(product);
  if (fromModel) return fromModel;

  const explicitInName = product.name.match(/\b(A[34])\b/i);
  if (explicitInName) return explicitInName[1]!.toUpperCase();

  return null;
}

function resolveSubtitleSpeedLabel(product: ProductBadgeSource & { name: string }): string | null {
  for (const attr of product.attributes ?? []) {
    const name = attr.name?.trim().toLowerCase() ?? '';
    if (!name.includes('velocidad') && name !== 'ppm') continue;
    const value = attr.value?.trim() ?? '';
    const match = value.match(/(\d{1,3})\s*ppm/i) ?? value.match(/^(\d{1,3})$/);
    if (match) return `${match[1]} ppm`;
  }

  const ppm = resolveProductSpeedPpm(product);
  return ppm != null ? `${ppm} ppm` : null;
}

/** Título en vitrina home: oración con marca y modelo preservados. */
export function formatHomeLandingProductCardTitle(
  product: ProductBadgeSource & { name: string; category?: string | null; brand?: string | null },
): string {
  const normalized = formatInventoryProductName(product.name.trim());
  return formatProductNameSentenceCase(normalized, { brand: product.brand });
}

/** Título en dos líneas para vitrina home: «Ricoh MP 401» + «Multifuncional seminueva B/N». */
export function getHomeLandingProductCardLines(
  product: ProductBadgeSource & { name: string; category?: string | null; brand?: string | null },
): { headline: string; subtitle: string | null } {
  const brand = product.brand?.trim() || null;
  const rawName = formatInventoryProductName(product.name.trim());
  let headline = rawName;

  if (brand) {
    const brandRegex = new RegExp(
      `\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    );
    const brandIndex = rawName.search(brandRegex);
    if (brandIndex >= 0) {
      headline = rawName
        .slice(brandIndex)
        .replace(/\s+\d{2,3}\s*v\b.*$/i, '')
        .replace(/\s*\([^)]*\)\s*$/g, '')
        .trim();
    }
  } else {
    headline = rawName
      .replace(
        /^(impresora\s+)?multifuncional\s+(seminueva\s+|nueva\s+|remanufacturada\s+)?/i,
        '',
      )
      .replace(/\s+\d{2,3}\s*v\b.*$/i, '')
      .replace(/\s*\([^)]*\)\s*$/g, '')
      .trim();
  }

  headline = formatProductNameSentenceCase(headline, { brand });

  const consumableSubtitle = resolveHomeLandingConsumableSubtitle(product);
  if (consumableSubtitle) {
    return { headline, subtitle: consumableSubtitle };
  }

  const haystack = `${product.category ?? ''} ${product.name}`.toLowerCase();
  const isMultifunctional = haystack.includes('multifunc') || haystack.includes('copiadora');
  const condition = resolveProductCardConditionLabel(product);
  const subtitleParts: string[] = [];

  if (isMultifunctional) subtitleParts.push('Multifuncional');
  else if (isPrinterProduct(product)) subtitleParts.push('Impresora');
  if (condition) subtitleParts.push(condition.toLowerCase());
  subtitleParts.push(inferColor(product) === 'Color' ? 'Color' : 'B/N');

  const subtitleExtras: string[] = [];
  const formato = resolveSubtitleFormatoLabel(product);
  if (formato) subtitleExtras.push(formato);
  const speed = resolveSubtitleSpeedLabel(product);
  if (speed) subtitleExtras.push(speed);

  const subtitleMain = subtitleParts.join(' ');
  const subtitle =
    subtitleMain && subtitleExtras.length > 0
      ? [subtitleMain, ...subtitleExtras].join(' · ')
      : subtitleMain || (subtitleExtras.length > 0 ? subtitleExtras.join(' · ') : null);

  return {
    headline,
    subtitle,
  };
}

/** Añade «B/N» en equipos monocromáticos si el nombre aún no lo incluye. */
export function formatProductCardTitle(
  product: ProductBadgeSource & { name: string; category?: string | null },
): string {
  const title = capitalizeEquipmentDescriptorWords(
    formatInventoryProductName(product.name.trim()),
  );
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
  product: ProductBadgeSource & {
    name: string;
    category?: string | null;
    code?: string | null;
  },
): ProductCardTitleContent {
  const brand = product.brand?.trim() || null;
  const code = formatProductDisplayCode(product.code, {
    brand: product.brand,
    category: product.category ?? null,
    name: product.name,
  });

  return {
    brand: brand ? brand.toUpperCase() : null,
    code,
    title: formatProductCardTitle(product),
  };
}
