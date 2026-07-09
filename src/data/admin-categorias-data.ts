import type {
  AdminCategoriaKpi,
  AdminCategoriaProductBar,
  AdminCategoriaRecord,
  AdminCategoriaTopRotation,
  AdminCategoriaTypeDistribution,
} from '@/types/admin-categorias';

export const ADMIN_CATEGORIAS_TOTAL = 0;

export const ADMIN_CATEGORIAS_UPDATED_AT = new Date();

export const ADMIN_CATEGORIAS_KPIS: AdminCategoriaKpi[] = [
  {
    title: 'Categorías activas',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'active',
    sparkline: [0],
  },
  {
    title: 'Subcategorías',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'subcategories',
    sparkline: [0],
  },
  {
    title: 'Productos asociados',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'products',
    sparkline: [0],
    trendIsPercent: true,
  },
  {
    title: 'Sin asignar',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'unassigned',
    sparkline: [0],
  },
];

export const ADMIN_CATEGORIAS_TYPE_DISTRIBUTION: AdminCategoriaTypeDistribution[] = [];
export const ADMIN_CATEGORIAS_PRODUCT_BARS: AdminCategoriaProductBar[] = [];
export const ADMIN_CATEGORIAS_TOP_ROTATION: AdminCategoriaTopRotation[] = [];
export const ADMIN_CATEGORIAS_RECORDS: AdminCategoriaRecord[] = [];

export function computeCategoriasTabCounts(records: AdminCategoriaRecord[]) {
  return {
    activa: records.filter((record) => record.status === 'activa' || record.status === 'destacada').length,
    destacada: records.filter((record) => record.status === 'destacada').length,
    borrador: records.filter((record) => record.status === 'borrador').length,
    archivada: records.filter((record) => record.status === 'archivada').length,
  };
}
