import { extractProductYield } from '@/lib/product-cost-per-copy';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';

export type MaintenancePlanKindId = 'maintenance' | 'supplies';

export interface MaintenancePlanKindOption {
  id: MaintenancePlanKindId;
  label: string;
  hint: string;
}

export const MAINTENANCE_PLAN_KINDS: readonly MaintenancePlanKindOption[] = [
  {
    id: 'maintenance',
    label: 'Solo mantenimiento',
    hint: 'Preventivo y correctivo, sin tóner',
  },
  {
    id: 'supplies',
    label: 'Plan de suministros',
    hint: 'Mantenimiento + tóner proyectado según modelo y plazo',
  },
] as const;

export interface MaintenanceTonerCatalogItem {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  prices?: { public?: number } | null;
  price?: number;
  attributes?: { name: string; value: string }[];
}

export interface MaintenanceTonerSku {
  color: string;
  yieldPages: number;
  publicUsd: number;
  productId?: string;
}

export interface MaintenanceSupplyLine {
  color: string;
  yieldPages: number;
  unitSalePen: number;
  rawUnits: number;
  unitsToBuy: number;
  linePen: number;
}

export interface MaintenanceSupplyProjection {
  totalPages: number;
  lines: MaintenanceSupplyLine[];
  unitsToBuy: number;
  suppliesPen: number;
  suppliesIgvPen: number;
  suppliesTotalPen: number;
}

const FALLBACK_BW: MaintenanceTonerSku = {
  color: 'Negro',
  yieldPages: 20_000,
  publicUsd: 90,
};

const FALLBACK_COLOR: readonly MaintenanceTonerSku[] = [
  { color: 'Negro', yieldPages: 16_000, publicUsd: 65 },
  { color: 'Cyan', yieldPages: 10_000, publicUsd: 175 },
  { color: 'Magenta', yieldPages: 10_000, publicUsd: 175 },
  { color: 'Amarillo', yieldPages: 10_000, publicUsd: 175 },
];

/** Perfiles de tóner original (rendimiento ISO 5% y precio de venta público USD). */
const TONER_BY_MODEL: Record<string, readonly MaintenanceTonerSku[]> = {
  'im-430f': [{ color: 'Negro', yieldPages: 14_500, publicUsd: 82.9, productId: '419078' }],
  'p-502': [{ color: 'Negro', yieldPages: 14_500, publicUsd: 82.9, productId: '419078' }],
  'im-550f': [{ color: 'Negro', yieldPages: 25_000, publicUsd: 120 }],
  'im-600f': [{ color: 'Negro', yieldPages: 40_000, publicUsd: 160, productId: '418480' }],
  'p-800': [{ color: 'Negro', yieldPages: 40_000, publicUsd: 160, productId: '418480' }],
  'p-801': [{ color: 'Negro', yieldPages: 40_000, publicUsd: 160, productId: '418480' }],
  'mp-305-plus': [{ color: 'Negro', yieldPages: 9_000, publicUsd: 72 }],
  'im-2510': [
    { color: 'Negro', yieldPages: 30_100, publicUsd: 98, productId: 'ricoh-842831' },
  ],
  'im-c320f': [
    { color: 'Negro', yieldPages: 16_000, publicUsd: 65, productId: '842725' },
    { color: 'Cyan', yieldPages: 10_000, publicUsd: 175, productId: '842718' },
    { color: 'Magenta', yieldPages: 10_000, publicUsd: 175, productId: '842719' },
    { color: 'Amarillo', yieldPages: 10_000, publicUsd: 175, productId: '842720' },
  ],
  'im-c401f': [
    { color: 'Negro', yieldPages: 17_500, publicUsd: 68, productId: '842394' },
    { color: 'Cyan', yieldPages: 8_000, publicUsd: 155, productId: '842395' },
    { color: 'Magenta', yieldPages: 8_000, publicUsd: 155, productId: '842396' },
    { color: 'Amarillo', yieldPages: 8_000, publicUsd: 155, productId: '842397' },
  ],
  'p-c600': [
    { color: 'Negro', yieldPages: 16_000, publicUsd: 65 },
    { color: 'Cyan', yieldPages: 10_000, publicUsd: 175 },
    { color: 'Magenta', yieldPages: 10_000, publicUsd: 175 },
    { color: 'Amarillo', yieldPages: 10_000, publicUsd: 175 },
  ],
  'im-c3000': [
    { color: 'Negro', yieldPages: 29_500, publicUsd: 98, productId: 'ricoh-toner-mp' },
    { color: 'Cyan', yieldPages: 22_500, publicUsd: 165 },
    { color: 'Magenta', yieldPages: 22_500, publicUsd: 165 },
    { color: 'Amarillo', yieldPages: 22_500, publicUsd: 165 },
  ],
  'im-c4510': [
    { color: 'Negro', yieldPages: 33_000, publicUsd: 110 },
    { color: 'Cyan', yieldPages: 22_500, publicUsd: 175 },
    { color: 'Magenta', yieldPages: 22_500, publicUsd: 175 },
    { color: 'Amarillo', yieldPages: 22_500, publicUsd: 175 },
  ],
  'pro-c5300': [
    { color: 'Negro', yieldPages: 45_000, publicUsd: 210 },
    { color: 'Cyan', yieldPages: 33_000, publicUsd: 240 },
    { color: 'Magenta', yieldPages: 33_000, publicUsd: 240 },
    { color: 'Amarillo', yieldPages: 33_000, publicUsd: 240 },
  ],
  'pro-c5310': [
    { color: 'Negro', yieldPages: 45_000, publicUsd: 220 },
    { color: 'Cyan', yieldPages: 33_000, publicUsd: 250 },
    { color: 'Magenta', yieldPages: 33_000, publicUsd: 250 },
    { color: 'Amarillo', yieldPages: 33_000, publicUsd: 250 },
  ],
  'pro-8300': [{ color: 'Negro', yieldPages: 51_000, publicUsd: 190 }],
  'plotter-cw2200': [
    { color: 'Negro', yieldPages: 12_000, publicUsd: 140 },
    { color: 'Cyan', yieldPages: 8_000, publicUsd: 155 },
    { color: 'Magenta', yieldPages: 8_000, publicUsd: 155 },
    { color: 'Amarillo', yieldPages: 8_000, publicUsd: 155 },
  ],
};

