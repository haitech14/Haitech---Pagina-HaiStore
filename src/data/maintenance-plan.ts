/** Configuración y motor de cálculo — Plan de Mantenimiento Ricoh. */

export const MAINTENANCE_PLAN_CALCULATOR_ID = 'configura-plan';

export type MaintenanceServiceModeId = 'plan' | 'individual';

export type MaintenanceEquipmentId =
  | 'multifuncionales'
  | 'impresoras'
  | 'plotter'
  | 'otros';

export type MaintenancePaperFormat = 'A4' | 'A3';
export type MaintenancePrintType = 'bw' | 'color';
export type MaintenanceDifficulty = 'baja' | 'media' | 'alta' | 'pro';

export type MaintenanceVolumePresetPages = 5000 | 15000 | 30000 | 60000;
export type MaintenanceTermMonths = 12 | 24 | 36;
export type MaintenanceModelId = string;

export interface MaintenanceServiceModeOption {
  id: MaintenanceServiceModeId;
  label: string;
  hint: string;
}

export interface MaintenanceEquipmentOption {
  id: MaintenanceEquipmentId;
  label: string;
  shortLabel: string;
  hint: string;
  image: string;
  imageAlt: string;
  usesPrintSpecs: boolean;
}

export interface MaintenanceModelOption {
  id: MaintenanceModelId;
  equipmentId: MaintenanceEquipmentId;
  label: string;
  shortLabel: string;
  image: string;
  paperFormat: MaintenancePaperFormat;
  printType: MaintenancePrintType;
  /** Factor de mano de obra / complejidad técnica. */
  difficulty: MaintenanceDifficulty;
  laborFactor: number;
  usesPrintVolume: boolean;
}

export interface MaintenanceVolumeOption {
  pages: MaintenanceVolumePresetPages;
  label: string;
  hint: string;
}

export interface MaintenanceTermOption {
  months: MaintenanceTermMonths;
  label: string;
  badge: string | null;
  /** Descuento sobre el precio mensual (0–1). */
  discount: number;
}

export interface MaintenancePlanState {
  serviceMode: MaintenanceServiceModeId;
  equipmentId: MaintenanceEquipmentId;
  paperFormat: MaintenancePaperFormat;
  printType: MaintenancePrintType;
  modelId: MaintenanceModelId;
  /** Texto libre cuando el modelo no está en el catálogo. */
  customModel: string;
  quantity: number;
  volumePages: number;
  termMonths: MaintenanceTermMonths;
  city: string;
  district: string;
}

export interface MaintenancePlanQuote {
  serviceMode: MaintenanceServiceModeId;
  baseMonthly: number;
  volumeFactor: number;
  discountRate: number;
  laborFactor: number;
  locationFactor: number;
  monthlyBeforeDiscount: number;
  /** Mensual sin IGV. */
  monthlyPen: number;
  monthlyIgvPen: number;
  monthlyTotalPen: number;
  monthlyBeforeDiscountTotal: number;
  /** Cotización por visita (modo individual). */
  visitPen: number;
  savingsPercent: number;
  equipmentLabel: string;
  modelLabel: string;
  difficultyLabel: string;
  paperFormat: MaintenancePaperFormat;
  printType: MaintenancePrintType;
  quantity: number;
  volumePages: number;
  termMonths: number;
  city: string;
  district: string;
}

/** IGV Perú. */
export const MAINTENANCE_IGV_RATE = 0.18;

/**
 * Referencia comercial: A4 · B/N · 55,000 págs/mes · plan 12 meses.
 * S/ 304 + IGV mensual.
 */
export const MAINTENANCE_PLAN_REF_PAGES = 55_000;
export const MAINTENANCE_PLAN_REF_MONTHLY_PEN = 304;

/** Mínimo comercial del plan anual: S/ 99 + IGV /mes. */
export const MAINTENANCE_PLAN_MIN_MONTHLY_PEN = 99;

export const MAINTENANCE_VOLUME_MIN = 1_000;
export const MAINTENANCE_VOLUME_MAX = 150_000;
export const MAINTENANCE_VOLUME_SLIDER_MIN = 5_000;
export const MAINTENANCE_VOLUME_SLIDER_MAX = 60_000;

/** Precio base referencial plan (A4 · B/N · 55,000 págs · 12 meses). */
export const MAINTENANCE_PLAN_BASE_MONTHLY_PEN = MAINTENANCE_PLAN_REF_MONTHLY_PEN;

