/** Configurador de alquiler integral Ricoh (landing). */

import {
  RENTAL_A3_TO_A4_FACTOR,
  RENTAL_BW_COPY_COST_PEN,
  RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN,
  RENTAL_COLOR_BLACK_PAGE_SHARE,
  RENTAL_COLOR_EXCESS_COPY_COST_PEN,
  RENTAL_IGV_RATE,
  RENTAL_SCAN_COURTESY_RATIO,
  RENTAL_SCAN_EXCESS_COPY_COST_PEN,
  defaultColorPageSplit,
  roundPen,
  toA4EquivalentPages,
} from '@/lib/rental-calculator';
import { usdToPen } from '@/lib/utils';

export const RENTAL_SOLUTION_CONFIGURATOR_ID = 'calculadora';

export type SolutionModalityId = 'leasing-integral' | 'alquiler-integral' | 'alquiler-operativo';
export type SolutionEquipmentId =
  | 'multifuncionales'
  | 'impresoras'
  | 'plotter'
  | 'otros';
export type SolutionConditionId = 'nueva' | 'seminueva' | 'operativo';
export type SolutionPaperFormat = 'A4' | 'A3';
export type SolutionPrintType = 'bw' | 'color';
export type SolutionNewTermMonths = 24 | 36;
export type SolutionTermMonths = 6 | 12 | 24 | 36;
export type SolutionLocationId = 'lima' | 'provincias';

export const SOLUTION_LOCATIONS: readonly { id: SolutionLocationId; label: string }[] = [
  { id: 'lima', label: 'Lima' },
  { id: 'provincias', label: 'Provincias' },
] as const;

/** Ciudades frecuentes para el cotizador (texto libre también permitido). */
export const SOLUTION_CITY_SUGGESTIONS = [
  'Lima',
  'Arequipa',
  'Trujillo',
  'Chiclayo',
  'Piura',
  'Cusco',
  'Ica',
  'Huancayo',
] as const;

/** Distritos de Lima Metropolitana (sugerencias). */
export const SOLUTION_LIMA_DISTRICT_SUGGESTIONS = [
  'Miraflores',
  'San Isidro',
  'Surco',
  'La Molina',
  'San Borja',
  'Jesús María',
  'Lince',
  'Magdalena',
  'Pueblo Libre',
  'Barranco',
  'San Miguel',
  'Callao',
] as const;

export function resolveSolutionLocationFromCity(city: string): SolutionLocationId {
  const normalized = city.trim().toLowerCase();
  return normalized === '' || normalized === 'lima' ? 'lima' : 'provincias';
}

export type SolutionExtraId = 'operador' | 'papel' | 'oficina';
export type SolutionModelId = string;

export interface SolutionModality {
  id: SolutionModalityId;
  title: string;
  subtitle: string;
  benefits: readonly string[];
}

export interface SolutionEquipmentOption {
  id: SolutionEquipmentId;
  label: string;
  shortLabel: string;
  hint: string;
  image: string;
  imageAlt: string;
  usesPrintVolume: boolean;
}

export interface SolutionModelOption {
  id: SolutionModelId;
  equipmentId: SolutionEquipmentId;
  label: string;
  shortLabel: string;
  image: string;
  paperFormat: SolutionPaperFormat;
  printType: SolutionPrintType;
  /** Precio venta corporativa (USD) — rol técnico/corporativo del inventario. */
  corporateSaleUsd: number;
  usesPrintVolume: boolean;
}

export interface SolutionExtraService {
  id: SolutionExtraId;
  title: string;
  description: string;
  monthlyPen?: number;
  perCopyPen?: number;
  includes?: readonly string[];
}

export const SOLUTION_MODALITIES: readonly SolutionModality[] = [
  {
    id: 'leasing-integral',
    title: 'Leasing Integral',
    subtitle: 'Equipo nuevo con cuotas fijas + Outsourcing incluido',
    benefits: [
      'Equipo Ricoh nuevo',
      'Outsourcing e impresión incluidos',
      'Tóner, mantenimiento y soporte',
      'Opción de compra al finalizar',
    ],
  },
  {
    id: 'alquiler-integral',
    title: 'Alquiler Integral',
    subtitle: 'Equipos seminuevos + Outsourcing incluido',
    benefits: [
      'Equipo seminuevo certificado',
      'Outsourcing e impresión incluidos',
      'Consumibles, mantenimiento y soporte',
      'Plazos flexibles',
    ],
  },
  {
    id: 'alquiler-operativo',
    title: 'Alquiler Operativo',
    subtitle: 'Solo equipo: tóner, repuestos y ST a tu cargo',
    benefits: [
      'Cuota fija de máquina (sin bolsa)',
      'Simulación de tóner y repuestos',
      'Servicio técnico según producción',
      'Ideal para control de consumibles propios',
    ],
  },
] as const;

