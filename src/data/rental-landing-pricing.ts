export const RENTAL_LANDING_CALCULATOR_ID = 'calculadora';

export type RentalModality = 'leasing' | 'alquiler' | 'outsourcing';
export type RentalPrintType = 'bw' | 'color';
export type RentalPaperFormat = 'A4' | 'A3';
export type RentalEquipmentKind = 'a4-bw' | 'a4-color' | 'a3-bw' | 'a3-color';
export type RentalContractMonths = 6 | 12 | 18 | 24 | 36;
export type RentalDelivery = 'standard' | 'express';
export type RentalLocation = 'lima' | 'provincias';
export type RentalVolumePages = 1000 | 3000 | 5000 | 10000;

export const LEASING_CONTRACT_MONTHS = [24, 36] as const satisfies readonly RentalContractMonths[];
export const ALQUILER_CONTRACT_MONTHS = [6, 12, 18, 24, 36] as const satisfies readonly RentalContractMonths[];
export const OUTSOURCING_CONTRACT_MONTHS = [12, 24, 36] as const satisfies readonly RentalContractMonths[];

export const RENTAL_EQUIPMENT_KINDS: readonly {
  id: RentalEquipmentKind;
  label: string;
  format: RentalPaperFormat;
  printType: RentalPrintType;
}[] = [
  { id: 'a4-bw', label: 'Multifuncional A4 · Blanco y negro', format: 'A4', printType: 'bw' },
  { id: 'a4-color', label: 'Multifuncional A4 · Color', format: 'A4', printType: 'color' },
  { id: 'a3-bw', label: 'Multifuncional A3 · Blanco y negro', format: 'A3', printType: 'bw' },
  { id: 'a3-color', label: 'Multifuncional A3 · Color', format: 'A3', printType: 'color' },
];

export function contractMonthsFor(modality: RentalModality): readonly RentalContractMonths[] {
  if (modality === 'leasing') return LEASING_CONTRACT_MONTHS;
  if (modality === 'outsourcing') return OUTSOURCING_CONTRACT_MONTHS;
  return ALQUILER_CONTRACT_MONTHS;
}

export function clampContractMonths(
  modality: RentalModality,
  months: RentalContractMonths,
): RentalContractMonths {
  const options = contractMonthsFor(modality);
  return options.includes(months) ? months : options[0]!;
}

export function resolveEquipmentKind(kind: RentalEquipmentKind) {
  return RENTAL_EQUIPMENT_KINDS.find((item) => item.id === kind) ?? RENTAL_EQUIPMENT_KINDS[0]!;
}

export interface RentalIncludedServices {
  installation: boolean;
  toner: boolean;
  training: boolean;
  support: boolean;
}

export interface RentalCalculatorInput {
  modality: RentalModality;
  equipmentKind: RentalEquipmentKind;
  quantity: number;
  monthlyVolume: RentalVolumePages;
  paperFormat: RentalPaperFormat;
  printType: RentalPrintType;
  contractMonths: RentalContractMonths;
  services: RentalIncludedServices;
  delivery: RentalDelivery;
  location: RentalLocation;
}

export interface RentalPriceBreakdown {
  equipmentBase: number;
  volume: number;
  services: number;
  monthlyUnit: number;
  total: number;
  projectedTotal: number;
  equipmentValue: number;
  savingsPercent: number;
  savingsAmount: number;
}

export const RENTAL_VOLUME_STEPS: readonly RentalVolumePages[] = [1000, 3000, 5000, 10000];

export const RENTAL_PRICING = {
  base: {
    leasing: 579,
    alquiler: 479,
    outsourcing: 689,
  } satisfies Record<RentalModality, number>,
  kind: {
    'a4-bw': 0,
    'a4-color': 160,
    'a3-bw': 80,
    'a3-color': 240,
  } satisfies Record<RentalEquipmentKind, number>,
  volume: {
    1000: 0,
    3000: 120,
    5000: 220,
    10000: 380,
  } satisfies Record<RentalVolumePages, number>,
  contract: {
    6: 140,
    12: 80,
    18: 40,
    24: 0,
    36: -70,
  } satisfies Record<RentalContractMonths, number>,
  services: {
    installation: 0,
    toner: 50,
    training: 25,
    support: 40,
  } satisfies Record<keyof RentalIncludedServices, number>,
  delivery: {
    standard: 0,
    express: 35,
  } satisfies Record<RentalDelivery, number>,
  location: {
    lima: 0,
    provincias: 45,
  } satisfies Record<RentalLocation, number>,
  equipmentValue: {
    'a4-bw': 4200,
    'a4-color': 6800,
    'a3-bw': 7900,
    'a3-color': 12400,
  } satisfies Record<RentalEquipmentKind, number>,
} as const;

export const DEFAULT_RENTAL_CALCULATOR: RentalCalculatorInput = {
  modality: 'leasing',
  equipmentKind: 'a4-bw',
  quantity: 1,
  monthlyVolume: 3000,
  paperFormat: 'A4',
  printType: 'bw',
  contractMonths: 36,
  services: {
    installation: true,
    toner: true,
    training: true,
    support: true,
  },
  delivery: 'standard',
  location: 'lima',
};

function moneyPen(value: number): number {
  return Math.max(0, Math.round(value));
}

export function calculateMonthlyPrice(input: RentalCalculatorInput): RentalPriceBreakdown {
  const quantity = Math.min(50, Math.max(1, Math.floor(input.quantity) || 1));
  const equipmentBase = moneyPen(
    (RENTAL_PRICING.base[input.modality] + RENTAL_PRICING.kind[input.equipmentKind]) * quantity,
  );
  const volume = moneyPen(RENTAL_PRICING.volume[input.monthlyVolume] * quantity);

  let services = RENTAL_PRICING.contract[input.contractMonths];
  (Object.keys(RENTAL_PRICING.services) as (keyof RentalIncludedServices)[]).forEach((key) => {
    if (input.services[key]) services += RENTAL_PRICING.services[key];
  });
  services += RENTAL_PRICING.delivery[input.delivery];
  services += RENTAL_PRICING.location[input.location];
  services = moneyPen(services * quantity);

  const total = moneyPen(equipmentBase + volume + services);
  const equipmentValue = moneyPen(RENTAL_PRICING.equipmentValue[input.equipmentKind] * quantity);
  const projectedTotal = moneyPen(total * input.contractMonths);
  const savingsPercent =
    input.contractMonths >= 36 ? 30 : input.contractMonths >= 24 ? 18 : 10;
  const savingsAmount = moneyPen((equipmentValue * savingsPercent) / 100);

  return {
    equipmentBase,
    volume,
    services,
    monthlyUnit: moneyPen(total / quantity),
    total,
    projectedTotal,
    equipmentValue,
    savingsPercent,
    savingsAmount,
  };
}

export function formatRentalPen(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function modalityLabel(modality: RentalModality): string {
  if (modality === 'leasing') return 'Leasing';
  if (modality === 'outsourcing') return 'Outsourcing';
  return 'Alquiler';
}
