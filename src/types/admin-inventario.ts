export type AdminInventarioStockStatus = 'en_stock' | 'stock_bajo' | 'stock_critico';

export type AdminInventarioMovementType = 'entrada' | 'salida';

export interface AdminInventarioRecord {
  id: string;
  name: string;
  subtitle: string;
  sku: string;
  barcode?: string;
  category: string;
  stock: number;
  minStock: number;
  location: string;
  status: AdminInventarioStockStatus;
  lastMovementAt: Date;
  lastMovementType: AdminInventarioMovementType;
  imageColor: string;
  imageUrl?: string | null;
}

export interface AdminInventarioKpi {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: 'products' | 'low-stock' | 'movements' | 'value';
  sparkline: number[];
}

export interface AdminInventarioCategoryDistribution {
  category: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminInventarioStockAlert {
  key: string;
  label: string;
  count: number;
  tone: 'red' | 'orange' | 'amber';
}

export interface AdminInventarioTopMovedProduct {
  rank: number;
  name: string;
  movements: number;
  imageColor: string;
  imageUrl?: string | null;
}
