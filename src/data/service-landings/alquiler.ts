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
  metaTitle: 'Alquiler tecnológico para empresas',
  badge: 'Alquiler tecnológico para empresas',
  badgeIcon: Building2,
  title: 'Soluciones de alquiler para',
  titleHighlight: 'tu empresa',
  subtitle: 'Equipos profesionales listos para impulsar tu productividad.',
  bullets: ['Entrega rápida', 'Soporte experto', 'Flexibilidad total'],
  highlightBulletIndex: 2,
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
      description: 'Equipos láser o de tinta con suministro y mantenimiento incluido.',
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
