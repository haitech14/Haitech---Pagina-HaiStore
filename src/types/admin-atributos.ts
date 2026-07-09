export type AdminAtributoTipo = 'lista' | 'lista_multiple' | 'numero' | 'texto' | 'booleano';

export type AdminAtributoScope = 'global' | 'especifico' | 'sistema' | 'personalizado';

export type AdminAtributoVisibility = 'publica' | 'privada';

export type AdminAtributoStatus = 'activo' | 'inactivo';

export type AdminAtributosTab = 'todos' | 'globales' | 'especificos' | 'sistema' | 'personalizados';

export interface AdminCatalogAttribute {
  id: string;
  name: string;
  slug: string;
  tipo: AdminAtributoTipo;
  valores: string;
  aplicaA: string[];
  visibilidad: AdminAtributoVisibility;
  estado: AdminAtributoStatus;
  scope: AdminAtributoScope;
  required: boolean;
  usedInFilters: boolean;
  productCount: number;
  createdAt: string;
}

export interface AdminAtributosKpi {
  title: string;
  value: string;
  icon: 'active' | 'values' | 'required' | 'filters';
  trend?: number;
  delta?: number;
  trendLabel: string;
  subtitle?: string;
  sparkline: number[];
}

export interface AdminAtributosTypeDistribution {
  tipo: AdminAtributoTipo;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminAtributosCategoryUsage {
  category: string;
  used: number;
  total: number;
  percent: number;
}

export interface AdminAtributosTopUsed {
  rank: number;
  name: string;
  productCount: number;
}
