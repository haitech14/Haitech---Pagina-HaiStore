import { stripProductCodePrefix } from '../product-code-prefix.js';
import { normalizeProductCodeSuffix } from '../product-code-suffix.js';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '../inventory-product-name.js';
import { proposeProductSlug } from '../product-slug.js';
import { truncateMetaDescription } from './meta.js';
export const DEFAULT_USD_TO_PEN_SEO = 3.7;

const KNOWN_BRAND_PATTERN =
  /\b(RICOH|HP|CANON|EPSON|BROTHER|KONICA|KYOCERA|XEROX|LEXMARK|SAMSUNG)\b/i;

const MODEL_PATTERNS = [
  /\b(IM\s*\d{3,4}\s*[A-Z]{0,3}(?:\s*SPDF)?)\b/i,
  /\b(MP\s*[A-Z]?\s*\d{3,4}[A-Z]?)\b/i,
  /\b(SP\s*\d{3,4}[A-Z]?)\b/i,
  /\b(BIZHUB\s*[A-Z]?\d{3,4}[A-Z]?)\b/i,
  /\b(M\s*\d{3,4}[A-Z]?)\b/i,
];

const SITE_SUFFIX = ' | Haitech';

export function usdToPenSeo(usd, rate = DEFAULT_USD_TO_PEN_SEO) {
  return Math.round(Number(usd) * rate);
}

function isConsumableOrAccessoryProductSeo(product) {
  const cat = String(product?.category ?? '').toLowerCase();
  const name = String(product?.name ?? '').toLowerCase();
  return (
    cat.includes('toner') ||
    cat.includes('tóner') ||
    cat.includes('suministro') ||
    cat.includes('repuesto') ||
    cat.includes('accesorio') ||
    cat.includes('consumible') ||
    cat.includes('partes') ||
    cat.includes('refacci') ||
    name.includes('toner') ||
    name.includes('tóner') ||
    name.includes('cartucho') ||
    name.includes('grapa') ||
    name.includes('staple')
  );
}

export function isPrinterProductSeo(product) {
  if (isConsumableOrAccessoryProductSeo(product)) return false;

  const text = `${product?.category ?? ''} ${product?.name ?? ''}`.toLowerCase();
  return (
    text.includes('impres') ||
    text.includes('multifunc') ||
    text.includes('plotter') ||
    text.includes('ricoh') ||
    text.includes('bizhub')
  );
}

export function resolveProductHeroBrandSeo(product) {
  const fromInventory = product?.brand?.trim();
  if (fromInventory) return fromInventory.toUpperCase();

  const fromName = String(product?.name ?? '').match(KNOWN_BRAND_PATTERN)?.[1];
  if (fromName) return fromName.toUpperCase();

  return null;
}

export function resolveProductHeroCodeSeo(product) {
  const raw = product?.code?.trim();
  if (!raw) return null;

  let cleaned = stripProductCodePrefix(raw);
  const brand = product?.brand?.trim();
  if (brand && cleaned.toUpperCase().startsWith(brand.toUpperCase())) {
    cleaned = cleaned.slice(brand.length).trim();
  }
  cleaned = normalizeProductCodeSuffix(cleaned, {
    brand: product?.brand,
    category: product?.category ?? null,
    name: product?.name,
  });

  return cleaned || raw;
}

export function resolveProductEquipmentConditionLabelSeo(product) {
  if (!isPrinterProductSeo(product)) return null;

  if (productQualifiesAsSeminuevaEquipment(product)) return 'Seminueva';
  if (productQualifiesAsRemanufacturadaEquipment(product)) return 'Remanufacturada';

  const category = String(product?.category ?? '').toLowerCase();
  if (category.includes('seminuevas')) return 'Seminueva';
  if (category.includes('remanufacturadas') || category.includes('remanufacturados')) {
    return 'Remanufacturada';
  }

  if (productQualifiesAsNuevaEquipment(product)) return 'Nueva';
  if (category.includes('nuevas') || category.includes('nuevos')) return 'Nueva';

  return 'Nueva';
}

export function resolveSchemaItemCondition(product) {
  const label = resolveProductEquipmentConditionLabelSeo(product);
  if (label === 'Seminueva') return 'https://schema.org/UsedCondition';
  if (label === 'Remanufacturada') return 'https://schema.org/RefurbishedCondition';
  return 'https://schema.org/NewCondition';
}