const CHIP = '/home/category-chips/equipment';

export const SOLUTION_EQUIPMENT: readonly SolutionEquipmentOption[] = [
  {
    id: 'multifuncionales',
    label: 'Multifuncionales',
    shortLabel: 'Multifuncionales',
    hint: 'A4/A3 | B/N - Color',
    image: `${CHIP}/multifuncionales.webp`,
    imageAlt: 'Multifuncional Ricoh para alquiler',
    usesPrintVolume: true,
  },
  {
    id: 'impresoras',
    label: 'Impresoras',
    shortLabel: 'Impresoras',
    hint: 'A4 | B/N - Color',
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Impresora para alquiler',
    usesPrintVolume: true,
  },
  {
    id: 'plotter',
    label: 'Plotter',
    shortLabel: 'Plotter',
    hint: 'Formato ancho',
    image: '/services/alquiler/plotters.png',
    imageAlt: 'Plotter de formato ancho',
    usesPrintVolume: true,
  },
  {
    id: 'otros',
    label: 'Otros equipos',
    shortLabel: 'Otros equipos',
    hint: 'Pizarras, proyectores, etc.',
    image: `${CHIP}/pantallas-interactivas.webp`,
    imageAlt: 'Equipos de oficina adicionales',
    usesPrintVolume: false,
  },
] as const;

export const SOLUTION_CONDITIONS: readonly {
  id: SolutionConditionId;
  label: string;
  hint: string;
}[] = [
  {
    id: 'nueva',
    label: 'Nueva',
    hint: 'Cuota equipo (corp. + 20%) / plazo + bolsa',
  },
  {
    id: 'seminueva',
    label: 'Seminueva o remanufacturada',
    hint: 'Solo bolsa de impresión + excedentes',
  },
  {
    id: 'operativo',
    label: 'Alquiler operativo',
    hint: 'Solo cuota máquina · simulación tóner + ST',
  },
] as const;

export const SOLUTION_PRINT_TYPES: readonly {
  id: SolutionPrintType;
  label: string;
  hint: string;
}[] = [
  {
    id: 'bw',
    label: 'B/N',
    hint: 'Impresión en blanco y negro',
  },
  {
    id: 'color',
    label: 'Color',
    hint: 'Impresión a color (CMYK)',
  },
] as const;

