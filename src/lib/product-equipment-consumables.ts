import { isPrinterEquipment } from '@/lib/build-product-detail';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import type { Product } from '@/types/product';

export type ConsumableCategoryId =
  | 'toner'
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
    label: 'Tóner',
    keywords: ['toner', 'tóner', 'cartucho', 'cartridge', 'botella toner', 'waste toner', 'residual'],
  },
  {
    id: 'imaging-unit',
    label: 'Unidad de imagen',
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
    label: 'Unidad fusora',
    keywords: ['unidad fusora', 'fusor', 'fuser', 'fusing unit', 'kit fusor'],
  },
  {
    id: 'transfer-unit',
    label: 'Unidad de transferencia',
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

function productHaystack(product: Product): string {
  const attributes = product.attributes?.map((attr) => `${attr.name} ${attr.value}`).join(' ') ?? '';
  return normalizeText(
    `${product.category ?? ''} ${product.name} ${product.description ?? ''} ${attributes}`,
  );
}

function extractSearchKeys(equipment: Product): string[] {
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

function isEquipmentConsumable(product: Product): boolean {
  const haystack = productHaystack(product);
  if (haystack.includes('impresora') || haystack.includes('multifuncional')) {
    return false;
  }
  return CATEGORY_RULES.some((rule) =>
    rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword))),
  );
}

function consumableMatchesEquipment(consumable: Product, keys: string[]): boolean {
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
  const image = buildProductImageCandidates(product)[0] ?? null;
  const componentLabel = resolveComponentLabel(product);
  return {
    productId: product.id,
    name: product.name,
    image,
    priceUsd: product.price,
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

export function resolveEquipmentConsumables(
  equipment: Product,
  catalog: Product[],
): ConsumableGroup[] {
  if (!isPrinterEquipment(equipment)) return [];

  const keys = extractSearchKeys(equipment);
  const matched = catalog
    .filter((row) => row.id !== equipment.id)
    .filter(isEquipmentConsumable)
    .filter((row) => consumableMatchesEquipment(row, keys));

  const byCategory = new Map<ConsumableCategoryId, ConsumableItem[]>();

  for (const product of matched) {
    const categoryId = classifyConsumable(product);
    if (!categoryId) continue;
    const item = toConsumableItem(product);
    const list = byCategory.get(categoryId) ?? [];
    list.push(item);
    byCategory.set(categoryId, list);
  }

  return CATEGORY_RULES.filter((rule) => byCategory.has(rule.id)).map((rule) => {
    const allItems = (byCategory.get(rule.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, 'es'),
    );
    const items = allItems.filter((item) => !item.componentLabel);
    const subgroups = buildSubgroups(allItems);

    return {
      id: rule.id,
      label: rule.label,
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
