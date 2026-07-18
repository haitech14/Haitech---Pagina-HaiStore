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
  badge: 'Alquiler de equipos',
  badgeIcon: Building2,
  title: 'Equipos profesionales,',
  titleHighlight: 'resultados inteligentes.',
  subtitle:
    'Alquila fotocopiadoras e impresoras Ricoh con todo incluido. Mantenimiento, tóner y soporte técnico durante todo el contrato.',
  bullets: [
    'Equipos de última tecnología',
    'Mantenimiento incluido',
    'Tóner y repuestos sin costo adicional',
    'Soporte técnico rápido y especializado',
  ],
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
      id: 'envios',
      title: 'Envíos a todo Lima y Perú',
      description: 'Rápido y seguro.',
      icon: Truck,
    },
    {
      id: 'atencion',
      title: 'Atención personalizada',
      description: 'Asesoría sin compromiso.',
      icon: Headphones,
    },
    {
      id: 'originales',
      title: 'Equipos originales Ricoh',
      description: 'Garantía y calidad asegurada.',
      icon: ShieldCheck,
    },
    {
      id: 'contratos',
      title: 'Contratos flexibles',
      description: 'Planes a tu medida.',
      icon: Timer,
    },
  ],
};
