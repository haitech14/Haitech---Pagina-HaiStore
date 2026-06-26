import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  Globe2,
  GraduationCap,
  Headphones,
  KeyRound,
  Package,
  Printer,
  ShieldCheck,
  Truck,
  UserCheck,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { serviceHubPath } from '@/lib/service-hub';

export interface ServiceHeroBannerHighlight {
  icon: LucideIcon;
  label: string;
}

export interface ServiceHeroBannerSlide {
  id: string;
  image: string;
  imageAlt: string;
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  highlights?: ServiceHeroBannerHighlight[];
  ctaLabel: string;
  ctaHref: string;
  ctaIcon?: LucideIcon;
  objectPositionClass?: string;
}

/** Slides del carrusel hero de /servicios (imagen + copy superpuesto). */
export const servicesHeroBannerSlides: ServiceHeroBannerSlide[] = [
  {
    id: 'servicios-soporte-tecnico',
    image: '/services/hero/soporte-tecnico.png',
    imageAlt:
      'Técnico especializado atendiendo una multifuncional Ricoh en oficina corporativa',
    badge: 'Respuesta ágil',
    badgeIcon: Zap,
    title: 'Servicio técnico',
    titleHighlight: 'certificado',
    subtitle:
      'Mantenimiento preventivo y correctivo con especialistas Ricoh. Menos paradas, más productividad.',
    highlights: [
      { icon: Clock, label: 'Atención rápida' },
      { icon: UserCheck, label: 'Técnicos certificados' },
      { icon: Wrench, label: 'Repuestos originales' },
    ],
    ctaLabel: 'Ver soporte técnico',
    ctaIcon: ArrowRight,
    ctaHref: serviceHubPath('servicio-tecnico'),
    objectPositionClass: 'object-[78%_center]',
  },
  {
    id: 'servicios-alquiler',
    image: '/services/hero/alquiler.png',
    imageAlt: 'Impresoras y laptops empresariales listas para alquiler corporativo',
    badge: 'Sin inversión inicial',
    badgeIcon: KeyRound,
    title: 'Alquiler',
    titleHighlight: 'empresarial',
    subtitle:
      'Equipos listos para operar con entrega, instalación y soporte experto incluidos.',
    highlights: [
      { icon: Truck, label: 'Entrega e instalación' },
      { icon: Printer, label: 'Impresoras y laptops' },
      { icon: Headphones, label: 'Soporte incluido' },
    ],
    ctaLabel: 'Ver alquiler',
    ctaIcon: ArrowRight,
    ctaHref: serviceHubPath('alquiler'),
    objectPositionClass: 'object-[70%_center]',
  },
  {
    id: 'servicios-outsourcing',
    image: '/services/hero/outsourcing-impresion.png',
    imageAlt:
      'Flota de impresoras gestionada en outsourcing de impresión para empresas',
    badge: 'Todo incluido',
    badgeIcon: Package,
    title: 'Outsourcing de',
    titleHighlight: 'impresión',
    subtitle:
      'Equipos, insumos y soporte en un solo plan. Costos predecibles y operación sin interrupciones.',
    highlights: [
      { icon: Printer, label: 'Flota gestionada' },
      { icon: Globe2, label: 'Operación continua' },
      { icon: ShieldCheck, label: 'Costos predecibles' },
    ],
    ctaLabel: 'Ver outsourcing',
    ctaIcon: ArrowRight,
    ctaHref: serviceHubPath('outsourcing'),
    objectPositionClass: 'object-[72%_center]',
  },
  {
    id: 'servicios-corporativos',
    image: '/services/hero/servicios-corporativos.png',
    imageAlt: 'Sala corporativa para capacitación técnica y eventos empresariales',
    badge: 'Para empresas',
    badgeIcon: Building2,
    title: 'Soluciones',
    titleHighlight: 'corporativas',
    subtitle:
      'Capacitación, eventos y servicios complementarios para equipos de alto rendimiento.',
    highlights: [
      { icon: GraduationCap, label: 'Capacitación técnica' },
      { icon: CalendarDays, label: 'Eventos corporativos' },
      { icon: Building2, label: 'Soluciones a medida' },
    ],
    ctaLabel: 'Ver servicios corporativos',
    ctaIcon: ArrowRight,
    ctaHref: serviceHubPath('servicios-corporativos'),
    objectPositionClass: 'object-[68%_center]',
  },
];