/** Precio base visita individual (dificultad media · Lima). */
export const MAINTENANCE_INDIVIDUAL_VISIT_BASE_PEN = 189;

const CHIP = '/home/category-chips/equipment';

export const MAINTENANCE_SERVICE_MODES: readonly MaintenanceServiceModeOption[] = [
  {
    id: 'plan',
    label: 'Plan',
    hint: 'Contrato mensual con preventivo y correctivo',
  },
  {
    id: 'individual',
    label: 'A Demanda',
    hint: 'Visita técnica puntual: agenda fecha y técnico',
  },
] as const;

export const MAINTENANCE_EQUIPMENT_OPTIONS: readonly MaintenanceEquipmentOption[] = [
  {
    id: 'multifuncionales',
    label: 'Multifuncionales',
    shortLabel: 'Multifuncionales',
    hint: 'A4/A3 | B/N - Color',
    image: `${CHIP}/multifuncionales.webp`,
    imageAlt: 'Multifuncional Ricoh',
    usesPrintSpecs: true,
  },
  {
    id: 'impresoras',
    label: 'Impresoras',
    shortLabel: 'Impresoras',
    hint: 'A4 | B/N - Color',
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Impresora Ricoh',
    usesPrintSpecs: true,
  },
  {
    id: 'plotter',
    label: 'Plotter',
    shortLabel: 'Plotter',
    hint: 'Formato ancho',
    image: '/services/alquiler/plotters.png',
    imageAlt: 'Plotter de formato ancho',
    usesPrintSpecs: false,
  },
  {
    id: 'otros',
    label: 'Otros equipos',
    shortLabel: 'Otros equipos',
    hint: 'Pizarras, proyectores, etc.',
    image: `${CHIP}/pantallas-interactivas.webp`,
    imageAlt: 'Equipos de oficina adicionales',
    usesPrintSpecs: false,
  },
] as const;

export const MAINTENANCE_PRINT_TYPES: readonly {
  id: MaintenancePrintType;
  label: string;
  hint: string;
}[] = [
  { id: 'bw', label: 'B/N', hint: 'Blanco y negro' },
  { id: 'color', label: 'Color', hint: 'Impresión a color' },
] as const;

export const MAINTENANCE_PAPER_FORMATS: readonly {
  id: MaintenancePaperFormat;
  label: string;
}[] = [
  { id: 'A4', label: 'A4' },
  { id: 'A3', label: 'A3' },
] as const;

const DIFFICULTY_LABEL: Record<MaintenanceDifficulty, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  pro: 'PRO / producción',
};