export function extractProductModel(product) {
  const attributes = Array.isArray(product?.attributes) ? product.attributes : [];
  for (const row of attributes) {
    const key = String(row?.name ?? '').toLowerCase();
    if (/modelo/.test(key) && row?.value?.trim()) {
      return row.value.trim().toUpperCase().replace(/\s+/g, ' ');
    }
  }

  const name = String(product?.name ?? '');
  for (const pattern of MODEL_PATTERNS) {
    const match = name.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, ' ').trim().toUpperCase();
    }
  }

  return null;
}

function extractVariantSuffix(name) {
  const match = String(name ?? '').match(/\((SPDF|ADF|D\.Scan[^)]*)\)/i);
  return match?.[1]?.trim().toUpperCase() ?? null;
}

function findAttributeValue(product, needles) {
  const attributes = Array.isArray(product?.attributes) ? product.attributes : [];
  for (const row of attributes) {
    const key = String(row?.name ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '');
    if (needles.some((needle) => key.includes(needle))) {
      const value = row?.value?.trim();
      if (value) return value;
    }
  }
  return null;
}

function resolveEquipmentTypeLabel(product) {
  const haystack = `${product?.category ?? ''} ${product?.name ?? ''}`.toLowerCase();
  if (haystack.includes('multifunc')) return 'Impresora Multifuncional';
  if (haystack.includes('impresora')) return 'Impresora';
  if (haystack.includes('plotter') || haystack.includes('formato ancho')) {
    return 'Plotter';
  }
  return 'Equipo';
}

function resolveSpeedSpec(product) {
  return findAttributeValue(product, ['velocidad', 'ppm']);
}

function resolveConnectivitySpec(product) {
  return findAttributeValue(product, ['conectividad']);
}

function resolveScreenSpec(product) {
  return findAttributeValue(product, ['pantalla']);
}

function formatPenSeo(usd) {
  const pen = usdToPenSeo(usd);
  return `S/ ${pen.toLocaleString('es-PE')}`;
}

