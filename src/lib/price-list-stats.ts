import { sortProductsByOrder } from '@/lib/inventory-product-order';
import { ensureFullPrices } from '@/lib/pricing';
import { PRICE_ROLES, type InventoryProduct, type PriceRole } from '@/types/product';

export interface PriceListRow {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  usd: number;
}

export interface PriceListRoleStats {
  role: PriceRole;
  productCount: number;
  pricedCount: number;
  totalUsd: number;
  averageUsd: number;
  rows: PriceListRow[];
}

export function buildPriceListStats(
  products: InventoryProduct[],
  role: PriceRole,
): PriceListRoleStats {
  const rows: PriceListRow[] = sortProductsByOrder(products)
    .map((product) => {
      const prices = ensureFullPrices(product.prices);
      return {
        id: product.id,
        code: product.code,
        name: product.name,
        category: product.category?.trim() || 'Sin categoría',
        stock: product.stock,
        usd: Number(prices[role]) || 0,
      };
    })
    .filter((row) => row.usd > 0);

  const totalUsd = rows.reduce((sum, row) => sum + row.usd, 0);

  return {
    role,
    productCount: products.length,
    pricedCount: rows.length,
    totalUsd,
    averageUsd: rows.length > 0 ? totalUsd / rows.length : 0,
    rows,
  };
}

export function buildAllPriceListStats(products: InventoryProduct[]): PriceListRoleStats[] {
  return PRICE_ROLES.map((role) => buildPriceListStats(products, role));
}
