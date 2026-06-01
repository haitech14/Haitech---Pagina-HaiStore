import type { InventoryProduct, InventorySupplier } from '@/types/product';

export function createEmptySupplier(): InventorySupplier {
  return {
    id: crypto.randomUUID(),
    name: '',
    purchase_price_usd: 0,
  };
}

export function normalizeSuppliers(
  value: unknown,
  legacyPurchaseUsd?: number,
): InventorySupplier[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const row = entry as Partial<InventorySupplier>;
        const name = typeof row.name === 'string' ? row.name.trim() : '';
        const purchase_price_usd = Math.max(0, Number(row.purchase_price_usd) || 0);
        const id =
          typeof row.id === 'string' && row.id.trim().length > 0
            ? row.id.trim()
            : crypto.randomUUID();
        if (!name && purchase_price_usd <= 0) return null;
        return { id, name, purchase_price_usd };
      })
      .filter((row): row is InventorySupplier => row != null);
  }

  const legacy = Math.max(0, Number(legacyPurchaseUsd) || 0);
  if (legacy > 0) {
    return [{ id: crypto.randomUUID(), name: '', purchase_price_usd: legacy }];
  }

  return [];
}

/** Precio de compra de referencia: el menor entre proveedores o el valor manual. */
export function resolvePurchasePriceUsd(
  suppliers: InventorySupplier[],
  fallbackUsd = 0,
): number {
  const priced = suppliers
    .map((supplier) => Number(supplier.purchase_price_usd) || 0)
    .filter((price) => price > 0);

  if (priced.length > 0) {
    return Math.round(Math.min(...priced) * 100) / 100;
  }

  return Math.max(0, Number(fallbackUsd) || 0);
}

export function withSyncedPurchasePrice(product: InventoryProduct): InventoryProduct {
  const suppliers = product.suppliers ?? [];
  return {
    ...product,
    suppliers,
    purchase_price_usd: resolvePurchasePriceUsd(suppliers, product.purchase_price_usd),
  };
}
