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

export interface ShipmentRecord {
  id: string;
  orderRef: string;
  customerName: string;
  district: string;
  zoneId: ShippingZoneId;
  carrierId: string;
  status: ShipmentStatus;
  shippingCostPen: number;
  trackingCode: string;
  createdAt: string;
  etaLabel: string;
}
