import {
  inferAdf,
  inferProduccionTier,
  PRODUCCION_ATTR,
  PRODUCTION_FILTER_OPTIONS,
} from '@/lib/category-catalog-filters';
import { parseInventoryTagList } from '@/lib/inventory-tags';
import { buildProductDetailBadges } from '@/lib/product-detail-badges';
import type { Product } from '@/types/product';

export const PRODUCT_TABLE_SPEC_COLUMNS = [
  { id: 'velocidad', label: 'Velocidad' },
  { id: 'adf', label: 'ADF' },
  { id: 'produccion', label: 'Producción' },
  { id: 'anio', label: 'Año fab.' },
] as const;

const PRODUCTION_TABLE_LABELS: Record<string, string> = {
  'Basico (>5000 páginas)': 'Básico',
  'Mediano (15,000 páginas aprox)': 'Mediano',
  'Alta Producción (50,000 páginas aprox)': 'Alta prod.',
  'Producción (200,000 a 500,000 páginas aprox)': 'Producción',
};

export function formatProductTableCategory(category: string | null | undefined): string {
  if (!category?.trim()) return '—';
  const value = category.trim();
  if (value === 'Multifuncionales Seminuevas') return 'Multif. seminuevas';
  if (value === 'Multifuncionales Nuevas') return 'Multif. nuevas';
  if (value.startsWith('Multifuncionales ')) {
    return `Multif. ${value.slice('Multifuncionales '.length).toLowerCase()}`;
  }
  return value;
}

function formatProductTableSubcategory(value: string | null | undefined): string {
  if (!value?.trim()) return '—';
  const trimmed = value.trim();
  if (trimmed === 'Multifuncionales Seminuevas') return 'Seminuevas';
  if (trimmed === 'Multifuncionales Nuevas') return 'Nuevas';
  if (trimmed === 'Multifuncionales Remanufacturadas') return 'Remanufacturadas';
  if (trimmed.startsWith('Multifuncionales ')) {
    return trimmed.slice('Multifuncionales '.length);
  }
  if (trimmed === 'Repuestos Originales') return 'Originales';
  if (trimmed === 'Toner Original') return 'Original';
  if (trimmed === 'Toner Compatible') return 'Compatible';
  if (trimmed.startsWith('Repuestos ')) return trimmed.slice('Repuestos '.length);
  if (trimmed.startsWith('Toner ')) return trimmed.slice('Toner '.length);
  if (trimmed.startsWith('Impresoras ')) return trimmed.slice('Impresoras '.length);
  return formatProductTableCategory(trimmed);
}

function stripCategoryRootPrefix(label: string, root: string): string {
  const trimmed = label.trim();
  const rootTrim = root.trim();
  if (!rootTrim) return trimmed;
  if (trimmed.toLowerCase() === rootTrim.toLowerCase()) return '';
  if (trimmed.toLowerCase().startsWith(`${rootTrim.toLowerCase()} `)) {
    return trimmed.slice(rootTrim.length).trim();
  }
  return trimmed;
}

function splitSingleCategoryLabel(value: string): { root: string; sub: string | null } {
  const roots = [
    'Multifuncionales',
    'Impresoras',
    'Toner y Suministros',
    'Toner y suministros',
    'Tóner y Suministros',
    'Repuestos',
    'Formato Ancho',
    'Toner',
  ].sort((a, b) => b.length - a.length);

  for (const root of roots) {
    if (value === root) return { root, sub: null };
    if (value.toLowerCase().startsWith(`${root.toLowerCase()} `)) {
      return { root, sub: value.slice(root.length).trim() };
    }
  }

  return { root: value, sub: null };
}

/** Separa categoría raíz y subcategoría para la tabla de catálogo. */
export function splitProductTableCategoryParts(category: string | null | undefined): {
  rootLabel: string;
  subLabel: string;
} {
  const tags = parseInventoryTagList(category ?? undefined);
  if (tags.length === 0) {
    return { rootLabel: '—', subLabel: '—' };
  }

  if (tags.length >= 2) {
    const root = tags[0];
    const sub = tags[tags.length - 1];
    const subShort = stripCategoryRootPrefix(sub, root) || sub;
    return {
      rootLabel: formatProductTableCategory(root),
      subLabel: formatProductTableSubcategory(subShort),
    };
  }

  const { root, sub } = splitSingleCategoryLabel(tags[0]);
  return {
    rootLabel: formatProductTableCategory(root),
    subLabel: sub ? formatProductTableSubcategory(sub) : '—',
  };
}

