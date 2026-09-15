import { getCatalogProductById, getCatalogRows, type CatalogRow } from '@/lib/catalog-featured';

function warehouseStockTotal(row: CatalogRow | undefined): number {
  if (!row?.stock_by_warehouse?.length) return 0;
  return row.stock_by_warehouse.reduce(
    (sum, entry) => sum + Math.max(0, Math.floor(Number(entry.quantity) || 0)),
    0,
  );
}

/** Stock usable en vitrina: índice vivo; el mock de la card solo si no hay fila. */
export function resolveCatalogStock(
  row: CatalogRow | undefined,
  fallbackStock?: number,
): number {
  if (row) {
    const rowStock = Math.max(0, Math.floor(Number(row.stock) || 0));
    const warehouseStock = warehouseStockTotal(row);
    return Math.max(rowStock, warehouseStock);
  }
  return Math.max(0, Math.floor(Number(fallbackStock) || 0));
}

export function resolveCatalogRowForProduct(product: {
  id: string;
  code?: string | null;
}): CatalogRow | undefined {
  const byId = getCatalogProductById(product.id);
  if (byId) return byId;

  const code = product.code?.trim().toUpperCase();
  if (!code) return undefined;

  return getCatalogRows().find((row) => row.code?.trim().toUpperCase() === code);
}
