import {
  CATALOG_FORMAT_CROSS_LIST_TO_A4_PATTERNS,
} from '@/data/catalog-format-spotlight';
// @ts-ignore módulo JS compartido sin declaración de tipos
import { isHomeCarouselExcludedProduct } from '../../shared/home-excluded-products.js';
// @ts-ignore módulo JS compartido sin declaración de tipos
import {
  MOST_VIEWED_OFFER_ATTR_KEY,
  productHasMostViewedOfferAttribute,
  resolveMostViewedOfferProductIds,
} from '../../shared/catalog-most-viewed-offers.js';
import { sortProductsByPublicPriceAsc } from '@/lib/inventory-product-order';
import type { Product } from '@/types/product';

export const FORMATO_PAPEL_ATTR = 'Formato papel';
export const PRODUCCION_ATTR = 'Producción';
export const ADF_ATTR = 'Alimentador (ADF)';
export const MODELO_EQUIPO_ATTR = 'Modelo de equipo';
export const RENDIMIENTO_ATTR = 'Rendimiento (5%)';

export const ADF_ESTANDAR_KEY = `${ADF_ATTR}::Estándar`;
export const ADF_DOBLE_SCAN_KEY = `${ADF_ATTR}::Doble Scan`;

export const EXCLUDED_QUICK_ATTRIBUTE_KEYS = new Set([
  `${ADF_ATTR}::No tiene`,
  `${ADF_ATTR}::Estandar`,
  MOST_VIEWED_OFFER_ATTR_KEY,
]);

export const PRODUCTION_FILTER_OPTIONS = [
  {
    key: `${PRODUCCION_ATTR}::Basico (>5000 páginas)`,
    label: 'Basico (>5000 páginas)',
    sidebarLabel: 'Básico >5k',
    value: 'Basico (>5000 páginas)',
  },
  {
    key: `${PRODUCCION_ATTR}::Mediano (15,000 páginas aprox)`,
    label: 'Mediano (15,000 páginas aprox)',
    sidebarLabel: 'Mediano ~15k',
    value: 'Mediano (15,000 páginas aprox)',
  },
  {
    key: `${PRODUCCION_ATTR}::Alta Producción (50,000 páginas aprox)`,
    label: 'Alta Producción (50,000 páginas aprox)',
    sidebarLabel: 'Alta ~50k',
    value: 'Alta Producción (50,000 páginas aprox)',
  },
  {
    key: `${PRODUCCION_ATTR}::Producción (200,000 a 500,000 páginas aprox)`,
    label: 'Producción (200,000 a 500,000 páginas aprox)',
    sidebarLabel: '200k–500k',
    value: 'Producción (200,000 a 500,000 páginas aprox)',
  },
] as const;

export function isProduccionAttributeKey(key: string): boolean {
  return key.startsWith(`${PRODUCCION_ATTR}::`);
}

export function isModeloEquipoAttributeKey(key: string): boolean {
  return key.startsWith(`${MODELO_EQUIPO_ATTR}::`);
}

export function isRendimientoAttributeKey(key: string): boolean {
  return key.startsWith(`${RENDIMIENTO_ATTR}::`);
}

export function isSpecQuickAttributeKey(key: string): boolean {
  return !isProduccionAttributeKey(key) && !isModeloEquipoAttributeKey(key) && !isRendimientoAttributeKey(key);
}

/** Chips rápidos por slug de categoría (valor mostrado = parte tras «nombre: »). */
const QUICK_FILTER_KEYS_BY_SLUG: Record<string, readonly string[]> = {
  multifuncionales: [
    'Color::B/N',
    'Color::Color',
    ADF_ESTANDAR_KEY,
    ADF_DOBLE_SCAN_KEY,
    `${FORMATO_PAPEL_ATTR}::A4`,
    `${FORMATO_PAPEL_ATTR}::A3`,
  ],
  impresoras: [
    'Color::B/N',
    'Color::Color',
    ADF_ESTANDAR_KEY,
    ADF_DOBLE_SCAN_KEY,
    `${FORMATO_PAPEL_ATTR}::A4`,
    `${FORMATO_PAPEL_ATTR}::A3`,
  ],
};

