import type { InventoryProduct } from '@/types/product';

export function buildSupplierNameCatalog(products: readonly InventoryProduct[]): string[] {
  const seen = new Set<string>();

  for (const product of products) {
    for (const supplier of product.suppliers ?? []) {
      const name = supplier.name?.trim();
      if (name) seen.add(name);
    }
  }

  return [...seen].sort((a, b) => a.localeCompare(b, 'es'));
}
