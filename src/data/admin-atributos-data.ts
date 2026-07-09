import type {
  AdminAtributosCategoryUsage,
  AdminAtributosKpi,
  AdminAtributosTopUsed,
  AdminAtributosTypeDistribution,
  AdminCatalogAttribute,
} from '@/types/admin-atributos';

export const ADMIN_ATRIBUTOS_UPDATED_AT = new Date();

export const ADMIN_ATRIBUTOS_KPIS: AdminAtributosKpi[] = [
  {
    title: 'Atributos activos',
    value: '0',
    icon: 'active',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    sparkline: [0],
  },
  {
    title: 'Valores registrados',
    value: '0',
    icon: 'values',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    sparkline: [0],
  },
  {
    title: 'Obligatorios',
    value: '0',
    icon: 'required',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    sparkline: [0],
  },
  {
    title: 'En filtros',
    value: '0',
    icon: 'filters',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    sparkline: [0],
  },
];

export const ADMIN_CATALOG_ATTRIBUTES: AdminCatalogAttribute[] = [];
export const ADMIN_ATRIBUTOS_TYPE_DISTRIBUTION: AdminAtributosTypeDistribution[] = [];
export const ADMIN_ATRIBUTOS_CATEGORY_USAGE: AdminAtributosCategoryUsage[] = [];
export const ADMIN_ATRIBUTOS_TOP_USED: AdminAtributosTopUsed[] = [];
