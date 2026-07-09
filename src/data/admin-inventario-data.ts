import type {
  AdminInventarioCategoryDistribution,
  AdminInventarioKpi,
  AdminInventarioRecord,
  AdminInventarioStockAlert,
  AdminInventarioTopMovedProduct,
} from '@/types/admin-inventario';

export const ADMIN_INVENTARIO_TOTAL = 0;

export const ADMIN_INVENTARIO_UPDATED_AT = new Date();

export const ADMIN_INVENTARIO_KPIS: AdminInventarioKpi[] = [
  {
    title: 'Productos activos',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'products',
    sparkline: [0],
  },
  {
    title: 'Stock bajo',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'low-stock',
    sparkline: [0],
  },
  {
    title: 'Movimientos hoy',
    value: '0',
    trend: 0,
    trendLabel: 'vs. ayer',
    icon: 'products',
    sparkline: [0],
  },
  {
    title: 'Valor inventario',
    value: 'S/ 0.00',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'low-stock',
    sparkline: [0],
  },
];

export const ADMIN_INVENTARIO_CATEGORY_DISTRIBUTION: AdminInventarioCategoryDistribution[] = [];
export const ADMIN_INVENTARIO_STOCK_ALERTS: AdminInventarioStockAlert[] = [];
export const ADMIN_INVENTARIO_TOP_MOVED: AdminInventarioTopMovedProduct[] = [];
export const ADMIN_INVENTARIO_RECORDS: AdminInventarioRecord[] = [];
