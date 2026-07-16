import { randomId } from '@/lib/random-id';
import type { InventoryProduct, InventorySupplier } from '@/types/product';

export function createEmptySupplier(): InventorySupplier {
  return {
    id: randomId(),
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
            : randomId();
        if (!name && purchase_price_usd <= 0) return null;
        return { id, name, purchase_price_usd };
      })
      .filter((row): row is InventorySupplier => row != null);
  }

  const legacy = Math.max(0, Number(legacyPurchaseUsd) || 0);
  if (legacy > 0) {
    return [{ id: randomId(), name: '', purchase_price_usd: legacy }];
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

/** Nombre del proveedor de referencia (el del menor precio de compra, o todos si empatan). */
export function resolvePurchaseSupplierLabel(
  suppliers: InventorySupplier[],
  purchaseUsd = 0,
): string | null {
  const named = suppliers
    .map((supplier) => ({
      name: typeof supplier.name === 'string' ? supplier.name.trim() : '',
      purchase_price_usd: Math.max(0, Number(supplier.purchase_price_usd) || 0),
    }))
    .filter((supplier) => supplier.name.length > 0);

  if (named.length === 0) return null;

  const target =
    purchaseUsd > 0
      ? purchaseUsd
      : Math.min(
          ...named
            .map((s) => s.purchase_price_usd)
            .filter((price) => price > 0)
            .concat(Infinity),
        );

  const matches =
    Number.isFinite(target) && target > 0
      ? named.filter((s) => Math.abs(s.purchase_price_usd - target) < 0.01)
      : named;

  const labels = (matches.length > 0 ? matches : named).map((s) => s.name);
  return [...new Set(labels)].join(', ');
}

export function withSyncedPurchasePrice(product: InventoryProduct): InventoryProduct {
  const suppliers = product.suppliers ?? [];
  return {
    ...product,
    suppliers,
    purchase_price_usd: resolvePurchasePriceUsd(suppliers, product.purchase_price_usd),
  };
}

/** Patch de compra alineado con todos los proveedores (evita que el mínimo revierta el valor). */
export function buildPurchasePricePatch(
  product: InventoryProduct,
  nextUsd: number,
): Pick<InventoryProduct, 'purchase_price_usd' | 'suppliers'> {
  const normalizedUsd = Math.max(0, Number(nextUsd) || 0);
  const suppliers = product.suppliers ?? [];
  const syncedSuppliers =
    suppliers.length > 0
      ? suppliers.map((supplier) => ({
          ...supplier,
          purchase_price_usd: normalizedUsd,
        }))
      : suppliers;

  return {
    purchase_price_usd: normalizedUsd,
    ...(syncedSuppliers.length > 0 ? { suppliers: syncedSuppliers } : {}),
  };
}
