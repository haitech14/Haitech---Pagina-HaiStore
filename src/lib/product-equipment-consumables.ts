import { isPrinterEquipment } from '@/lib/build-product-detail';
import { isTonerPackProduct } from '@/lib/product-bundle';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { computeCostPerCopyPen, extractProductYield } from '@/lib/product-cost-per-copy';
import type { Product } from '@/types/product';

export type ConsumableCategoryId =
  | 'toner'
  | 'accesorios'
  | 'repuestos'
  | 'imaging-unit'
  | 'fuser-unit'
  | 'transfer-unit'
  | 'adf'
  | 'rollers';

export interface ConsumableItem {
  productId: string;
  name: string;
  image: string | null;
  priceUsd: number;
  sku?: string;
  componentLabel?: string;
  yieldPages?: number | null;
  yieldLabel?: string | null;
  costPerCopyPen?: number | null;
}

export interface ConsumableSubgroup {
  label: string;
  items: ConsumableItem[];
}

export interface ConsumableGroup {
  id: ConsumableCategoryId;
  label: string;
  items: ConsumableItem[];
  subgroups: ConsumableSubgroup[];
}

interface CategoryRule {
  id: ConsumableCategoryId;
  label: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    id: 'toner',
    label: 'Toner',
    keywords: ['toner', 'tóner', 'cartucho', 'cartridge', 'botella toner', 'waste toner', 'residual'],
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    keywords: ['accesorio'],
  },
  {
    id: 'imaging-unit',
    label: 'Unidad de Imagen',
    keywords: [
      'unidad de imagen',
      'imaging unit',
      'image unit',
      'tambor',
      'drum unit',
      'photoconductor',
      'pcu',
    ],
  },
  {
    id: 'fuser-unit',
    label: 'Unidad Fusora',
    keywords: ['unidad fusora', 'fusor', 'fuser', 'fusing unit', 'kit fusor'],
  },
  {
    id: 'transfer-unit',
    label: 'Unidad de Transferencia',
    keywords: [
      'unidad de transferencia',
      'transfer unit',
      'transfer belt',
      'banda de transferencia',
      'itb',
    ],
  },
  {
    id: 'adf',
    label: 'ADF',
    keywords: [
      'adf',
      'alimentador automatico',
      'alimentador automático',
      'document feeder',
      'doc feeder',
    ],
  },
  {
    id: 'rollers',
    label: 'Ruedas',
    keywords: [
      'rueda',
      'rodillo',
      'roller',
      'pickup',
      'feed roller',
      'separation roller',
      'pressure roller',
    ],
  },
];

/** Orden y títulos de sección en la pestaña Repuestos. */
const SPARE_PARTS_DISPLAY_ORDER: { id: ConsumableCategoryId; label: string }[] = [
  { id: 'toner', label: 'Toner' },
  { id: 'imaging-unit', label: 'Unidad de Imagen' },
  { id: 'fuser-unit', label: 'Unidad Fusora' },
  { id: 'transfer-unit', label: 'Unidad de Transferencia' },
  { id: 'rollers', label: 'Ruedas' },
  { id: 'adf', label: 'ADF' },
  { id: 'repuestos', label: 'Repuestos' },
  { id: 'accesorios', label: 'Accesorios' },
];

const TONER_COLOR_DISPLAY: Record<string, string> = {
  amarillo: 'Amarillo',
  yellow: 'Amarillo',
  cyan: 'Cyan',
  cian: 'Cyan',
  magenta: 'Magenta',
  negro: 'Negro',
  black: 'Negro',
};

/** Palabras de color CMYK en títulos de tóner (cualquier posición). Sin flag `g` para conservar `index`. */
const TONER_COLOR_WORD_PATTERN = /\b(amarillo|yellow|cyan|cian|magenta|negro|black)\b/i;

function resolveTonerColorDisplayLabel(raw: string): string {
  return TONER_COLOR_DISPLAY[raw.toLowerCase()] ?? raw;
}

/**
 * Extrae la primera palabra de color CMYK del título y la devuelve para sufijar al final.
 * Evita dejar el color entre marca y modelo (p. ej. «Ricoh negro IM C300F»).
 */
