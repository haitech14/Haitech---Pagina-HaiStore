import { CONSULTAR_PRECIO_LABEL, discountedUsdPrice, isPriceOnRequest } from '@/lib/display-price';
import {
  DEFAULT_BULK_DISCOUNT_TIERS,
  parseBulkDiscountRange,
} from '@/lib/bulk-discount-tiers';
import { CATALOG_VOLUME_TIERS, getCatalogCardPricing } from '@/lib/product-catalog-card-meta';
import { isTonerOrRepuestosCategory } from '@/lib/pen-pricing';
import { PRODUCT_ON_REQUEST_STOCK_LABEL } from '@/lib/product-on-request-label';
import { formatUsd } from '@/lib/utils';
import type { ProductVolumeRolePriceTier } from '@/types/product';

/** Validez comercial del precio cotizado (versión corta para WhatsApp). */
export const DEFAULT_PRODUCT_CLIPBOARD_PRICE_VALIDITY = '7 días / agotar stock';

/**
 * Origen fijo para URLs en el portapapeles (nunca localhost / Vite).
 * El usuario pide explícitamente haitech.pe (sin www).
 */
export const PRODUCT_CLIPBOARD_SITE_ORIGIN = 'https://haitech.pe';

export interface ProductClipboardVolumeDiscount {
  fromUnits: number;
  priceUsd: number;
  discountPercent: number;
  /** Color / juego de tóner: etiqueta «por Juego» en vez de «N+». */
  perSet?: boolean;
}

export interface ProductClipboardTextInput {
  code?: string | null;
  title: string;
  stock: number;
  /** Precio de oferta / vigente. */
  priceUsd: number | null | undefined;
  /**
   * Precio normal (tachado). Si no se pasa y hay `productId`, se toma de catálogo.
   */
  normalPriceUsd?: number | null;
  /** Para resolver precio normal desde catálogo cuando falta `normalPriceUsd`. */
  productId?: string | null;
  /** Nueva / Seminueva / Remanufacturada / Original, etc. */
  condition?: string | null;
  /** Categoría: equipos → dscto desde 2+; tóner/repuestos → desde 3+. */
  category?: string | null;
  /** Producto a color: el dscto se muestra «por Juego». */
  isColorProduct?: boolean | null;
  /** Tramos por cantidad/rol del producto; si faltan se usan tiers por categoría. */
  volumeRolePrices?: ProductVolumeRolePriceTier[] | null;
  /** Override del tramo de descuento; si no se pasa se resuelve. */
  volumeDiscount?: ProductClipboardVolumeDiscount | null;
  /** Ignorado: el texto copiado ya no incluye entrega. */
  deliveryTime?: string | null;
  /** Override; por defecto 7 días / agotar stock. */
  priceValidity?: string | null;
  /**
   * Ruta de ficha (`/tienda/...`) o URL absoluta.
   * Siempre se reescribe a `https://haitech.pe` + path (nunca localhost).
   */
  productPath?: string | null;
  /** Imagen principal para copiar junto al texto. */
  imageUrl?: string | null;
}

/** Une path de producto con https://haitech.pe (ignora host de la URL de entrada). */
export function buildProductClipboardPageUrl(productPathOrUrl: string): string {
  const raw = productPathOrUrl.trim();
  let pathname = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      pathname = new URL(raw).pathname;
    }
  } catch {
    pathname = raw;
  }
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${PRODUCT_CLIPBOARD_SITE_ORIGIN}${path}`;
}

/** Stock label aligned with storefront cards (`2 unids.` / `A pedido`). */
export function formatProductClipboardStock(stock: number): string {
  const quantity = Math.max(0, Math.floor(Number(stock) || 0));
  if (quantity <= 0) return PRODUCT_ON_REQUEST_STOCK_LABEL;
  return `${quantity} unids.`;
}

/** WhatsApp / plain-text bold (mismo estilo que mensajes WA del repo). */
export function waBold(text: string): string {
  return `*${text}*`;
}

/** WhatsApp / plain-text strikethrough. */
export function waStrike(text: string): string {
  return `~${text}~`;
}

function htmlBold(text: string): string {
  return `<b>${escapeHtml(text)}</b>`;
}

function htmlStrike(text: string): string {
  return `<s>${escapeHtml(text)}</s>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Equipos: desde 2+; tóner / repuestos: desde 3+. */
