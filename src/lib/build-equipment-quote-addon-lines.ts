import { isPrinterEquipment } from '@/lib/build-product-detail';
import {
  getCatalogActiveRows,
  getCatalogProductById,
  loadCatalogIndex,
} from '@/lib/catalog-featured';
import { ESTABILIZADOR_2KVA_PRODUCT_ID, ESTABILIZADOR_QUOTE_CODE } from '@/lib/equipment-config-catalog';
import type {
  ProductQuoteLineInput,
  SelectedEquipmentOption,
} from '@/lib/equipment-config-selection';
import { toPublicProduct } from '@/lib/pricing';
import {
  flattenConsumableGroupItems,
  resolveEquipmentConsumables,
  splitTonerItemsBySupplyType,
  tonerProductMatchesEquipment,
  type ConsumableItem,
} from '@/lib/product-equipment-consumables';
import {
  resolveKnownCompatibleTonerProductIds,
  resolveKnownOriginalTonerProductIds,
} from '@/lib/product-merchandising';
import { usdToPen } from '@/lib/utils';
import type { Product } from '@/types/product';

const STABILIZER_FALLBACK_USD = 150;
const STABILIZER_NAME = 'Estabilizador Sólido 2000 watts';
const STABILIZER_FALLBACK_IMAGE = '/products/estabilizador-solido-2000w.png';
const TONER_FALLBACK_IMAGE = '/categories/toner-suministros.png';

export interface EquipmentQuoteAddonOptions {
  existingLines?: ProductQuoteLineInput[];
  selectedOptions?: SelectedEquipmentOption[];
}

function isTonerName(name: string): boolean {
  return /\bt[oó]ner\b|\bcartucho\b/i.test(name);
}

function isCompatibleName(name: string): boolean {
  return /compatible|intercopy|alternativ/i.test(name);
}

/** Modelos donde no se cotiza tóner compatible (no hay oferta comercial). */
function shouldQuoteCompatibleToner(product: Product): boolean {
  const haystack = `${product.id} ${product.name} ${product.code ?? ''} ${product.slug ?? ''}`;
  return !/\bIM\s*430\s*F\b|\bMP\s*401\b|\bMP\s*402\b|\bSP\s*4510\b/i.test(haystack);
}

