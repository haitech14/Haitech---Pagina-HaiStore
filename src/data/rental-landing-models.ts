import { productPath } from '@/lib/product-path';
import {
  resolveEquipmentKind,
  type RentalCalculatorInput,
  type RentalVolumePages,
} from '@/data/rental-landing-pricing';

export interface RentalRecommendedModel {
  id: string;
  name: string;
  image: string;
  href: string;
  shortDescription: string;
}

export const RENTAL_RECOMMENDED_MODELS = {
  'mp-305-plus': {
    id: 'mp-305-plus',
    name: 'RICOH MP 305+',
    image: '/products/ab878d89-61e0-4e51-a941-03455e1da407.webp',
    href: productPath('impresora-multifuncional-b-n-nueva-ricoh-mp-305-03455e1da407'),
    shortDescription: 'Modelo recomendado según las necesidades seleccionadas.',
  },
  'im-430f': {
    id: 'im-430f',
    name: 'RICOH IM 430F',
    image: '/products/ricoh-im-430f.webp',
    href: productPath('ricoh-im-430f'),
    shortDescription: 'Modelo recomendado según las necesidades seleccionadas.',
  },
  'im-c2500': {
    id: 'im-c2500',
    name: 'RICOH IM C2500',
    image: '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp',
    href: productPath('impresora-multifuncional-nueva-ricoh-im-2500-50dee575bcd8'),
    shortDescription: 'Modelo recomendado según las necesidades seleccionadas.',
  },
  'im-c3000': {
    id: 'im-c3000',
    name: 'RICOH IM C3000',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    href: '/fotocopiadoras-ricoh',
    shortDescription: 'Modelo recomendado según las necesidades seleccionadas.',
  },
} as const satisfies Record<string, RentalRecommendedModel>;

export type RentalRecommendedModelId = keyof typeof RENTAL_RECOMMENDED_MODELS;

export function getRecommendedModel(input: Pick<
  RentalCalculatorInput,
  'modality' | 'monthlyVolume' | 'equipmentKind' | 'contractMonths'
>): RentalRecommendedModel {
  const volume: RentalVolumePages = input.monthlyVolume;
  const kind = resolveEquipmentKind(input.equipmentKind);

  if (kind.printType === 'color') {
    if (kind.format === 'A4') return RENTAL_RECOMMENDED_MODELS['im-c2500'];
    if (volume >= 5000) return RENTAL_RECOMMENDED_MODELS['im-c3000'];
    return RENTAL_RECOMMENDED_MODELS['im-c2500'];
  }

  if (kind.format === 'A4') return RENTAL_RECOMMENDED_MODELS['im-430f'];
  return RENTAL_RECOMMENDED_MODELS['mp-305-plus'];
}

export interface RentalCatalogMachine {
  id: string;
  name: string;
  description: string;
  image: string;
  href: string;
  features: readonly string[];
  fromMonthlyPen: number;
}

export const RENTAL_CATALOG_MACHINES: readonly RentalCatalogMachine[] = [
  {
    id: 'im-c3000',
    name: 'RICOH IM C3000',
    description: 'Multifuncional color A3',
    image: RENTAL_RECOMMENDED_MODELS['im-c3000'].image,
    href: RENTAL_RECOMMENDED_MODELS['im-c3000'].href,
    features: [
      'Impresión, copia, escaneo y fax',
      'Hasta 30 ppm',
      'Pantalla táctil de 10.1"',
      'Ideal para oficinas y equipos de trabajo',
    ],
    fromMonthlyPen: 599,
  },
  {
    id: 'im-430f',
    name: 'RICOH IM 430F',
    description: 'Multifuncional monocromático A4',
    image: RENTAL_RECOMMENDED_MODELS['im-430f'].image,
    href: RENTAL_RECOMMENDED_MODELS['im-430f'].href,
    features: [
      'Impresión, copia, escaneo y fax',
      'Hasta 43 ppm',
      'Alimentador automático (SPDF)',
      'Ideal para oficinas en crecimiento',
    ],
    fromMonthlyPen: 849,
  },
  {
    id: 'mp-305-plus',
    name: 'RICOH MP 305+',
    description: 'Multifuncional monocromático A3',
    image: RENTAL_RECOMMENDED_MODELS['mp-305-plus'].image,
    href: RENTAL_RECOMMENDED_MODELS['mp-305-plus'].href,
    features: [
      'Impresión, copia y escaneo',
      'Alta durabilidad',
      'Ideal para alto volumen de trabajo',
    ],
    fromMonthlyPen: 699,
  },
  {
    id: 'im-c2500',
    name: 'RICOH IM C2500',
    description: 'Multifuncional color A3',
    image: RENTAL_RECOMMENDED_MODELS['im-c2500'].image,
    href: RENTAL_RECOMMENDED_MODELS['im-c2500'].href,
    features: [
      'Impresión, copia, escaneo y fax',
      'Hasta 25 ppm',
      'Pantalla táctil de 10.1"',
      'Eficiencia y bajo consumo',
    ],
    fromMonthlyPen: 749,
  },
];
