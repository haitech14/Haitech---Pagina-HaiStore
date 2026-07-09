export type AdminVarianteStatus = 'activa' | 'stock_bajo' | 'agotada' | 'inactiva';

export type AdminVariantesTab = 'todas' | 'activas' | 'stock_bajo' | 'agotadas' | 'inactivas';

export type AdminVariantesView = 'variantes' | 'opciones';

export interface AdminCatalogVariant {
  id: string;
  createdAt: string;
  baseProductId: string;
  baseProductName: string;
  baseProductImage: string | null;
  variantLabel: string;
  sku: string;
  pricePen: number;
  stock: number;
  stockCapacity: number;
  warehouse: string;
  category: string;
  updatedAt: string;
  updatedBy: string;
  status: AdminVarianteStatus;
}

export interface AdminVariantesKpi {
  title: string;
  value: string;
  icon: 'active' | 'products' | 'stock' | 'out_of_stock';
  trend?: number;
  delta?: number;
  trendLabel: string;
  sparkline: number[];
}

export interface AdminVariantesStatusDistribution {
  status: AdminVarianteStatus;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminVariantesStockBar {
  variantId: string;
  label: string;
  stock: number;
  capacity: number;
  percent: number;
}

export interface AdminVariantesTopCombinations {
  rank: number;
  productName: string;
  variantCount: number;
}

export type AdminProductOptionType = 'cross_sell' | 'upsell';

export type AdminProductOptionSource = 'inventory' | 'optional';

export type AdminProductOptionsTab = 'todas' | 'cross_sell' | 'upsell' | 'opcionales';

export interface AdminProductOptionRow {
  id: string;
  parentProductId: string;
  parentProductName: string;
  parentCode: string | null;
  type: AdminProductOptionType;
  source: AdminProductOptionSource;
  linkedProductId: string | null;
  name: string;
  code: string | null;
  priceUsd: number;
  imageUrl: string | null;
  updatedAt: string;
}

export interface AdminProductOptionsKpi {
  title: string;
  value: string;
  icon: 'total' | 'cross_sell' | 'upsell' | 'optional';
  trendLabel: string;
  sparkline: number[];
}