function extractModelNeedles(product: Product): string[] {
  const haystack = `${product.name} ${product.code ?? ''} ${product.slug ?? ''}`;
  const matches = haystack.match(/\b(?:IM\s*C?\s*\d{3,4}|MP\s*C?\s*\d{3,4}|P\s*\d{3,4})[A-Z]*/gi) ?? [];
  const needles: string[] = [];
  for (const match of matches) {
    const spaced = match.replace(/\s+/g, ' ').trim();
    needles.push(spaced, spaced.replace(/\s+/g, ''), spaced.replace(/F$/i, '').trim());
  }
  return [...new Set(needles.filter((entry) => entry.length >= 4))];
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

function pickQuotedToner(items: ConsumableItem[]): ConsumableItem | null {
  const priced = items.filter((item) => item.priceUsd > 0);
  const pool = priced.length > 0 ? priced : items;
  if (pool.length === 0) return null;
  const pack = pool.find((item) => /pack\s*x?\s*0?4|juego|set\s*x?\s*4|\bx04\b/i.test(item.name));
  if (pack) return pack;
  const black = pool.find((item) => /\bnegro\b|\bblack\b/i.test(item.name));
  if (black) return black;
  return pool[0] ?? null;
}

function tonerAlreadyQuoted(
  item: ConsumableItem,
  existing: EquipmentQuoteAddonOptions,
): boolean {
  if (existing.selectedOptions?.some((option) => option.productId === item.productId)) {
    return true;
  }
  const sku = item.sku?.trim().toLowerCase();
  return Boolean(
    existing.existingLines?.some((line) => {
      if (line.sku && sku && line.sku.trim().toLowerCase() === sku) return true;
      return line.name.trim().toLowerCase() === item.name.trim().toLowerCase();
    }),
  );
}

function stabilizerAlreadyQuoted(existing: EquipmentQuoteAddonOptions): boolean {
  if (
    existing.selectedOptions?.some(
      (option) =>
        option.productId === ESTABILIZADOR_2KVA_PRODUCT_ID ||
        option.optionId === 'estabilizador-2000w' ||
        /estabiliz/i.test(option.optionName),
    )
  ) {
    return true;
  }
  return Boolean(existing.existingLines?.some((line) => /estabiliz/i.test(line.name)));
}

function toTonerQuoteLine(
  item: ConsumableItem,
  supplyType: 'original' | 'compatible',
): ProductQuoteLineInput {
  const priceUsd = Number(item.priceUsd) || 0;
  const yieldLine = item.yieldLabel ? `Rendimiento: ${item.yieldLabel}` : null;

  return {
    name: item.name.replace(/\s+/g, ' ').trim() || (supplyType === 'original' ? 'Toner Original' : 'Toner Compatible'),
    sku: item.sku || item.productId,
    brand: supplyType === 'original' ? 'Original' : 'Compatible',
    priceUsd,
    pricePen: usdToPen(priceUsd),
    quantity: 1,
    imageUrl: item.image || TONER_FALLBACK_IMAGE,
    ...(yieldLine ? { shortDescription: yieldLine } : {}),
  };
}

function collectTonerItems(equipment: Product, catalog: Product[]): ConsumableItem[] {
  const byId = new Map<string, ConsumableItem>();
  const addItem = (item: ConsumableItem | undefined) => {
    if (!item || byId.has(item.productId)) return;
    if (!isTonerName(item.name)) return;
    byId.set(item.productId, item);
  };

  const groups = resolveEquipmentConsumables(equipment, catalog);
  const tonerGroup = groups.find((group) => group.id === 'toner');
  if (tonerGroup) {
    for (const item of flattenConsumableGroupItems([tonerGroup])) addItem(item);
  }

  const catalogById = new Map(catalog.map((row) => [row.id, row]));
  for (const id of [
    ...resolveKnownOriginalTonerProductIds(equipment),
    ...resolveKnownCompatibleTonerProductIds(equipment),
  ]) {
    const row = catalogById.get(id);
    if (row) addItem(productToTonerItem(row));
  }

  const needles = extractModelNeedles(equipment).map((needle) =>
    needle.replace(/\s+/g, '').toLowerCase(),
  );

  for (const row of catalog) {
    if (row.id === equipment.id) continue;
    if (!isTonerName(row.name)) continue;
    if (tonerProductMatchesEquipment(row, equipment)) {
      addItem(productToTonerItem(row));
      continue;
    }
    if (needles.length === 0) continue;
    const compact = `${row.name} ${row.code ?? ''}`.replace(/\s+/g, '').toLowerCase();
    if (needles.some((needle) => compact.includes(needle))) {
      addItem(productToTonerItem(row));
    }
  }

  return [...byId.values()];
}

function fallbackCompatibleLine(equipment: Product, original: ConsumableItem | null): ProductQuoteLineInput {
  const model =
    equipment.name.match(/\b(?:IM\s*C?\s*\d{3,4}[A-Z]?|MP\s*C?\s*\d{3,4}[A-Z]?)/i)?.[0]?.replace(/\s+/g, ' ') ??
    'equipo';
  const brand = equipment.brand?.trim().toUpperCase() || 'RICOH';
  const priceUsd =
    original && original.priceUsd > 0 ? Math.max(29, Math.round(original.priceUsd * 0.5)) : 49.8;

  return {
    name: `Tóner Compatible ${brand} ${model}`,
    sku: `TON-C-${model.replace(/\s+/g, '')}`,
    brand: 'Compatible',
    priceUsd,
    pricePen: usdToPen(priceUsd),
    quantity: 1,
    imageUrl: TONER_FALLBACK_IMAGE,
    shortDescription: 'Cartucho compatible — rendimiento según modelo',
  };
}

/** Líneas extra de cotización para equipos: tóner original, compatible y estabilizador 2000 W. */
export async function buildEquipmentQuoteAddonLines(
  product: Product,
  existing: EquipmentQuoteAddonOptions = {},
): Promise<ProductQuoteLineInput[]> {
  if (!isPrinterEquipment(product)) return [];

  try {
    await loadCatalogIndex();
  } catch {
    /* seguir con lo que haya en caché */
  }

  const catalog = getCatalogActiveRows().map((row) => toPublicProduct(row, 'public'));
  const items = collectTonerItems(product, catalog);
  const { original, compatible } = splitTonerItemsBySupplyType(
    items.map((item) =>
      isCompatibleName(item.name) && !/compatible/i.test(item.name)
        ? { ...item, name: `${item.name} compatible` }
        : item,
    ),
  );

  const lines: ProductQuoteLineInput[] = [];

  const originalToner = pickQuotedToner(original);
  if (originalToner && originalToner.priceUsd > 0 && !tonerAlreadyQuoted(originalToner, existing)) {
    lines.push(toTonerQuoteLine(originalToner, 'original'));
  }

  if (shouldQuoteCompatibleToner(product)) {
    const compatibleToner = pickQuotedToner(compatible);
    if (
      compatibleToner &&
      compatibleToner.priceUsd > 0 &&
      !tonerAlreadyQuoted(compatibleToner, existing)
    ) {
      lines.push(toTonerQuoteLine(compatibleToner, 'compatible'));
    } else if (!compatibleToner || compatibleToner.priceUsd <= 0) {
      const fallback = fallbackCompatibleLine(product, originalToner);
      if (
        !tonerAlreadyQuoted(
          {
            productId: fallback.sku,
            name: fallback.name,
            image: null,
            priceUsd: fallback.priceUsd ?? 0,
            sku: fallback.sku,
          },
          existing,
        )
      ) {
        lines.push(fallback);
      }
    }
  }

  if (!stabilizerAlreadyQuoted(existing)) {
    const stabilizerRow =
      catalog.find((row) => row.id === ESTABILIZADOR_2KVA_PRODUCT_ID) ??
      (() => {
        const raw = getCatalogProductById(ESTABILIZADOR_2KVA_PRODUCT_ID);
        return raw ? toPublicProduct(raw, 'public') : undefined;
      })();
    const priceUsd =
      Number(stabilizerRow?.prices?.public ?? stabilizerRow?.price) || STABILIZER_FALLBACK_USD;
    lines.push({
      name: STABILIZER_NAME,
      sku: ESTABILIZADOR_QUOTE_CODE,
      brand: stabilizerRow?.brand?.trim() || 'DELTRON',
      priceUsd,
      pricePen: usdToPen(priceUsd),
      quantity: 1,
      imageUrl: stabilizerRow?.image_url || STABILIZER_FALLBACK_IMAGE,
      shortDescription: 'Protección eléctrica 2000 watts / 2 KVA',
    });
  }

  return lines;
}
