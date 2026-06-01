import { getBrandName, printerBrands } from '@/data/brands';
import { parseInventoryTagList } from '@/lib/inventory-tags';
import type { InventoryProduct } from '@/types/product';

import type { InventorySelectOption } from '@/lib/inventory-category-options';

export function buildBrandSelectOptions(
  products: InventoryProduct[] | undefined,
  currentValue: string | null | undefined,
): InventorySelectOption[] {
  const seen = new Set<string>();

  const add = (name: string) => {
    const key = name.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
  };

  for (const brand of printerBrands) {
    add(getBrandName(brand));
  }

  for (const product of products ?? []) {
    for (const part of parseInventoryTagList(product.brand)) {
      add(part);
    }
  }

  for (const part of parseInventoryTagList(currentValue)) {
    add(part);
  }

  return [...seen]
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((value) => ({ value, label: value }));
}