const QUICK_FILTER_CHIP_LABELS: Record<string, string> = {
  [ADF_ESTANDAR_KEY]: 'ADF Estándar',
  [ADF_DOBLE_SCAN_KEY]: 'ADF Doble Scan',
  [`${FORMATO_PAPEL_ATTR}::A4`]: 'Formato A4',
  [`${FORMATO_PAPEL_ATTR}::A3`]: 'Formato A3',
  'Color::B/N': 'B/N',
  'Color::Color': 'Color',
};

export function getQuickFilterChipLabel(attr: { key: string; label: string }): string {
  if (QUICK_FILTER_CHIP_LABELS[attr.key]) return QUICK_FILTER_CHIP_LABELS[attr.key];
  return attr.label.split(': ')[1] ?? attr.label;
}

function normalizeAdfValue(value: string): 'Estándar' | 'Doble Scan' | null {
  const trimmed = value.trim();
  if (!trimmed || /no tiene/i.test(trimmed)) return null;
  if (/doble\s*scan/i.test(trimmed)) return 'Doble Scan';
  if (/estandar|estándar/i.test(trimmed)) return 'Estándar';
  return null;
}

export type CatalogAttributeFilter = {
  key: string;
  label: string;
  count: number;
};

function attributeKey(name: string, value: string): string {
  return `${name}::${value}`;
}

