import type { ProductRolePrices } from '@/lib/roles';

export type ServiceOrderStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  active: boolean;
  /** Orden en catálogo (código de categoría / prioridad). */
  sortOrder?: number;
}

export interface ServiceOrder {
  id: string;
  code: string;
  customerName: string;
  customerPhone?: string | null;
  categoryId: string;
  status: ServiceOrderStatus;
  scheduledAt: string;
  description: string;
  technician?: string | null;
  address?: string | null;
  createdAt: string;
}

export type ServiceCatalogModalidad = 'presencial' | 'remoto' | 'mixto';

export type ServiceCatalogTipo = 'unico' | 'mensual' | 'proyecto';

export type ServiceCatalogEstado = 'activo' | 'programado' | 'pausado' | 'archivado';

/** Metadatos del catálogo usados en el módulo admin de servicios. */
export interface ServiceCatalogMeta {
  modalidad?: ServiceCatalogModalidad;
  cobertura?: string;
  tipo?: ServiceCatalogTipo;
  estado?: ServiceCatalogEstado;
  responsableName?: string;
  responsableTitle?: string;
  createdAt?: string;
}

/** Ítem de catálogo en la lista de precios de servicios (soles por rol). */
export interface ServicePriceItem extends ServiceCatalogMeta {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  /** Precios en PEN por lista (público, técnico, mayorista, distribuidor). */
  prices: ProductRolePrices;
  active: boolean;
}
