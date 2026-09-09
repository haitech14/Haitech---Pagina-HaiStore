import {
  listedTonersForEquipment,
  type ListedOriginalTonerRow,
} from '@/data/listed-original-toners';
import { isPrinterEquipment } from '@/lib/build-product-detail';
import {
  resolveEquipmentConsumables,
  splitTonerItemsBySupplyType,
  tonerProductMatchesEquipment,
  type ConsumableItem,
} from '@/lib/product-equipment-consumables';
import { resolveTonerColorLabel } from '@/lib/product-configure-toner';
import {
  isTonerMerchandisingProduct,
  normalizeMerchandisingProductIds,
  resolveKnownCompatibleTonerProductIds,
  resolveKnownOriginalTonerProductIds,
  resolveTonerSupplyTypeFromProduct,
} from '@/lib/product-merchandising';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { ensureFullPrices, type PriceRole } from '@/lib/roles';
import type { Product } from '@/types/product';

export interface EquipmentTonerPriceLine {
  id: string;
  label: string;
  priceUsd: number;
  supplyType: 'original' | 'compatible';
  code?: string;
  description?: string;
  name?: string;
  image?: string;
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

function isBlackTonerLabel(label: string): boolean {
  return /negro|black|\bbk\b/i.test(label);
}

/**
 * Equipo B/N: 1 tóner (negro). Equipo color: los 4 (negro, cyan, magenta, amarillo).
 */
export function selectPrinterTonerSet(
  lines: EquipmentTonerPriceLine[],
  isColor: boolean,
): EquipmentTonerPriceLine[] {
  if (lines.length === 0) return [];
  if (!isColor) {
    const black = lines.find((line) => isBlackTonerLabel(line.label));
    return [black ?? lines[0]!];
  }

  const picked: EquipmentTonerPriceLine[] = [];
  const used = new Set<string>();
  for (const color of COLOR_ORDER) {
    const line = lines.find((item) => item.label === color);
    if (!line) continue;
    picked.push(line);
    used.add(line.id);
  }
  if (picked.length >= 4) return picked.slice(0, 4);

  for (const line of lines) {
    if (picked.length >= 4) break;
    if (used.has(line.id)) continue;
    picked.push(line);
    used.add(line.id);
  }
  return picked.slice(0, 4);
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

function collectLinkedTonerProducts(equipment: Product, catalog: Product[]): Product[] {
  const byId = new Map(catalog.map((row) => [row.id, row]));
  const seen = new Set<string>();
  const out: Product[] = [];

  const add = (product: Product | undefined) => {
    if (!product || seen.has(product.id) || product.id === equipment.id) return;
    if (!isTonerMerchandisingProduct(product)) return;
    seen.add(product.id);
    out.push(product);
  };

  for (const id of [
    ...normalizeMerchandisingProductIds(equipment.cross_sell_product_ids),
    ...resolveKnownOriginalTonerProductIds(equipment),
    ...resolveKnownCompatibleTonerProductIds(equipment),
  ]) {
    add(byId.get(id));
  }

  for (const row of catalog) {
    if (tonerProductMatchesEquipment(row, equipment)) add(row);
  }

  return out;
}

function productToTonerItem(product: Product): ConsumableItem {
  return {
    productId: product.id,
    name: product.name,
    image: product.image_url ?? null,
    priceUsd: Number(product.prices?.public ?? product.price) || 0,
    ...(product.code ? { sku: product.code } : {}),
  };
}

function listedRowPriceUsd(row: ListedOriginalTonerRow, priceRole: PriceRole): number {
  if (priceRole === 'tecnico' || priceRole === 'distribuidor') return row.dist;
  return row.public;
}

const GENERIC_TONER_THUMB = '/products/toner-418480.webp';

function resolveTonerLineImage(
  product: Product | undefined,
  fallbackImage?: string | null,
): string {
  const fromItem = typeof fallbackImage === 'string' ? fallbackImage.trim() : '';
  if (fromItem) return fromItem;
  if (product) {
    const fromCatalog = resolveProductImageUrl(product);
    if (fromCatalog) return fromCatalog;
  }
  return GENERIC_TONER_THUMB;
}

function listedRowToLine(
  row: ListedOriginalTonerRow,
  priceRole: PriceRole,
  catalogById: Map<string, Product>,
  catalogByCode: Map<string, Product>,
): EquipmentTonerPriceLine {
  const product = catalogById.get(row.id) ?? catalogByCode.get(row.code.trim().toUpperCase());
  const fromCatalog = product
    ? Number(ensureFullPrices(product.prices ?? { public: product.price })[priceRole] ?? 0)
    : 0;
  const priceUsd = fromCatalog > 0 ? fromCatalog : listedRowPriceUsd(row, priceRole);
  const image = resolveTonerLineImage(product);
  return {
    id: product?.id ?? row.id,
    label: row.color,
    priceUsd,
    supplyType: 'original',
    code: row.code,
    description: row.description,
    name: product?.name ?? row.name,
    image,
  };
}

function linesFromListedToners(
  equipment: Product,
  catalog: Product[],
  priceRole: PriceRole,
): EquipmentTonerPriceLine[] {
  const rows = listedTonersForEquipment(equipment);
  if (rows.length === 0) return [];
  const catalogById = new Map(catalog.map((row) => [row.id, row]));
  const catalogByCode = new Map(
    catalog
      .filter((row) => typeof row.code === 'string' && row.code.trim())
      .map((row) => [row.code!.trim().toUpperCase(), row]),
  );
  return rows
    .map((row) => listedRowToLine(row, priceRole, catalogById, catalogByCode))
    .filter((line) => line.priceUsd > 0);
}

/** Precios de tóner compatibles con un equipo, para tooltip en tarjeta. */
export function resolveEquipmentTonerPriceLines(
  equipment: Product,
  catalog: Product[],
  options?: { maxLines?: number; priceRole?: PriceRole },
): EquipmentTonerPriceLine[] {
  if (!isPrinterEquipment(equipment)) return [];

  const maxLines = options?.maxLines ?? 8;
  const priceRole = options?.priceRole ?? 'public';
  const listedLines = linesFromListedToners(equipment, catalog, priceRole);
  if (listedLines.length > 0) {
    return dedupeByColor(sortLines(listedLines)).slice(0, maxLines);
  }

  if (catalog.length === 0) return [];

  const groups = resolveEquipmentConsumables(equipment, catalog);
  const items = flattenTonerItems(groups);
  const linked = collectLinkedTonerProducts(equipment, catalog);
  const seen = new Set(items.map((item) => item.productId));
  for (const product of linked) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    items.push(productToTonerItem(product));
  }
  if (items.length === 0) return [];

  const catalogById = new Map(catalog.map((row) => [row.id, row]));
  const { original, compatible } = splitTonerItemsBySupplyType(
    items.map((item) => {
      const product = catalogById.get(item.productId);
      if (!product) return item;
      return resolveTonerSupplyTypeFromProduct(product) === 'compatible'
        ? { ...item, name: /compatible/i.test(item.name) ? item.name : `${item.name} compatible` }
        : item;
    }),
  );

  const toLines = (
    list: ConsumableItem[],
    supplyType: 'original' | 'compatible',
  ): EquipmentTonerPriceLine[] =>
    list
      .map((item) => {
        const product = catalogById.get(item.productId);
        const image = resolveTonerLineImage(product, item.image);
        return {
          id: item.productId,
          label: lineLabel(item, catalogById),
          priceUsd: resolveItemPriceUsd(item, catalogById, priceRole),
          supplyType,
          ...(item.sku ? { code: item.sku } : {}),
          name: item.name,
          image,
        };
      })
      .filter((line) => line.priceUsd > 0);

  const preferred = toLines(original, 'original');
  const fallback = preferred.length > 0 ? preferred : toLines(compatible, 'compatible');
  return dedupeByColor(sortLines(fallback)).slice(0, maxLines);
}