export const MAINTENANCE_MODELS: readonly MaintenanceModelOption[] = [
  {
    id: 'im-550f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 550F — Multifuncional A4 (B/N)',
    shortLabel: 'IM 550F',
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    paperFormat: 'A4',
    printType: 'bw',
    difficulty: 'media',
    laborFactor: 1,
    usesPrintVolume: true,
  },
  {
    id: 'im-430f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 430F — Multifuncional A4 (B/N)',
    shortLabel: 'IM 430F',
    image: '/products/ricoh-im-430f.webp',
    paperFormat: 'A4',
    printType: 'bw',
    difficulty: 'baja',
    laborFactor: 0.9,
    usesPrintVolume: true,
  },
  {
    id: 'im-600f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 600F — Multifuncional A4 (B/N)',
    shortLabel: 'IM 600F',
    image: '/products/b32a43a1-09e4-49f6-8950-3639c9534700.webp',
    paperFormat: 'A4',
    printType: 'bw',
    difficulty: 'media',
    laborFactor: 1.05,
    usesPrintVolume: true,
  },
  {
    id: 'im-c320f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM C320F — Multifuncional A4 (Color)',
    shortLabel: 'IM C320F',
    image: '/products/481dbc77-436b-464d-b76f-930f7d79f4ff.webp',
    paperFormat: 'A4',
    printType: 'color',
    difficulty: 'media',
    laborFactor: 1.15,
    usesPrintVolume: true,
  },
  {
    id: 'im-c401f',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM C401F — Multifuncional A4 (Color)',
    shortLabel: 'IM C401F',
    image: '/products/5a142c47-521c-47af-92ec-dda8808907c9.webp',
    paperFormat: 'A4',
    printType: 'color',
    difficulty: 'alta',
    laborFactor: 1.25,
    usesPrintVolume: true,
  },
  {
    id: 'mp-305-plus',
    equipmentId: 'multifuncionales',
    label: 'RICOH MP 305+ — Multifuncional A3 (B/N)',
    shortLabel: 'MP 305+',
    image: '/products/ab878d89-61e0-4e51-a941-03455e1da407.webp',
    paperFormat: 'A3',
    printType: 'bw',
    difficulty: 'media',
    laborFactor: 1.1,
    usesPrintVolume: true,
  },
  {
    id: 'im-2510',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM 2510 — Multifuncional A3 (B/N)',
    shortLabel: 'IM 2510',
    image: '/products/ricoh-im-2510.webp',
    paperFormat: 'A3',
    printType: 'bw',
    difficulty: 'alta',
    laborFactor: 1.2,
    usesPrintVolume: true,
  },
  {
    id: 'im-c3000',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM C3000 — Multifuncional A3 (Color)',
    shortLabel: 'IM C3000',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    paperFormat: 'A3',
    printType: 'color',
    difficulty: 'alta',
    laborFactor: 1.3,
    usesPrintVolume: true,
  },
  {
    id: 'im-c4510',
    equipmentId: 'multifuncionales',
    label: 'RICOH IM C4510 — Multifuncional A3 (Color)',
    shortLabel: 'IM C4510',
    image: '/products/a9c74a93-3a15-42da-a9cf-33d59e2b1019.webp',
    paperFormat: 'A3',
    printType: 'color',
    difficulty: 'alta',
    laborFactor: 1.35,
    usesPrintVolume: true,
  },
  {
    id: 'pro-c5300',
    equipmentId: 'multifuncionales',
    label: 'RICOH PRO C5300 — Producción color',
    shortLabel: 'PRO C5300',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    paperFormat: 'A3',
    printType: 'color',
    difficulty: 'pro',
    laborFactor: 1.7,
    usesPrintVolume: true,
  },
  {
    id: 'pro-c5310',
    equipmentId: 'multifuncionales',
    label: 'RICOH PRO C5310 — Producción color',
    shortLabel: 'PRO C5310',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    paperFormat: 'A3',
    printType: 'color',
    difficulty: 'pro',
    laborFactor: 1.75,
    usesPrintVolume: true,
  },
  {
    id: 'pro-8300',
    equipmentId: 'multifuncionales',
    label: 'RICOH PRO 8300 — Producción B/N',
    shortLabel: 'PRO 8300',
    image: '/products/ricoh-im-2510.webp',
    paperFormat: 'A3',
    printType: 'bw',
    difficulty: 'pro',
    laborFactor: 1.65,
    usesPrintVolume: true,
  },
  {
    id: 'p-502',
    equipmentId: 'impresoras',
    label: 'RICOH P 502 — Impresora A4 (B/N)',
    shortLabel: 'P 502',
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    paperFormat: 'A4',
    printType: 'bw',
    difficulty: 'baja',
    laborFactor: 0.85,
    usesPrintVolume: true,
  },
  {
    id: 'p-800',
    equipmentId: 'impresoras',
    label: 'RICOH P 800 — Impresora A4 (B/N)',
    shortLabel: 'P 800',
    image: '/products/73ab69b8-602b-4203-a389-070ef7bb80b0.webp',
    paperFormat: 'A4',
    printType: 'bw',
    difficulty: 'baja',
    laborFactor: 0.9,
    usesPrintVolume: true,
  },
  {
    id: 'p-801',
    equipmentId: 'impresoras',
    label: 'RICOH P 801 — Impresora A4 (B/N)',
    shortLabel: 'P 801',
    image: '/products/be3457a0-76dd-4cf7-beca-31ad9aa7f541.webp',
    paperFormat: 'A4',
    printType: 'bw',
    difficulty: 'media',
    laborFactor: 1,
    usesPrintVolume: true,
  },
  {
    id: 'p-c600',
    equipmentId: 'impresoras',
    label: 'RICOH P C600 — Impresora A4 (Color)',
    shortLabel: 'P C600',
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    paperFormat: 'A4',
    printType: 'color',
    difficulty: 'media',
    laborFactor: 1.1,
    usesPrintVolume: true,
  },
  {
    id: 'plotter-cw2200',
    equipmentId: 'plotter',
    label: 'RICOH IM CW2200 — Plotter',
    shortLabel: 'IM CW2200',
    image: '/services/alquiler/plotters.png',
    paperFormat: 'A3',
    printType: 'color',
    difficulty: 'alta',
    laborFactor: 1.4,
    usesPrintVolume: true,
  },
  {
    id: 'pizarra',
    equipmentId: 'otros',
    label: 'Pizarra interactiva',
    shortLabel: 'Pizarra',
    image: `${CHIP}/pantallas-interactivas.webp`,
    paperFormat: 'A4',
    printType: 'bw',
    difficulty: 'media',
    laborFactor: 1.05,
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
    difficulty: 'baja',
    laborFactor: 0.95,
    usesPrintVolume: false,
  },
] as const;