/** Modelos cotizables (precio corporativo = técnico USD del inventario). */
export const SOLUTION_MODELS: readonly SolutionModelOption[] = [
  {
    id: 'im-550f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 550F - Multifuncional A4 (B/N)',
    shortLabel: 'RICOH IM 550F',
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 1499,
    usesPrintVolume: true,
  },
  {
    id: 'im-430f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 430F - Multifuncional A4 (B/N)',
    shortLabel: 'RICOH IM 430F',
    image: '/products/ricoh-im-430f.webp',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 899,
    usesPrintVolume: true,
  },
  {
    id: 'im-600f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 600F - Multifuncional A4 (B/N)',
    shortLabel: 'RICOH IM 600F',
    image: '/products/b32a43a1-09e4-49f6-8950-3639c9534700.webp',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 1819,
    usesPrintVolume: true,
  },
  {
    id: 'im-460f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 460F - Multifuncional A4 (B/N)',
    shortLabel: 'RICOH IM 460F',
    image: '/products/71289ec2-dbca-4780-b319-eb3d259fadb5.webp',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 999,
    usesPrintVolume: true,
  },
  {
    id: 'im-c320f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM C320F - Multifuncional A4 (Color)',
    shortLabel: 'RICOH IM C320F',
    image: '/products/481dbc77-436b-464d-b76f-930f7d79f4ff.webp',
    paperFormat: 'A4',
    printType: 'color',
    corporateSaleUsd: 1949,
    usesPrintVolume: true,
  },
  {
    id: 'm-c320fw',
    equipmentId: 'multifuncionales',
    label: 'RICOH M C320FW - Multifuncional A4 (Color)',
    shortLabel: 'RICOH M C320FW',
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    paperFormat: 'A4',
    printType: 'color',
    corporateSaleUsd: 849,
    usesPrintVolume: true,
  },
  {
    id: 'im-c401f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM C401F - Multifuncional A4 (Color)',
    shortLabel: 'RICOH IM C401F',
    image: '/products/5a142c47-521c-47af-92ec-dda8808907c9.webp',
    paperFormat: 'A4',
    printType: 'color',
    corporateSaleUsd: 2240,
    usesPrintVolume: true,
  },
  {
    id: 'mp-305-plus',
    equipmentId: 'multifuncionales',
    label: 'RICOH MP 305+ - Multifuncional A3 (B/N)',
    shortLabel: 'RICOH MP 305+',
    image: '/products/ab878d89-61e0-4e51-a941-03455e1da407.webp',
    paperFormat: 'A3',
    printType: 'bw',
    corporateSaleUsd: 859,
    usesPrintVolume: true,
  },
  {
    id: 'im-2510',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 2510 - Multifuncional A3 (B/N)',
    shortLabel: 'RICOH IM 2510',
    image: '/products/ricoh-im-2510.webp',
    paperFormat: 'A3',
    printType: 'bw',
    corporateSaleUsd: 3549,
    usesPrintVolume: true,
  },
  {
    id: 'im-c3000',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM C3000 - Multifuncional A3 (Color)',
    shortLabel: 'RICOH IM C3000',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    paperFormat: 'A3',
    printType: 'color',
    corporateSaleUsd: 2287,
    usesPrintVolume: true,
  },
  {
    id: 'im-2500',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 2500 - Multifuncional A3 (Color)',
    shortLabel: 'RICOH IM 2500',
    image: '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp',
    paperFormat: 'A3',
    printType: 'color',
    corporateSaleUsd: 3549,
    usesPrintVolume: true,
  },
  {
    id: 'p-502',
    equipmentId: 'impresoras',
    label: 'RICOH P 502 - Impresora A4 (B/N)',
    shortLabel: 'RICOH P 502',
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 629,
    usesPrintVolume: true,
  },
  {
    id: 'p-800',
    equipmentId: 'impresoras',
    label: 'RICOH P 800 - Impresora A4 (B/N)',
    shortLabel: 'RICOH P 800',
    image: '/products/73ab69b8-602b-4203-a389-070ef7bb80b0.webp',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 899,
    usesPrintVolume: true,
  },
  {
    id: 'p-801',
    equipmentId: 'impresoras',
    label: 'RICOH P 801 - Impresora A4 (B/N)',
    shortLabel: 'RICOH P 801',
    image: '/products/be3457a0-76dd-4cf7-beca-31ad9aa7f541.webp',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 1199,
    usesPrintVolume: true,
  },
  {
    id: 'plotter-cw2200',
    equipmentId: 'plotter',
    label: 'RICOH IM CW2200 - Plotter',
    shortLabel: 'RICOH IM CW2200',
    image: '/services/alquiler/plotters.png',
    paperFormat: 'A3',
    printType: 'color',
    corporateSaleUsd: 17189,
    usesPrintVolume: true,
  },
  {
    id: 'pizarra',
    equipmentId: 'otros',
    label: 'Pizarra interactiva',
    shortLabel: 'Pizarra interactiva',
    image: `${CHIP}/pantallas-interactivas.webp`,
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 1200,
    usesPrintVolume: false,
  },
  {
    id: 'proyector',
    equipmentId: 'otros',
    label: 'Proyector corporativo',
    shortLabel: 'Proyector',
    image: '/services/alquiler/proyectores.png',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 800,
    usesPrintVolume: false,
  },
  {
    id: 'laptop',
    equipmentId: 'otros',
    label: 'Laptop corporativa',
    shortLabel: 'Laptop',
    image: '/services/alquiler/laptops.png',
    paperFormat: 'A4',
    printType: 'bw',
    corporateSaleUsd: 900,
    usesPrintVolume: false,
  },
] as const;

export const SOLUTION_VOLUME_PRESETS = [3000, 5000, 10000, 30000] as const;

export const SOLUTION_NEW_TERM_OPTIONS: readonly {
  months: SolutionNewTermMonths;
  label: string;
  recommended?: boolean;
}[] = [
  { months: 24, label: '24 meses' },
  { months: 36, label: '36 meses (recomendado)', recommended: true },
];