export function resolveProductClipboardDiscountMinUnits(
  category?: string | null,
): number {
  return isTonerOrRepuestosCategory(category) ? 3 : 2;
}

/** Precio normal tachado cuando es mayor que la oferta. */
export function resolveProductClipboardNormalPrice(
  input: Pick<ProductClipboardTextInput, 'priceUsd' | 'normalPriceUsd' | 'productId'>,
): number | null {
  if (isPriceOnRequest(input.priceUsd) || input.priceUsd == null || input.priceUsd <= 0) {
    return null;
  }
  const sale = input.priceUsd;
  if (input.normalPriceUsd != null && input.normalPriceUsd > sale) {
    return input.normalPriceUsd;
  }
  const productId = input.productId?.trim();
  if (productId) {
    const pricing = getCatalogCardPricing({ id: productId, price: sale });
    if (pricing.compareUsd > pricing.currentUsd) return pricing.compareUsd;
  }
  return null;
}

/**
 * Precio con descuento por volumen.
 * Equipos desde 2+; tóner/repuestos desde 3+. Color → etiqueta «por Juego».
 * Prioriza `volume_role_prices` (rol público); si no hay, usa tiers por categoría.
 */
export function resolveProductClipboardVolumeDiscount(
  priceUsd: number | null | undefined,
  volumeRolePrices?: ProductVolumeRolePriceTier[] | null,
  options?: {
    category?: string | null;
    isColorProduct?: boolean | null;
  },
): ProductClipboardVolumeDiscount | null {
  if (isPriceOnRequest(priceUsd) || priceUsd == null || priceUsd <= 0) return null;

  const minUnits = resolveProductClipboardDiscountMinUnits(options?.category);
  const perSet = Boolean(options?.isColorProduct);

  const roleTiers = volumeRolePrices ?? [];
  for (const tier of roleTiers) {
    const bounds = parseBulkDiscountRange(tier.range);
    if (!bounds || bounds.min < minUnits) continue;
    const unit = Number(tier.prices?.public) || 0;
    if (unit <= 0 || unit >= priceUsd) continue;
    const discountPercent = Math.round((1 - unit / priceUsd) * 1000) / 10;
    return {
      fromUnits: bounds.min,
      priceUsd: Math.round(unit * 100) / 100,
      discountPercent,
      ...(perSet ? { perSet: true } : {}),
    };
  }

  // Equipos: DEFAULT_BULK (2 → 5%). Tóner/repuestos: CATALOG_VOLUME (3 → 5%).
  if (isTonerOrRepuestosCategory(options?.category)) {
    const catalogTier = CATALOG_VOLUME_TIERS.filter((tier) => tier.discountPercent > 0);
    const first = catalogTier[0];
    if (!first) return null;
    const parsedMin = parseBulkDiscountRange(first.range)?.min;
    const matchedMin = Number(first.range.match(/(\d+)/)?.[1]);
    const fromUnits =
      parsedMin ?? (Number.isFinite(matchedMin) && matchedMin > 0 ? matchedMin : 3);
    return {
      fromUnits: Math.max(fromUnits, minUnits),
      priceUsd: discountedUsdPrice(priceUsd, first.discountPercent),
      discountPercent: first.discountPercent,
      ...(perSet ? { perSet: true } : {}),
    };
  }

  const equipmentTier = DEFAULT_BULK_DISCOUNT_TIERS.filter((tier) => tier.discountPercent > 0);
  const firstEquipment = equipmentTier[0];
  if (!firstEquipment) return null;
  const parsedMin = parseBulkDiscountRange(firstEquipment.range)?.min;
  const fromUnits = parsedMin ?? minUnits;
  return {
    fromUnits: Math.max(fromUnits, minUnits),
    priceUsd: discountedUsdPrice(priceUsd, firstEquipment.discountPercent),
    discountPercent: firstEquipment.discountPercent,
    ...(perSet ? { perSet: true } : {}),
  };
}

function resolveVolume(
  input: ProductClipboardTextInput,
): ProductClipboardVolumeDiscount | null {
  if (input.volumeDiscount === null) return null;
  if (input.volumeDiscount) {
    if (input.isColorProduct && input.volumeDiscount.perSet !== false) {
      return { ...input.volumeDiscount, perSet: true };
    }
    return input.volumeDiscount;
  }
  return resolveProductClipboardVolumeDiscount(input.priceUsd, input.volumeRolePrices, {
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.isColorProduct !== undefined ? { isColorProduct: input.isColorProduct } : {}),
  });
}

