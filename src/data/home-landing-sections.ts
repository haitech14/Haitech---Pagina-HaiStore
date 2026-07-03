import { CalendarDays, Cog, Droplets, Headphones, Printer, ShieldCheck, Truck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export type HomeLandingBenefitItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const HOME_LANDING_BLACK_BENEFITS: HomeLandingBenefitItem[] = [
  {
    id: 'entrega',
    title: 'Entrega rápida',
    description: 'Envíos a todo el país en 24 a 48 horas.',
    icon: Truck,
  },
  {
    id: 'soporte',
    title: 'Soporte técnico especializado',
    description: 'Asistencia profesional cuando la necesites.',
    icon: Headphones,
  },
  {
    id: 'garantia',
    title: 'Garantía asegurada',
    description: 'Equipos y repuestos con respaldo oficial.',
    icon: ShieldCheck,
  },
  {
    id: 'repuestos',
    title: 'Repuestos originales',
    description: 'Componentes certificados para tu equipo.',
    icon: Cog,
  },
  {
    id: 'atencion',
    title: 'Atención personalizada',
    description: 'Asesoría comercial a medida de tu negocio.',
    icon: UserRound,
  },
];

export const HOME_LANDING_SERVICE_FEATURES = [
  'Diagnóstico preciso y rápido',
  'Mantenimiento preventivo programado',
  'Reparación con repuestos originales',
  'Soporte técnico remoto y presencial',
] as const;

export type HomeLandingRentalFeature = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const HOME_LANDING_RENTAL_FEATURES: HomeLandingRentalFeature[] = [
  { id: 'planes', label: 'Planes mensuales flexibles', icon: CalendarDays },
  { id: 'equipos', label: 'Equipos multifuncionales incluidos', icon: Printer },
  { id: 'mantenimiento', label: 'Mantenimiento y tóner incluidos', icon: Droplets },
];

export type HomeLandingRentalPlanCard = {
  id: string;
  name: string;
  subtitle: string;
  priceFromPen: number;
  image: string;
  imageAlt: string;
  popular?: boolean;
  href: string;
};

export const HOME_LANDING_RENTAL_PLANS: HomeLandingRentalPlanCard[] = [
  {
    id: 'basico',
    name: 'Básico',
    subtitle: 'Ideal para oficinas pequeñas',
    priceFromPen: 199,
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Impresora multifuncional para plan básico',
    href: serviceHubPath('alquiler'),
  },
  {
    id: 'profesional',
    name: 'Profesional',
    subtitle: 'Para equipos de trabajo exigentes',
    priceFromPen: 399,
    image: '/categories/multifuncionales.png',
    imageAlt: 'Fotocopiadora multifuncional para plan profesional',
    popular: true,
    href: serviceHubPath('alquiler'),
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    subtitle: 'Solución integral para empresas',
    priceFromPen: 699,
    image: '/services/alquiler/plotters.png',
    imageAlt: 'Equipos de impresión empresarial en alquiler',
    href: serviceHubPath('alquiler'),
  },
];

export const HOME_LANDING_TONER_HIGHLIGHTS = [
  'Mayor rendimiento',
  'Precios competitivos',
  'Productos garantizados',
] as const;

export const HOME_LANDING_LINKS = {
  allProducts: '/tienda',
  technicalService: '/servicio-tecnico',
  tonerCatalog: categoryLandingPath('toner-suministros'),
  sparePartsCatalog: categoryLandingPath('repuestos'),
} as const;

export const HOME_LANDING_SERVICE_IMAGE = '/promo-cards/technician-service.webp';
