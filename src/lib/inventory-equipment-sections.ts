import {
  buildCatalogFormatSections,
  inferColor,
  inferFormatoPapelFromModel,
  type CatalogFormatSectionGroup,
} from '@/lib/category-catalog-filters';
import { resolveCategoryFilterLabels } from '@/lib/inventory-categories';
import { inventoryCategoryParentLabel } from '@/lib/inventory-stock-status';
import type { InventoryProduct, Product, ProductAttribute } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const EQUIPMENT_CATEGORY_PATTERN =
  /multifuncion|impresor|formato ancho|plotter|copiadora|esc[aá]ner/i;

/** Divisiones fijas para equipos con color + formato detectables. */
export const INVENTORY_FORMAT_DIVISION_LABELS = [
  'B/N · Formato A4',
  'B/N · Formato A3',
  'Color · Formato A4',
  'Color · Formato A3',
] as const;

export type InventoryFormatDivisionLabel = (typeof INVENTORY_FORMAT_DIVISION_LABELS)[number];

export const INVENTORY_UNCLASSIFIED_DIVISION_LABEL = 'Sin clasificar';

const FORMAT_DIVISION_RANK = new Map<string, number>(
  INVENTORY_FORMAT_DIVISION_LABELS.map((label, index) => [label, index]),
);

function productEquipmentHaystack(
  product: Pick<InventoryProduct, 'name' | 'category' | 'brand'>,
): string {
  return `${product.name ?? ''} ${product.category ?? ''} ${product.brand ?? ''}`;
}

export function isInventoryPrintEquipmentProduct(
  product: Pick<InventoryProduct, 'name' | 'category' | 'brand'>,
): boolean {
  return EQUIPMENT_CATEGORY_PATTERN.test(productEquipmentHaystack(product));
}

function findAttributeValue(
  attributes: ProductAttribute[] | undefined,
  namePattern: RegExp,
): string | null {
  for (const attribute of attributes ?? []) {
    const name = String(attribute?.name ?? '').trim();
    if (!namePattern.test(name)) continue;
    const value = String(attribute?.value ?? '').trim();
    if (value) return value;
  }
  return null;
}

/** Color explícito por atributo o nombre; null si no hay señal. */
export function detectInventoryPaperColor(
  product: Pick<InventoryProduct, 'name' | 'category' | 'brand' | 'attributes'>,
): 'B/N' | 'Color' | null {
  const colorAttr = findAttributeValue(product.attributes, /^color$/i);
  if (colorAttr) {
    if (/^color$/i.test(colorAttr) || /a\s*color/i.test(colorAttr)) return 'Color';
    if (/b\s*\/\s*n|negro|monocrom/i.test(colorAttr)) return 'B/N';
  }

  const haystack = productEquipmentHaystack(product).toLowerCase();
  if (/\bb\s*\/\s*n\b|monocrom/.test(haystack)) return 'B/N';
  if (/\bcolor\b|a color|\bim\s*c|\bc\d{3,4}\b/.test(haystack)) return 'Color';

  // Equipos de impresión sin señal de color → B/N (paridad con catálogo).
  if (isInventoryPrintEquipmentProduct(product)) return inferColor(product as Product);

  return null;
}

/** Formato A4/A3 por atributo, modelo o nombre; sin default a A4. */
export function detectInventoryPaperFormat(
  product: Pick<InventoryProduct, 'name' | 'category' | 'brand' | 'attributes' | 'code'>,
): 'A4' | 'A3' | null {
  const fromModel = inferFormatoPapelFromModel(product as Product);
  if (fromModel) return fromModel;

  const formatAttr =
    findAttributeValue(product.attributes, /^formato(\s+papel)?$/i) ??
    findAttributeValue(product.attributes, /formato|tama[ñn]o/i);
  if (formatAttr) {
    const value = formatAttr.toUpperCase();
    if (/\bA3\b/.test(value) || value.includes('A3')) return 'A3';
    if (/\bA4\b/.test(value) || value.includes('A4')) return 'A4';
  }

  const haystack = `${productEquipmentHaystack(product)} ${product.code ?? ''}`.toLowerCase();
  if (/\ba3\b/.test(haystack)) return 'A3';
  if (/\ba4\b/.test(haystack)) return 'A4';

  return null;
}

