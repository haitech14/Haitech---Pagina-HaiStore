export type AdminServicioEstado = 'activo' | 'programado' | 'pausado' | 'archivado';

export type AdminServicioModalidad = 'presencial' | 'remoto' | 'mixto';

export type AdminServicioCategoria =
  | 'mantenimiento'
  | 'instalacion'
  | 'soporte'
  | 'consultoria'
  | 'otros';

export type AdminServiciosTab =
  | 'todos'
  | 'activos'
  | 'programados'
  | 'pausados'
  | 'archivados';

export interface AdminServicioResponsable {
  name: string;
  title: string;
  initials: string;
  avatarColor: string;
}

export interface AdminServicioRecord {
  id: string;
  /** ID del ítem en la lista de precios (`ServicePriceItem`). */
  sourceId: string;
  name: string;
  slug: string;
  categoria: AdminServicioCategoria;
  modalidad: AdminServicioModalidad;
  precioLabel: string;
  cobertura: string;
  responsable: AdminServicioResponsable;
  estado: AdminServicioEstado;
  tipo: 'unico' | 'mensual' | 'proyecto';
  createdAt: string;
}

export interface AdminServiciosKpi {
  title: string;
  value: string;
  icon: 'active' | 'plans' | 'requests' | 'coverage';
  delta?: number;
  trend?: number;
  trendLabel: string;
  sparkline: number[];
}

export interface AdminServiciosCategoryDistribution {
  categoria: AdminServicioCategoria;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminServiciosRequestUsage {
  serviceName: string;
  requests: number;
  percent: number;
}

export interface AdminServiciosTopDemand {
  rank: number;
  name: string;
  requests: number;
}
