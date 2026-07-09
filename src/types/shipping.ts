export type ShippingZoneId = 'lima-metropolitana' | 'callao' | 'provincia-costera' | 'provincia-interior';

export type ShipmentStatus =
  | 'pending_pickup'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed';

export interface ShippingZone {
  id: ShippingZoneId;
  name: string;
  description: string;
  etaBusinessDays: string;
  active: boolean;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  trackingUrlTemplate?: string;
  active: boolean;
}

export interface ShippingRate {
  id: string;
  zoneId: ShippingZoneId;
  carrierId: string;
  label: string;
  basePricePen: number;
  freeFromPen: number | null;
  maxWeightKg: number;
  active: boolean;
}

export interface ShipmentLineItem {
  id: string;
  description: string;
  unitPriceUsd: number;
  quantity: number;
}

export interface ShipmentRecord {
  id: string;
  orderRef: string;
  /** Razón social (alias histórico: customerName). */
  customerName: string;
  razonSocial?: string;
  taxId?: string | null;
  address?: string | null;
  /** Ciudad o destino logístico (ej. Huancayo). */
  destination?: string | null;
  district: string;
  attention?: string | null;
  customerDni?: string | null;
  customerPhone?: string | null;
  /** Detalle de agencia, ej. «A Domicilio». */
  agencyDetail?: string | null;
  zoneId: ShippingZoneId;
  carrierId: string;
  status: ShipmentStatus;
  shippingCostPen: number;
  trackingCode: string;
  createdAt: string;
  /** Fecha del despacho (ISO o YYYY-MM-DD). */
  shipmentDate?: string | null;
  /** Fecha estimada de entrega (ISO o YYYY-MM-DD). */
  estimatedDeliveryDate?: string | null;
  /** Cantidad de incidencias reportadas en el envío. */
  incidentsCount?: number;
  etaLabel: string;
  exchangeRate?: number;
  lineItems?: ShipmentLineItem[];
}
