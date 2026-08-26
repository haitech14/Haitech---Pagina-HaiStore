import { isPrinterEquipment } from '@/lib/build-product-detail';
import {
  resolveEquipmentConsumables,
  splitTonerItemsBySupplyType,
  type ConsumableItem,
} from '@/lib/product-equipment-consumables';
import { resolveTonerColorLabel } from '@/lib/product-configure-toner';
import { ensureFullPrices, type PriceRole } from '@/lib/roles';
import type { Product } from '@/types/product';

export interface EquipmentTonerPriceLine {
  id: string;
  label: string;
  priceUsd: number;
  supplyType: 'original' | 'compatible';
}

const COLOR_ORDER = ['Negro', 'Cyan', 'Magenta', 'Amarillo'] as const;

function flattenTonerItems(
  groups: ReturnType<typeof resolveEquipmentConsumables>,
): ConsumableItem[] {
  const toner = groups.find((group) => group.id === 'toner');
  if (!toner) return [];
  const fromSubgroups = toner.subgroups.flatMap((subgroup) => subgroup.items);
  const seen = new Set<string>();
  const out: ConsumableItem[] = [];
  for (const item of [...toner.items, ...fromSubgroups]) {
    if (seen.has(item.productId)) continue;
    seen.add(item.productId);
    out.push(item);
  }
  return out;
}

function resolveItemPriceUsd(
  item: ConsumableItem,
  catalogById: Map<string, Product>,
  priceRole: PriceRole,
): number {
  const product = catalogById.get(item.productId);
  if (product) {
    const prices = ensureFullPrices(product.prices ?? { public: product.price });
    const fromRole = Number(prices[priceRole] ?? prices.public ?? 0);
    if (fromRole > 0) return fromRole;
  }
  return Number(item.priceUsd) || 0;
}

function lineLabel(item: ConsumableItem, catalogById: Map<string, Product>): string {
  const product = catalogById.get(item.productId);
  const color =
    resolveTonerColorLabel(product, item.name) ??
    item.componentLabel?.trim() ??
    null;
  if (color) return color;
  const short = item.name
    .replace(/\bt[oó]ner\b/gi, '')
    .replace(/\boriginal\b/gi, '')
    .replace(/\bcompatible\b/gi, '')
    .replace(/\bricoh\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return short.length > 28 ? `${short.slice(0, 26)}…` : short || item.name;
}

function sortLines(lines: EquipmentTonerPriceLine[]): EquipmentTonerPriceLine[] {
  return [...lines].sort((a, b) => {
    if (a.supplyType !== b.supplyType) {
      return a.supplyType === 'original' ? -1 : 1;
    }
    const ai = COLOR_ORDER.indexOf(a.label as (typeof COLOR_ORDER)[number]);
    const bi = COLOR_ORDER.indexOf(b.label as (typeof COLOR_ORDER)[number]);
    const aKey = ai >= 0 ? ai : 50;
    const bKey = bi >= 0 ? bi : 50;
    if (aKey !== bKey) return aKey - bKey;
    return a.label.localeCompare(b.label, 'es');
  });
}

function dedupeByColor(lines: EquipmentTonerPriceLine[]): EquipmentTonerPriceLine[] {
  const seen = new Set<string>();
  const out: EquipmentTonerPriceLine[] = [];
  for (const line of lines) {
    const key = `${line.supplyType}:${line.label.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

/** Precios de tóner compatibles con un equipo, para tooltip en tarjeta. */
export function resolveEquipmentTonerPriceLines(
  equipment: Product,
  catalog: Product[],
  options?: { maxLines?: number; priceRole?: PriceRole },
): EquipmentTonerPriceLine[] {
  if (!isPrinterEquipment(equipment) || catalog.length === 0) return [];

  const maxLines = options?.maxLines ?? 8;
  const priceRole = options?.priceRole ?? 'public';
  const groups = resolveEquipmentConsumables(equipment, catalog);
  const items = flattenTonerItems(groups);
  if (items.length === 0) return [];

  const catalogById = new Map(catalog.map((row) => [row.id, row]));
  const { original, compatible } = splitTonerItemsBySupplyType(items);

  const toLines = (
    list: ConsumableItem[],
    supplyType: 'original' | 'compatible',
  ): EquipmentTonerPriceLine[] =>
    list
      .map((item) => ({
        id: item.productId,
        label: lineLabel(item, catalogById),
        priceUsd: resolveItemPriceUsd(item, catalogById, priceRole),
        supplyType,
      }))
      .filter((line) => line.priceUsd > 0);

  const preferred = toLines(original, 'original');
  const fallback = preferred.length > 0 ? preferred : toLines(compatible, 'compatible');
  return dedupeByColor(sortLines(fallback)).slice(0, maxLines);
}
