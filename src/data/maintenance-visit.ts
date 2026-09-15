/** Agenda de visita técnica individual (servicio técnico). */

import {
  DEFAULT_MAINTENANCE_PLAN_STATE,
  MAINTENANCE_MODELS,
  clampMaintenanceQuantity,
  difficultyLabel,
  formatMaintenancePen,
  maintenanceEquipmentById,
  maintenanceModelById,
  resolveMaintenanceModelLabel,
  type MaintenanceEquipmentId,
  type MaintenanceModelId,
  type MaintenancePaperFormat,
  type MaintenancePrintType,
} from '@/data/maintenance-plan';

export const MAINTENANCE_VISIT_ID = 'agenda-visita';

export type VisitTechnicianId = 'jhelcen-romero' | 'nicolas-aliaga' | 'aleatorio';
export type VisitShiftId = 'refrigerio' | 'corrido';
export type VisitDefectId = 'correctivo' | 'preventivo' | 'general' | 'remoto';
export type VisitFaultId =
  | 'atasco'
  | 'manchas'
  | 'codigo'
  | 'no-enciende'
  | 'calidad'
  | 'ruido'
  | 'fusor'
  | 'otro';
export type VisitServiceIconId = 'wrench' | 'shield' | 'settings' | 'headset';
export type VisitCoverageZone = 'lima-cerca' | 'lima-lejos' | 'piura' | 'provincia';

export interface VisitTechnician {
  id: VisitTechnicianId;
  name: string;
  hint: string;
}

export interface VisitDefectOption {
  id: VisitDefectId;
  label: string;
  hint: string;
  icon: VisitServiceIconId;
  /** Precio base B/N en Lima (mano de obra media). */
  basePen: number;
}

export interface VisitFaultOption {
  id: VisitFaultId;
  label: string;
}

export interface MaintenanceVisitState {
  ruc: string;
  razonSocial: string;
  atencion: string;
  celular: string;
  equipmentId: MaintenanceEquipmentId;
  paperFormat: MaintenancePaperFormat;
  printType: MaintenancePrintType;
  modelId: MaintenanceModelId;
  /** Texto libre cuando el modelo no está en el catálogo. */
  customModel: string;
  /** Número de serie del equipo registrado en HaiSupport. */
  serialNumber: string;
  /** Contador de páginas del equipo. */
  counter: string;
  quantity: number;
  defectId: VisitDefectId;
  defectCustom: string;
  imageName: string;
  address: string;
  reference: string;
  city: string;
  district: string;
  technicianId: VisitTechnicianId;
  shiftId: VisitShiftId;
  visitDate: string;
  visitHour: number | null;
}

export interface MaintenanceVisitQuote {
  visitPen: number;
  zone: VisitCoverageZone;
  zoneLabel: string;
  coverageNote: string;
  includesPackage: boolean;
  includes: readonly string[];
  priceSuffix: string;
  locationLabel: string;
  serviceLabel: string;
  faultLabel: string;
  equipmentLabel: string;
  modelLabel: string;
  difficultyLabel: string;
  paperFormat: MaintenancePaperFormat;
  printType: MaintenancePrintType;
  technicianName: string;
  slotLabel: string;
  shiftLabel: string;
  serialNumber: string;
  counter: string;
}

export const VISIT_TECHNICIANS: readonly VisitTechnician[] = [
  {
    id: 'jhelcen-romero',
    name: 'Jhelcen Romero',
    hint: 'Técnico certificado Ricoh',
  },
  {
    id: 'nicolas-aliaga',
    name: 'Nicolas Aliaga',
    hint: 'Técnico certificado Ricoh',
  },
  {
    id: 'aleatorio',
    name: 'Técnico aleatorio',
    hint: 'Asignamos al primero disponible',
  },
] as const;

