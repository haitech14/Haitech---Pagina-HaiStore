import { resolveInventoryTableDivisionLabel } from '@/lib/inventory-equipment-sections';
import { inventoryCategoryParentLabel } from '@/lib/inventory-stock-status';
import { ensureFullPrices } from '@/lib/pricing';
import { usdToPenCharm } from '@/lib/pen-pricing';
import { PRICE_ROLE_LABELS } from '@/lib/roles';
import { normalizeProductCatalogStatus } from '../../shared/product-catalog-status.js';
import type {
  AdminListaPreciosCurrencySlice,
  AdminListaPreciosKpi,
  AdminListaPreciosMarginProduct,
  AdminListaPreciosRecord,
  AdminListaPreciosRoleAverage,
  AdminListaPreciosRoleKey,
  AdminListaPreciosRoleSlice,
  AdminListaPreciosStatus,
} from '@/types/admin-listas-precios';
import type { InventoryProduct } from '@/types/product';

const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EC4899', '#14B8A6'];

const ROLE_HEADER_META: Record<AdminListaPreciosRoleKey, { tone: string }> = {
  public: {
    tone: 'text-blue-600',
  },
  distribuidor: {
    tone: 'text-emerald-600',
  },
  mayorista: {
    tone: 'text-violet-600',
  },
  compra: {
    tone: 'text-orange-600',
  },
};

const ROLE_COLORS: Record<AdminListaPreciosRoleKey, string> = {
  public: '#3B82F6',
  distribuidor: '#22C55E',
  mayorista: '#8B5CF6',
  compra: '#F97316',
};

const ROLE_BG: Record<AdminListaPreciosRoleKey, string> = {
  public: 'bg-blue-50 text-blue-700',
  distribuidor: 'bg-emerald-50 text-emerald-700',
  mayorista: 'bg-violet-50 text-violet-700',
  compra: 'bg-orange-50 text-orange-700',
};

const ROLE_LABELS: Record<AdminListaPreciosRoleKey, string> = {
  public: PRICE_ROLE_LABELS.public,
  distribuidor: PRICE_ROLE_LABELS.distribuidor,
  mayorista: PRICE_ROLE_LABELS.mayorista,
  compra: 'Compra',
};

function hashColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length] ?? '#3B82F6';
}

function productSubtitle(product: InventoryProduct): string {
  const brand = product.brand?.trim();
  const attribute = product.attributes?.[0];
  if (brand && attribute?.value) return `${brand} · ${attribute.value}`;
  if (brand) return brand;
  return product.category?.split(',')[1]?.trim() ?? product.category ?? '';
}

function resolveStatus(product: InventoryProduct): AdminListaPreciosStatus {
  return normalizeProductCatalogStatus(product.status);
}

export function mapProductToListaPreciosRecord(product: InventoryProduct): AdminListaPreciosRecord {
  const fullPrices = ensureFullPrices(product.prices);
  const prices: Record<AdminListaPreciosRoleKey, number> = {
    public: Number(fullPrices.public) || 0,
    distribuidor: Number(fullPrices.distribuidor) || 0,
    mayorista: Number(fullPrices.mayorista) || 0,
    compra: Number(product.purchase_price_usd) || 0,
  };

  return {
    id: product.id,
    parentCategory: inventoryCategoryParentLabel(product.category),
    divisionLabel: resolveInventoryTableDivisionLabel(product),
    name: product.name,
    subtitle: productSubtitle(product),
    sku: product.code?.trim() || product.id,
    imageUrl: product.image_url,
    imageColor: hashColor(product.id),
    prices,
    status: resolveStatus(product),
  };
}

function buildSparkline(total: number, points = 8): number[] {
  if (total <= 0) return Array.from({ length: points }, () => 0);
  const step = total / (points - 1);
  return Array.from({ length: points }, (_, index) => Math.round(step * index));
}

