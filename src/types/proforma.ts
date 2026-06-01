import type { PriceRole } from '@/types/product';
import type { TpvCurrency, TpvDocumentType } from '@/types/tpv';

export type ProformaSource = 'tpv' | 'product';

export type ProformaFollowUpStatus =
  | 'pending'
  | 'contacted'
  | 'negotiating'
  | 'won'
  | 'lost';

export interface ProformaLineItem {
  productId?: string;
  name: string;
  sku: string;
  brand: string;
  quantity: number;
  unitPricePen: number;
  imageUrl?: string | null;
}

export interface ProformaCustomer {
  razonSocial: string;
  documento: string;
  atencion: string;
  celular: string;
  direccion?: string;
  ciudad?: string;
  storeCustomerId?: string | null;
}

export interface ProformaRecord {
  id: string;
  documentNumber: string;
  source: ProformaSource;
  documentType: TpvDocumentType | 'proforma';
  customer: ProformaCustomer;
  lineItems: ProformaLineItem[];
  currency: TpvCurrency;
  priceList?: PriceRole;
  subtotalPen: number;
  totalPen: number;
  sellerName: string;
  sellerEmail: string;
  followUpStatus: ProformaFollowUpStatus;
  notes: string;
  validityDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProformaPayload {
  documentNumber: string;
  source: ProformaSource;
  documentType?: TpvDocumentType | 'proforma';
  customer: ProformaCustomer;
  lineItems: ProformaLineItem[];
  currency: TpvCurrency;
  priceList?: PriceRole;
  subtotalPen: number;
  totalPen: number;
  validityDays?: number;
  notes?: string;
}

export interface UpdateProformaPayload {
  customer?: Partial<ProformaCustomer>;
  followUpStatus?: ProformaFollowUpStatus;
  notes?: string;
  lineItems?: ProformaLineItem[];
  subtotalPen?: number;
  totalPen?: number;
}

export const PROFORMA_FOLLOW_UP_LABELS: Record<ProformaFollowUpStatus, string> = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  negotiating: 'En negociación',
  won: 'Cerrado',
  lost: 'Perdido',
};