export const VISIT_SHIFT_OPTIONS: readonly {
  id: VisitShiftId;
  label: string;
  hint: string;
}[] = [
  {
    id: 'refrigerio',
    label: 'Refrigerio',
    hint: '9:00–13:00 y 14:00–18:00',
  },
  {
    id: 'corrido',
    label: 'Horario corrido',
    hint: '9:00–18:00 sin pausa',
  },
] as const;

export const VISIT_ATTENTION_HOURS = 'Lunes a sábado · 9:00 a 18:00';

export const VISIT_DEFECT_OPTIONS: readonly VisitDefectOption[] = [
  {
    id: 'correctivo',
    label: 'Correctivo',
    hint: 'Reparación de falla',
    icon: 'wrench',
    basePen: 120,
  },
  {
    id: 'preventivo',
    label: 'Preventivo',
    hint: 'Aspiradora de tóner',
    icon: 'shield',
    basePen: 150,
  },
  {
    id: 'general',
    label: 'General',
    hint: 'Limpieza y ajuste',
    icon: 'settings',
    basePen: 380,
  },
  {
    id: 'remoto',
    label: 'Soporte Remoto',
    hint: 'Asistencia a distancia',
    icon: 'headset',
    basePen: 80,
  },
] as const;

export const VISIT_FAULT_OPTIONS: readonly VisitFaultOption[] = [
  { id: 'atasco', label: 'Atasco de papel' },
  { id: 'manchas', label: 'Manchas / suciedad' },
  { id: 'codigo', label: 'Código de error' },
  { id: 'no-enciende', label: 'No enciende' },
  { id: 'calidad', label: 'Calidad de impresión' },
  { id: 'ruido', label: 'Ruido anormal' },
  { id: 'fusor', label: 'Falla de fusor / calor' },
  { id: 'otro', label: 'Otro (personalizar)' },
] as const;

const NAMED_TECHNICIANS: readonly Exclude<VisitTechnicianId, 'aleatorio'>[] = [
  'jhelcen-romero',
  'nicolas-aliaga',
];

const REFRIGERIO_HOURS = [9, 10, 11, 12, 14, 15, 16, 17] as const;
const CORRIDO_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17] as const;

const FAR_LIMA_DISTRICTS = new Set([
  'villa el salvador',
  'ves',
  'comas',
  'carabayllo',
  'lurin',
  'chosica',
  'lurigancho',
  'lurigancho chosica',
  'lurigancho-chosica',
]);

const PACKAGE_INCLUDES = [
  'Visita diagnóstico',
  'Visita instalación de repuestos',
  'Visita por garantía',
] as const;

