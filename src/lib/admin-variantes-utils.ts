import type {
  AdminCatalogVariant,
  AdminProductOptionRow,
  AdminProductOptionSource,
  AdminProductOptionsTab,
  AdminProductOptionType,
  AdminVariantesTab,
  AdminVarianteStatus,
} from '@/types/admin-variantes';
import type { InventoryProduct } from '@/types/product';

export const VARIANTE_STATUS_LABELS: Record<AdminVarianteStatus, string> = {
  activa: 'Activa',
  stock_bajo: 'Stock bajo',
  agotada: 'Agotada',
  inactiva: 'Inactiva',
};

export const PRODUCT_OPTION_TYPE_LABELS: Record<AdminProductOptionType, string> = {
  cross_sell: 'Cross-sell',
  upsell: 'Upsell',
};

export const PRODUCT_OPTION_SOURCE_LABELS: Record<AdminProductOptionSource, string> = {
  inventory: 'Inventario',
  optional: 'Sin inventario',
};

export function computeVariantesTabCounts(variants: AdminCatalogVariant[]) {
  return {
    activas: variants.filter((variant) => variant.status === 'activa').length,
    stock_bajo: variants.filter((variant) => variant.status === 'stock_bajo').length,
    agotadas: variants.filter((variant) => variant.status === 'agotada').length,
    inactivas: variants.filter((variant) => variant.status === 'inactiva').length,
  };
}

interface FilterVariantesParams {
  variants: AdminCatalogVariant[];
  tab: AdminVariantesTab;
  search: string;
  statusFilter: string;
  categoryFilter: string;
  warehouseFilter: string;
}

export function filterVariantes({
  variants,
  tab,
  search,
  statusFilter,
  categoryFilter,
  warehouseFilter,
}: FilterVariantesParams): AdminCatalogVariant[] {
  const normalizedSearch = search.trim().toLowerCase();

  return variants.filter((variant) => {
    if (tab === 'activas' && variant.status !== 'activa') return false;
    if (tab === 'stock_bajo' && variant.status !== 'stock_bajo') return false;
    if (tab === 'agotadas' && variant.status !== 'agotada') return false;
    if (tab === 'inactivas' && variant.status !== 'inactiva') return false;

    if (statusFilter !== 'todos' && variant.status !== statusFilter) return false;
    if (categoryFilter !== 'todos' && variant.category !== categoryFilter) return false;
    if (warehouseFilter !== 'todos' && variant.warehouse !== warehouseFilter) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      variant.baseProductName,
      variant.variantLabel,
      variant.sku,
      variant.category,
      variant.warehouse,
      variant.updatedBy,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

export function formatVariantePrice(pricePen: number): string {
  return `S/ ${pricePen.toLocaleString('es-PE')}`;
}

export function stockTone(stock: number, status: AdminVarianteStatus): 'high' | 'low' | 'zero' {
  if (status === 'agotada' || stock === 0) return 'zero';
  if (status === 'stock_bajo' || stock < 15) return 'low';
  return 'high';
}

export function collectProductOptionsFromInventory(
  products: InventoryProduct[],
): AdminProductOptionRow[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const rows: AdminProductOptionRow[] = [];

  for (const parent of products) {
    for (const linkedId of parent.cross_sell_product_ids ?? []) {
      const linked = productById.get(linkedId);
      if (!linked) continue;
      rows.push({
        id: `${parent.id}:cross:${linkedId}`,
        parentProductId: parent.id,
        parentProductName: parent.name,
        parentCode: parent.code ?? null,
        type: 'cross_sell',
        source: 'inventory',
        linkedProductId: linkedId,
        name: linked.name,
        code: linked.code ?? null,
        priceUsd: linked.prices?.public ?? 0,
        imageUrl: linked.image_url ?? null,
        updatedAt: parent.created_at,
      });
    }

    for (const optional of parent.cross_sell_optional_products ?? []) {
      rows.push({
        id: `${parent.id}:cross-opt:${optional.id}`,
        parentProductId: parent.id,
        parentProductName: parent.name,
        parentCode: parent.code ?? null,
        type: 'cross_sell',
        source: 'optional',
        linkedProductId: null,
        name: optional.name,
        code: optional.code ?? null,
        priceUsd: optional.price_usd,
        imageUrl: optional.image_url ?? null,
        updatedAt: parent.created_at,
      });
    }

    for (const linkedId of parent.upsell_product_ids ?? []) {
      const linked = productById.get(linkedId);
      if (!linked) continue;
      rows.push({
        id: `${parent.id}:upsell:${linkedId}`,
        parentProductId: parent.id,
        parentProductName: parent.name,
        parentCode: parent.code ?? null,
        type: 'upsell',
        source: 'inventory',
        linkedProductId: linkedId,
        name: linked.name,
        code: linked.code ?? null,
        priceUsd: linked.prices?.public ?? 0,
        imageUrl: linked.image_url ?? null,
        updatedAt: parent.created_at,
      });
    }

    for (const optional of parent.upsell_optional_products ?? []) {
      rows.push({
        id: `${parent.id}:upsell-opt:${optional.id}`,
        parentProductId: parent.id,
        parentProductName: parent.name,
        parentCode: parent.code ?? null,
        type: 'upsell',
        source: 'optional',
        linkedProductId: null,
        name: optional.name,
        code: optional.code ?? null,
        priceUsd: optional.price_usd,
        imageUrl: optional.image_url ?? null,
        updatedAt: parent.created_at,
      });
    }
  }

  return rows.sort((a, b) => {
    const byParent = a.parentProductName.localeCompare(b.parentProductName, 'es');
    if (byParent !== 0) return byParent;
    return a.name.localeCompare(b.name, 'es');
  });
}

export function computeProductOptionsTabCounts(options: AdminProductOptionRow[]) {
  return {
    cross_sell: options.filter((option) => option.type === 'cross_sell').length,
    upsell: options.filter((option) => option.type === 'upsell').length,
    opcionales: options.filter((option) => option.source === 'optional').length,
  };
}

interface FilterProductOptionsParams {
  options: AdminProductOptionRow[];
  tab: AdminProductOptionsTab;
  search: string;
  typeFilter: string;
  sourceFilter: string;
}

export function filterProductOptions({
  options,
  tab,
  search,
  typeFilter,
  sourceFilter,
}: FilterProductOptionsParams): AdminProductOptionRow[] {
  const normalizedSearch = search.trim().toLowerCase();

  return options.filter((option) => {
    if (tab === 'cross_sell' && option.type !== 'cross_sell') return false;
    if (tab === 'upsell' && option.type !== 'upsell') return false;
    if (tab === 'opcionales' && option.source !== 'optional') return false;

    if (typeFilter !== 'todos' && option.type !== typeFilter) return false;
    if (sourceFilter !== 'todos' && option.source !== sourceFilter) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      option.parentProductName,
      option.parentCode,
      option.name,
      option.code,
      option.type,
      option.source,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

export function computeProductOptionsKpis(options: AdminProductOptionRow[]) {
  const crossSell = options.filter((option) => option.type === 'cross_sell').length;
  const upsell = options.filter((option) => option.type === 'upsell').length;
  const optional = options.filter((option) => option.source === 'optional').length;

  return {
    total: String(options.length),
    crossSell: String(crossSell),
    upsell: String(upsell),
    optional: String(optional),
  };
}
