import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export const HAITECH_HOME_SERVICES_HEADER = {
  eyebrow: 'Soluciones para tu empresa',
  titleBefore: 'Nuestros ',
  titleAccent: 'Servicios',
  description:
    'Te acompañamos en cada etapa, con soluciones integrales para mejorar la productividad de tu negocio.',
  tagline: 'Tu aliado en soluciones de impresión',
} as const;

export const HAITECH_HOME_SERVICES_GRID = [
  {
    id: 'venta-equipos',
    title: 'Venta de Equipos',
    description:
      'Equipos multifuncionales Ricoh con el respaldo de un distribuidor autorizado.',
    href: categoryLandingPath('multifuncionales'),
    image: '/home/home-equipos-banner-bg.png',
    imageAlt: 'Venta de multifuncionales e impresoras Ricoh',
    icon: 'cart',
  },
  {
    id: 'alquiler',
    title: 'Alquiler de Equipos',
    description:
      'Equipos en alquiler con planes flexibles, adaptados a las necesidades de tu empresa.',
    href: serviceHubPath('alquiler'),
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Alquiler de equipos de impresión para empresas',
    icon: 'printer',
  },
  {
    id: 'servicio-tecnico',
    title: 'Mantenimiento de Equipos',
    description:
      'Servicio técnico especializado para un rendimiento óptimo y sin interrupciones.',
    href: serviceHubPath('servicio-tecnico'),
    image: '/promo-cards/technician-service.webp',
    imageAlt: 'Servicio técnico y mantenimiento certificado Ricoh',
    icon: 'wrench',
  },
  {
    id: 'repuestos',
    title: 'Venta de Repuestos',
    description:
      'Repuestos y consumibles originales Ricoh para garantizar la máxima calidad y durabilidad.',
    href: categoryLandingPath('repuestos'),
    image: '/home/home-toner-repuestos-banner-bg.png',
    imageAlt: 'Repuestos y consumibles originales Ricoh',
    icon: 'cog',
  },
] as const;

export const HAITECH_HOME_SERVICES_TRUST = [
  {
    id: 'distribuidor',
    title: 'Distribuidor Autorizado',
    subtitle: 'Respaldo y garantía oficial Ricoh',
    icon: 'badge',
  },
  {
    id: 'asesoria',
    title: 'Asesoría Especializada',
    subtitle: 'Te ayudamos a encontrar la mejor solución',
    icon: 'users',
  },
  {
    id: 'soporte',
    title: 'Soporte Técnico',
    subtitle: 'Servicio rápido y confiable',
    icon: 'headset',
  },
  {
    id: 'soluciones',
    title: 'Soluciones a Medida',
    subtitle: 'Nos adaptamos a tu empresa',
    icon: 'shield',
  },
] as const;
