import { CATEGORY_STRIP_HERO_HEIGHT_CLASS } from '@/lib/category-strip-layout';
import { serviceHubPath } from '@/lib/service-hub';
import type { HomeHeroSlide } from '@/data/home-hero-slides';

const SERVICES_HERO_COMPACT_SHARED = {
  imageOnly: true,
  singleAsset: true,
  compact: true,
  skipHeroWebpVariants: true,
  objectFit: 'cover' as const,
  heroVerticalCrop: 0.84,
  objectPositionClass: 'object-[center_45%]',
  compactMaxHeightClass: CATEGORY_STRIP_HERO_HEIGHT_CLASS,
  ctaOverlay: false,
} satisfies Partial<HomeHeroSlide>;

/** Slides del hero de la landing de servicios. */
export const servicesHeroSlides: HomeHeroSlide[] = [
  {
    ...SERVICES_HERO_COMPACT_SHARED,
    id: 'servicios-soporte-tecnico',
    backgroundImage: '/promotions/promo-hero-servicio.webp',
    imageWidth: 1536,
    imageHeight: 1024,
    imageAlt:
      'Soporte técnico especializado para impresoras y equipos de oficina — HaiStore',
    linkHref: serviceHubPath('servicio-tecnico'),
  },
  {
    ...SERVICES_HERO_COMPACT_SHARED,
    id: 'servicios-alquiler',
    backgroundImage: '/categories/alquiler.png',
    imageWidth: 1536,
    imageHeight: 1024,
    imageAlt: 'Alquiler de impresoras, laptops y equipos para empresas — HaiStore',
    linkHref: serviceHubPath('alquiler'),
  },
  {
    ...SERVICES_HERO_COMPACT_SHARED,
    id: 'servicios-outsourcing',
    backgroundImage: '/services/outsourcing/impresion.png',
    imageWidth: 1536,
    imageHeight: 1024,
    imageAlt: 'Outsourcing de impresión y gestión tecnológica para empresas — HaiStore',
    linkHref: serviceHubPath('outsourcing'),
  },
  {
    ...SERVICES_HERO_COMPACT_SHARED,
    id: 'servicios-corporativos',
    backgroundImage: '/services/servicios-corporativos/local-eventos.png',
    imageWidth: 1536,
    imageHeight: 1024,
    imageAlt: 'Servicios corporativos, eventos y capacitación técnica — HaiStore',
    linkHref: serviceHubPath('servicios-corporativos'),
  },
];
