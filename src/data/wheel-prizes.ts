import type { LucideIcon } from 'lucide-react';
import {
  ShoppingCart,
  Calendar,
  Cog,
  FileText,
  Truck,
  Gift,
  RefreshCw,
  Tag,
  Star,
} from 'lucide-react';

export interface WheelPrize {
  id: string;
  color: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  extraSpin?: boolean;
}

/** Orden horario desde las 12 en punto (como la imagen de referencia). */
export const wheelPrizes: WheelPrize[] = [
  {
    id: 'toner-5',
    color: '#ec4899',
    label: '$5 USD',
    sublabel: 'Tóner',
    icon: Tag,
  },
  {
    id: 'points-x2',
    color: '#e11d48',
    label: 'x2 puntos',
    sublabel: 'Compra',
    icon: ShoppingCart,
  },
  {
    id: 'rental-5',
    color: '#f97316',
    label: '5% 1.er mes',
    sublabel: 'Alquiler',
    icon: Calendar,
  },
  {
    id: 'parts-10',
    color: '#eab308',
    label: '10%',
    sublabel: 'Repuestos',
    icon: Cog,
  },
  {
    id: 'copy-50',
    color: '#22c55e',
    label: 'S/ 50 dto.',
    sublabel: 'Fotocopia',
    icon: FileText,
  },
  {
    id: 'free-shipping',
    color: '#38bdf8',
    label: 'Envío',
    sublabel: 'Gratis',
    icon: Truck,
  },
  {
    id: 'surprise',
    color: '#3b82f6',
    label: 'Regalo',
    sublabel: 'Sorpresa',
    icon: Gift,
  },
  {
    id: 'extra-spin',
    color: '#a855f7',
    label: 'Otro',
    sublabel: 'Giro',
    icon: RefreshCw,
    extraSpin: true,
  },
  {
    id: 'points-20',
    color: '#14b8a6',
    label: '+20',
    sublabel: 'Puntos',
    icon: Star,
  },
];

export const WHEEL_SEGMENT_COUNT = wheelPrizes.length;
export const WHEEL_SEGMENT_ANGLE = 360 / WHEEL_SEGMENT_COUNT;

export function computeWheelRotation(targetIndex: number, extraSpins = 6): number {
  const segmentCenter = targetIndex * WHEEL_SEGMENT_ANGLE + WHEEL_SEGMENT_ANGLE / 2;
  return extraSpins * 360 + (360 - segmentCenter);
}

export function pickRandomPrizeIndex(): number {
  return Math.floor(Math.random() * WHEEL_SEGMENT_COUNT);
}

export function getPrizeByIndex(index: number): WheelPrize {
  return wheelPrizes[index] ?? wheelPrizes[0];
}

function buildConicGradient(): string {
  const stops = wheelPrizes
    .map((prize, index) => {
      const start = index * WHEEL_SEGMENT_ANGLE;
      const end = (index + 1) * WHEEL_SEGMENT_ANGLE;
      return `${prize.color} ${start}deg ${end}deg`;
    })
    .join(', ');

  return `conic-gradient(from -90deg, ${stops})`;
}

export function getWheelGradient(): string {
  return buildConicGradient();
}