export const SOLUTION_USED_TERM_OPTIONS: readonly {
  months: SolutionTermMonths;
  label: string;
  recommended?: boolean;
}[] = [
  { months: 6, label: '6 meses' },
  { months: 12, label: '12 meses (recomendado)', recommended: true },
  { months: 24, label: '24 meses' },
  { months: 36, label: '36 meses' },
];

/** @deprecated Usar SOLUTION_USED_TERM_OPTIONS / SOLUTION_NEW_TERM_OPTIONS */
export const SOLUTION_TERM_OPTIONS = SOLUTION_USED_TERM_OPTIONS;

export const SOLUTION_EXTRA_SERVICES: readonly SolutionExtraService[] = [
  {
    id: 'operador',
    title: 'Operador',
    description: 'Personal especializado para operación y gestión del equipo de impresión.',
    monthlyPen: 2000,
  },
  {
    id: 'papel',
    title: 'Papel',
    description: 'Suministro de papel. Se agrega S/ 0.059 adicional al costo por copia.',
    perCopyPen: 0.059,
  },
  {
    id: 'oficina',
    title: 'Equipos de oficina',
    description: 'Pack de acabado para tu oficina (enmicadora, anilladora, espiraladora, guillotina).',
    monthlyPen: 250,
    includes: ['Enmicadora', 'Anilladora', 'Espiraladora', 'Guillotina A3'],
  },
] as const;

export const SOLUTION_PLAN_INCLUDES_NUEVA = [
  'Equipo Ricoh nuevo',
  'Cuota de equipo (venta corporativa + 20% / plazo)',
  'Bolsa de impresión (mantenimiento + tóner + repuestos)',
  'Instalación y configuración',
  'Soporte técnico',
] as const;

export const SOLUTION_PLAN_INCLUDES_SEMINUEVA = [
  'Equipo seminuevo o remanufacturado certificado',
  'Outsourcing de impresión (mantenimiento + tóner + repuestos)',
  'Instalación y configuración',
  'Soporte técnico',
  'Plazos flexibles',
] as const;

export const SOLUTION_PLAN_INCLUDES_OPERATIVO = [
  'Alquiler operativo del equipo (sin bolsa de impresión)',
  'Cuota fija mensual según formato y tipo (A4/A3 · B/N/Color)',
  'Simulación de tóner y repuestos según volumen',
  'Simulación de servicio técnico cada 60 000 páginas',
  'Instalación y configuración',
] as const;

/** @deprecated Preferir includesForCondition() */
export const SOLUTION_PLAN_INCLUDES = SOLUTION_PLAN_INCLUDES_SEMINUEVA;

/** Cuotas mínimas mensuales de máquina (alquiler operativo, sin bolsa). */
export const OPERATIONAL_MACHINE_MONTHLY_PEN: Record<
  SolutionPaperFormat,
  Record<SolutionPrintType, number>
> = {
  A4: { bw: 500, color: 800 },
  A3: { bw: 800, color: 1000 },
};

/** Cada N páginas de producción se cuenta 1 visita de servicio técnico. */
export const OPERATIONAL_SERVICE_EVERY_PAGES = 60_000;

export const OPERATIONAL_SERVICE_FEE_PEN: Record<SolutionPrintType, number> = {
  bw: 120,
  color: 180,
};

/**
 * Simulación referencial de tóner + repuestos por página (sin IGV).
 * No es bolsa integral: solo estimación de costo operativo del cliente.
 */
export const OPERATIONAL_TONER_PARTS_PER_PAGE_PEN = {
  bw: 0.04,
  colorBlack: 0.06,
  color: 0.2,
} as const;

export const SOLUTION_COPY_COSTS = {
  bw: RENTAL_BW_COPY_COST_PEN,
  colorBlack: RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN,
  color: RENTAL_COLOR_EXCESS_COPY_COST_PEN,
  scan: RENTAL_SCAN_EXCESS_COPY_COST_PEN,
  scanCourtesyRatio: RENTAL_SCAN_COURTESY_RATIO,
  a3Factor: RENTAL_A3_TO_A4_FACTOR,
  blackShare: RENTAL_COLOR_BLACK_PAGE_SHARE,
  igvRate: RENTAL_IGV_RATE,
} as const;

/** Envío ida + vuelta por equipo (PEN total del contrato, se prorratea por mes). */
export const SOLUTION_SHIPPING_LEG_PEN: Record<SolutionPaperFormat, number> = {
  A4: 60,
  A3: 120,
};