function formatVolumeDiscountLabel(volume: ProductClipboardVolumeDiscount): string {
  if (volume.perSet) return 'por Juego';
  return `${volume.fromUnits}+`;
}

function resolvePriceValidity(input: ProductClipboardTextInput): string {
  const custom = input.priceValidity?.trim();
  if (custom) return custom;
  return DEFAULT_PRODUCT_CLIPBOARD_PRICE_VALIDITY;
}

export interface ProductClipboardPayload {
  plain: string;
  html: string;
}

/**
 * Bloque compacto para WhatsApp / cotización (etiquetas cortas).
 * Orden: Producto → Código → Cond. → Stock → Precio → Dscto → Validez → link.
 * Negrita: WhatsApp `*…*` en plain; `<b>` en HTML.
 */
export function buildProductClipboardPayload(input: ProductClipboardTextInput): ProductClipboardPayload {
  const code = input.code?.trim() || null;
  const title = input.title.trim();
  const condition = input.condition?.trim() || null;
  const stockLabel = formatProductClipboardStock(input.stock);
  const priceValidity = resolvePriceValidity(input);
  const volume = resolveVolume(input);
  const pageUrl = input.productPath?.trim()
    ? buildProductClipboardPageUrl(input.productPath)
    : null;

  const onRequest = isPriceOnRequest(input.priceUsd);
  const priceLabel = onRequest ? CONSULTAR_PRECIO_LABEL : formatUsd(input.priceUsd!);
  const normalPrice = resolveProductClipboardNormalPrice(input);

  const plainLines: string[] = [];
  const htmlLines: string[] = [];

  const push = (plain: string, html?: string) => {
    plainLines.push(plain);
    htmlLines.push(html ?? escapeHtml(plain));
  };

  // Identidad: Producto primero, Código debajo
  push(`📦 Producto: ${waBold(title)}`, `📦 Producto: ${htmlBold(title)}`);
  if (code) {
    push(`📋 Código: ${code}`, `📋 Código: ${escapeHtml(code)}`);
  }

  // Condición y stock en líneas propias (evita wrap raro de «unids.»)
  if (condition) {
    push(`✨ Cond.: ${waBold(condition)}`, `✨ Cond.: ${htmlBold(condition)}`);
  }
  push(`📊 Stock: ${stockLabel}`, `📊 Stock: ${escapeHtml(stockLabel)}`);

  plainLines.push('');
  htmlLines.push('');

  // Precio Normal (tachado) + Oferta (incl IGV)
  if (normalPrice != null) {
    const normalLabel = formatUsd(normalPrice);
    push(
      `💰 Precio Normal: ${waStrike(normalLabel)}`,
      `💰 Precio Normal: ${htmlStrike(normalLabel)}`,
    );
  }

  if (onRequest) {
    push(`🔥 Oferta: ${waBold(priceLabel)}`, `🔥 Oferta: ${htmlBold(priceLabel)}`);
  } else {
    push(
      `🔥 Oferta: ${waBold(priceLabel)} incl IGV`,
      `🔥 Oferta: ${htmlBold(priceLabel)} incl IGV`,
    );
  }

  // Dscto en línea propia
  if (volume) {
    const volPrice = formatUsd(volume.priceUsd);
    const volLabel = formatVolumeDiscountLabel(volume);
    push(
      `🏷️ Dscto. ${volLabel}: ${waBold(volPrice)} (−${volume.discountPercent}%)`,
      `🏷️ Dscto. ${escapeHtml(volLabel)}: ${htmlBold(volPrice)} (−${volume.discountPercent}%)`,
    );
  }

  plainLines.push('');
  htmlLines.push('');

  push(
    `⏳ Validez: ${priceValidity}`,
    `⏳ Validez: ${escapeHtml(priceValidity)}`,
  );

  if (pageUrl) {
    push(
      `🔗 Mayor información en:\n${pageUrl}`,
      `🔗 Mayor información en:<br><a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a>`,
    );
  }

  return {
    plain: plainLines.join('\n'),
    html: `<div>${htmlLines.map((line) => (line === '' ? '<br>' : `<div>${line}</div>`)).join('')}</div>`,
  };
}

/** Plain text para callers simples / tests. */
export function buildProductClipboardText(input: ProductClipboardTextInput): string {
  return buildProductClipboardPayload(input).plain;
}