function normalizeVisitPlace(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function visitCoverageZone(city: string, district: string): VisitCoverageZone {
  const cityKey = normalizeVisitPlace(city) || 'lima';
  const distKey = normalizeVisitPlace(district);
  if (cityKey === 'piura') return 'piura';
  if (cityKey !== 'lima' && cityKey !== 'callao') return 'provincia';
  if (FAR_LIMA_DISTRICTS.has(distKey)) return 'lima-lejos';
  return 'lima-cerca';
}

function visitZoneLabel(zone: VisitCoverageZone): string {
  if (zone === 'lima-lejos') return 'Zona alejada de Lince';
  if (zone === 'piura') return 'Piura';
  if (zone === 'provincia') return 'Provincia';
  return 'Lima y alrededores';
}

function visitCoverageNote(
  zone: VisitCoverageZone,
  includesPackage: boolean,
  service: VisitDefectId,
): string {
  if (service === 'remoto') {
    return 'Asistencia remota. Precio fijo S/ 80 por sesión, sin recargo por distrito.';
  }
  if (zone === 'lima-lejos') {
    return includesPackage
      ? 'Zona alejada de Lince (Villa El Salvador, Comas, Carabayllo, Lurín, Chosica). Paquete de 3 visitas técnicas.'
      : 'Zona alejada de Lince (Villa El Salvador, Comas, Carabayllo, Lurín, Chosica).';
  }
  if (zone === 'piura') {
    return 'Cobertura Piura. Paquete de 3 visitas técnicas (2 visitas + 1 garantía).';
  }
  if (zone === 'provincia') {
    return 'Tarifa provincia por visita.';
  }
  return 'Tarifa Lima (Lince y alrededores). Paquete de 3 visitas técnicas (2 visitas + 1 garantía).';
}

function visitUnitPrice(
  service: VisitDefectId,
  printType: MaintenancePrintType,
  zone: VisitCoverageZone,
): number {
  if (service === 'remoto') return 80;
  const color = printType === 'color';
  if (service === 'general') return color ? 450 : 380;
  if (service === 'correctivo') {
    if (zone === 'provincia') return 180;
    if (zone === 'lima-lejos') return color ? 180 : 150;
    return color ? 180 : 120;
  }
  if (zone === 'lima-cerca' || zone === 'piura') return color ? 180 : 150;
  return color ? 230 : 180;
}

function visitIncludes(service: VisitDefectId, includesPackage: boolean): string[] {
  if (service === 'remoto') {
    return [
      'Conexión remota segura al equipo',
      'Diagnóstico y ajustes de configuración',
      'Registro de acciones realizadas',
    ];
  }
  const items: string[] = includesPackage
    ? [...PACKAGE_INCLUDES]
    : ['Visita técnica por diagnóstico'];
  if (service === 'preventivo') items.push('Se lleva aspiradora de tóner');
  return items;
}

export const DEFAULT_MAINTENANCE_VISIT_STATE: MaintenanceVisitState = {
  ruc: '',
  razonSocial: '',
  atencion: '',
  celular: '',
  equipmentId: DEFAULT_MAINTENANCE_PLAN_STATE.equipmentId,
  paperFormat: DEFAULT_MAINTENANCE_PLAN_STATE.paperFormat,
  printType: DEFAULT_MAINTENANCE_PLAN_STATE.printType,
  modelId: DEFAULT_MAINTENANCE_PLAN_STATE.modelId,
  customModel: '',
  serialNumber: '',
  counter: '',
  quantity: 1,
  defectId: 'correctivo',
  defectCustom: '',
  imageName: '',
  address: '',
  reference: '',
  city: 'Lima',
  district: '',
  technicianId: 'jhelcen-romero',
  shiftId: 'refrigerio',
  visitDate: '',
  visitHour: null,
};

export function visitTechnicianById(id: VisitTechnicianId): VisitTechnician {
  return VISIT_TECHNICIANS.find((item) => item.id === id) ?? VISIT_TECHNICIANS[0]!;
}

export function visitDefectById(id: VisitDefectId): VisitDefectOption {
  return VISIT_DEFECT_OPTIONS.find((item) => item.id === id) ?? VISIT_DEFECT_OPTIONS[0]!;
}

export function visitFaultLabel(custom: string): string {
  return custom.trim();
}

export function matchVisitModelFromLabel(label: string) {
  const needle = label
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^ricoh\s+/, '');
  if (!needle) return undefined;

  const exact = MAINTENANCE_MODELS.find((model) => {
    const short = model.shortLabel.toLowerCase();
    const full = model.label.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
    return short === needle || full === needle || full.startsWith(`ricoh ${needle}`);
  });
  if (exact) return exact;

  return MAINTENANCE_MODELS.find((model) => {
    const short = model.shortLabel.toLowerCase();
    const escaped = short.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(needle);
  });
}

export function filterVisitFaults(query: string): VisitFaultOption[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...VISIT_FAULT_OPTIONS.filter((item) => item.id !== 'otro')];
  return VISIT_FAULT_OPTIONS.filter(
    (item) => item.id !== 'otro' && item.label.toLowerCase().includes(needle),
  );
}