export function shippingTotalPen(paperFormat: SolutionPaperFormat): number {
  const leg = SOLUTION_SHIPPING_LEG_PEN[paperFormat];
  return leg * 2;
}

/** Cuota fija referencial para “otros equipos” en condición seminueva (sin bolsa de impresión). */
const OTHER_USED_MONTHLY: Record<string, number> = {
  pizarra: 280,
  proyector: 180,
  laptop: 299,
};

const LOCATION_ADJUST: Record<SolutionLocationId, number> = {
  lima: 0,
  provincias: 45,
};

export interface SolutionConfiguratorState {
  modality: SolutionModalityId;
  equipment: SolutionEquipmentId;
  condition: SolutionConditionId;
  modelId: SolutionModelId;
  quantity: number;
  termMonths: SolutionTermMonths;
  volumePages: number;
  blackPages: number;
  colorPages: number;
  /** Páginas B/N o negro por encima de la bolsa (ingreso manual). */
  excessBlackPages: number;
  /** Páginas color por encima de la bolsa (ingreso manual; solo equipos color). */
  excessColorPages: number;
  /** Escaneos mensuales estimados (la cortesía es 20% del volumen de impresión). */
  scanPages: number;
  city: string;
  district: string;
  location: SolutionLocationId;
  extras: Record<SolutionExtraId, boolean>;
}

const DEFAULT_VOLUME = 5000;
const DEFAULT_SPLIT = defaultColorPageSplit(DEFAULT_VOLUME);

export const DEFAULT_SOLUTION_CONFIG: SolutionConfiguratorState = {
  modality: 'alquiler-integral',
  equipment: 'multifuncionales',
  condition: 'seminueva',
  modelId: 'im-550f',
  quantity: 1,
  termMonths: 12,
  volumePages: DEFAULT_VOLUME,
  blackPages: DEFAULT_SPLIT.blackPages,
  colorPages: DEFAULT_SPLIT.colorPages,
  excessBlackPages: 0,
  excessColorPages: 0,
  scanPages: 0,
  city: 'Lima',
  district: '',
  location: 'lima',
  extras: {
    operador: false,
    papel: false,
    oficina: false,
  },
};

export interface SolutionQuoteBreakdown {
  equipmentFinanceMonthly: number;
  planBaseMonthly: number;
  includedPages: number;
  copyVariableMonthly: number;
  blackCopyMonthly: number;
  colorCopyMonthly: number;
  /** Bolsa de impresión + excedentes de impresión (sin IGV). */
  printBundleMonthly: number;
  /** Cuota fija de máquina en alquiler operativo. */
  operationalMachineMonthly: number;
  /** Simulación mensual de tóner + repuestos (operativo). */
  tonerPartsMonthly: number;
  /** Simulación mensual de servicio técnico por producción (operativo). */
  serviceTechMonthly: number;
  /** Visitas ST estimadas por mes (volumen / 60 000). */
  serviceTechVisitsMonthly: number;
  /** Visitas ST estimadas por año. */
  serviceTechVisitsYearly: number;
  scanCourtesyPages: number;
  scanExcessPages: number;
  scanMonthly: number;
  shippingMonthly: number;
  shippingTotalPen: number;
  shippingLegPen: number;
  extrasMonthly: number;
  locationMonthly: number;
  /** Subtotal mensual sin IGV. */
  subtotalMonthly: number;
  igvMonthly: number;
  /** Total mensual con IGV. */
  totalMonthly: number;
  perUnitMonthly: number;
  savingsPercent: number;
  billablePages: number;
  excessPages: number;
  bwCopyCost: number;
  colorBlackCopyCost: number;
  colorCopyCost: number;
  scanCopyCost: number;
  corporateSaleUsd: number;
  corporateSalePen: number;
  financedValuePen: number;
}

function moneyPen(value: number): number {
  return Math.max(0, Math.round(value));
}

export function clampVolumePages(value: number): number {
  const n = Math.floor(Number(value) || 0);
  return Math.min(200_000, Math.max(500, n));
}

export function clampExcessPages(value: number): number {
  const n = Math.floor(Number(value) || 0);
  return Math.min(200_000, Math.max(0, n));
}

export function balancedSplitForVolume(volumePages: number): {
  blackPages: number;
  colorPages: number;
} {
  return defaultColorPageSplit(clampVolumePages(volumePages));
}

