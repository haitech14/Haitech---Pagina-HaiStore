import type { PriceRole } from '@/types/product';

/** Cliente canónico alineado a HaiSupport `clients`. */
export interface HaitechClient {
  id?: string | null;
  storeCustomerId?: string | null;
  haisupportClientId?: string | null;
  /** Razón social — `nombre` en HaiSupport */
  nombre: string;
  /** Persona de contacto — `nombre_contacto` */
  nombreContacto: string;
  /** RUC/DNI — `ruc_dni` */
  rucDni: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  tipoCliente: PriceRole;
  email?: string | null;
  notas?: string | null;
  source?: 'haistore' | 'haisupport';
}

export type ServiceRequestStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RentalRequestStatus = 'pending' | 'quoted' | 'active' | 'ended' | 'cancelled';

export interface ServiceRequestRecord {
  id: string;
  code: string;
  clientId?: string | null;
  haisupportRequestId?: string | null;
  customerSnapshot: HaitechClient;
  categoryId: string;
  categoryLabel: string;
  description: string;
  status: ServiceRequestStatus;
  scheduledAt: string;
  technician?: string | null;
  address?: string | null;
  city?: string | null;
  source: 'haistore' | 'haisupport';
  createdAt: string;
  updatedAt: string;
}

export interface RentalRequestRecord {
  id: string;
  code: string;
  clientId?: string | null;
  planId: string;
  planLabel: string;
  productId?: string | null;
  productName?: string | null;
  haisupportRentalId?: string | null;
  customerSnapshot: HaitechClient;
  pagesPerMonth: number;
  monthlyPricePen: number;
  startDate: string;
  status: RentalRequestStatus;
  notes?: string | null;
  source: 'haistore' | 'haisupport';
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategoryRecord {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
}

export interface CreateServiceRequestPayload {
  customer: HaitechClient;
  categoryId: string;
  categoryLabel?: string;
  description: string;
  scheduledAt: string;
  technician?: string | null;
  address?: string | null;
  city?: string | null;
}

export interface CreateRentalRequestPayload {
  customer: HaitechClient;
  planId: string;
  productId?: string | null;
  productName?: string | null;
  startDate: string;
  notes?: string | null;
}

export interface CreateStoreOrderPayload {
  customer: HaitechClient;
  lineItems: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPriceUsd: number;
    imageUrl?: string | null;
    category?: string | null;
  }>;
  currency?: 'USD' | 'PEN';
  paymentMethod?: string | null;
  paymentStatus?: 'pending' | 'paid';
  status?: string;
  notes?: string | null;
  exchangeRate?: number;
  couponCode?: string | null;
}