function extractTonerColorWord(name: string): { base: string; color: string | null } {
  const match = TONER_COLOR_WORD_PATTERN.exec(name);
  if (!match?.[0] || match.index == null) {
    return { base: name, color: null };
  }

  const color = resolveTonerColorDisplayLabel(match[0]);
  const base = `${name.slice(0, match.index)} ${name.slice(match.index + match[0].length)}`
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+[—–-]\s*$/g, '')
    .trim();

  return { base: base || name, color };
}

/** Títulos de tóner/cartucho que conviene limpiar en UI (búsqueda, tarjetas, listados). */
export function looksLikeTonerDisplayName(name: string): boolean {
  const n = name.trim();
  if (!n) return false;
  return (
    /\bt[oó]ner\b/i.test(n) ||
    /\bcartuchos?\b/i.test(n) ||
    /\bprint\s*cart(?:ridge)?\b/i.test(n)
  );
}

/**
 * Limpia títulos redundantes de inventario para UI.
 * - Quita «Cartucho»
 * - «INTERCOPY» → «compatible Intercopy»
 * - Evita «tóner … tóner» duplicado
 * - «MP 320F» → «M 320F»
 * - Mueve color CMYK (negro, cyan, …) al final del título
 *
 * Ej.: «Tóner cartucho INTERCOPY TÓNER CARTUCHO MP 320F» → «Tóner compatible Intercopy M 320F»
 * Ej.: «Tóner original Ricoh negro IM C300F (17,000 págs)» → «Tóner original Ricoh IM C300F (17,000 págs) Negro»
 */
export function formatConsumableListDisplayName(name: string): string {
  let n = name.trim();
  if (!n) return n;

  const colorMatch = n.match(/\+\s*(Amarillo|Cyan|Cian|Magenta|Negro|Yellow|Black)\s*$/i);
  let color: string | null = null;
  if (colorMatch?.[1]) {
    color = resolveTonerColorDisplayLabel(colorMatch[1]);
    n = n.slice(0, colorMatch.index).trim();
  }

  // Typo habitual: el equipo es M 320F, no MP 320F.
  n = n.replace(/\bMP\s*320\s*F\b/gi, 'M 320F');

  const packMatch = n.match(/^(Pack\s*x0?\d+)\s+/i);
  const packPrefix = packMatch?.[1]?.trim() ?? '';
  if (packMatch) {
    n = n.slice(packMatch[0].length).trim();
  }

  const hasIntercopy = /\bintercopy\b/i.test(n);
  const isTonerLike =
    /\bt[oó]ner\b/i.test(n) || /\bcartuchos?\b/i.test(n) || /\bprint\s*cart(?:ridge)?\b/i.test(n);

  // Quitar «cartucho(s)» y normalizar repeticiones de tóner.
  n = n
    .replace(/\bcartuchos?\b/gi, ' ')
    .replace(/\bprint\s*cart(?:ridge)?\b/gi, ' ')
    .replace(/\bt[oó]ner\b/gi, '@@TONER@@')
    .replace(/(?:@@TONER@@\s*)+/g, '@@TONER@@ ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (hasIntercopy && isTonerLike) {
    n = n
      .replace(/\bintercopy\b/gi, ' ')
      .replace(/\bcompatibles?\b/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (/@@TONER@@/.test(n)) {
      n = n.replace(/@@TONER@@/, 'Tóner compatible Intercopy').replace(/@@TONER@@/g, '');
    } else {
      n = `Tóner compatible Intercopy ${n}`;
    }
  } else {
    n = n.replace(/@@TONER@@/, 'Tóner').replace(/@@TONER@@/g, '');
  }

  n = n.replace(/\s{2,}/g, ' ').replace(/\s+[—–-]\s*$/g, '').trim();

  if (!color) {
    const extracted = extractTonerColorWord(n);
    n = extracted.base;
    color = extracted.color;
  } else {
    // Evitar color duplicado si ya venía como «+ Negro» y también inline.
    n = extractTonerColorWord(n).base;
  }

  if (packPrefix) {
    n = `${packPrefix} ${n}`.replace(/\s{2,}/g, ' ').trim();
  }

  return color ? `${n} ${color}`.replace(/\s{2,}/g, ' ').trim() : n;
}

const COMPONENT_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /pickup|alimentaci[oó]n|feed roller/i, label: 'Rodillo de alimentación' },
  { pattern: /separation|separaci[oó]n/i, label: 'Rodillo de separación' },
  { pattern: /transfer roller|rodillo de transferencia/i, label: 'Rodillo de transferencia' },
  { pattern: /pressure|presi[oó]n/i, label: 'Rodillo de presión' },
  { pattern: /fuser|fusor/i, label: 'Módulo fusor' },
  { pattern: /belt|banda/i, label: 'Banda de transferencia' },
  { pattern: /waste|residual|botella/i, label: 'Botella residual' },
  { pattern: /developer|desarrollador/i, label: 'Unidad desarrolladora' },
  { pattern: /adf|alimentador/i, label: 'Kit ADF' },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Conjunto/hopper de suministro de tóner (repuesto), no cartucho CMYK para Original/Compatible.
 */
