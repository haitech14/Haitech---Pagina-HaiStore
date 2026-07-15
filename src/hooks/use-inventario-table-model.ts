import { useMemo } from 'react';

import { mapProductToListaPreciosRecord } from '@/lib/admin-listas-precios-utils';
import { compareInventoryTableDivisionLabels } from '@/lib/inventory-equipment-sections';
import {
  buildCategoryFilterTargetSet,
  productMatchesCategoryTargetSet,
} from '@/lib/inventory-categories';
import { collectOrphanCategoryLabels, buildCategorySelectOptions } from '@/lib/inventory-category-options';
import type { AdminListaPreciosRecord, AdminListaPreciosRoleKey } from '@/types/admin-listas-precios';
import type { InventoryProduct } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export type InventarioMerchandisingCatalogEntry = {
  id: string;
  name: string;
  code?: string | null;
};

export type InventarioTableViewFilters = {
  search: string;
  roleFilter: string;
  currencyFilter: string;
  channelFilter: string;
  validityFilter: string;
  sortRole: AdminListaPreciosRoleKey;
  sortDir: 'asc' | 'desc';
};

export type InventarioTableModel = {
  productsById: Map<string, InventoryProduct>;
  merchandisingProductById: Map<string, string>;
  merchandisingCatalog: InventarioMerchandisingCatalogEntry[];
  records: AdminListaPreciosRecord[];
  categoryOptions: ReturnType<typeof buildCategorySelectOptions>;
  filteredRecords: AdminListaPreciosRecord[];
  sortedRecords: AdminListaPreciosRecord[];
  divisionCounts: Map<string, number>;
};

/**
 * Derivaciones O(N) del inventario admin: maps, haystack, filtro y sort.
 * Una sola pasada de dependencias por cambio de productos/vista.
 */
export function useInventarioTableModel(
  products: InventoryProduct[],
  categoryTree: StoreCategoryTreeNode[],
  view: InventarioTableViewFilters,
): InventarioTableModel {
  const productsById = useMemo(() => {
    const map = new Map<string, InventoryProduct>();
    for (const product of products) {
      if (map.has(product.id)) {
        console.warn(
          `[inventario] id duplicado en lista admin: ${product.id} — se conserva el primero`,
        );
        continue;
      }
      map.set(product.id, product);
    }
    return map;
  }, [products]);

  const merchandisingProductById = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );

  const merchandisingCatalog = useMemo(() => {
    const entries: InventarioMerchandisingCatalogEntry[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      code: product.code,
    }));
    entries.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return entries;
  }, [products]);

  const records = useMemo(
    () => products.map(mapProductToListaPreciosRecord),
    [products],
  );

  const categoryOptions = useMemo(() => {
    const orphans = collectOrphanCategoryLabels(
      categoryTree,
      products.map((product) => product.category ?? ''),
    );
    return buildCategorySelectOptions(categoryTree, orphans);
  }, [categoryTree, products]);

  const categoryTargets = useMemo(() => {
    if (view.channelFilter === 'todos') return null;
    return buildCategoryFilterTargetSet(categoryTree, view.channelFilter);
  }, [categoryTree, view.channelFilter]);

  const filteredRecords = useMemo(() => {
    const normalized = view.search.trim().toLowerCase();
    const hasSearch = normalized.length > 0;
    const hasCategory = view.channelFilter !== 'todos';

    return records.filter((record) => {
      // Con búsqueda activa no aplicar filtros de vigencia/rol/moneda: el usuario busca
      // un SKU o nombre concreto (p. ej. borrador sin costo de compra).
      if (!hasSearch) {
        if (view.roleFilter !== 'todos') {
          const role = view.roleFilter as AdminListaPreciosRoleKey;
          if (record.prices[role] <= 0) return false;
        }

        if (view.validityFilter === 'vigente' && record.status === 'inactiva') return false;
        if (view.validityFilter === 'activa' && record.status !== 'activa') return false;
        if (view.validityFilter === 'borrador' && record.status !== 'borrador') return false;
        if (view.validityFilter === 'inactiva' && record.status !== 'inactiva') return false;

        if (view.currencyFilter === 'pen' && record.prices.public <= 0) return false;
        if (view.currencyFilter === 'usd' && record.prices.compra <= 0) return false;
      }

      if (hasCategory) {
        const product = productsById.get(record.id);
        if (
          !productMatchesCategoryTargetSet(
            { category: product?.category ?? record.parentCategory },
            categoryTargets,
          )
        ) {
          return false;
        }
      }

      if (!hasSearch) return true;
      const haystack = record.searchHaystack ?? `${record.name} ${record.sku}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [
    categoryTargets,
    productsById,
    records,
    view.channelFilter,
    view.currencyFilter,
    view.roleFilter,
    view.search,
    view.validityFilter,
  ]);

  const sortedRecords = useMemo(() => {
    const direction = view.sortDir === 'asc' ? 1 : -1;
    const role = view.sortRole;
    return filteredRecords.slice().sort((a, b) => {
      const divisionDiff = compareInventoryTableDivisionLabels(
        a.divisionLabel,
        b.divisionLabel,
      );
      if (divisionDiff !== 0) return divisionDiff;
      const diff = (Number(a.prices[role]) || 0) - (Number(b.prices[role]) || 0);
      if (diff !== 0) return diff * direction;
      return a.name.localeCompare(b.name, 'es');
    });
  }, [filteredRecords, view.sortDir, view.sortRole]);

  const divisionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of sortedRecords) {
      counts.set(record.divisionLabel, (counts.get(record.divisionLabel) ?? 0) + 1);
    }
    return counts;
  }, [sortedRecords]);

  return {
    productsById,
    merchandisingProductById,
    merchandisingCatalog,
    records,
    categoryOptions,
    filteredRecords,
    sortedRecords,
    divisionCounts,
  };
}