export function productAttributeKeys(product: Product): Set<string> {
  const keys = new Set<string>();
  for (const attr of product.attributes ?? []) {
    const name = attr.name.trim();
    const value = attr.value.trim();
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

/** Inferencia ADF para multifuncionales (alineado con badges de ficha). */
export function inferAdf(product: Product): 'Estándar' | 'Doble Scan' | null {
  const haystack = product.name.toLowerCase();
  const stored = (product.attributes ?? []).find(
    (attr) => attr.name.trim() === ADF_ATTR || /alimentador.*adf/i.test(attr.name),
  );
  if (stored) return normalizeAdfValue(stored.value);

  if (/\blaser\b/.test(haystack) && !/multifunc/i.test(product.category ?? '')) return null;
  if (/\bim\s*430f\b|\bim\s*460f\b|\bim\s*550f\b|\bim\s*600f\b/.test(haystack)) return 'Doble Scan';
  if (/multifunc/i.test(product.category ?? '') || /\b(impresora|multifunc)/i.test(haystack)) {
    return 'Estándar';
  }
  return null;
}

export function productMatchesAttributeKeys(product: Product, keys: string[]): boolean {
  if (keys.length === 0) return true;
  const attrs = productAttributeKeys(product);
  return keys.every((key) => attrs.has(key));
}

export function productMatchesProductionKey(product: Product, key: string | null): boolean {
  if (!key) return true;
  return productAttributeKeys(product).has(key);
}

export function buildCatalogQuickFilters(
  slug: string | undefined,
  availableAttributes: CatalogAttributeFilter[],
): CatalogAttributeFilter[] {
  const configured = slug ? QUICK_FILTER_KEYS_BY_SLUG[slug] : undefined;
  const attrByKey = new Map(availableAttributes.map((attr) => [attr.key, attr]));

  if (configured) {
    return configured
      .filter((key) => !EXCLUDED_QUICK_ATTRIBUTE_KEYS.has(key))
      .map((key) => {
        const found = attrByKey.get(key);
        if (found) return found;
        const [name, value] = key.split('::');
        return {
          key,
          label: `${name}: ${value}`,
          count: 0,
        };
      });
  }

  return availableAttributes
    .filter((attr) => !EXCLUDED_QUICK_ATTRIBUTE_KEYS.has(attr.key))
    .filter((attr) => isSpecQuickAttributeKey(attr.key))
    .slice(0, 6);
}

/** Filtros de modelo de equipo para la fila horizontal del catálogo. */
export function buildModelQuickFilters(
  availableAttributes: CatalogAttributeFilter[],
): CatalogAttributeFilter[] {
  return availableAttributes
    .filter((attr) => isModeloEquipoAttributeKey(attr.key))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
}

export function getModeloEquipoChipLabel(attr: { key: string; label: string }): string {
  if (!isModeloEquipoAttributeKey(attr.key)) {
    return getQuickFilterChipLabel(attr);
  }
  const value = attr.key.slice(`${MODELO_EQUIPO_ATTR}::`.length);
  return value || (attr.label.split(': ')[1] ?? attr.label);
}

export function shouldShowProductionFilters(slug: string | undefined): boolean {
  return slug === 'multifuncionales' || slug === 'tienda';
}

function productFormatoHaystack(product: Product): string {
  return `${product.name} ${product.category ?? ''}`.toLowerCase();
}

/** Inferencia por modelo conocido; `null` si no hay regla explícita. */
export function inferFormatoPapelFromModel(product: Product): 'A4' | 'A3' | null {
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

export function inferFormatoPapel(product: Product): 'A4' | 'A3' {
  return inferFormatoPapelFromModel(product) ?? 'A4';
}

/** Formato papel: modelo conocido, atributo almacenado o inferencia por defecto. */
export function resolveFormatoPapel(product: Product): 'A4' | 'A3' {
  const fromModel = inferFormatoPapelFromModel(product);
  if (fromModel) return fromModel;

  const keys = productAttributeKeys(product);
  if (keys.has(attributeKey(FORMATO_PAPEL_ATTR, 'A3'))) return 'A3';
  if (keys.has(attributeKey(FORMATO_PAPEL_ATTR, 'A4'))) return 'A4';

  const stored = (product.attributes ?? []).find((attr) =>
    /formato\s*papel|tamaño|formato/i.test(attr.name.trim()),
  );
  if (stored?.value?.trim()) {
    const value = stored.value.trim().toUpperCase();
    if (value.includes('A3')) return 'A3';
    if (value.includes('A4')) return 'A4';
  }

  return inferFormatoPapel(product);
}

export function inferProduccionTier(product: Product): (typeof PRODUCTION_FILTER_OPTIONS)[number]['value'] {
  const haystack = product.name.toUpperCase();

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

function isPrinterEquipmentForSpecFilters(product: Product): boolean {
  const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
  return /multifunc|impresor|laser|plotter|copiadora/.test(haystack);
}

export function inferColor(product: Product): 'B/N' | 'Color' {
  const stored = (product.attributes ?? []).find((attr) => /color/i.test(attr.name.trim()));
  if (stored?.value?.trim()) {
    const value = stored.value.trim();
    if (/^color$/i.test(value) || /a color/i.test(value)) return 'Color';
    if (/b\/n|negro|monocrom/i.test(value)) return 'B/N';
  }

  const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
  if (/\bcolor\b|a color|\bc\d{3,4}\b|\bim\s*c/i.test(haystack)) return 'Color';
  return 'B/N';
}

export function splitProductsByCatalogColor(products: readonly Product[]): {
  bn: Product[];
  color: Product[];
  ordered: Product[];
} {
  const bn: Product[] = [];
  const color: Product[] = [];

  for (const product of products) {
    if (inferColor(product) === 'Color') {
      color.push(product);
    } else {
      bn.push(product);
    }
  }

  return { bn, color, ordered: [...bn, ...color] };
}

export interface CatalogFormatSubsection {
  id: string;
  title: string;
  products: Product[];
}

export interface CatalogFormatSectionGroup {
  id: 'bn' | 'color';
  title: string;
  subsections: CatalogFormatSubsection[];
}

function productMatchesModelPatterns(product: Product, patterns: readonly RegExp[]): boolean {
  const haystack = `${product.name} ${product.code ?? ''} ${product.id}`;
  return patterns.some((pattern) => pattern.test(haystack));
}

function isCrossListedToA4(product: Product): boolean {
  return (
    inferFormatoPapelFromModel(product) === 'A3' &&
    productMatchesModelPatterns(product, CATALOG_FORMAT_CROSS_LIST_TO_A4_PATTERNS)
  );
}

/** Una tarjeta por producto al aplanar subsecciones B/N · A4/A3 del catálogo. */
export function dedupeCatalogProductsById(products: readonly Product[]): Product[] {
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const product of products) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    result.push(product);
  }
  return result;
}

function sortCatalogSubsectionProducts(products: readonly Product[]): Product[] {
  return sortProductsByPublicPriceAsc([...products]);
}

function splitProductsByPaperFormat(products: readonly Product[]): {
  a4: Product[];
  a3: Product[];
  ordered: Product[];
} {
  const a4: Product[] = [];
  const a3: Product[] = [];

  for (const product of products) {
    if (resolveFormatoPapel(product) === 'A3') {
      a3.push(product);
    } else {
      a4.push(product);
    }
  }

  return { a4, a3, ordered: [...a4, ...a3] };
}

/** Incluye en A4 equipos cross-list (mismo id) que ya están en A3 u otro bucket. */
function mergeCrossListedIntoA4(a4: Product[], sourceProducts: readonly Product[]): Product[] {
  const a4Ids = new Set(a4.map((product) => product.id));
  const crossListed: Product[] = [];

  for (const product of sourceProducts) {
    if (
      productMatchesModelPatterns(product, CATALOG_FORMAT_CROSS_LIST_TO_A4_PATTERNS) &&
      !a4Ids.has(product.id)
    ) {
      crossListed.push(product);
      a4Ids.add(product.id);
    }
  }

  if (crossListed.length === 0) return a4;
  return [...crossListed, ...a4];
}

export function buildCatalogFormatSections(
  products: readonly Product[],
): CatalogFormatSectionGroup[] {
  const visibleProducts = products.filter((product) => !isHomeCarouselExcludedProduct(product));
  const { bn, color } = splitProductsByCatalogColor(visibleProducts);
  const bnByPaper = splitProductsByPaperFormat(bn);
  const bnA4WithCrossList = mergeCrossListedIntoA4(bnByPaper.a4, bn);
  const colorByPaper = splitProductsByPaperFormat(color);

  return [
    {
      id: 'bn',
      title: 'B/N',
      subsections: [
        {
          id: 'bn-a4',
          title: 'A4',
          products: sortCatalogSubsectionProducts(bnA4WithCrossList),
        },
        {
          id: 'bn-a3',
          title: 'A3',
          products: sortCatalogSubsectionProducts(bnByPaper.a3),
        },
      ],
    },
    {
      id: 'color',
      title: 'Color',
      subsections: [
        { id: 'color-a4', title: 'A4', products: sortCatalogSubsectionProducts(colorByPaper.a4) },
        { id: 'color-a3', title: 'A3', products: sortCatalogSubsectionProducts(colorByPaper.a3) },
      ],
    },
  ];
}

export function findProductCatalogFormatPlacement(
  product: Product,
  sections: readonly CatalogFormatSectionGroup[],
): { section: CatalogFormatSectionGroup; subsection: CatalogFormatSubsection } | null {
  for (const section of sections) {
    for (const subsection of section.subsections) {
      if (subsection.products.some((row) => row.id === product.id)) {
        return { section, subsection };
      }
    }
  }

  const colorId = inferColor(product) === 'Color' ? 'color' : 'bn';
  const paperId = resolveFormatoPapel(product) === 'A3' ? `${colorId}-a3` : `${colorId}-a4`;
  const section = sections.find((row) => row.id === colorId);
  const subsection = section?.subsections.find((row) => row.id === paperId);
  if (!section || !subsection) return null;
  return { section, subsection };
}

export function getCatalogLayoutOrderedProducts(products: readonly Product[]): Product[] {
  const ordered = buildCatalogFormatSections(products).flatMap((section) =>
    section.subsections.flatMap((subsection) => subsection.products),
  );
  return dedupeCatalogProductsById(ordered);
}

export const CATALOG_SPEC_FILTER_TABS = [
  { key: 'Color::B/N', label: 'B/N' },
  { key: 'Color::Color', label: 'Color' },
  { key: `${FORMATO_PAPEL_ATTR}::A4`, label: 'Formato A4' },
  { key: `${FORMATO_PAPEL_ATTR}::A3`, label: 'Formato A3' },
] as const;

const FORMAT_FILTER_KEYS = new Set<string>(
  CATALOG_SPEC_FILTER_TABS.filter((tab) => tab.key.startsWith(`${FORMATO_PAPEL_ATTR}::`)).map(
    (tab) => tab.key,
  ),
);

const COLOR_FILTER_KEYS = new Set<string>(
  CATALOG_SPEC_FILTER_TABS.filter((tab) => tab.key.startsWith('Color::')).map((tab) => tab.key),
);

export const CATALOG_SPEC_FILTER_TAB_KEYS = new Set<string>(
  CATALOG_SPEC_FILTER_TABS.map((tab) => tab.key),
);

export function shouldShowCatalogSpecFilterTabs(slug: string | undefined): boolean {
  return slug === 'multifuncionales' || slug === 'impresoras' || slug === 'tienda';
}

/** Sidebar fijo, vista tabla/grilla y toolbar compacto (tóner, repuestos, equipos). */
export function shouldUseCatalogSidebarLayout(slug: string | undefined): boolean {
  return (
    shouldShowCatalogSpecFilterTabs(slug) ||
    slug === 'toner-suministros' ||
    slug === 'repuestos' ||
    slug === 'formato-ancho' ||
    slug === 'accesorios'
  );
}

export type CatalogBrandFilter = {
  key: string;
  label: string;
  count: number;
};

export {
  buildBrandFacets,
  getCatalogBrandLabel,
  normalizeCatalogBrandKey,
  productMatchesBrandFilter,
} from '../../shared/catalog-brand-filter.js';

export function buildCatalogSpecFilterTabs(products: readonly Product[]) {
  return CATALOG_SPEC_FILTER_TABS.map(({ key, label }) => ({
    key,
    label,
    count: countProductsForAttributeKey(products, key),
  }));
}

export function getSpecFilterDisplayLabel(key: string): string {
  if (key === 'Color::B/N') return 'Blanco y Negro';
  if (key === 'Color::Color') return 'Color';
  if (key === `${FORMATO_PAPEL_ATTR}::A4`) return 'A4';
  if (key === `${FORMATO_PAPEL_ATTR}::A3`) return 'A3';
  const parts = key.split('::');
  return parts[1] ?? key;
}

export function toggleCatalogSpecFilter(selectedKeys: readonly string[], key: string): string[] {
  if (selectedKeys.includes(key)) {
    return selectedKeys.filter((item) => item !== key);
  }

  const withoutSameGroup = selectedKeys.filter((item) => {
    if (FORMAT_FILTER_KEYS.has(key) && FORMAT_FILTER_KEYS.has(item)) return false;
    if (COLOR_FILTER_KEYS.has(key) && COLOR_FILTER_KEYS.has(item)) return false;
    return true;
  });

  return [...withoutSameGroup, key];
}

export function resolveProductCatalogAttributeKeys(product: Product): Set<string> {
  const keys = productAttributeKeys(product);
  const isMultifuncional = /multifunc/i.test(product.category ?? '');
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

export function productMatchesCatalogFilters(
  product: Product,
  attributeKeys: string[],
  productionKey: string | null,
  catalogContextProducts?: readonly Product[],
): boolean {
  const resolved = resolveProductCatalogAttributeKeys(product);
  if (catalogContextProducts?.length && attributeKeys.includes(MOST_VIEWED_OFFER_ATTR_KEY)) {
    const offerIds = resolveMostViewedOfferProductIds(catalogContextProducts);
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

export function countProductsForAttributeKey(
  products: readonly Product[],
  key: string,
): number {
  if (key === MOST_VIEWED_OFFER_ATTR_KEY) {
    const offerIds = resolveMostViewedOfferProductIds(products);
    return products.filter((product) => productHasMostViewedOfferAttribute(product, offerIds))
      .length;
  }
  return products.filter((product) => resolveProductCatalogAttributeKeys(product).has(key)).length;
}

export { MOST_VIEWED_OFFER_ATTR_KEY };
