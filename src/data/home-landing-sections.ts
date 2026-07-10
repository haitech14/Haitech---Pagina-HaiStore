import { CalendarDays, Droplets, Printer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export const HOME_LANDING_SERVICE_FEATURES = [
  'Mantenimiento preventivo',
  'Reparación',
  'Instalación',
  'Diagnóstico',
  'Repuestos',
] as const;

export const HOME_LANDING_SERVICE_WHATSAPP_MESSAGE =
  'Hola, vengo desde HaiStore. Necesito solicitar un diagnóstico técnico para mi equipo de impresión.';

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
    name: 'Plan Oficina Pequeña',
    subtitle: 'Para 1 a 5 usuarios',
    priceFromPen: 499,
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Impresora multifuncional para plan oficina pequeña',
    href: serviceHubPath('alquiler'),
  },
  {
    id: 'profesional',
    name: 'Plan Empresa',
    subtitle: 'Para equipos de trabajo exigentes',
    priceFromPen: 899,
    image: '/categories/multifuncionales.png',
    imageAlt: 'Fotocopiadora multifuncional para plan empresa',
    popular: true,
    href: serviceHubPath('alquiler'),
  },
  {
    id: 'empresarial',
    name: 'Plan Alto Volumen',
    subtitle: 'Para impresión constante',
    priceFromPen: 1399,
    image: '/services/alquiler/plotters.png',
    imageAlt: 'Equipos de impresión de alto volumen en alquiler',
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