export const MAINTENANCE_VOLUME_OPTIONS: readonly MaintenanceVolumeOption[] = [
  { pages: 5000, label: 'Bajo', hint: '5,000 páginas/mes' },
  { pages: 15000, label: 'Medio', hint: '15,000 páginas/mes' },
  { pages: 30000, label: 'Alto', hint: '30,000 páginas/mes' },
  { pages: 60000, label: 'Muy alto', hint: '60,000 páginas/mes' },
] as const;

export const MAINTENANCE_TERM_OPTIONS: readonly MaintenanceTermOption[] = [
  { months: 12, label: '12 meses', badge: 'Precio recomendado', discount: 0 },
  { months: 24, label: '24 meses', badge: 'Ahorro 10%', discount: 0.1 },
  { months: 36, label: '36 meses', badge: 'Ahorro 15%', discount: 0.15 },
] as const;

export const MAINTENANCE_CITY_SUGGESTIONS = [
  'Lima',
  'Arequipa',
  'Trujillo',
  'Chiclayo',
  'Piura',
  'Cusco',
  'Ica',
  'Huancayo',
] as const;

export const MAINTENANCE_LIMA_DISTRICT_SUGGESTIONS = [
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
  'Chorrillos',
  'Ate',
  'Los Olivos',
  'Comas',
  'Callao',
  'Villa El Salvador',
  'Carabayllo',
  'Lurín',
  'Chosica',
] as const;

/** Color y A3 se aproximan desde la referencia A4 B/N. */
const PRINT_TYPE_FACTOR: Record<MaintenancePrintType, number> = {
  bw: 1,
  color: 1.35,
};

const PAPER_FORMAT_FACTOR: Record<MaintenancePaperFormat, number> = {
  A4: 1,
  A3: 1.2,
};

export const MAINTENANCE_PLAN_INCLUDES = [
  'Mantenimiento preventivo',
  'Mantenimiento correctivo',
  'Diagnóstico técnico',
  'Soporte especializado',
  'Mantenimiento inicial',
  'Mantenimiento al término del servicio',
] as const;

export const MAINTENANCE_INDIVIDUAL_INCLUDES = [
  'Visita técnica en sitio',
  'Diagnóstico del equipo',
  'Mano de obra según dificultad del modelo',
  'Reporte de hallazgos',
] as const;

export const MAINTENANCE_HERO_BENEFITS = [
  'Mantenimiento preventivo y correctivo',
  'Técnicos certificados Ricoh',
  'Mayor vida útil de tus equipos',
  'Atención rápida',
] as const;

export function isLimaCity(city: string): boolean {
  const key = normalizePlaceName(city);
  return key === 'lima' || key === '' || key === 'callao';
}

function normalizePlaceName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const CITY_LOCATION_FACTOR: Record<string, number> = {
  lima: 1,
  callao: 1.1,
  ica: 1.15,
  arequipa: 1.18,
  trujillo: 1.18,
  chiclayo: 1.18,
  piura: 1.2,
  cusco: 1.22,
  huancayo: 1.22,
};

const LIMA_DISTRICT_FACTOR: Record<string, number> = {
  miraflores: 1,
  'san isidro': 1,
  'san borja': 1,
  'jesus maria': 1,
  lince: 1,
  magdalena: 1,
  'pueblo libre': 1,
  barranco: 1,
  'san miguel': 1,
  surco: 1.05,
  'santiago de surco': 1.05,
  'la molina': 1.06,
  chorrillos: 1.06,
  ate: 1.08,
  'san martin de porres': 1.08,
  'los olivos': 1.08,
  callao: 1.1,
  comas: 1.1,
  'villa el salvador': 1.1,
};

/** Factor de cobertura por ciudad y distrito (Lima 1.00 · provincias y zonas alejadas más). */
export function locationFactorForCity(city: string, district = ''): number {
  const cityKey = normalizePlaceName(city) || 'lima';
  const distKey = normalizePlaceName(district);
  const cityFactor = CITY_LOCATION_FACTOR[cityKey] ?? (isLimaCity(city) ? 1 : 1.2);

  if (cityKey !== 'lima' && cityKey !== 'callao') return cityFactor;
  if (!distKey) return cityFactor;
  return LIMA_DISTRICT_FACTOR[distKey] ?? Math.max(cityFactor, 1.04);
}