export function buildListaPreciosKpis(
  products: InventoryProduct[],
  exchangeRate: number,
  exchangeUpdatedAt?: Date,
): AdminListaPreciosKpi[] {
  const records = products.map(mapProductToListaPreciosRecord);
  const pricedCount = records.filter((record) => record.prices.public > 0).length;
  const activeRoles = (['compra', 'mayorista', 'distribuidor', 'public'] as const).filter((role) =>
    records.some((record) => record.prices[role] > 0),
  );

  const exchangeDetail = exchangeUpdatedAt
    ? `Actualizado ${exchangeUpdatedAt.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}`
    : 'Tipo de cambio de venta';

  return [
    {
      title: 'Listas activas',
      value: String(activeRoles.length),
      detail: 'roles con precios',
      icon: 'lists',
      sparkline: buildSparkline(activeRoles.length),
    },
    {
      title: 'Productos tarifados',
      value: pricedCount.toLocaleString('es-PE'),
      detail: `de ${products.length.toLocaleString('es-PE')} en catálogo`,
      icon: 'priced',
      sparkline: buildSparkline(pricedCount),
    },
    {
      title: 'Roles comparados',
      value: activeRoles.map((role) => ROLE_LABELS[role]).join(', '),
      detail: 'segmentación activa',
      icon: 'roles',
      sparkline: buildSparkline(activeRoles.length * 10),
    },
    {
      title: 'Tipo de cambio',
      value: `S/ ${exchangeRate.toFixed(2)} = $ 1.00`,
      detail: exchangeDetail,
      icon: 'exchange',
      sparkline: buildSparkline(Math.round(exchangeRate * 10)),
    },
  ];
}

export function buildRoleComparisonSlices(
  products: InventoryProduct[],
  exchangeRate: number,
): AdminListaPreciosRoleSlice[] {
  const roles: AdminListaPreciosRoleKey[] = ['compra', 'mayorista', 'distribuidor', 'public'];

  return roles.map((role) => {
    const values = products
      .map((product) => mapProductToListaPreciosRecord(product).prices[role])
      .filter((value) => value > 0);

    const averageUsd =
      values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

    return {
      role,
      label: ROLE_LABELS[role],
      averagePen: usdToPenCharm(averageUsd, exchangeRate),
      color: ROLE_COLORS[role],
    };
  });
}

export function buildTopMarginProducts(
  products: InventoryProduct[],
  limit = 5,
): AdminListaPreciosMarginProduct[] {
  return products
    .map((product) => {
      const record = mapProductToListaPreciosRecord(product);
      const sale = record.prices.public;
      const purchase = record.prices.compra;
      const marginPercent =
        sale > 0 && purchase > 0
          ? Math.round(((sale - purchase) / sale) * 100)
          : 0;

      return {
        id: record.id,
        name: record.name,
        marginPercent,
        color: hashColor(record.id),
      };
    })
    .filter((item) => item.marginPercent > 0)
    .sort((a, b) => b.marginPercent - a.marginPercent)
    .slice(0, limit);
}

export function buildCurrencyDistribution(
  products: InventoryProduct[],
): AdminListaPreciosCurrencySlice[] {
  const records = products.map(mapProductToListaPreciosRecord);
  const withPublic = records.filter((record) => record.prices.public > 0).length;
  const total = records.length || 1;
  const penPercent = Math.round((withPublic / total) * 100);
  const usdPercent = 100 - penPercent;

  return [
    { label: 'PEN', percent: penPercent, color: '#3B82F6' },
    { label: 'USD', percent: usdPercent, color: '#22C55E' },
  ];
}

export function buildRoleAveragePrices(
  products: InventoryProduct[],
  exchangeRate: number,
): AdminListaPreciosRoleAverage[] {
  return buildRoleComparisonSlices(products, exchangeRate).map((slice) => ({
    role: slice.role,
    label: slice.label,
    averagePen: slice.averagePen,
    color: slice.color,
    bgClass: ROLE_BG[slice.role],
  }));
}

export function getListaPreciosParentCategories(products: InventoryProduct[]): string[] {
  const categories = new Set<string>();
  for (const product of products) {
    categories.add(inventoryCategoryParentLabel(product.category));
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b, 'es'));
}

export { ROLE_COLORS, ROLE_HEADER_META, ROLE_LABELS };
