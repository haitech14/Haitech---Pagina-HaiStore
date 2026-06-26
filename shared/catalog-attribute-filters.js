/**
 * Inferencia de atributos de catálogo (Color, Formato, Producción, ADF).
 * Paridad con src/lib/category-catalog-filters.ts — usado por API y cliente.
 */
import {
  MOST_VIEWED_OFFER_ATTR_KEY,
  productHasMostViewedOfferAttribute,
} from './catalog-most-viewed-offers.js';

export const FORMATO_PAPEL_ATTR = 'Formato papel';
export const PRODUCCION_ATTR = 'Producción';
export const ADF_ATTR = 'Alimentador (ADF)';

/** Equipos A3 que también deben coincidir con filtro A4 (mismo id). */
const CATALOG_FORMAT_CROSS_LIST_TO_A4_PATTERNS = [
  /\bim\s*430\s*f\b/i,
  /\bim\s*460\s*f\b/i,
];

function attributeKey(name, value) {
  return `${name}::${value}`;
}

function normalizeAdfValue(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || /no tiene/i.test(trimmed)) return null;
  if (/doble\s*scan/i.test(trimmed)) return 'Doble Scan';
  if (/estandar|estándar/i.test(trimmed)) return 'Estándar';
  return null;
}

export function productAttributeKeys(product) {
  const keys = new Set();
  for (const attr of product?.attributes ?? []) {
    const name = String(attr?.name ?? '').trim();
    const value = String(attr?.value ?? '').trim();
    if (!name || !value) continue;
    if (name === ADF_ATTR || /alimentador.*adf/i.test(name)) {
      const adf = normalizeAdfValue(value);
      if (adf) keys.add(attributeKey(ADF_ATTR, adf));
      continue;
    }
    keys.add(attributeKey(name, value));
  }
  return keys;
}

export function inferAdf(product) {
  const haystack = String(product?.name ?? '').toLowerCase();
  const stored = (product?.attributes ?? []).find(
    (attr) =>
      String(attr?.name ?? '').trim() === ADF_ATTR ||
      /alimentador.*adf/i.test(String(attr?.name ?? '')),
  );
  if (stored) return normalizeAdfValue(stored.value);

  if (/\blaser\b/.test(haystack) && !/multifunc/i.test(product?.category ?? '')) return null;
  if (/\bim\s*430f\b|\bim\s*460f\b|\bim\s*550f\b|\bim\s*600f\b/.test(haystack)) {
    return 'Doble Scan';
  }
  if (/multifunc/i.test(product?.category ?? '') || /\b(impresora|multifunc)/i.test(haystack)) {
    return 'Estándar';
  }
  return null;
}

function productFormatoHaystack(product) {
  return `${product?.name ?? ''} ${product?.category ?? ''}`.toLowerCase();
}

export function inferFormatoPapelFromModel(product) {
  const haystack = productFormatoHaystack(product);

  if (
    /\b(mp\s*305\s*\+|mp\s*3055|mp\s*3555|mp\s*5055|mp\s*6055|mp\s*7503)\b/.test(haystack) ||
    /\b(im\s*460\s*f|im\s*2500|im\s*3000|im\s*4000|im\s*5000|im\s*6000|im\s*7000|im\s*8000|im\s*9000)\b/.test(
      haystack,
    ) ||
    /\b(pro\s+c9500|pro\s+c7500|pro\s+c5400|pro\s+c5410|im\s*c8000|im\s*c6010|im\s*c6510|im\s*c7510|pro\s+84)\b/.test(
      haystack,
    ) ||
    haystack.includes('planos') ||
    haystack.includes('formato ancho')
  ) {
    return 'A3';
  }

  if (
    /\b(mp\s*4054|mp\s*4055|mp\s*401|mp\s*402|mp\s*501)\b/.test(haystack) ||
    /\b(im\s*430\s*f|im\s*550\s*f|im\s*600\s*f|im\s*350\s*f|im\s*250\s*f)\b/.test(haystack)
  ) {
    return 'A4';
  }

  return null;
}

export function inferFormatoPapel(product) {
  return inferFormatoPapelFromModel(product) ?? 'A4';
}

export function resolveFormatoPapel(product) {
  const fromModel = inferFormatoPapelFromModel(product);
  if (fromModel) return fromModel;

  const keys = productAttributeKeys(product);
  if (keys.has(attributeKey(FORMATO_PAPEL_ATTR, 'A3'))) return 'A3';
  if (keys.has(attributeKey(FORMATO_PAPEL_ATTR, 'A4'))) return 'A4';

  const stored = (product?.attributes ?? []).find((attr) =>
    /formato\s*papel|tamaño|formato/i.test(String(attr?.name ?? '').trim()),
  );
  if (stored?.value?.trim()) {
    const value = stored.value.trim().toUpperCase();
    if (value.includes('A3')) return 'A3';
    if (value.includes('A4')) return 'A4';
  }

  return inferFormatoPapel(product);
}

