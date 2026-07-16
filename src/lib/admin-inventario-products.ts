import {
  getInventoryStockStatus,
  INVENTORY_LOW_STOCK_THRESHOLD,
  inventoryCategoryLeafLabel,
  normalizeStockQuantity,
} from '@/lib/inventory-stock-status';
import {
  DEFAULT_WAREHOUSES,
  getProductPrimaryWarehouseId,
  normalizeWarehouses,
} from '@/lib/inventory-stock';
import { formatPenFromUsd } from '@/lib/utils';
import type {
  AdminInventarioCategoryDistribution,
  AdminInventarioKpi,
  AdminInventarioRecord,
  AdminInventarioStockAlert,
  AdminInventarioStockStatus,
  AdminInventarioTopMovedProduct,
} from '@/types/admin-inventario';
import type { InventoryProduct, InventoryWarehouse } from '@/types/product';

const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#94A3B8', '#EC4899', '#14B8A6'];

function hashColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length] ?? '#3B82F6';
}

function toStockStatus(stock: number): AdminInventarioStockStatus {
  const level = getInventoryStockStatus(stock);
  if (level === 'out') return 'stock_critico';
  if (level === 'low') return 'stock_bajo';
  return 'en_stock';
}

function productSubtitle(product: InventoryProduct): string {
  const brand = product.brand?.trim();
  const attribute = product.attributes?.[0];
  if (brand && attribute?.value) return `${brand} · ${attribute.value}`;
  if (brand) return brand;
  if (attribute?.value) return attribute.value;
  const category = product.category?.trim();
  if (category) return inventoryCategoryLeafLabel(category);
  return 'Producto de tienda';
}

function productLocation(
  product: InventoryProduct,
  warehouses: InventoryWarehouse[] = DEFAULT_WAREHOUSES,
): string {
  const list = normalizeWarehouses(warehouses);
  const warehouseId = getProductPrimaryWarehouseId(product, list);
  return list.find((entry) => entry.id === warehouseId)?.name ?? 'Almacén principal';
}

export function mapInventoryProductToRecord(product: InventoryProduct): AdminInventarioRecord {
  const stock = normalizeStockQuantity(product.stock);
  const createdAt = product.created_at ? new Date(product.created_at) : new Date();

  return {
    id: product.id,
    name: product.name,
    subtitle: productSubtitle(product),
    sku: product.code?.trim() || product.id,
    barcode: product.code ?? undefined,
    category: inventoryCategoryLeafLabel(product.category),
    stock,
    minStock: INVENTORY_LOW_STOCK_THRESHOLD,
    location: productLocation(product),
    status: toStockStatus(stock),
    lastMovementAt: createdAt,
    lastMovementType: stock > 0 ? 'entrada' : 'salida',
    imageColor: hashColor(product.id),
    imageUrl: product.image_url,
  };
}

function buildSparkline(total: number, points = 8): number[] {
  if (total <= 0) return Array.from({ length: points }, () => 0);
  const step = total / (points - 1);
  return Array.from({ length: points }, (_, index) => Math.round(step * index));
}

export function buildInventarioKpis(products: InventoryProduct[]): AdminInventarioKpi[] {
  const total = products.length;
  const lowStock = products.filter((product) => {
    const status = getInventoryStockStatus(product.stock);
    return status === 'low' || status === 'out';
  }).length;
  const featured = products.filter((product) => product.is_featured).length;
  const inventoryValueUsd = products.reduce(
    (sum, product) => sum + Number(product.purchase_price_usd ?? 0) * normalizeStockQuantity(product.stock),
    0,
  );

  return [
    {
      title: 'Productos activos',
      value: total.toLocaleString('es-PE'),
      trend: 0,
      trendLabel: 'en catálogo web',
      icon: 'products',
      sparkline: buildSparkline(total),
    },
    {
      title: 'Stock bajo',
      value: String(lowStock),
      trend: 0,
      trendLabel: 'requieren atención',
      icon: 'low-stock',
      sparkline: buildSparkline(lowStock),
    },
    {
      title: 'Destacados en web',
      value: String(featured),
      trend: 0,
      trendLabel: 'en vitrina',
      icon: 'movements',
      sparkline: buildSparkline(featured),
    },
    {
      title: 'Valor inventario',
      value: formatPenFromUsd(inventoryValueUsd),
      trend: 0,
      trendLabel: 'costo en stock',
      icon: 'value',
      sparkline: buildSparkline(Math.round(inventoryValueUsd / 1000)),
    },
  ];
}

export function buildInventarioCategoryDistribution(
  products: InventoryProduct[],
): AdminInventarioCategoryDistribution[] {
  const counts = new Map<string, number>();

  for (const product of products) {
    const label = inventoryCategoryLeafLabel(product.category);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const total = products.length || 1;
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count], index) => ({
      category,
      count,
      percent: Math.round((count / total) * 1000) / 10,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? '#94A3B8',
    }));
}

export function buildInventarioStockAlerts(products: InventoryProduct[]): AdminInventarioStockAlert[] {
  let critical = 0;
  let low = 0;
  let healthy = 0;

  for (const product of products) {
    const status = getInventoryStockStatus(product.stock);
    if (status === 'out') critical += 1;
    else if (status === 'low') low += 1;
    else healthy += 1;
  }

  return [
    {
      key: 'critical',
      label: 'Stock crítico (sin unidades)',
      count: critical,
      tone: 'red',
    },
    {
      key: 'low',
      label: 'Stock bajo (≤ stock mínimo)',
      count: low,
      tone: 'orange',
    },
    {
      key: 'healthy',
      label: 'En stock saludable',
      count: healthy,
      tone: 'amber',
    },
  ];
}

export function buildInventarioTopMoved(products: InventoryProduct[]): AdminInventarioTopMovedProduct[] {
  return [...products]
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
    .slice(0, 5)
    .map((product, index) => ({
      rank: index + 1,
      name: product.name,
      movements: product.view_count ?? 0,
      imageColor: hashColor(product.id),
      imageUrl: product.image_url,
    }));
}

export function getInventarioCategoryNames(products: InventoryProduct[]): string[] {
  const categories = new Set<string>();
  for (const product of products) {
    categories.add(inventoryCategoryLeafLabel(product.category));
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b, 'es'));
}
