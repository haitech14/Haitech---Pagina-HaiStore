import {
  ADF_ATTR,
  FORMATO_PAPEL_ATTR,
  PRODUCCION_ATTR,
  countProductsForCatalogAttributeKey,
  inferAdf,
  inferColor,
  inferFormatoPapel,
  inferFormatoPapelFromModel,
  inferProduccionTier,
  productAttributeKeys,
  productMatchesCatalogAttributeFilters,
  isDualFormatA4PrimaryProduct,
  resolveCatalogListFormatoPapel,
  resolveFormatoPapel,
  resolveFormatoPapelBadgeLabels,
  resolveFormatoPapelDisplayLabel,
  resolveProductCatalogAttributeKeys,
} from '../../shared/catalog-attribute-filters.js';
// @ts-ignore módulo JS compartido sin declaración de tipos
import {
  MOST_VIEWED_OFFER_ATTR_KEY,
  productHasMostViewedOfferAttribute,
  resolveMostViewedOfferProductIds,
} from '../../shared/catalog-most-viewed-offers.js';
// @ts-ignore módulo JS compartido sin declaración de tipos
import { isHomeCarouselExcludedProduct } from '../../shared/home-excluded-products.js';
import { sortProductsByPublicPriceAsc } from '@/lib/inventory-product-order';
import type { Product } from '@/types/product';

export {
  ADF_ATTR,
  FORMATO_PAPEL_ATTR,
  PRODUCCION_ATTR,
  inferAdf,
  inferColor,
  inferFormatoPapel,
  inferFormatoPapelFromModel,
  inferProduccionTier,
  productAttributeKeys,
  isDualFormatA4PrimaryProduct,
  resolveCatalogListFormatoPapel,
  resolveFormatoPapel,
  resolveFormatoPapelBadgeLabels,
  resolveFormatoPapelDisplayLabel,
  resolveProductCatalogAttributeKeys,
};
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
  'toner-compatibles': [
    'Color::Cyan',
    'Color::Magenta',
    'Color::Yellow',
    'Color::Negro',
    'Color::Color',
    'Color::B/N',
  ],
};

const QUICK_FILTER_CHIP_LABELS: Record<string, string> = {
  [ADF_ESTANDAR_KEY]: 'ADF Estándar',
  [ADF_DOBLE_SCAN_KEY]: 'ADF Doble Scan',
  [`${FORMATO_PAPEL_ATTR}::A4`]: 'Formato A4',
  [`${FORMATO_PAPEL_ATTR}::A3`]: 'Formato A3',
  'Color::B/N': 'B/N',
  'Color::Color': 'Color',
  'Color::Cyan': 'Cyan',
  'Color::Magenta': 'Magenta',
  'Color::Yellow': 'Amarillo',
  'Color::Negro': 'Negro',
};

export function getQuickFilterChipLabel(attr: { key: string; label: string }): string {
  if (QUICK_FILTER_CHIP_LABELS[attr.key]) return QUICK_FILTER_CHIP_LABELS[attr.key];
  return attr.label.split(': ')[1] ?? attr.label;
}

export type CatalogAttributeFilter = {
  key: string;
  label: string;
  count: number;
};

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

export function shouldShowProductionFilters(slug: string | undefined, isStoreAll = false): boolean {
  return isStoreAll || slug === 'multifuncionales' || slug === 'impresoras';
}

export function shouldShowSpeedFilters(slug: string | undefined, isStoreAll = false): boolean {
  return shouldShowCatalogSpecFilterTabs(slug) || isStoreAll;
}

export {
  SPEED_FILTER_OPTIONS,
  countProductsForSpeedFilterKey,
  findSpeedFilterOption,
  productMatchesSpeedFilterKey,
  productMatchesSpeedFilterKeys,
  resolveProductSpeedPpm,
} from '../../shared/catalog-speed-filter.js';

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
    if (resolveCatalogListFormatoPapel(product) === 'A3') {
      a3.push(product);
    } else {
      a4.push(product);
    }
  }

  return { a4, a3, ordered: [...a4, ...a3] };
}

export function buildCatalogFormatSections(
  products: readonly Product[],
): CatalogFormatSectionGroup[] {
  const visibleProducts = products.filter((product) => !isHomeCarouselExcludedProduct(product));
  const { bn, color } = splitProductsByCatalogColor(visibleProducts);
  const bnByPaper = splitProductsByPaperFormat(bn);
  const colorByPaper = splitProductsByPaperFormat(color);

  return [
    {
      id: 'bn',
      title: 'B/N',
      subsections: [
        {
          id: 'bn-a4',
          title: 'A4',
          products: sortCatalogSubsectionProducts(bnByPaper.a4),
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
  const paperId =
    resolveCatalogListFormatoPapel(product) === 'A3' ? `${colorId}-a3` : `${colorId}-a4`;
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
    slug === 'toner-compatibles' ||
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
  BRAND_FILTER_OPTIONS,
  buildBrandFacets,
  buildBrandFilterOptions,
  countProductsForBrandFilterKey,
  findBrandFilterOption,
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

export function productMatchesCatalogFilters(
  product: Product,
  attributeKeys: string[],
  productionKey: string | null,
  catalogContextProducts?: readonly Product[],
): boolean {
  const offerIds =
    catalogContextProducts?.length && attributeKeys.includes(MOST_VIEWED_OFFER_ATTR_KEY)
      ? resolveMostViewedOfferProductIds(catalogContextProducts)
      : new Set<string>();
  return productMatchesCatalogAttributeFilters(
    product,
    attributeKeys,
    productionKey,
    offerIds,
  );
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
  return countProductsForCatalogAttributeKey(products, key);
}

export { MOST_VIEWED_OFFER_ATTR_KEY };