export function modelsForEquipment(equipmentId: SolutionEquipmentId): SolutionModelOption[] {
  return SOLUTION_MODELS.filter((model) => model.equipmentId === equipmentId);
}

export function modelsForEquipmentAndPrintType(
  equipmentId: SolutionEquipmentId,
  printType: SolutionPrintType,
): SolutionModelOption[] {
  const forEquipment = modelsForEquipment(equipmentId);
  const filtered = forEquipment.filter((model) => model.printType === printType);
  return filtered.length > 0 ? filtered : forEquipment;
}

export function defaultModelForEquipment(equipmentId: SolutionEquipmentId): SolutionModelOption {
  return modelsForEquipment(equipmentId)[0] ?? SOLUTION_MODELS[0]!;
}

export function defaultModelForEquipmentAndPrintType(
  equipmentId: SolutionEquipmentId,
  printType: SolutionPrintType,
): SolutionModelOption {
  return (
    modelsForEquipmentAndPrintType(equipmentId, printType)[0] ??
    defaultModelForEquipment(equipmentId)
  );
}

export function equipmentHasPrintTypeChoice(equipmentId: SolutionEquipmentId): boolean {
  const models = modelsForEquipment(equipmentId);
  if (!models.some((model) => model.usesPrintVolume)) return false;
  const hasBw = models.some((model) => model.printType === 'bw');
  const hasColor = models.some((model) => model.printType === 'color');
  return hasBw && hasColor;
}

export function modelById(id: SolutionModelId): SolutionModelOption {
  return SOLUTION_MODELS.find((item) => item.id === id) ?? SOLUTION_MODELS[0]!;
}

export function normalizeTermForCondition(
  condition: SolutionConditionId,
  termMonths: number,
): SolutionTermMonths {
  if (condition === 'nueva') {
    return termMonths === 24 ? 24 : 36;
  }
  const allowed: SolutionTermMonths[] = [6, 12, 24, 36];
  return allowed.includes(termMonths as SolutionTermMonths)
    ? (termMonths as SolutionTermMonths)
    : 12;
}

export function modalityForCondition(condition: SolutionConditionId): SolutionModalityId {
  switch (condition) {
    case 'nueva':
      return 'leasing-integral';
    case 'seminueva':
      return 'alquiler-integral';
    case 'operativo':
      return 'alquiler-operativo';
    default: {
      const _exhaustive: never = condition;
      return _exhaustive;
    }
  }
}

export function includesForCondition(condition: SolutionConditionId): readonly string[] {
  switch (condition) {
    case 'nueva':
      return SOLUTION_PLAN_INCLUDES_NUEVA;
    case 'seminueva':
      return SOLUTION_PLAN_INCLUDES_SEMINUEVA;
    case 'operativo':
      return SOLUTION_PLAN_INCLUDES_OPERATIVO;
    default: {
      const _exhaustive: never = condition;
      return _exhaustive;
    }
  }
}

export function conditionLabel(condition: SolutionConditionId): string {
  return SOLUTION_CONDITIONS.find((item) => item.id === condition)?.label ?? condition;
}

export function operationalMachineMonthlyPen(model: SolutionModelOption): number {
  const format = model.paperFormat === 'A3' ? 'A3' : 'A4';
  return OPERATIONAL_MACHINE_MONTHLY_PEN[format][model.printType];
}