export function isTonerSupplyAssemblyName(name: string): boolean {
  const n = normalizeText(name);
  if (
    /toner\s+supply/.test(n) ||
    /toner\s+hopper/.test(n) ||
    /conjunto\s+suministro/.test(n) ||
    /supply\s+assembly/.test(n)
  ) {
    return true;
  }
  return /ass.?y/.test(n) && /toner|hopper|conjunto|suministro/.test(n);
}

export function isTonerSupplyAssemblyProduct(
  product: Pick<Product, 'name'> | { name?: string | null },
): boolean {
  return isTonerSupplyAssemblyName(product.name ?? '');
}

function productHaystack(product: Product): string {
  const attributes = product.attributes?.map((attr) => `${attr.name} ${attr.value}`).join(' ') ?? '';
  return normalizeText(
    `${product.category ?? ''} ${product.name} ${product.description ?? ''} ${attributes}`,
  );
}

export function extractEquipmentConsumableSearchKeys(equipment: Product): string[] {
  const keys = new Set<string>();
  const name = equipment.name;

  const regexes = [
    /\bIM\s*C?\s*\d{3,4}[A-Z]?\b/gi,
    /\bIM\s+\d{3,4}[A-Z]?\b/gi,
    /\bMP\s*C?\s*\d{3,4}[A-Z]?\b/gi,
    /\b[A-Z]{1,5}\s*-?\s*\d{3,4}[A-Z]{0,4}\b/g,
    /\b[A-Z]{1,5}\d{3,4}[A-Z]{0,4}\b/g,
  ];

  for (const pattern of regexes) {
    for (const match of name.matchAll(pattern)) {
      const raw = match[0].trim();
      keys.add(normalizeText(raw));
      keys.add(raw.replace(/\s+/g, '').toLowerCase());
    }
  }

  const withoutBrand = equipment.brand
    ? name.replace(new RegExp(equipment.brand, 'i'), '').trim()
    : name.trim();
  if (withoutBrand.length >= 4) {
    keys.add(normalizeText(withoutBrand));
    keys.add(withoutBrand.replace(/\s+/g, '').toLowerCase());
  }

  keys.add(equipment.id.replace(/-/g, ' '));

  return [...keys].filter((key) => key.replace(/\s+/g, '').length >= 3);
}

function isAccesoriosCategory(product: Product): boolean {
  const category = normalizeText(product.category ?? '');
  return category.includes('accesorio');
}

function isRepuestosCategory(product: Product): boolean {
  const category = normalizeText(product.category ?? '');
  return (
    category.includes('repuesto') ||
    category.includes('accesorio') ||
    category.includes('suministro') ||
    category.includes('toner') ||
    category.includes('tóner')
  );
}

function isEquipmentConsumable(product: Product): boolean {
  const haystack = productHaystack(product);
  if (haystack.includes('impresora') || haystack.includes('multifuncional')) {
    return false;
  }
  if (isRepuestosCategory(product)) return true;
  return CATEGORY_RULES.some((rule) =>
    rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword))),
  );
}

export function consumableMatchesEquipment(consumable: Product, keys: string[]): boolean {
  const haystack = productHaystack(consumable);
  const compactHaystack = haystack.replace(/\s+/g, '');

  return keys.some((key) => {
    const compactKey = key.replace(/\s+/g, '');
    if (compactKey.length < 3) return false;
    return haystack.includes(key) || compactHaystack.includes(compactKey);
  });
}

