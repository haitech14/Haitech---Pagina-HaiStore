import {
  DEFAULT_SHIPPING_CARRIERS,
  DEFAULT_SHIPPING_RATES,
  DEFAULT_SHIPPING_ZONES,
  DEMO_SHIPMENTS,
} from '@/data/shipping-defaults';
import { nextShipmentOrderRef } from '@/lib/shipment-order-serial';
import type { ShipmentRecord, ShippingCarrier, ShippingRate, ShippingZone } from '@/types/shipping';

export {
  nextShipmentOrderRef as generateShipmentOrderRef,
  peekShipmentOrderRef,
} from '@/lib/shipment-order-serial';

const ZONES_KEY = 'haistore-shipping-zones';
const CARRIERS_KEY = 'haistore-shipping-carriers';
const RATES_STORAGE_KEY = 'haistore-shipping-rates';
const SHIPMENTS_KEY = 'haistore-shipping-shipments';

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadShippingZones(): ShippingZone[] {
  return loadJson(ZONES_KEY, DEFAULT_SHIPPING_ZONES);
}

export function saveShippingZones(zones: ShippingZone[]): void {
  saveJson(ZONES_KEY, zones);
}

export function loadShippingCarriers(): ShippingCarrier[] {
  return loadJson(CARRIERS_KEY, DEFAULT_SHIPPING_CARRIERS);
}

export function saveShippingCarriers(carriers: ShippingCarrier[]): void {
  saveJson(CARRIERS_KEY, carriers);
}

export function loadShippingRates(): ShippingRate[] {
  return loadJson(RATES_STORAGE_KEY, DEFAULT_SHIPPING_RATES);
}

export function saveShippingRates(rates: ShippingRate[]): void {
  saveJson(RATES_STORAGE_KEY, rates);
}

export function loadShipments(): ShipmentRecord[] {
  return loadJson(SHIPMENTS_KEY, DEMO_SHIPMENTS);
}

export function saveShipments(shipments: ShipmentRecord[]): void {
  saveJson(SHIPMENTS_KEY, shipments);
}

export function updateShipmentStatus(id: string, status: ShipmentRecord['status']): ShipmentRecord[] {
  const next = loadShipments().map((row) => (row.id === id ? { ...row, status } : row));
  saveShipments(next);
  return next;
}

export type NewShipmentInput = Omit<ShipmentRecord, 'id' | 'status' | 'createdAt'>;

const TRACKING_PREFIX: Record<string, string> = {
  haitech: 'HT-LIM',
  olva: 'OLVA',
  shalom: 'SHM',
  urbano: 'URB',
};

export function generateShipmentTrackingCode(carrierId: string): string {
  const prefix = TRACKING_PREFIX[carrierId] ?? 'TRK';
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function createShipment(input: NewShipmentInput): ShipmentRecord[] {
  const row: ShipmentRecord = {
    id: `shp-${Date.now()}`,
    status: 'pending_pickup',
    createdAt: new Date().toISOString(),
    ...input,
    customerName: input.customerName.trim(),
    razonSocial: input.razonSocial?.trim() || input.customerName.trim(),
    customerPhone: input.customerPhone?.trim() || null,
  };
  const next = [row, ...loadShipments()];
  saveShipments(next);
  return next;
}

export function updateShipment(id: string, input: NewShipmentInput): ShipmentRecord[] {
  const next = loadShipments().map((row) =>
    row.id === id
      ? {
          ...row,
          ...input,
          customerName: input.customerName.trim(),
          razonSocial: input.razonSocial?.trim() || input.customerName.trim(),
          customerPhone: input.customerPhone?.trim() || null,
        }
      : row,
  );
  saveShipments(next);
  return next;
}

export function deleteShipment(id: string): ShipmentRecord[] {
  const next = loadShipments().filter((row) => row.id !== id);
  saveShipments(next);
  return next;
}

export function duplicateShipment(id: string): ShipmentRecord[] {
  const source = loadShipments().find((row) => row.id === id);
  if (!source) return loadShipments();

  const copy: ShipmentRecord = {
    ...source,
    id: `shp-${Date.now()}`,
    orderRef: nextShipmentOrderRef(),
    trackingCode: generateShipmentTrackingCode(source.carrierId),
    status: 'pending_pickup',
    createdAt: new Date().toISOString(),
  };

  const next = [copy, ...loadShipments()];
  saveShipments(next);
  return next;
}