export type ProductTableSpecColumnId = (typeof PRODUCT_TABLE_SPEC_COLUMNS)[number]['id'];

function normalizeAttrName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function findAttributeValue(product: Product, needles: readonly string[]): string | null {
  const normalizedNeedles = needles.map(normalizeAttrName).filter(Boolean);
  for (const attr of product.attributes ?? []) {
    const key = normalizeAttrName(attr.name);
    const value = attr.value?.trim();
    if (!key || !value) continue;
    if (normalizedNeedles.some((needle) => key === needle || key.includes(needle))) {
      return value;
    }
  }
  return null;
}

function shortenProduccion(value: string, forTable = false): string {
  const trimmed = value.trim();
  const option = PRODUCTION_FILTER_OPTIONS.find(
    (row) => row.value === trimmed || trimmed.startsWith(row.value.slice(0, 12)),
  );
  if (option) {
    if (forTable) {
      return PRODUCTION_TABLE_LABELS[option.value] ?? option.sidebarLabel;
    }
    return option.sidebarLabel;
  }

  if (forTable && trimmed.length > 14) {
    return `${trimmed.slice(0, 12)}…`;
  }
  if (trimmed.length > 32) {
    return `${trimmed.slice(0, 30)}…`;
  }
  return trimmed;
}

function formatAdfDisplay(value: string): string {
  const trimmed = value.trim();
  if (/doble\s*scan/i.test(trimmed)) return 'Doble Scan';
  if (/estandar|estándar/i.test(trimmed)) return 'Estándar';
  if (/no tiene/i.test(trimmed)) return '—';
  return trimmed;
}

function resolveVelocidad(product: Product): string {
  const stored = findAttributeValue(product, ['velocidad', 'ppm', 'velocidad de impresion']);
  if (stored) return stored;

  const badge = buildProductDetailBadges(product, { primaryOnly: true }).find(
    (row) => row.id === 'velocidad',
  );
  return badge?.value ?? '—';
}

function resolveAdf(product: Product): string {
  const stored = findAttributeValue(product, ['alimentador (adf)', 'alimentador', 'adf', 'escaner adf']);
  if (stored) return formatAdfDisplay(stored);

  const adf = inferAdf(product);
  return adf ?? '—';
}

function resolveProduccion(product: Product, forTable = false): string {
  const stored = (product.attributes ?? []).find(
    (attr) => attr.name.trim() === PRODUCCION_ATTR,
  )?.value;
  if (stored?.trim()) return shortenProduccion(stored, forTable);

  if (/multifunc/i.test(product.category ?? '')) {
    return shortenProduccion(inferProduccionTier(product), forTable);
  }

  const generic = findAttributeValue(product, ['produccion', 'producción']);
  return generic ? shortenProduccion(generic, forTable) : '—';
}

function resolveAnioFabricacion(product: Product): string {
  const stored = findAttributeValue(product, [
    'ano fabricacion',
    'año fabricacion',
    'ano de fabricacion',
    'año de fabricación',
    'fabricacion',
    'fabricación',
    'year',
    'año',
    'ano',
  ]);
  if (stored) return stored;

  const fromDescription = product.description?.match(
    /a[nñ]o\s+de\s+fabricaci[oó]n\s*:\s*(\d{4})/i,
  )?.[1];
  return fromDescription ?? '—';
}

export function getProductTableSpecDisplay(
  product: Product,
  columnId: ProductTableSpecColumnId,
): string {
  switch (columnId) {
    case 'velocidad':
      return resolveVelocidad(product);
    case 'adf':
      return resolveAdf(product);
    case 'produccion':
      return resolveProduccion(product, true);
    case 'anio':
      return resolveAnioFabricacion(product);
    default:
      return '—';
  }
}
