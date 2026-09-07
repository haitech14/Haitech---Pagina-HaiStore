export type HaiProtectEquipmentType = 'monochrome' | 'color';

export type HaiProtectPlanId = '6m' | '12m';

export interface HaiProtectPlan {
  id: HaiProtectPlanId;
  months: number;
  label: string;
  description: string;
  highlighted?: boolean;
}

export const HAIPROTECT_EQUIPMENT_OPTIONS: readonly {
  id: HaiProtectEquipmentType;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: 'monochrome',
    label: 'Negro / Monocromático',
    shortLabel: 'Monocromático',
    description: 'Impresoras y multifuncionales en blanco y negro.',
  },
  {
    id: 'color',
    label: 'Color',
    shortLabel: 'Color',
    description: 'Equipos láser o inkjet con impresión a color.',
  },
];

export const HAIPROTECT_PLANS: readonly HaiProtectPlan[] = [
  {
    id: '6m',
    months: 6,
    label: 'Plan 6 meses',
    description: 'Ideal para flotas pequeñas o equipos en evaluación.',
  },
  {
    id: '12m',
    months: 12,
    label: 'Plan 12 meses',
    description: 'Mayor ahorro y continuidad operativa durante todo el año.',
    highlighted: true,
  },
];

export const HAIPROTECT_PRICES: Record<
  HaiProtectEquipmentType,
  Record<HaiProtectPlanId, number>
> = {
  monochrome: {
    '6m': 699,
    '12m': 1199,
  },
  color: {
    '6m': 999,
    '12m': 1599,
  },
};

export type HaiProtectOfferingId =
  | 'mono-6m'
  | 'mono-12m'
  | 'color-6m'
  | 'color-12m';

export interface HaiProtectOffering {
  id: HaiProtectOfferingId;
  equipmentType: HaiProtectEquipmentType;
  planId: HaiProtectPlanId;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  variant: 'mono-short' | 'mono-long' | 'color-short' | 'color-long';
  highlighted?: boolean;
}

export const HAIPROTECT_OFFERINGS: readonly HaiProtectOffering[] = [
  {
    id: 'mono-6m',
    equipmentType: 'monochrome',
    planId: '6m',
    title: '6 meses · Monocromático',
    description: 'Garantía extendida para equipos en blanco y negro.',
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Impresora multifuncional monocromática',
    variant: 'mono-short',
  },
  {
    id: 'mono-12m',
    equipmentType: 'monochrome',
    planId: '12m',
    title: '12 meses · Monocromático',
    description: 'Mayor continuidad para flotas monocromáticas.',
    image: '/services/servicio-tecnico/garantia.png',
    imageAlt: 'Plan anual de garantía para equipos monocromáticos',
    variant: 'mono-long',
    highlighted: true,
  },
  {
    id: 'color-6m',
    equipmentType: 'color',
    planId: '6m',
    title: '6 meses · Color',
    description: 'Cobertura para impresoras y multifuncionales a color.',
    image: '/services/outsourcing/impresion.png',
    imageAlt: 'Impresora multifuncional a color',
    variant: 'color-short',
  },
  {
    id: 'color-12m',
    equipmentType: 'color',
    planId: '12m',
    title: '12 meses · Color',
    description: 'Protección anual para equipos con impresión a color.',
    image: '/services/servicio-tecnico/planes.png',
    imageAlt: 'Plan anual de garantía para equipos a color',
    variant: 'color-long',
  },
];

export const HAIPROTECT_BENEFITS = [
  'Cobertura extendida más allá de la garantía de fábrica',
  'Repuestos y mano de obra con estándares Haitech',
  'Atención prioritaria ante fallas críticas',
  'Planificación de mantenimiento preventivo incluida',
  'Tranquilidad operativa para tu oficina o empresa',
] as const;

export function getHaiProtectOffering(
  offeringId: HaiProtectOfferingId,
): HaiProtectOffering | undefined {
  return HAIPROTECT_OFFERINGS.find((entry) => entry.id === offeringId);
}

export function getHaiProtectOfferingPrice(offering: HaiProtectOffering): number {
  return HAIPROTECT_PRICES[offering.equipmentType][offering.planId];
}

export function formatHaiProtectPrice(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function haiProtectContactHref(
  equipmentType: HaiProtectEquipmentType,
  planId: HaiProtectPlanId,
): string {
  const equipment =
    HAIPROTECT_EQUIPMENT_OPTIONS.find((option) => option.id === equipmentType)?.label ??
    equipmentType;
  const plan = HAIPROTECT_PLANS.find((entry) => entry.id === planId);
  const price = HAIPROTECT_PRICES[equipmentType][planId];
  const servicio = `HaiProtect — Garantía extendida ${plan?.months ?? 6} meses (${equipment}) — ${formatHaiProtectPrice(price)}`;

  return `/contacto?servicio=${encodeURIComponent(servicio)}`;
}
