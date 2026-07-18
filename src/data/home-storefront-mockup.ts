import {
  Briefcase,
  Calendar,
  Headphones,
  Package,
  Printer,
  Settings2,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { serviceDetailPathFromLanding, serviceHubPath } from '@/lib/service-hub';

/** Paleta de vitrina alineada a la marca HaiStore. */
export const STOREFRONT_BLUE = '#E30613';
export const STOREFRONT_BLUE_SOFT = '#FFF0F1';
export const STOREFRONT_ORANGE = '#E30613';
export const STOREFRONT_TRUST_BG = '#F4F7FB';

export type HomeStorefrontInfoStripItem = {
  id: string;
  /** Línea principal (negrita, arriba). */
  line1: string;
  /** Línea secundaria (más pequeña, abajo). */
  line2: string;
  icon: LucideIcon;
};

/** Franja de confianza bajo el hero. */
export const HOME_STOREFRONT_INFO_STRIP_ITEMS: readonly HomeStorefrontInfoStripItem[] = [
  {
    id: 'ricoh',
    line1: 'RICOH',
    line2: 'Distribuidor Autorizado',
    icon: ShieldCheck,
  },
  {
    id: 'envios',
    line1: 'Envíos a Lima y Provincias',
    line2: 'todos los días',
    icon: Truck,
  },
  {
    id: 'soporte',
    line1: 'Soporte Técnico Certificado',
    line2: 'a nivel Nacional',
    icon: Headphones,
  },
  {
    id: 'peru-compras',
    line1: 'Perú Compras',
    line2: 'Proveedor autorizado',
    icon: Briefcase,
  },
];

export type HomeStorefrontCategoryCard = {
  id: string;
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  icon: LucideIcon;
  /** Color de acento del icono / etiqueta. */
  iconColor?: string;
};

export const HOME_STOREFRONT_CATEGORIES: readonly HomeStorefrontCategoryCard[] = [
  {
    id: 'fotocopiadoras',
    label: 'Fotocopiadoras',
    href: categoryLandingPath('multifuncionales'),
    imageSrc: '/home/category-chips/equipment/multifuncionales.webp',
    imageAlt: 'Fotocopiadora multifuncional',
    icon: Printer,
    iconColor: '#E30613',
  },
  {
    id: 'impresoras-laser',
    label: 'Impresoras Láser',
    href: categoryLandingPath('impresoras'),
    imageSrc: '/home/category-chips/equipment/impresora-laser.webp',
    imageAlt: 'Impresora láser',
    icon: Printer,
    iconColor: '#2563EB',
  },
  {
    id: 'impresoras-tinta',
    label: 'Impresoras de Tinta',
    href: '/categoria/impresoras?buscar=tinta',
    imageSrc: '/home/category-chips/equipment/impresora-tinta.webp',
    imageAlt: 'Impresora de tinta',
    icon: Printer,
    iconColor: '#0EA5E9',
  },
  {
    id: 'escaneres',
    label: 'Escáneres',
    href: categoryLandingPath('escaneres'),
    imageSrc: '/home/category-chips/equipment/escaneres.webp',
    imageAlt: 'Escáner de documentos',
    icon: Printer,
    iconColor: '#0F766E',
  },
  {
    id: 'plotters',
    label: 'Plotters',
    href: categoryLandingPath('formato-ancho'),
    imageSrc: '/home/category-chips/equipment/plotter.webp',
    imageAlt: 'Plotter de formato ancho',
    icon: Printer,
    iconColor: '#7C3AED',
  },
  {
    id: 'laptops',
    label: 'Laptops',
    href: categoryLandingPath('computadoras-laptop'),
    imageSrc: '/home/category-chips/equipment/laptops.webp',
    imageAlt: 'Laptop para oficina',
    icon: Briefcase,
    iconColor: '#334155',
  },
  {
    id: 'pantallas',
    label: 'Pantallas',
    href: categoryLandingPath('soluciones-colaboracion'),
    imageSrc: '/home/category-chips/equipment/pantallas-interactivas.webp',
    imageAlt: 'Pantalla interactiva',
    icon: Sparkles,
    iconColor: '#EA580C',
  },
  {
    id: 'impresora-termica',
    label: 'Térmicas',
    href: categoryPath('impresoras', 'impresoras-termicas'),
    imageSrc: '/home/category-chips/equipment/impresora-termica.webp',
    imageAlt: 'Impresora térmica',
    icon: Printer,
    iconColor: '#111111',
  },
  {
    id: 'formato-ancho',
    label: 'Gran formato',
    href: categoryLandingPath('formato-ancho'),
    imageSrc: '/home/category-chips/equipment/formato-ancho.webp',
    imageAlt: 'Equipo de gran formato',
    icon: Printer,
    iconColor: '#0284C7',
  },
  {
    id: 'toner',
    label: 'Toner',
    href: categoryLandingPath('toner-suministros'),
    imageSrc: '/home/category-chips/consumables/toner.webp',
    imageAlt: 'Cartucho de tóner',
    icon: Package,
    iconColor: '#111111',
  },
  {
    id: 'repuestos',
    label: 'Repuestos',
    href: categoryLandingPath('repuestos'),
    imageSrc: '/home/category-chips/consumables/repuestos.webp',
    imageAlt: 'Repuestos para impresoras',
    icon: Wrench,
    iconColor: '#B45309',
  },
  {
    id: 'tintas',
    label: 'Tintas',
    href: categoryLandingPath('toner-suministros'),
    imageSrc: '/home/category-chips/consumables/tintas.webp',
    imageAlt: 'Cartuchos de tinta',
    icon: Package,
    iconColor: '#DB2777',
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    href: categoryLandingPath('accesorios'),
    imageSrc: '/home/category-chips/equipment/accesorios.webp',
    imageAlt: 'Accesorios para impresión',
    icon: Wrench,
    iconColor: '#4F46E5',
  },
];

export type HomeStorefrontTrustItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const HOME_STOREFRONT_TRUST_ITEMS: readonly HomeStorefrontTrustItem[] = [
  {
    id: 'envio',
    title: 'Envío rápido',
    description: 'A todo el país en 24 a 48 horas',
    icon: Truck,
  },
  {
    id: 'garantia',
    title: 'Garantía',
    description: 'Hasta 12 meses en equipos y repuestos',
    icon: ShieldCheck,
  },
  {
    id: 'soporte',
    title: 'Soporte especializado',
    description: 'Asesoría técnica 24/7',
    icon: Headphones,
  },
  {
    id: 'instalacion',
    title: 'Instalación',
    description: 'Instalación y capacitación en tu empresa',
    icon: Wrench,
  },
  {
    id: 'empresarial',
    title: 'Atención empresarial',
    description: 'Soluciones a la medida para tu negocio',
    icon: Briefcase,
  },
];

export type HomeStorefrontServiceCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  icon: LucideIcon;
};