function classifyConsumable(product: Product): ConsumableCategoryId | null {
  const haystack = productHaystack(product);

  if (isAccesoriosCategory(product)) {
    return 'accesorios';
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.id === 'toner' && rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
      if (isTonerSupplyAssemblyProduct(product)) return 'repuestos';
      return 'toner';
    }
  }

  if (isRepuestosCategory(product) && !haystack.includes('toner') && !haystack.includes('tóner')) {
    for (const rule of CATEGORY_RULES) {
      if (rule.id !== 'toner' && rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
        return rule.id;
      }
    }
    return 'repuestos';
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
      return rule.id;
    }
  }

  return null;
}

function resolveComponentLabel(product: Product): string | undefined {
  const source = `${product.name} ${product.description ?? ''}`;
  for (const { pattern, label } of COMPONENT_PATTERNS) {
    if (pattern.test(source)) return label;
  }
  return undefined;
}

function toConsumableItem(product: Product): ConsumableItem {
  const image =
    buildProductImageCandidates(product)[0] ?? null;
  const componentLabel = resolveComponentLabel(product);
  const yieldInfo = extractProductYield(product);
  const costPerCopyPen = computeCostPerCopyPen(product.price, yieldInfo.pages);

  return {
    productId: product.id,
    name: product.name,
    image,
    priceUsd: product.price,
    yieldPages: yieldInfo.pages,
    yieldLabel: yieldInfo.label,
    costPerCopyPen,
    ...(product.code ? { sku: product.code } : {}),
    ...(componentLabel ? { componentLabel } : {}),
  };
}

function buildSubgroups(items: ConsumableItem[]): ConsumableSubgroup[] {
  const byComponent = new Map<string, ConsumableItem[]>();

  for (const item of items) {
    if (!item.componentLabel) continue;
    const list = byComponent.get(item.componentLabel) ?? [];
    list.push(item);
    byComponent.set(item.componentLabel, list);
  }

  return [...byComponent.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([label, subgroupItems]) => ({ label, items: subgroupItems }));
}

export function flattenConsumableGroupItems(groups: ConsumableGroup[]): ConsumableItem[] {
  const items: ConsumableItem[] = [];
  for (const group of groups) {
    items.push(...group.items);
    for (const subgroup of group.subgroups) {
      items.push(...subgroup.items);
    }
  }
  return items;
}