export function modelsForEquipment(
  equipmentId: MaintenanceEquipmentId,
): MaintenanceModelOption[] {
  return MAINTENANCE_MODELS.filter((model) => model.equipmentId === equipmentId);
}

export function modelsForEquipmentSpecs(
  equipmentId: MaintenanceEquipmentId,
  paperFormat: MaintenancePaperFormat,
  printType: MaintenancePrintType,
): MaintenanceModelOption[] {
  const equipment = maintenanceEquipmentById(equipmentId);
  const pool = modelsForEquipment(equipmentId);
  if (!equipment.usesPrintSpecs) return pool;
  return pool.filter(
    (model) => model.paperFormat === paperFormat && model.printType === printType,
  );
}

export function defaultModelForEquipment(
  equipmentId: MaintenanceEquipmentId,
): MaintenanceModelOption {
  return modelsForEquipment(equipmentId)[0] ?? MAINTENANCE_MODELS[0]!;
}

export function defaultModelForEquipmentSpecs(
  equipmentId: MaintenanceEquipmentId,
  paperFormat: MaintenancePaperFormat,
  printType: MaintenancePrintType,
): MaintenanceModelOption {
  const matched = modelsForEquipmentSpecs(equipmentId, paperFormat, printType);
  return matched[0] ?? defaultModelForEquipment(equipmentId);
}

export function maintenanceModelById(id: MaintenanceModelId): MaintenanceModelOption {
  return MAINTENANCE_MODELS.find((item) => item.id === id) ?? MAINTENANCE_MODELS[0]!;
}

export function maintenanceEquipmentById(
  id: MaintenanceEquipmentId,
): MaintenanceEquipmentOption {
  return (
    MAINTENANCE_EQUIPMENT_OPTIONS.find((item) => item.id === id) ??
    MAINTENANCE_EQUIPMENT_OPTIONS[0]!
  );
}

export function difficultyLabel(difficulty: MaintenanceDifficulty): string {
  return DIFFICULTY_LABEL[difficulty];
}

export const DEFAULT_MAINTENANCE_PLAN_STATE: MaintenancePlanState = {
  serviceMode: 'plan',
  equipmentId: 'multifuncionales',
  paperFormat: 'A4',
  printType: 'bw',
  modelId: 'im-550f',
  customModel: '',
  quantity: 1,
  volumePages: 5000,
  termMonths: 12,
  city: 'Lima',
  district: '',
};

export function resolveMaintenanceModelLabel(
  modelId: MaintenanceModelId,
  customModel = '',
): string {
  const custom = customModel.trim();
  if (custom) return custom;
  return maintenanceModelById(modelId).label;
}

export function filterMaintenanceModels(
  models: readonly MaintenanceModelOption[],
  query: string,
): MaintenanceModelOption[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...models];
  return models.filter((model) => {
    const haystack = `${model.label} ${model.shortLabel} ${model.id}`.toLowerCase();
    return haystack.includes(needle);
  });
}

export function findMaintenanceModelMatch(
  models: readonly MaintenanceModelOption[],
  query: string,
): MaintenanceModelOption | undefined {
  const needle = query.trim().toLowerCase();
  if (!needle) return undefined;
  return models.find(
    (model) =>
      model.label.toLowerCase() === needle ||
      model.shortLabel.toLowerCase() === needle ||
      model.id.toLowerCase() === needle,
  );
}

export function clampMaintenanceQuantity(value: number): number {
  return Math.min(20, Math.max(1, Math.floor(Number(value) || 1)));
}

export function clampMaintenanceVolume(value: number): number {
  const pages = Math.floor(Number(value) || 0);
  return Math.min(MAINTENANCE_VOLUME_MAX, Math.max(MAINTENANCE_VOLUME_MIN, pages));
}

function moneyPen(value: number): number {
  return Math.max(0, Math.round(value));
}