export function inventoryFormatDivisionLabel(
  color: 'B/N' | 'Color',
  format: 'A4' | 'A3',
): InventoryFormatDivisionLabel {
  return `${color} · Formato ${format}` as InventoryFormatDivisionLabel;
}

/**
 * División de la tabla de inventario:
 * color+formato detectables → B/N|Color · Formato A4|A3;
 * equipo de impresión sin clasificar → Sin clasificar;
 * resto → categoría padre.
 */
export function resolveInventoryTableDivisionLabel(
  product: Pick<InventoryProduct, 'name' | 'category' | 'brand' | 'attributes' | 'code'>,
): string {
  const color = detectInventoryPaperColor(product);
  const format = detectInventoryPaperFormat(product);
  if (color && format) {
    return inventoryFormatDivisionLabel(color, format);
  }
  if (isInventoryPrintEquipmentProduct(product)) {
    return INVENTORY_UNCLASSIFIED_DIVISION_LABEL;
  }
  return inventoryCategoryParentLabel(product.category);
}

/** Orden: B/N A4 → B/N A3 → Color A4 → Color A3 → otras (A–Z) → Sin clasificar. */
export function compareInventoryTableDivisionLabels(a: string, b: string): number {
  if (a === b) return 0;

  const rankA = FORMAT_DIVISION_RANK.get(a);
  const rankB = FORMAT_DIVISION_RANK.get(b);
  const aIsFormat = rankA !== undefined;
  const bIsFormat = rankB !== undefined;
  const aUnclassified = a === INVENTORY_UNCLASSIFIED_DIVISION_LABEL;
  const bUnclassified = b === INVENTORY_UNCLASSIFIED_DIVISION_LABEL;

  if (aIsFormat && bIsFormat) return (rankA as number) - (rankB as number);
  if (aIsFormat) return -1;
  if (bIsFormat) return 1;
  if (aUnclassified && !bUnclassified) return 1;
  if (bUnclassified && !aUnclassified) return -1;
  return a.localeCompare(b, 'es');
}

export interface InventoryEquipmentSubsection {
  id: string;
  title: string;
  products: InventoryProduct[];
}

export interface InventoryEquipmentSectionGroup {
  id: CatalogFormatSectionGroup['id'];
  title: string;
  subsections: InventoryEquipmentSubsection[];
}

/** Muestra divisiones B/N · A4/A3 cuando el filtro apunta a equipos de impresión. */
export function shouldShowInventoryEquipmentSections(
  categoryFilter: string,
  categoryTree: StoreCategoryTreeNode[],
): boolean {
  if (categoryFilter === 'all') return false;
  const labels = resolveCategoryFilterLabels(categoryTree, categoryFilter);
  return labels.some((label) => EQUIPMENT_CATEGORY_PATTERN.test(label));
}

export function buildInventoryEquipmentSections(
  products: readonly InventoryProduct[],
): InventoryEquipmentSectionGroup[] {
  const catalogProducts = products as unknown as readonly Product[];
  return buildCatalogFormatSections(catalogProducts)
    .map((section) => ({
      id: section.id,
      title: section.title,
      subsections: section.subsections
        .filter((subsection) => subsection.products.length > 0)
        .map((subsection) => ({
          id: subsection.id,
          title: subsection.title,
          products: subsection.products as unknown as InventoryProduct[],
        })),
    }))
    .filter((section) => section.subsections.length > 0);
}

export function flattenInventoryEquipmentSections(
  sections: readonly InventoryEquipmentSectionGroup[],
): InventoryProduct[] {
  return sections.flatMap((section) =>
    section.subsections.flatMap((subsection) => subsection.products),
  );
}