/** Agrupa consumibles por tipo de repuesto (Toner, Unidad de Imagen, Fusora, etc.). */
export function buildSparePartsDisplayGroups(groups: ConsumableGroup[]): ConsumableGroup[] {
  const byId = new Map(groups.map((group) => [group.id, group]));
  const result: ConsumableGroup[] = [];

  for (const entry of SPARE_PARTS_DISPLAY_ORDER) {
    const group = byId.get(entry.id);
    if (!group) continue;

    const items = flattenConsumableGroupItems([group])
      .map((item) => ({
        ...item,
        name: formatConsumableListDisplayName(item.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    if (items.length === 0) continue;

    result.push({
      id: entry.id,
      label: entry.label,
      items,
      subgroups: [],
    });
  }

  return result;
}

export function sumCostPerCopyPen(items: ConsumableItem[]): number {
  return items.reduce((sum, item) => sum + (item.costPerCopyPen ?? 0), 0);
}

function isCompatibleConsumableItem(item: ConsumableItem): boolean {
  const haystack = item.name.toLowerCase();
  return (
    haystack.includes('compatible') ||
    haystack.includes('compatibles') ||
    haystack.includes('intercopy') ||
    haystack.includes('alternativ') ||
    haystack.includes('->')
  );
}

export function splitTonerItemsBySupplyType(items: ConsumableItem[]): {
  original: ConsumableItem[];
  compatible: ConsumableItem[];
} {
  const original: ConsumableItem[] = [];
  const compatible: ConsumableItem[] = [];

  for (const item of items) {
    if (isCompatibleConsumableItem(item)) {
      compatible.push(item);
    } else {
      original.push(item);
    }
  }

  return {
    original: original.sort((a, b) => a.name.localeCompare(b.name, 'es')),
    compatible: compatible.sort((a, b) => a.name.localeCompare(b.name, 'es')),
  };
}

export function resolveEquipmentConsumables(
  equipment: Product,
  catalog: Product[],
): ConsumableGroup[] {
  if (!isPrinterEquipment(equipment)) return [];

  const keys = extractEquipmentConsumableSearchKeys(equipment);
  const matched = catalog
    .filter((row) => row.id !== equipment.id)
    .filter(isEquipmentConsumable)
    .filter((row) => !isTonerPackProduct(row))
    .filter((row) => {
      const categoryId = classifyConsumable(row);
      // Tóner: matching estricto por modelo (evita 418480 en IM 550F por texto “IM-550F” en descripción).
      if (categoryId === 'toner') {
        return tonerProductMatchesEquipment(row, equipment);
      }
      return consumableMatchesEquipment(row, keys);
    });

  const byCategory = new Map<ConsumableCategoryId, ConsumableItem[]>();

  for (const product of matched) {
    const categoryId = classifyConsumable(product);
    if (!categoryId) continue;
    const item = toConsumableItem(product);
    const list = byCategory.get(categoryId) ?? [];
    list.push(item);
    byCategory.set(categoryId, list);
  }

  const groupOrder: { id: ConsumableCategoryId; label: string }[] = [
    ...CATEGORY_RULES.map((rule) => ({ id: rule.id, label: rule.label })),
    { id: 'repuestos', label: 'Repuestos' },
  ];

  return groupOrder
    .filter((entry) => byCategory.has(entry.id))
    .map((entry) => {
      const allItems = (byCategory.get(entry.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, 'es'),
      );
      const items = allItems.filter((item) => !item.componentLabel);
      const subgroups = buildSubgroups(allItems);

      return {
        id: entry.id,
        label: entry.label,
        items,
        subgroups,
      };
    });
}

export function hasEquipmentConsumables(equipment: Product, catalog: Product[]): boolean {
  return resolveEquipmentConsumables(equipment, catalog).some(
    (group) => group.items.length > 0 || group.subgroups.length > 0,
  );
}

const KNOWN_TONER_EQUIPMENT_MODEL_ATTR = /modelo de equipo/i;

/** Tóner del inventario compatible con el modelo/marca del equipo actual. */
export function tonerProductMatchesEquipment(
  toner: Product,
  equipment: Product,
  options?: { allowKnownTonerId?: boolean; knownTonerIds?: readonly string[] },
): boolean {
  // Cartucho 418480: no listar en ficha IM 550F (se reserva para IM 600F).
  if (
    toner.id === '418480' &&
    /\bim\s*550\s*f\b/i.test(equipment.name) &&
    !/\bim\s*600\s*f\b/i.test(equipment.name)
  ) {
    return false;
  }

  if (options?.allowKnownTonerId && options.knownTonerIds?.includes(toner.id)) {
    return true;
  }

  const equipmentModelAttr = equipment.attributes?.find((attribute) =>
    /^modelo$/i.test(attribute.name.trim()),
  )?.value;
  const tonerEquipmentAttr = toner.attributes?.find((attribute) =>
    KNOWN_TONER_EQUIPMENT_MODEL_ATTR.test(attribute.name.trim()),
  )?.value;

  const keys = extractEquipmentConsumableSearchKeys(equipment);
  if (keys.length === 0) return false;

  if (consumableMatchesEquipment(toner, keys)) return true;

  if (tonerEquipmentAttr && equipmentModelAttr) {
    const tonerModels = normalizeText(tonerEquipmentAttr);
    const equipmentModel = normalizeText(equipmentModelAttr);
    if (tonerModels.includes(equipmentModel)) return true;
  }

  if (tonerEquipmentAttr) {
    return keys.some((key) => {
      const compactKey = key.replace(/\s+/g, '');
      if (compactKey.length < 3) return false;
      const normalizedAttr = normalizeText(tonerEquipmentAttr);
      return normalizedAttr.includes(key) || normalizedAttr.replace(/\s+/g, '').includes(compactKey);
    });
  }

  return false;
}
