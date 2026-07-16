import {
  Building2,
  Headphones,
  Laptop,
  Monitor,
  Printer,
  Projector,
  Ruler,
  ScanLine,
  ShieldCheck,
  Timer,
  Truck,
} from 'lucide-react';

import type { ServiceLandingConfig } from '@/types/service-landing';

export const alquilerLanding: ServiceLandingConfig = {
  slug: 'alquiler',
  metaTitle: 'Alquiler de fotocopiadoras e impresoras Ricoh',
  badge: 'Alquiler de fotocopiadoras Ricoh',
  badgeIcon: Building2,
  title: 'Alquiler de fotocopiadoras e',
  titleHighlight: 'equipos para tu empresa',
  subtitle:
    'Planes mensuales de fotocopiadoras e impresoras multifuncionales Ricoh con mantenimiento, tóner y soporte técnico según contrato. Ideal para oficinas en Lima y provincias.',
  bullets: ['Mantenimiento incluido', 'Tóner según plan', 'Soporte especializado'],
  highlightBulletIndex: 0,
  gridCols: 'four',
  cards: [
    {
      id: 'laptops',
      title: 'Alquiler de Laptops',
      description:
        'Equipos portátiles listos para usar, entrega rápida y soporte técnico.',
      image: '/services/alquiler/laptops.png',
      imageAlt: 'Laptop profesional para alquiler corporativo',
      icon: Laptop,
    },
    {
      id: 'computadoras',
      title: 'Alquiler de Computadoras',
      description: 'Potencia y estabilidad para oficina, diseño o producción.',
      image: '/services/alquiler/computadoras.png',
      imageAlt: 'Computadora de escritorio en alquiler',
      icon: Monitor,
    },
    {
      id: 'proyectores',
      title: 'Alquiler de Proyectores',
      description:
        'Ideal para presentaciones y conferencias. Incluye instalación y soporte técnico.',
      image: '/services/alquiler/proyectores.png',
      imageAlt: 'Proyector en sala de reuniones',
      icon: Projector,
    },
    {
      id: 'impresoras',
      title: 'Alquiler de Impresoras',
      description:
        'Alquiler de impresoras y multifuncionales Ricoh con suministro y mantenimiento incluido según plan.',
      image: '/services/alquiler/impresoras.png',
      imageAlt: 'Impresora multifuncional en alquiler',
      icon: Printer,
    },
    {
      id: 'plotters',
      title: 'Alquiler de Plotters',
      description: 'Impresión de gran formato para arquitectura, ingeniería o diseño.',
      image: '/services/alquiler/plotters.png',
      imageAlt: 'Plotter de formato ancho',
      icon: Ruler,
    },
    {
      id: 'escaneres',
      title: 'Alquiler de Escáneres',
      description: 'Digitalización documental con equipos profesionales y software especializado.',
      image: '/services/alquiler/escaneres.png',
      imageAlt: 'Escáner de documentos profesional',
      icon: ScanLine,
    },
  ],
  benefits: [
    {
      id: 'entrega',
      title: 'Entrega rápida',
      description: 'Donde y cuando tu empresa lo necesite.',
      icon: Truck,
    },
    {
      id: 'soporte',
      title: 'Soporte experto',
      description: 'Acompañamiento técnico durante todo el alquiler.',
      icon: Headphones,
    },
    {
      id: 'equipos',
      title: 'Equipos confiables',
      description: 'Tecnología de calidad, siempre actualizada.',
      icon: ShieldCheck,
    },
    {
      id: 'flexibilidad',
      title: 'Flexibilidad total',
      description: 'Planes a medida, por el tiempo que tu empresa los necesite.',
      icon: Timer,
    },
  ],
};
