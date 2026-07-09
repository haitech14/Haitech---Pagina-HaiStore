import type { ShipmentRecord, ShippingCarrier, ShippingRate, ShippingZone } from '@/types/shipping';

export const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'lima-metropolitana',
    name: 'Lima Metropolitana',
    description: 'Distritos de Lima ciudad (motorizado o courier express).',
    etaBusinessDays: '1–2 días hábiles',
    active: true,
  },
  {
    id: 'callao',
    name: 'Callao y puerto',
    description: 'Ventanilla, Carmen de la Legua, Bellavista y zonas portuarias.',
    etaBusinessDays: '1–2 días hábiles',
    active: true,
  },
  {
    id: 'provincia-costera',
    name: 'Costa (provincias)',
    description: 'Trujillo, Chiclayo, Piura, Arequipa costa, Ica.',
    etaBusinessDays: '3–5 días hábiles',
    active: true,
  },
  {
    id: 'provincia-interior',
    name: 'Sierra y selva',
    description: 'Cusco, Huancayo, Pucallpa, Cajamarca y zonas alejadas.',
    etaBusinessDays: '5–8 días hábiles',
    active: true,
  },
];

export const DEFAULT_SHIPPING_CARRIERS: ShippingCarrier[] = [
  { id: 'haitech', name: 'Haitech — motorizado propio', active: true },
  { id: 'olva', name: 'Olva Courier', trackingUrlTemplate: 'https://www.olva.pe/rastreo/{code}', active: true },
  { id: 'shalom', name: 'Shalom', active: true },
  { id: 'urbano', name: 'Urbano', active: true },
];

export const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  {
    id: 'lima-haitech',
    zoneId: 'lima-metropolitana',
    carrierId: 'haitech',
    label: 'Entrega mismo día (pedido antes 2 p.m.)',
    basePricePen: 15,
    freeFromPen: 500,
    maxWeightKg: 25,
    active: true,
  },
  {
    id: 'lima-olva',
    zoneId: 'lima-metropolitana',
    carrierId: 'olva',
    label: 'Olva estándar',
    basePricePen: 22,
    freeFromPen: 800,
    maxWeightKg: 30,
    active: true,
  },
  {
    id: 'callao-haitech',
    zoneId: 'callao',
    carrierId: 'haitech',
    label: 'Callao express',
    basePricePen: 18,
    freeFromPen: 600,
    maxWeightKg: 25,
    active: true,
  },
  {
    id: 'costa-olva',
    zoneId: 'provincia-costera',
    carrierId: 'olva',
    label: 'Olva provincias costa',
    basePricePen: 35,
    freeFromPen: 1200,
    maxWeightKg: 40,
    active: true,
  },
  {
    id: 'costa-shalom',
    zoneId: 'provincia-costera',
    carrierId: 'shalom',
    label: 'Shalom paquetería',
    basePricePen: 28,
    freeFromPen: null,
    maxWeightKg: 50,
    active: true,
  },
  {
    id: 'interior-urbano',
    zoneId: 'provincia-interior',
    carrierId: 'urbano',
    label: 'Urbano interior',
    basePricePen: 45,
    freeFromPen: 1500,
    maxWeightKg: 35,
    active: true,
  },
];

export const DEMO_SHIPMENTS: ShipmentRecord[] = [];
