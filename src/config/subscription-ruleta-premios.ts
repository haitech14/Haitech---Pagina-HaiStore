import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  Droplet,
  FileText,
  Gift,
  RefreshCw,
  Settings,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';

export interface RuletaPremio {
  id: string;
  sectorColor: string;
  textColor: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  extraSpin?: boolean;
  /** Ajuste fino del ángulo (°) respecto al centro del sector. */
  angleOffsetDeg?: number;
  /** Ajuste fino del radio (% respecto al centro de la ruleta). */
  radiusOffsetPercent?: number;
}

/** Orden horario desde el puntero (12 en punto). 9 sectores × 40°. */
export const SUBSCRIPTION_RULETA_PREMIOS: RuletaPremio[] = [
  {
    id: 'rental-5',
    sectorColor: '#14b8a6',
    textColor: '#0f766e',
    label: '5% 1.er mes',
    sublabel: 'Alquiler',
    icon: CalendarDays,
  },
  {
    id: 'parts-10',
    sectorColor: '#ef4444',
    textColor: '#b91c1c',
    label: '10%',
    sublabel: 'Repuestos',
    icon: Settings,
  },
  {
    id: 'copy-50',
    sectorColor: '#f97316',
    textColor: '#c2410c',
    label: 'S/ 50 dto.',
    sublabel: 'Fotocopia',
    icon: FileText,
  },
  {
    id: 'free-shipping',
    sectorColor: '#eab308',
    textColor: '#a16207',
    label: 'Envío',
    sublabel: 'Gratis',
    icon: Truck,
  },
  {
    id: 'surprise',
    sectorColor: '#22c55e',
    textColor: '#15803d',
    label: 'Regalo',
    sublabel: 'Sorpresa',
    icon: Gift,
  },
  {
    id: 'extra-spin',
    sectorColor: '#06b6d4',
    textColor: '#0e7490',
    label: 'Otro',
    sublabel: 'Giro',
    icon: RefreshCw,
    extraSpin: true,
  },
  {
    id: 'toner-5',
    sectorColor: '#3b82f6',
    textColor: '#1d4ed8',
    label: '$5 USD',
    sublabel: 'Tóner',
    icon: Droplet,
  },
  {
    id: 'points-20',
    sectorColor: '#8b5cf6',
    textColor: '#6d28d9',
    label: '+20',
    sublabel: 'Puntos',
    icon: Star,
  },
  {
    id: 'points-x2',
    sectorColor: '#ec4899',
    textColor: '#be185d',
    label: '×2 puntos',
    sublabel: 'Compra',
    icon: ShoppingCart,
  },
];

export const RULETA_SEGMENT_COUNT = SUBSCRIPTION_RULETA_PREMIOS.length;
export const RULETA_SEGMENT_ANGLE = 360 / RULETA_SEGMENT_COUNT;

/** Ángulo del centro de un sector (mismo origen que `conic-gradient(from -90deg)`). */
export function getRuletaSegmentMidAngleDeg(index: number): number {
  return index * RULETA_SEGMENT_ANGLE + RULETA_SEGMENT_ANGLE / 2 - 90;
}

export function getRuletaConicGradient(): string {
  const stops = SUBSCRIPTION_RULETA_PREMIOS.map((premio, index) => {
    const start = index * RULETA_SEGMENT_ANGLE;
    const end = (index + 1) * RULETA_SEGMENT_ANGLE;
    return `${premio.sectorColor} ${start}deg ${end}deg`;
  }).join(', ');

  return `conic-gradient(from -90deg, ${stops})`;
}

/** Índice aleatorio criptográfico [0, 8]. */
export function pickRandomPremioIndex(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] ?? 0) % RULETA_SEGMENT_COUNT;
}

export function getPremioByIndex(index: number): RuletaPremio {
  return SUBSCRIPTION_RULETA_PREMIOS[index] ?? SUBSCRIPTION_RULETA_PREMIOS[0];
}

/** Grados adicionales para que el premio quede bajo el puntero superior. */
export function computeRuletaSpinDeltaDeg(targetIndex: number, extraSpins = 6): number {
  const segmentCenter = targetIndex * RULETA_SEGMENT_ANGLE + RULETA_SEGMENT_ANGLE / 2;
  return extraSpins * 360 + (360 - segmentCenter);
}

export function formatPremioLabel(premio: RuletaPremio): string {
  return `${premio.label} ${premio.sublabel}`.trim();
}
