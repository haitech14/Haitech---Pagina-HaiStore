export type CrmMuralColumnId =
  | 'ventas'
  | 'cuentas'
  | 'productos'
  | 'equipos'
  | 'envios';

export type CrmMuralCardKind = 'text' | 'accounts' | 'product' | 'equipment' | 'shipment';

export interface CrmMuralColumn {
  id: CrmMuralColumnId;
  label: string;
  accentClass: string;
}

interface CrmMuralCardBase {
  id: string;
  columnId: CrmMuralColumnId;
  topBorderClass?: string;
}

export interface CrmMuralTextCard extends CrmMuralCardBase {
  kind: 'text';
  paragraphs: string[];
}

export interface CrmMuralAccountLine {
  bank: string;
  lines: string[];
}

export interface CrmMuralAccountsCard extends CrmMuralCardBase {
  kind: 'accounts';
  title?: string;
  accounts: CrmMuralAccountLine[];
}

export interface CrmMuralFeatureItem {
  label: string;
  highlight?: boolean;
}

export interface CrmMuralProductCard extends CrmMuralCardBase {
  kind: 'product';
  title: string;
  priceLabel: string;
  features: CrmMuralFeatureItem[];
  footer?: string;
}

export interface CrmMuralEquipmentCard extends CrmMuralCardBase {
  kind: 'equipment';
  title: string;
  priceLabel: string;
  specs: CrmMuralFeatureItem[];
}

export interface CrmMuralShipmentField {
  label: string;
  value: string;
}

export interface CrmMuralShipmentLine {
  description: string;
  priceLabel: string;
}

export interface CrmMuralShipmentCard extends CrmMuralCardBase {
  kind: 'shipment';
  dateLabel: string;
  shippingFields: CrmMuralShipmentField[];
  orderLines: CrmMuralShipmentLine[];
  totalLabel: string;
}

export type CrmMuralCard =
  | CrmMuralTextCard
  | CrmMuralAccountsCard
  | CrmMuralProductCard
  | CrmMuralEquipmentCard
  | CrmMuralShipmentCard;