export const HOME_STOREFRONT_SERVICE = {
  eyebrow: 'SERVICIOS',
  title: 'Mucho más que productos',
  description: 'Brindamos soluciones integrales para que tu negocio nunca se detenga.',
  ctaLabel: 'Conoce más',
  ctaHref: '/servicios',
  cards: [
    {
      id: 'servicio-tecnico',
      title: 'Servicio Técnico Especializado',
      description: 'Técnicos certificados listos para mantener tus equipos siempre operativos.',
      href: serviceHubPath('servicio-tecnico'),
      imageSrc: '/promo-cards/technician-service.webp',
      imageAlt: 'Técnico especializado reparando una multifuncional',
      icon: ShieldCheck,
    },
    {
      id: 'alquiler',
      title: 'Alquiler de Equipos',
      description: 'Planes flexibles y accesibles para empresas y proyectos de cualquier tamaño.',
      href: serviceHubPath('alquiler'),
      imageSrc: '/services/alquiler/impresoras.png',
      imageAlt: 'Fila de multifuncionales listas para alquiler',
      icon: Calendar,
    },
    {
      id: 'mantenimiento',
      title: 'Mantenimiento Preventivo',
      description: 'Prolonga la vida útil de tus equipos con nuestros planes de mantenimiento.',
      href: serviceDetailPathFromLanding('servicio-tecnico', 'preventivo'),
      imageSrc: '/services/servicio-tecnico/preventivo.png',
      imageAlt: 'Mantenimiento preventivo en componentes de impresora',
      icon: Settings2,
    },
  ] satisfies readonly HomeStorefrontServiceCard[],
} as const;

export type HomeStorefrontRentalPlan = {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  tone: 'blue' | 'mint' | 'peach';
};

export const HOME_STOREFRONT_RENTAL = {
  title: 'Alquiler de equipos',
  subtitle: 'Planes flexibles para cada necesidad',
  plans: [
    {
      id: 'empresas',
      title: 'Para empresas',
      description: 'Multifuncionales de alto volumen con mantenimiento incluido.',
      href: serviceHubPath('alquiler'),
      imageSrc: '/home/category-chips/equipment/multifuncionales.webp',
      imageAlt: 'Fotocopiadora para empresas',
      tone: 'blue',
    },
    {
      id: 'oficinas',
      title: 'Para oficinas',
      description: 'Equipos compactos ideales para equipos de trabajo diarios.',
      href: serviceHubPath('alquiler'),
      imageSrc: '/home/category-chips/equipment/impresora-laser.webp',
      imageAlt: 'Impresora para oficinas',
      tone: 'mint',
    },
    {
      id: 'eventos',
      title: 'Para eventos',
      description: 'Alquiler temporal con entrega rápida y soporte en sitio.',
      href: serviceHubPath('alquiler'),
      imageSrc: '/home/category-chips/equipment/impresora-tinta.webp',
      imageAlt: 'Equipo para eventos',
      tone: 'peach',
    },
  ] satisfies readonly HomeStorefrontRentalPlan[],
} as const;

export const HOME_STOREFRONT_FEATURED_LIMIT = 10;