export function findVisitFaultMatch(query: string): VisitFaultOption | undefined {
  const needle = query.trim().toLowerCase();
  if (!needle) return undefined;
  return VISIT_FAULT_OPTIONS.find(
    (item) => item.id !== 'otro' && item.label.toLowerCase() === needle,
  );
}

export function visitShiftHours(shiftId: VisitShiftId): readonly number[] {
  return shiftId === 'corrido' ? CORRIDO_HOURS : REFRIGERIO_HOURS;
}

export function formatVisitHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function formatVisitDateLabel(dateKey: string): string {
  if (!dateKey) return '';
  const date = new Date(`${dateKey}T12:00:00-05:00`);
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function dateToVisitKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function visitKeyToDate(dateKey: string): Date | undefined {
  if (!dateKey) return undefined;
  const date = new Date(`${dateKey}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function isNamedTechnicianBusy(
  technicianId: Exclude<VisitTechnicianId, 'aleatorio'>,
  dateKey: string,
  hour: number,
): boolean {
  return hashString(`${technicianId}:${dateKey}:${hour}`) % 10 < 2;
}

export function isVisitSlotAvailable(
  technicianId: VisitTechnicianId,
  dateKey: string,
  hour: number,
): boolean {
  if (technicianId === 'aleatorio') {
    return NAMED_TECHNICIANS.some((id) => !isNamedTechnicianBusy(id, dateKey, hour));
  }
  return !isNamedTechnicianBusy(technicianId, dateKey, hour);
}

export function resolveAssignedTechnician(
  technicianId: VisitTechnicianId,
  dateKey: string,
  hour: number,
): VisitTechnician {
  if (technicianId !== 'aleatorio') return visitTechnicianById(technicianId);
  const available = NAMED_TECHNICIANS.find((id) => !isNamedTechnicianBusy(id, dateKey, hour));
  return visitTechnicianById(available ?? 'jhelcen-romero');
}

export function isVisitBusinessDay(date: Date): boolean {
  const weekday = date.getDay();
  return weekday !== 0;
}

export function nextVisitBusinessDate(from = new Date()): Date {
  const date = new Date(from);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  while (!isVisitBusinessDay(date)) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function moneyPen(value: number): number {
  return Math.max(0, Math.round(value));
}

export function calculateMaintenanceVisitQuote(state: MaintenanceVisitState): MaintenanceVisitQuote {
  const quantity = clampMaintenanceQuantity(state.quantity);
  const equipment = maintenanceEquipmentById(state.equipmentId);
  const model = maintenanceModelById(state.modelId);
  const defect = visitDefectById(state.defectId);
  const zone = visitCoverageZone(state.city, state.district);
  const isRemote = state.defectId === 'remoto';
  const includesPackage = !isRemote && zone !== 'provincia';
  const visitPen = moneyPen(visitUnitPrice(state.defectId, state.printType, zone) * quantity);
  const location = [state.city.trim() || 'Lima', state.district.trim()].filter(Boolean).join(' · ');
  const faultLabel = visitFaultLabel(state.defectCustom);
  const serviceLabel = defect.label;
  const hour = state.visitHour;
  const slotLabel =
    state.visitDate && hour != null
      ? `${formatVisitDateLabel(state.visitDate)} · ${formatVisitHour(hour)}`
      : 'Por confirmar';
  const assigned =
    state.visitDate && hour != null
      ? resolveAssignedTechnician(state.technicianId, state.visitDate, hour)
      : visitTechnicianById(state.technicianId);
  const shift = VISIT_SHIFT_OPTIONS.find((item) => item.id === state.shiftId);

  return {
    visitPen,
    zone,
    zoneLabel: visitZoneLabel(zone),
    coverageNote: visitCoverageNote(zone, includesPackage, state.defectId),
    includesPackage,
    includes: visitIncludes(state.defectId, includesPackage),
    priceSuffix: isRemote ? '/sesión' : includesPackage ? 'paquete de 3 visitas' : '/visita',
    locationLabel: location,
    serviceLabel,
    faultLabel,
    equipmentLabel: equipment.label,
    modelLabel: resolveMaintenanceModelLabel(state.modelId, state.customModel),
    difficultyLabel: difficultyLabel(model.difficulty),
    paperFormat: state.paperFormat,
    printType: state.printType,
    technicianName: assigned.name,
    slotLabel,
    shiftLabel: shift?.label ?? 'Refrigerio',
    serialNumber: state.serialNumber.trim(),
    counter: state.counter.trim(),
  };
}

export function validateMaintenanceVisit(state: MaintenanceVisitState): string | null {
  if (!/^\d{11}$/.test(state.ruc.trim())) return 'Indica un RUC de 11 dígitos.';
  if (!state.razonSocial.trim()) return 'Indica la razón social.';
  if (!state.atencion.trim()) return 'Indica la persona de atención.';
  if (!state.celular.trim()) return 'Indica un celular de contacto.';
  if (state.defectId === 'correctivo' && !state.defectCustom.trim()) {
    return 'Especifica la falla del equipo.';
  }
  if (!state.address.trim()) return 'Indica la dirección del equipo.';
  if (!state.city.trim()) return 'Indica la ciudad.';
  if (!state.district.trim()) return 'Indica el distrito.';
  if (!state.visitDate || state.visitHour == null) {
    return 'Selecciona fecha y horario disponible.';
  }
  if (!isVisitSlotAvailable(state.technicianId, state.visitDate, state.visitHour)) {
    return 'Ese horario ya no está disponible. Elige otro.';
  }
  return null;
}

export function buildMaintenanceVisitWhatsAppMessage(
  state: MaintenanceVisitState,
  quote: MaintenanceVisitQuote,
): string {
  const assigned =
    state.visitDate && state.visitHour != null
      ? resolveAssignedTechnician(state.technicianId, state.visitDate, state.visitHour)
      : visitTechnicianById(state.technicianId);

  return [
    state.defectId === 'remoto'
      ? 'Hola, quiero agendar un soporte remoto Ricoh.'
      : 'Hola, quiero agendar una visita técnica a demanda Ricoh.',
    `RUC: ${state.ruc.trim()}`,
    `Razón social: ${state.razonSocial.trim()}`,
    `Atención: ${state.atencion.trim()}`,
    `Celular: ${state.celular.trim()}`,
    `Equipo: ${quote.equipmentLabel}`,
    `Modelo: ${quote.modelLabel}`,
    quote.serialNumber ? `Serie: ${quote.serialNumber}` : null,
    quote.counter ? `Contador: ${quote.counter}` : null,
    `Formato / impresión: ${quote.paperFormat} · ${quote.printType === 'bw' ? 'B/N' : 'Color'}`,
    `Servicio: ${visitDefectById(state.defectId).label}`,
    quote.faultLabel ? `Falla: ${quote.faultLabel}` : null,
    state.imageName ? `Imagen adjunta: ${state.imageName}` : 'Imagen adjunta: no',
    `Dirección: ${state.address.trim()}`,
    state.reference.trim() ? `Referencia: ${state.reference.trim()}` : null,
    `Ubicación: ${quote.locationLabel}`,
    `Técnico: ${assigned.name}`,
    `Horario: ${quote.slotLabel}`,
    `Jornada: ${quote.shiftLabel} (${VISIT_ATTENTION_HOURS})`,
    `Zona: ${quote.zoneLabel}`,
    quote.includesPackage
      ? 'Paquete: 3 visitas técnicas (diagnóstico, instalación de repuestos y garantía)'
      : 'Modalidad: por visita',
    ...quote.includes.map((item) => `- ${item}`),
    'No incluye repuestos (se cotizan por separado).',
    `Visita estimada: ${formatMaintenancePen(quote.visitPen)} ${quote.priceSuffix}`,
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}