export function inferProduccionTier(product) {
  const haystack = String(product?.name ?? '').toUpperCase();

  if (
    /\bPRO\s+C9500\b/.test(haystack) ||
    /\bPRO\s+C7500\b/.test(haystack) ||
    /\bIM\s*9000\b/.test(haystack) ||
    /\bIM\s*8000\b/.test(haystack) ||
    /\bIM\s*C8000\b/.test(haystack) ||
    /\bPRO\s+84/.test(haystack) ||
    haystack.includes('PLANOS')
  ) {
    return 'Producción (200,000 a 500,000 páginas aprox)';
  }

  if (
    /\bIM\s*7000\b/.test(haystack) ||
    /\bIM\s*6000\b/.test(haystack) ||
    /\bIM\s*5000\b/.test(haystack) ||
    /\bIM\s*4000\b/.test(haystack) ||
    /\bIM\s*C6010\b/.test(haystack) ||
    /\bIM\s*C6500\b/.test(haystack) ||
    /\bPRO\s+C54/.test(haystack) ||
    /\bMP\s*7503\b/.test(haystack) ||
    /\bIM\s*600F\b/.test(haystack)
  ) {
    return 'Alta Producción (50,000 páginas aprox)';
  }

  if (
    /\bIM\s*550/.test(haystack) ||
    /\bIM\s*5000\b/.test(haystack) ||
    /\bIM\s*3000\b/.test(haystack) ||
    /\bIM\s*2500\b/.test(haystack) ||
    /\bMP\s*4054\b/.test(haystack) ||
    /\bMP\s*5055\b/.test(haystack) ||
    /\bIM\s*C3010\b/.test(haystack) ||
    /\bIM\s*C4510\b/.test(haystack) ||
    /\bPRO\s+C52/.test(haystack)
  ) {
    return 'Mediano (15,000 páginas aprox)';
  }

  return 'Basico (>5000 páginas)';
}

export function inferColor(product) {
  const stored = (product?.attributes ?? []).find((attr) =>
    /color/i.test(String(attr?.name ?? '').trim()),
  );
  if (stored?.value?.trim()) {
    const value = stored.value.trim();
    if (/^color$/i.test(value) || /a color/i.test(value)) return 'Color';
    if (/b\/n|negro|monocrom/i.test(value)) return 'B/N';
  }

  const haystack = `${product?.name ?? ''} ${product?.category ?? ''}`.toLowerCase();
  if (/\bcolor\b|a color|\bc\d{3,4}\b|\bim\s*c/i.test(haystack)) return 'Color';
  return 'B/N';
}

function isPrinterEquipmentForSpecFilters(product) {
  const haystack = `${product?.name ?? ''} ${product?.category ?? ''}`.toLowerCase();
  return /multifunc|impresor|laser|plotter|copiadora/.test(haystack);
}

function productMatchesModelPatterns(product, patterns) {
  const haystack = `${product?.name ?? ''} ${product?.code ?? ''} ${product?.id ?? ''}`;
  return patterns.some((pattern) => pattern.test(haystack));
}

function isCrossListedToA4(product) {
  return (
    inferFormatoPapelFromModel(product) === 'A3' &&
    productMatchesModelPatterns(product, CATALOG_FORMAT_CROSS_LIST_TO_A4_PATTERNS)
  );
}

/** Claves de filtro de catálogo (atributos almacenados + inferencia por modelo). */
export function resolveProductCatalogAttributeKeys(product) {
  const keys = productAttributeKeys(product);
  const isMultifuncional = /multifunc/i.test(product?.category ?? '');
  const useSpecInference = isMultifuncional || isPrinterEquipmentForSpecFilters(product);

  if (!useSpecInference) return keys;

  if (![...keys].some((key) => key.startsWith(`${FORMATO_PAPEL_ATTR}::`))) {
    keys.add(attributeKey(FORMATO_PAPEL_ATTR, resolveFormatoPapel(product)));
  }

  if (isCrossListedToA4(product)) {
    keys.add(attributeKey(FORMATO_PAPEL_ATTR, 'A4'));
  }

  if (![...keys].some((key) => key.startsWith('Color::'))) {
    keys.add(attributeKey('Color', inferColor(product)));
  }

  if (!isMultifuncional) return keys;

  if (![...keys].some((key) => key.startsWith(`${PRODUCCION_ATTR}::`))) {
    keys.add(attributeKey(PRODUCCION_ATTR, inferProduccionTier(product)));
  }

  if (![...keys].some((key) => key.startsWith(`${ADF_ATTR}::`))) {
    const adf = inferAdf(product);
    if (adf) keys.add(attributeKey(ADF_ATTR, adf));
  }

  return keys;
}

export function productMatchesCatalogAttributeFilters(
  product,
  attributeKeys,
  productionKey,
  offerIds = new Set(),
) {
  const resolved = resolveProductCatalogAttributeKeys(product);
  if (offerIds.size > 0 && attributeKeys.includes(MOST_VIEWED_OFFER_ATTR_KEY)) {
    if (productHasMostViewedOfferAttribute(product, offerIds)) {
      resolved.add(MOST_VIEWED_OFFER_ATTR_KEY);
    }
  }
  if (attributeKeys.length > 0 && !attributeKeys.every((key) => resolved.has(key))) {
    return false;
  }
  if (productionKey && !resolved.has(productionKey)) return false;
  return true;
}

export function countProductsForCatalogAttributeKey(products, key) {
  return products.filter((product) => resolveProductCatalogAttributeKeys(product).has(key)).length;
}

/** Atributos inferidos para persistir en inventario (solo los que faltan o están vacíos). */
export function buildInferredEquipmentCatalogAttributes(product) {
  const isMultifuncional = /multifunc/i.test(product?.category ?? '');
  if (!isMultifuncional && !isPrinterEquipmentForSpecFilters(product)) {
    return [];
  }

  const inferred = [];
  const existing = new Map(
    (product?.attributes ?? []).map((attr) => [String(attr?.name ?? '').trim(), attr]),
  );

  const upsert = (name, value) => {
    if (!value) return;
    const current = existing.get(name);
    if (current?.value?.trim()) return;
    inferred.push({ name, value });
  };

  upsert('Color', inferColor(product));
  upsert(FORMATO_PAPEL_ATTR, resolveFormatoPapel(product));
  if (isMultifuncional) {
    upsert(PRODUCCION_ATTR, inferProduccionTier(product));
    upsert(ADF_ATTR, inferAdf(product));
  }

  return inferred;
}
