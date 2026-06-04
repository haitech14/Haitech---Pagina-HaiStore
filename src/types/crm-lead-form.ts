import type { CrmPipelineStageId } from '@/types/crm-pipeline';
import type { UserRole } from '@/types/product';

export type CrmLeadPhoneType = 'trabajo' | 'celular' | 'personal';
export type CrmLeadEmailType = 'trabajo' | 'personal' | 'otro';

export interface CrmLeadPhoneEntry {
  id: string;
  countryCode: string;
  number: string;
  type: CrmLeadPhoneType;
}

export interface CrmLeadEmailEntry {
  id: string;
  address: string;
  type: CrmLeadEmailType;
}

export interface CrmLeadLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  /** Precio unitario en la moneda del lead (editable). */
  unitPrice: string;
}

export interface CrmNewLeadFormValues {
  contactName: string;
  organization: string;
  /** Dirección de entrega o fiscal (calle / av.). */
  address: string;
  district: string;
  city: string;
  province: string;
  title: string;
  /** Resumen de productos (auto si hay líneas del inventario). */
  productName: string;
  lineItems: CrmLeadLineItem[];
  valueAmount: string;
  currency: string;
  customerRole: UserRole;
  contactEmail: string;
  website: string;
  tags: string;
  ownerId: string;
  /** Nombre del vendedor asignado (propietario del lead). */
  ownerLabel: string;
  expectedCloseDate: string;
  sourceChannel: string;
  visibility: string;
  phones: CrmLeadPhoneEntry[];
  emails: CrmLeadEmailEntry[];
  notes: string;
  stageId: CrmPipelineStageId;
}
