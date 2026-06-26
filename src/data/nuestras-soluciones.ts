import {
  Globe2,
  Headphones,
  Printer,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import type { ServiceLandingSlug } from '@/data/service-landings';
import { serviceHubPath } from '@/lib/service-hub';

export type NuestraSolucionDarkVariant = 'rental' | 'support' | 'outsourcing' | 'corporate';
export type ServiceInfoboxTheme = 'red' | 'blue' | 'purple' | 'green';

export interface NuestraSolucionItem {
  slug: ServiceLandingSlug;
  title: string;
  infoboxTitle: string;
  description: string;
  hubDescription: string;
  ctaLabel: string;
  theme: ServiceInfoboxTheme;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  href: string;
  darkVariant: NuestraSolucionDarkVariant;
}

export const NUESTRAS_SOLUCIONES_ITEMS: NuestraSolucionItem[] = [
  {
    slug: 'alquiler',
    title: 'Alquiler',
    infoboxTitle: 'Alquiler de Equipos',
    description:
      'Equipos profesionales listos para impulsar tu productividad con alquiler flexible.',
    hubDescription: 'Equipos profesionales listos para impulsar tu productividad.',
    ctaLabel: 'Explorar alquileres',
    theme: 'red',
    icon: Printer,
    image: '/categories/alquiler.png',
    imageAlt: 'Impresora multifuncional y laptop en modalidad de alquiler',
    href: serviceHubPath('alquiler'),
    darkVariant: 'rental',
  },
  {
    slug: 'servicio-tecnico',
    title: 'Soporte Técnico',
    infoboxTitle: 'Soporte Técnico',
    description:
      'Atención técnica profesional para asegurar continuidad, rendimiento y respaldo en cada equipo.',
    hubDescription:
      'Atención técnica profesional para asegurar continuidad, rendimiento y respaldo en cada equipo.',
    ctaLabel: 'Solicitar soporte',
    theme: 'blue',
    icon: Headphones,
    image: '/categories/servicio-tecnico.png',
    imageAlt: 'Técnico especializado en mantenimiento de equipos de impresión',
    href: serviceHubPath('servicio-tecnico'),
    darkVariant: 'support',
  },
  {
    slug: 'outsourcing',
    title: 'Outsourcing',
    infoboxTitle: 'Outsourcing de TI',
    description:
      'Soluciones profesionales para optimizar operación, continuidad y seguridad tecnológica.',
    hubDescription:
      'Soluciones profesionales para optimizar operación, continuidad y seguridad tecnológica.',
    ctaLabel: 'Ver soluciones',
    theme: 'purple',
    icon: Globe2,
    image: '/categories/outsourcing.png',
    imageAlt: 'Switch de red, laptop y servicios gestionados de outsourcing',
    href: serviceHubPath('outsourcing'),
    darkVariant: 'outsourcing',
  },
  {
    slug: 'servicios-corporativos',
    title: 'Servicios Corporativos',
    infoboxTitle: 'Servicios Corporativos',
    description:
      'Soluciones complementarias para eventos, transformación digital y capacitación técnica.',
    hubDescription:
      'Soluciones complementarias para eventos, transformación digital y capacitación técnica.',
    ctaLabel: 'Conocer servicios',
    theme: 'green',
    icon: ShieldCheck,
    image: '/categories/servicios-corporativos.png',
    imageAlt: 'Proyector, podio y sala corporativa para eventos empresariales',
    href: serviceHubPath('servicios-corporativos'),
    darkVariant: 'corporate',
  },
];
