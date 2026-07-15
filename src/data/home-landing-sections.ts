import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Headset,
  Printer,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Star,
  Truck,
  UserCog,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export const HOME_LANDING_SERVICE_EYEBROW = 'Soporte técnico certificado';

export const HOME_LANDING_SERVICE_TITLE = {
  lead: 'Soluciones técnicas',
  accent: 'en las que puedes confiar',
} as const;

export const HOME_LANDING_SERVICE_DESCRIPTION =
  'Técnicos certificados, experiencia comprobada y atención oportuna para que tus equipos de impresión funcionen sin interrupciones.';

export const HOME_LANDING_SERVICE_FEATURES = [
  'Diagnóstico preciso',
  'Mantenimiento preventivo',
  'Reparaciones con repuestos originales',
  'Instalación y configuración',
  'Asesoría personalizada',
  'Soporte técnico continuo',
] as const;

export const HOME_LANDING_SERVICE_TRUST_ITEMS = [
  { id: 'certificados', label: 'Técnicos certificados', icon: UserCog },
  { id: 'garantia', label: 'Garantía en cada servicio', icon: ShieldCheck },
  { id: 'respuesta', label: 'Respuesta rápida', icon: Clock3 },
] as const;

export type HomeLandingServiceHighlight = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const HOME_LANDING_SERVICE_HIGHLIGHTS: HomeLandingServiceHighlight[] = [
  { id: 'tecnicos', label: 'Técnicos certificados', icon: UserCog },
  { id: 'respuesta', label: 'Respuesta rápida', icon: Clock3 },
  { id: 'repuestos', label: 'Repuestos originales', icon: Star },
  { id: 'garantia', label: 'Garantía en cada servicio', icon: BadgeCheck },
];

export const HOME_LANDING_SERVICE_WHATSAPP_MESSAGE =
  'Hola, vengo desde HaiStore. Necesito solicitar un diagnóstico técnico para mi equipo de impresión.';

export const HOME_LANDING_RENTAL_EYEBROW = 'Alquiler de equipos';

export const HOME_LANDING_RENTAL_TITLE = 'Equipos profesionales para cada necesidad';

export const HOME_LANDING_RENTAL_DESCRIPTION =
  'Equipo de impresión de alta calidad con planes flexibles y mantenimiento incluido.';

export type HomeLandingRentalFeature = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const HOME_LANDING_RENTAL_FEATURES: HomeLandingRentalFeature[] = [
  { id: 'marcas', label: 'Equipos de las mejores marcas', icon: Printer },
  { id: 'mantenimiento', label: 'Mantenimiento y tóner incluidos', icon: Settings2 },
  { id: 'planes', label: 'Planes flexibles para tu empresa', icon: CircleDollarSign },
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
    subtitle: 'Todo incluido',
    priceFromPen: 499,
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Impresora multifuncional para plan oficina pequeña',
    href: serviceHubPath('alquiler'),
  },
  {
    id: 'profesional',
    name: 'Plan Empresa',
    subtitle: 'Para equipos de mayor rendimiento',
    priceFromPen: 899,
    image: '/categories/multifuncionales.png',
    imageAlt: 'Fotocopiadora multifuncional para plan empresa',
    popular: true,
    href: serviceHubPath('alquiler'),
  },
  {
    id: 'empresarial',
    name: 'Plan Alto Volumen',
    subtitle: 'Para trabajos exigentes',
    priceFromPen: 1399,
    image: '/services/alquiler/plotters.png',
    imageAlt: 'Equipos de impresión de alto volumen en alquiler',
    href: serviceHubPath('alquiler'),
  },
];

export type HomeLandingRentalFooterItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const HOME_LANDING_RENTAL_FOOTER: HomeLandingRentalFooterItem[] = [
  { id: 'entrega', label: 'Entrega e instalación incluida', icon: Truck },
  { id: 'cobertura', label: 'Cobertura a nivel nacional', icon: ShieldCheck },
  { id: 'soporte', label: 'Soporte técnico permanente', icon: Headset },
  { id: 'renueva', label: 'Renueva o cambia tu plan cuando lo necesites', icon: RefreshCw },
];

export const HOME_LANDING_TONER_HIGHLIGHTS = [
  'Mayor rendimiento',
  'Precios competitivos',
  'Productos garantizados',
] as const;

export const HOME_LANDING_LINKS = {
  allProducts: '/tienda',
  technicalService: '/servicio-tecnico',
  rentalCatalog: serviceHubPath('alquiler'),
  tonerCatalog: categoryLandingPath('toner-suministros'),
  sparePartsCatalog: categoryLandingPath('repuestos'),
} as const;

export const HOME_LANDING_SERVICE_IMAGE = '/promo-cards/technician-service.webp';