export function calculateMaintenancePlanQuote(
  state: MaintenancePlanState,
): MaintenancePlanQuote {
  const quantity = clampMaintenanceQuantity(state.quantity);
  const volumePages = clampMaintenanceVolume(state.volumePages);
  const equipment = maintenanceEquipmentById(state.equipmentId);
  const model = maintenanceModelById(state.modelId);
  const volumeFactor = volumePages / MAINTENANCE_PLAN_REF_PAGES;
  const term =
    MAINTENANCE_TERM_OPTIONS.find((item) => item.months === state.termMonths) ??
    MAINTENANCE_TERM_OPTIONS[0]!;
  const discountRate = state.serviceMode === 'plan' ? term.discount : 0;
  const laborFactor = model.laborFactor;
  const locationFactor = locationFactorForCity(state.city, state.district);
  const printFactor = PRINT_TYPE_FACTOR[state.printType] ?? 1;
  const formatFactor = PAPER_FORMAT_FACTOR[state.paperFormat] ?? 1;

  const rawMonthly = moneyPen(
    MAINTENANCE_PLAN_REF_MONTHLY_PEN *
      volumeFactor *
      quantity *
      locationFactor *
      printFactor *
      formatFactor,
  );
  const monthlyBeforeDiscount = moneyPen(
    Math.max(MAINTENANCE_PLAN_MIN_MONTHLY_PEN, rawMonthly),
  );
  const monthlyPen = moneyPen(
    Math.max(MAINTENANCE_PLAN_MIN_MONTHLY_PEN, monthlyBeforeDiscount * (1 - discountRate)),
  );
  const monthlyIgvPen = moneyPen(monthlyPen * MAINTENANCE_IGV_RATE);
  const monthlyTotalPen = monthlyPen + monthlyIgvPen;
  const monthlyBeforeDiscountTotal =
    monthlyBeforeDiscount + moneyPen(monthlyBeforeDiscount * MAINTENANCE_IGV_RATE);
  const savingsPercent =
    monthlyBeforeDiscount > 0
      ? Math.round((1 - monthlyPen / monthlyBeforeDiscount) * 100)
      : 0;

  const visitPen = moneyPen(
    MAINTENANCE_INDIVIDUAL_VISIT_BASE_PEN *
      quantity *
      laborFactor *
      locationFactor *
      printFactor *
      formatFactor,
  );

  return {
    serviceMode: state.serviceMode,
    baseMonthly: MAINTENANCE_PLAN_REF_MONTHLY_PEN,
    volumeFactor,
    discountRate,
    laborFactor,
    locationFactor,
    monthlyBeforeDiscount,
    monthlyPen,
    monthlyIgvPen,
    monthlyTotalPen,
    monthlyBeforeDiscountTotal,
    visitPen,
    savingsPercent,
    equipmentLabel: equipment.label,
    modelLabel: resolveMaintenanceModelLabel(state.modelId, state.customModel),
    difficultyLabel: difficultyLabel(model.difficulty),
    paperFormat: state.paperFormat,
    printType: state.printType,
    quantity,
    volumePages,
    termMonths: state.termMonths,
    city: state.city.trim() || 'Lima',
    district: state.district.trim(),
  };
}

export function formatMaintenancePen(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function buildMaintenancePlanWhatsAppMessage(
  state: MaintenancePlanState,
  quote: MaintenancePlanQuote,
): string {
  const location = [quote.city, quote.district].filter(Boolean).join(' · ');
  const lines = [
    state.serviceMode === 'plan'
      ? 'Hola, quiero solicitar un Plan de Mantenimiento Ricoh.'
      : 'Hola, quiero solicitar una visita técnica a demanda Ricoh.',
    `Modalidad: ${state.serviceMode === 'plan' ? 'Plan' : 'A Demanda'}`,
    `Tipo de equipo: ${quote.equipmentLabel}`,
    `Modelo: ${quote.modelLabel}`,
    `Formato / impresión: ${quote.paperFormat} · ${quote.printType === 'bw' ? 'B/N' : 'Color'}`,
    `Dificultad / mano de obra: ${quote.difficultyLabel}`,
    `Cantidad: ${quote.quantity}`,
    `Ubicación: ${location || 'Por confirmar'}`,
  ];

  if (quote.serviceMode === 'plan') {
    lines.push(
      `Volumen: ${quote.volumePages.toLocaleString('es-PE')} págs/mes`,
      `Duración: ${quote.termMonths} meses`,
      `Inversión estimada: ${formatMaintenancePen(quote.monthlyPen)} + IGV (${formatMaintenancePen(quote.monthlyTotalPen)} total)/mes`,
    );
  } else {
    lines.push(`Visita estimada: ${formatMaintenancePen(quote.visitPen)}`);
  }

  return lines.join('\n');
}