export function cleanProductInventoryDescription(product) {
  return String(product?.description ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True cuando el producto tiene copy propio en inventario (va a la pestaña Descripción). */
export function hasProductInventoryDescription(product) {
  return cleanProductInventoryDescription(product).length > 0;
}

/**
 * Title optimizado para búsquedas por modelo (~60 chars).
 */
export function formatProductPageTitleSeo(product) {
  const explicitName = String(product?.name ?? 'Producto').trim();
  if (!isPrinterProductSeo(product)) {
    const suffix = SITE_SUFFIX;
    if (explicitName.length + suffix.length <= 60) return `${explicitName}${suffix}`;
    return `${explicitName.slice(0, 60 - suffix.length - 1)}…${suffix}`;
  }

  const brand = resolveProductHeroBrandSeo(product) ?? 'RICOH';
  const model = extractProductModel(product);
  const condition = resolveProductEquipmentConditionLabelSeo(product);
  const variant = extractVariantSuffix(explicitName);
  const typeLabel = resolveEquipmentTypeLabel(product);

  const parts = [typeLabel];
  if (condition) parts.push(condition);
  parts.push(brand);
  if (model) parts.push(model);
  if (variant) parts.push(`(${variant})`);

  let title = parts.join(' ');
  const suffix = SITE_SUFFIX;
  if (title.length + suffix.length <= 60) return `${title}${suffix}`;

  if (model) {
    title = `${typeLabel} ${condition ?? ''} ${brand} ${model}`.replace(/\s+/g, ' ').trim();
    if (variant && title.length + variant.length + suffix.length + 3 <= 60) {
      title = `${title} (${variant})`;
    }
  }

  if (title.length + suffix.length > 60) {
    title = title.slice(0, 60 - suffix.length - 1).trim();
    title = `${title}…`;
  }

  return `${title}${suffix}`;
}

/**
 * Meta description con specs, precio PEN y CTA Perú (~155 chars).
 */
export function buildProductMetaDescriptionSeo(product, options = {}) {
  const cleaned = cleanProductInventoryDescription(product);

  const priceUsd = Number(product?.price ?? product?.prices?.public ?? 0);
  const penLabel = priceUsd > 0 ? formatPenSeo(priceUsd) : null;
  const stock = Math.max(0, Math.floor(Number(product?.stock) || 0));
  const stockHint =
    stock <= 0 ? 'Consultar disponibilidad' : stock <= 3 ? 'Últimas unidades' : 'En stock';

  if (cleaned) {
    const pricePart = penLabel ? ` Desde ${penLabel}.` : '';
    return truncateMetaDescription(`${cleaned}${pricePart} Cotiza online con envío a todo el Perú.`);
  }

  if (isPrinterProductSeo(product)) {
    const model = extractProductModel(product);
    const speed = resolveSpeedSpec(product);
    const screen = resolveScreenSpec(product);
    const connectivity = resolveConnectivitySpec(product);

    const specParts = [];
    if (speed) specParts.push(speed);
    else specParts.push('alta velocidad');
    specParts.push('impresión, copia, escaneo y fax');
    if (screen) specParts.push(`pantalla ${screen}`);
    if (connectivity) specParts.push(connectivity.split(/[,/]/)[0]?.trim());

    const intro = model
      ? `${resolveEquipmentTypeLabel(product)} RICOH ${model} — fotocopiadora multifuncional: ${specParts.slice(0, 3).join(', ')}.`
      : `${explicitIntro(product)} ${specParts.slice(0, 2).join(', ')}. Venta con garantía.`;

    const pricePart = penLabel ? ` Desde ${penLabel}.` : '';
    const tail = `${stockHint}. Cotiza online con envío a todo el Perú.`;
    return truncateMetaDescription(`${intro}${pricePart} ${tail}`);
  }

  const categoryLower = String(product?.category ?? '').toLowerCase();
  const nameLower = String(product?.name ?? '').toLowerCase();
  const isTonerOrInk =
    /toner|tóner|cartucho|tinta|ink|suministro|consumible/i.test(categoryLower) ||
    /toner|tóner|cartucho|tinta/i.test(nameLower);
  const isSparePart =
    /repuesto|partes|unidad de imagen|cilindro|fusor|rodillo/i.test(categoryLower);

  const brand = product?.brand?.trim();
  const category = product?.category?.trim();
  const name = String(product?.name ?? 'Producto').trim();
  const qualifiers = [brand, category].filter(Boolean).join(' · ');
  let intro = qualifiers ? `${name} (${qualifiers})` : name;

  if (isTonerOrInk) {
    const supplyKind = /tinta|ink/i.test(categoryLower + nameLower) ? 'tinta' : 'tóner';
    intro = `${name} — ${supplyKind} Ricoh${brand ? ` ${brand}` : ''}. Repuesto original o compatible.`;
  } else if (isSparePart) {
    intro = `${name} — repuesto Ricoh${brand ? ` ${brand}` : ''} para impresoras y fotocopiadoras.`;
  }

  const pricePart = penLabel ? ` Desde ${penLabel}.` : '';
  return truncateMetaDescription(
    `${intro}${pricePart} Compra con Distribuidor Autorizado Ricoh HaiTech. Envío a todo el Perú.`,
  );
}

function explicitIntro(product) {
  const name = String(product?.name ?? 'Producto').trim();
  const brand = resolveProductHeroBrandSeo(product);
  if (brand && !name.toUpperCase().includes(brand)) {
    return `${resolveEquipmentTypeLabel(product)} ${brand}`;
  }
  return name;
}

/**
 * Párrafo SEO automático en el hero (desactivado en vitrina).
 */
export function buildProductSeoBodyParagraph(_product) {
  return null;
}

export function buildProductOgProductMeta(product) {
  const priceUsd = Number(product?.price ?? product?.prices?.public ?? 0);
  const stock = Math.max(0, Math.floor(Number(product?.stock) || 0));
  const brand = resolveProductHeroBrandSeo(product) ?? product?.brand?.trim() ?? 'Ricoh';
  const sku = resolveProductHeroCodeSeo(product) ?? product?.code ?? product?.id ?? '';

  return {
    priceAmount: priceUsd > 0 ? priceUsd.toFixed(2) : null,
    priceCurrency: product?.currency ?? 'USD',
    priceAmountPen: priceUsd > 0 ? String(usdToPenSeo(priceUsd)) : null,
    availability: stock > 0 ? 'instock' : 'out of stock',
    brand,
    retailerItemId: sku,
  };
}

export function suggestProductSlug(product) {
  const explicit = String(product?.slug ?? '').trim();
  if (explicit) return explicit.toLowerCase();
  return proposeProductSlug(product);
}

export function priceValidUntilSeo(daysAhead = 90) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}
