import type {
  AdminMarcaCategoryPresence,
  AdminMarcaKpi,
  AdminMarcaOriginDistribution,
  AdminMarcaRecord,
  AdminMarcaTopSeller,
} from '@/types/admin-marcas';

export const ADMIN_MARCAS_TOTAL = 0;

export const ADMIN_MARCAS_UPDATED_AT = new Date();

export const ADMIN_MARCAS_KPIS: AdminMarcaKpi[] = [
  {
    title: 'Marcas activas',
    value: '0',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'active',
    sparkline: [0],
  },
  {
    title: 'Marcas destacadas',
    value: '0',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'featured',
    sparkline: [0],
  },
  {
    title: 'Productos asociados',
    value: '0',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'products',
    sparkline: [0],
  },
  {
    title: 'Países de origen',
    value: '0',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'new',
    sparkline: [0],
  },
];

export const ADMIN_MARCAS_ORIGIN_DISTRIBUTION: AdminMarcaOriginDistribution[] = [];
export const ADMIN_MARCAS_CATEGORY_PRESENCE: AdminMarcaCategoryPresence[] = [];
export const ADMIN_MARCAS_TOP_SELLERS: AdminMarcaTopSeller[] = [];
export const ADMIN_MARCAS_RECORDS: AdminMarcaRecord[] = [];