export function calculateSolutionQuote(state: SolutionConfiguratorState): SolutionQuoteBreakdown {
  const quantity = Math.min(20, Math.max(1, Math.floor(state.quantity) || 1));
  const model = modelById(state.modelId);
  const volumePages = clampVolumePages(state.volumePages);
  const termMonths = normalizeTermForCondition(state.condition, state.termMonths);
  const isColor = model.printType === 'color';
  const usesPrint = model.usesPrintVolume;
  const isOperational = state.condition === 'operativo';

  let billablePages = volumePages;
  let blackPages = 0;
  let colorPages = 0;

  if (usesPrint) {
    if (isColor) {
      blackPages = Math.max(0, Math.floor(state.blackPages));
      colorPages = Math.max(0, Math.floor(state.colorPages));
      if (blackPages + colorPages <= 0) {
        const split = balancedSplitForVolume(volumePages);
        blackPages = split.blackPages;
        colorPages = split.colorPages;
      }
      billablePages = Math.max(1, blackPages + colorPages);
    } else {
      const a4 = model.paperFormat === 'A4' ? volumePages : 0;
      const a3 = model.paperFormat === 'A3' ? volumePages : 0;
      billablePages = Math.max(1, toA4EquivalentPages(a4, a3));
    }
  }

  /** La bolsa de impresión coincide con el volumen mensual configurado. */
  const includedPages = usesPrint && !isOperational ? volumePages : 0;

  const corporateSaleUsd = Math.max(0, model.corporateSaleUsd);
  const corporateSalePen = usdToPen(corporateSaleUsd);
  const financedValuePen = corporateSalePen * 1.2;

  const equipmentFinanceMonthly =
    state.condition === 'nueva' ? moneyPen((financedValuePen / termMonths) * quantity) : 0;

  let planBaseMonthly = 0;
  let blackCopyMonthly = 0;
  let colorCopyMonthly = 0;
  let excessPages = 0;
  let operationalMachineMonthly = 0;
  let tonerPartsMonthly = 0;
  let serviceTechMonthly = 0;
  let serviceTechVisitsMonthly = 0;
  let serviceTechVisitsYearly = 0;

  if (isOperational) {
    operationalMachineMonthly = moneyPen(operationalMachineMonthlyPen(model) * quantity);

    if (usesPrint) {
      if (isColor) {
        tonerPartsMonthly = roundPen(
          (blackPages * OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.colorBlack +
            colorPages * OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.color) *
            quantity,
        );
      } else {
        const pagesForToner =
          model.paperFormat === 'A3' ? toA4EquivalentPages(0, volumePages) : volumePages;
        tonerPartsMonthly = roundPen(
          pagesForToner * OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.bw * quantity,
        );
      }

      serviceTechVisitsMonthly = volumePages / OPERATIONAL_SERVICE_EVERY_PAGES;
      serviceTechVisitsYearly = (volumePages * 12) / OPERATIONAL_SERVICE_EVERY_PAGES;
      const serviceFee = OPERATIONAL_SERVICE_FEE_PEN[model.printType];
      serviceTechMonthly = roundPen(serviceTechVisitsMonthly * serviceFee * quantity);
    }

    // En operativo no hay bolsa ni excedentes de copia.
    planBaseMonthly = 0;
  } else if (usesPrint) {
    if (isColor) {
      const configured = blackPages + colorPages;
      let bagBlack: number;
      let bagColor: number;

      if (configured <= 0) {
        const split = balancedSplitForVolume(volumePages);
        bagBlack = split.blackPages;
        bagColor = split.colorPages;
      } else if (configured === volumePages) {
        bagBlack = blackPages;
        bagColor = colorPages;
      } else {
        // Normaliza el mix al volumen mensual (la bolsa siempre = volumen).
        bagBlack = Math.floor((blackPages / configured) * volumePages);
        bagColor = volumePages - bagBlack;
      }

      planBaseMonthly = moneyPen(
        (bagBlack * RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN +
          bagColor * RENTAL_COLOR_EXCESS_COPY_COST_PEN) *
          quantity,
      );

      const excessBlack = clampExcessPages(state.excessBlackPages);
      const excessColor = clampExcessPages(state.excessColorPages);
      excessPages = excessBlack + excessColor;
      blackCopyMonthly = roundPen(
        excessBlack * RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN * quantity,
      );
      colorCopyMonthly = roundPen(excessColor * RENTAL_COLOR_EXCESS_COPY_COST_PEN * quantity);
    } else {
      const includedBillable =
        model.paperFormat === 'A3'
          ? Math.max(1, toA4EquivalentPages(0, volumePages))
          : volumePages;
      planBaseMonthly = moneyPen(includedBillable * RENTAL_BW_COPY_COST_PEN * quantity);
      const excessBw = clampExcessPages(state.excessBlackPages);
      const excessBillable =
        model.paperFormat === 'A3' ? toA4EquivalentPages(0, excessBw) : excessBw;
      excessPages = excessBillable;
      blackCopyMonthly = roundPen(excessBillable * RENTAL_BW_COPY_COST_PEN * quantity);
    }
  } else if (state.condition === 'seminueva') {
    planBaseMonthly = moneyPen((OTHER_USED_MONTHLY[model.id] ?? 200) * quantity);
  }

  const copyVariableMonthly = roundPen(blackCopyMonthly + colorCopyMonthly);
  const printBundleMonthly = roundPen(planBaseMonthly + copyVariableMonthly);

  const scanCourtesyPages =
    usesPrint && !isOperational ? Math.floor(volumePages * RENTAL_SCAN_COURTESY_RATIO) : 0;
  const scanPages = usesPrint && !isOperational ? clampExcessPages(state.scanPages) : 0;
  const scanExcessPages = Math.max(0, scanPages - scanCourtesyPages);
  const scanMonthly =
    usesPrint && !isOperational
      ? roundPen(scanExcessPages * RENTAL_SCAN_EXCESS_COPY_COST_PEN * quantity)
      : 0;

  const locationId = resolveSolutionLocationFromCity(state.city);
  const locationMonthly = moneyPen(LOCATION_ADJUST[locationId] * quantity);

  const shippingLegPen = SOLUTION_SHIPPING_LEG_PEN[model.paperFormat];
  const shippingContractTotal = shippingTotalPen(model.paperFormat) * quantity;
  const shippingMonthly = moneyPen(shippingContractTotal / termMonths);

  let extrasMonthly = 0;
  if (state.extras.operador) {
    extrasMonthly += SOLUTION_EXTRA_SERVICES.find((s) => s.id === 'operador')?.monthlyPen ?? 0;
  }
  if (state.extras.oficina) {
    extrasMonthly += SOLUTION_EXTRA_SERVICES.find((s) => s.id === 'oficina')?.monthlyPen ?? 0;
  }
  if (state.extras.papel && usesPrint) {
    const perCopy = SOLUTION_EXTRA_SERVICES.find((s) => s.id === 'papel')?.perCopyPen ?? 0.059;
    extrasMonthly += billablePages * quantity * perCopy;
  }
  extrasMonthly = moneyPen(extrasMonthly);

  const subtotalMonthly = roundPen(
    equipmentFinanceMonthly +
      printBundleMonthly +
      operationalMachineMonthly +
      tonerPartsMonthly +
      serviceTechMonthly +
      scanMonthly +
      shippingMonthly +
      locationMonthly +
      extrasMonthly,
  );
  const igvMonthly = roundPen(subtotalMonthly * RENTAL_IGV_RATE);
  const totalMonthly = roundPen(subtotalMonthly + igvMonthly);

  return {
    equipmentFinanceMonthly,
    planBaseMonthly,
    includedPages,
    copyVariableMonthly,
    blackCopyMonthly,
    colorCopyMonthly,
    printBundleMonthly,
    operationalMachineMonthly,
    tonerPartsMonthly,
    serviceTechMonthly,
    serviceTechVisitsMonthly,
    serviceTechVisitsYearly,
    scanCourtesyPages,
    scanExcessPages,
    scanMonthly,
    shippingMonthly,
    shippingTotalPen: shippingContractTotal,
    shippingLegPen,
    extrasMonthly,
    locationMonthly,
    subtotalMonthly,
    igvMonthly,
    totalMonthly,
    perUnitMonthly: roundPen(totalMonthly / quantity),
    savingsPercent: state.condition === 'nueva' ? 20 : state.condition === 'operativo' ? 15 : 30,
    billablePages,
    excessPages,
    bwCopyCost: RENTAL_BW_COPY_COST_PEN,
    colorBlackCopyCost: RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN,
    colorCopyCost: RENTAL_COLOR_EXCESS_COPY_COST_PEN,
    scanCopyCost: RENTAL_SCAN_EXCESS_COPY_COST_PEN,
    corporateSaleUsd,
    corporateSalePen: moneyPen(corporateSalePen),
    financedValuePen: moneyPen(financedValuePen),
  };
}

export function formatSolutionPen(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatCopyCostPen(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

export function formatSolutionVolumeLabel(pages: number): string {
  return `${clampVolumePages(pages).toLocaleString('es-PE')} páginas/mes`;
}

export function modalityById(id: SolutionModalityId): SolutionModality {
  return SOLUTION_MODALITIES.find((item) => item.id === id) ?? SOLUTION_MODALITIES[1]!;
}

export function equipmentById(id: SolutionEquipmentId): SolutionEquipmentOption {
  return SOLUTION_EQUIPMENT.find((item) => item.id === id) ?? SOLUTION_EQUIPMENT[0]!;
}

export function equipmentLabel(state: SolutionConfiguratorState): string {
  const model = modelById(state.modelId);
  return model.label;
}
