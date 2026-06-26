import type { ServiceLandingSlug } from '@/data/service-landings';
import { getServiceLandingBySlug } from '@/data/service-landings';
import { SERVICE_HUB_TABS } from '@/lib/service-hub';

export type ServiceHubHeroVariant = 'rental' | 'support' | 'outsourcing' | 'corporate';

export interface ServiceHubHeroBanner {
  slug: ServiceLandingSlug;
  label: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  variant: ServiceHubHeroVariant;
}

const HERO_META: Record<
  ServiceLandingSlug,
  Pick<ServiceHubHeroBanner, 'image' | 'imageAlt' | 'variant'>
> = {
  alquiler: {
    image: '/categories/alquiler.png',
    imageAlt: 'Impresora y laptop en modalidad de alquiler',
    variant: 'rental',
  },
  'servicio-tecnico': {
    image: '/promotions/promo-hero-servicio.png',
    imageAlt: 'Técnico especializado en mantenimiento de equipos',
    variant: 'support',
  },
  outsourcing: {
    image: '/services/hero/outsourcing-impresion.png',
    imageAlt: 'Flota de impresoras gestionada en outsourcing',
    variant: 'outsourcing',
  },
  'servicios-corporativos': {
    image: '/services/servicios-corporativos/local-eventos.png',
    imageAlt: 'Espacio corporativo para eventos empresariales',
    variant: 'corporate',
  },
};

export function getServiceHubHeroBanners(): ServiceHubHeroBanner[] {
  return SERVICE_HUB_TABS.map((tab) => {
    const config = getServiceLandingBySlug(tab.slug);
    const meta = HERO_META[tab.slug];

    return {
      slug: tab.slug,
      label: tab.label,
      title: tab.label,
      description: config?.subtitle ?? '',
      ...meta,
    };
  });
}