function money2(value: number): number {
  return Math.round(value * 100) / 100;
}

function tonerSalePen(usd: number): number {
  const rate = getUsdToPenSaleRate();
  if (!Number.isFinite(usd) || usd <= 0 || rate <= 0) return 0;
  return money2(usd * rate);
}

function catalogById(
  catalog: readonly MaintenanceTonerCatalogItem[] | undefined,
): Map<string, MaintenanceTonerCatalogItem> {
  const map = new Map<string, MaintenanceTonerCatalogItem>();
  if (!catalog) return map;
  for (const row of catalog) {
    map.set(row.id, row);
    const code = row.code?.trim();
    if (code) map.set(code, row);
  }
  return map;
}

function resolveSkuFromCatalog(
  sku: MaintenanceTonerSku,
  byId: Map<string, MaintenanceTonerCatalogItem>,
): MaintenanceTonerSku {
  if (!sku.productId) return sku;
  const row = byId.get(sku.productId);
  if (!row) return sku;

  const publicUsd = Number(row.prices?.public ?? row.price ?? 0);
  const yieldInfo = extractProductYield({
    name: row.name,
    attributes: (row.attributes ?? []).map((attr, index) => ({
      id: `toner-yield-${index}`,
      name: attr.name,
      value: attr.value,
    })),
    description: row.description ?? '',
  });

  return {
    ...sku,
    publicUsd: publicUsd > 0 ? publicUsd : sku.publicUsd,
    yieldPages:
      yieldInfo.pages && yieldInfo.pages > 0 ? yieldInfo.pages : sku.yieldPages,
  };
}

function skusForModel(
  modelId: string,
  printType: 'bw' | 'color',
): readonly MaintenanceTonerSku[] {
  const mapped = TONER_BY_MODEL[modelId];
  if (mapped?.length) return mapped;
  return printType === 'color' ? FALLBACK_COLOR : [FALLBACK_BW];
}

export function projectMaintenanceSupplies(input: {
  modelId: string;
  printType: 'bw' | 'color';
  usesPrintVolume: boolean;
  volumePages: number;
  termMonths: number;
  quantity: number;
  catalog?: readonly MaintenanceTonerCatalogItem[];
}): MaintenanceSupplyProjection | null {
  if (!input.usesPrintVolume) return null;

  const totalPages = Math.max(0, input.volumePages) * input.termMonths * input.quantity;
  if (totalPages <= 0) return null;

  const byId = catalogById(input.catalog);
  const skus = skusForModel(input.modelId, input.printType).map((sku) =>
    resolveSkuFromCatalog(sku, byId),
  );

  const lines: MaintenanceSupplyLine[] = skus.map((sku) => {
    const yieldPages = Math.max(1, sku.yieldPages);
    const unitSalePen = tonerSalePen(sku.publicUsd);
    const rawUnits = totalPages / yieldPages;
    const unitsToBuy = Math.max(1, Math.ceil(rawUnits - 1e-9));
    return {
      color: sku.color,
      yieldPages,
      unitSalePen,
      rawUnits: money2(rawUnits),
      unitsToBuy,
      linePen: money2(unitsToBuy * unitSalePen),
    };
  });

  const suppliesPen = money2(lines.reduce((sum, line) => sum + line.linePen, 0));
  const suppliesIgvPen = money2(suppliesPen * 0.18);
  return {
    totalPages,
    lines,
    unitsToBuy: lines.reduce((sum, line) => sum + line.unitsToBuy, 0),
    suppliesPen,
    suppliesIgvPen,
    suppliesTotalPen: money2(suppliesPen + suppliesIgvPen),
  };
}
