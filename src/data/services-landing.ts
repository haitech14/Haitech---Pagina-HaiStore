import {
  Building2,
  Clock,
  Coffee,
  Headphones,
  Printer,
  Projector,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wifi,
  Wrench,
  Volume2,
  type LucideIcon,
} from 'lucide-react';

import { clientRecommendations } from '@/data/client-recommendations';
import type { ServiceLandingSlug } from '@/data/service-landings';
import { serviceHubPath } from '@/lib/service-hub';

export const SERVICES_LANDING_FORM_ID = 'servicios-cotizacion';

export function servicesLandingSectionId(slug: ServiceLandingSlug): string {
  return `servicios-${slug}`;
}

export interface ServicesLandingHeroContent {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  quoteCtaLabel: string;
  whatsappCtaLabel: string;
  whatsappMessage: string;
}

export interface ServicesLandingFeature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ServicesLandingServiceCard {
  slug: ServiceLandingSlug;
  title: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
  bullets: readonly string[];
  href: string;
}

export interface ServicesLandingStat {
  id: string;
  value: string;
  label: string;
  icon: LucideIcon;
}

export interface ServicesLandingSpaceAmenity {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ServicesLandingFormBenefit {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ServicesLandingFormServiceOption {
  value: string;
  label: string;
}

export const servicesLandingHero: ServicesLandingHeroContent = {
  title: 'Compra servicios corporativos como en una tienda online',
  subtitle:
    'Alquila fotocopiadoras e impresoras Ricoh, contrata soporte técnico, reserva locales para eventos y arma tu cotización en minutos. Planes de alquiler con mantenimiento y tóner según contrato, con cobertura en Lima y Perú.',
  image: '/services/landing/hero-servicios.png',
  imageAlt:
    'Impresora multifuncional Ricoh, técnico especializado y sala corporativa para eventos empresariales',
  quoteCtaLabel: 'Ver catálogo',
  whatsappCtaLabel: 'Cotizar por WhatsApp',
  whatsappMessage:
    'Hola, vengo desde HaiStore. Me interesa conocer sus servicios corporativos (alquiler, soporte u outsourcing).',
};

export const servicesLandingFeatures: ServicesLandingFeature[] = [
  {
    id: 'respuesta-rapida',
    title: 'Respuesta rápida',
    description: 'Atención ágil para cotizaciones y soporte.',
    icon: Clock,
  },
  {
    id: 'soporte-especializado',
    title: 'Soporte especializado',
    description: 'Técnicos certificados Ricoh y cobertura nacional.',
    icon: Headphones,
  },
  {
    id: 'planes-flexibles',
    title: 'Planes flexibles',
    description: 'Alquiler, outsourcing y servicios a medida.',
    icon: SlidersHorizontal,
  },
  {
    id: 'atencion-empresarial',
    title: 'Atención empresarial',
    description: 'Acompañamiento dedicado para tu operación.',
    icon: Users,
  },
];

export const servicesLandingServiceCards: ServicesLandingServiceCard[] = [
  {
    slug: 'alquiler',
    title: 'Alquiler de equipos',
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Impresoras y equipos en alquiler empresarial',
    icon: Printer,
    bullets: [
      'Equipos de alto rendimiento listos para operar',
      'Entrega, instalación y mantenimiento incluidos',
      'Planes mensuales sin inversión inicial',
    ],
    href: serviceHubPath('alquiler'),
  },
  {
    slug: 'servicio-tecnico',
    title: 'Soporte técnico',
    image: '/services/servicio-tecnico/correctivo.png',
    imageAlt: 'Técnico especializado atendiendo equipo de impresión',
    icon: Wrench,
    bullets: [
      'Mantenimiento preventivo y correctivo',
      'Técnicos certificados con repuestos originales',
      'Cobertura en Lima y provincias',
    ],
    href: serviceHubPath('servicio-tecnico'),
  },
  {
    slug: 'outsourcing',
    title: 'Outsourcing de impresión',
    image: '/services/hero/outsourcing-impresion.png',
    imageAlt: 'Flota de impresoras gestionada en outsourcing',
    icon: ShieldCheck,
    bullets: [
      'Gestión integral de equipos e insumos',
      'Costos predecibles por página',
      'Soporte técnico incluido en el plan',
    ],
    href: serviceHubPath('outsourcing'),
  },
  {
    slug: 'servicios-corporativos',
    title: 'Servicios corporativos',
    image: '/services/servicios-corporativos/local-eventos.png',
    imageAlt: 'Salón corporativo para eventos y capacitaciones',
    icon: Building2,
    bullets: [
      'Locales para reuniones y capacitaciones',
      'Soluciones web, SaaS y eventos corporativos',
      'Atención personalizada para empresas',
    ],
    href: serviceHubPath('servicios-corporativos'),
  },
];

export const servicesLandingStats: ServicesLandingStat[] = [
  {
    id: 'respuesta',
    value: '2h',
    label: 'Respuesta promedio',
    icon: Clock,
  },
  {
    id: 'satisfaccion',
    value: '98%',
    label: 'Satisfacción',
    icon: ShieldCheck,
  },
  {
    id: 'empresas',
    value: '+500',
    label: 'Empresas atendidas',
    icon: Users,
  },
  {
    id: 'planes',
    value: '100%',
    label: 'Planes personalizados',
    icon: SlidersHorizontal,
  },
];

export const servicesLandingSpaces = {
  eyebrow: 'Espacios que inspiran',
  title: 'Locales para reuniones, capacitaciones y eventos',
  description:
    'Salas equipadas con conectividad, proyección y soporte para capacitaciones, lanzamientos y reuniones ejecutivas.',
  image: '/services/servicios-corporativos/local-eventos.png',
  imageAlt: 'Salón corporativo con proyector y filas de asientos',
  capacities: ['Hasta 20 personas', 'Hasta 50 personas', 'Hasta 100 personas'],
  amenities: [
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'proyector', label: 'Proyector', icon: Projector },
    { id: 'sonido', label: 'Sonido', icon: Volume2 },
    { id: 'cafe', label: 'Café', icon: Coffee },
  ] satisfies ServicesLandingSpaceAmenity[],
  ctaLabel: 'Ver locales disponibles',
  ctaHref: serviceHubPath('servicios-corporativos'),
};

export const servicesLandingTestimonials = clientRecommendations.slice(0, 3).map((item) => ({
  id: item.id,
  quote: item.quote,
  customerName: item.customerName,
  customerRole: item.customerCity,
  image: item.image,
  imageAlt: item.imageAlt,
}));

export const servicesLandingFormBenefits: ServicesLandingFormBenefit[] = [
  { id: 'asesoria', label: 'Asesoría gratuita', icon: Headphones },
  { id: 'propuesta', label: 'Propuesta personalizada', icon: SlidersHorizontal },
  { id: 'respuesta', label: 'Respuesta rápida', icon: Clock },
];

export const servicesLandingFormServiceOptions: ServicesLandingFormServiceOption[] = [
  { value: 'alquiler', label: 'Alquiler de equipos' },
  { value: 'servicio-tecnico', label: 'Soporte técnico' },
  { value: 'outsourcing', label: 'Outsourcing de impresión' },
  { value: 'servicios-corporativos', label: 'Servicios corporativos' },
  { value: 'locales-eventos', label: 'Locales para eventos' },
  { value: 'otro', label: 'Otro servicio' },
];

export const servicesLandingFormCopy = {
  panelTitle: 'Solicita tu cotización',
  panelDescription:
    'Cuéntanos qué necesitas y un asesor HaiStore te contactará con una propuesta a medida.',
  formTitle: 'Completa el formulario y te contactaremos',
  privacyNote: 'Tu información está protegida. No compartimos tus datos.',
  submitLabel: 'Enviar solicitud',
  successMessage: '¡Gracias! Hemos recibido tu solicitud. Te contactaremos pronto.',
};
