import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ServicesCatalogSection } from '@/components/services-storefront/services-catalog-section';
import { ServicesCustomSolutionForm } from '@/components/services-storefront/services-custom-solution-form';
import { ServicesStorefrontHero } from '@/components/services-storefront/services-storefront-hero';
import { mapHubSectionToCategory, SERVICES_CATALOG_ID } from '@/data/services-catalog';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { parseServiceHubSection } from '@/lib/service-hub';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const LANDING_SEO = {
  title: 'Servicios empresariales',
  description:
    'Alquiler de equipos, soporte técnico, outsourcing de impresión y servicios corporativos para empresas en Perú.',
};

export function ServicesHubPage() {
  const [searchParams] = useSearchParams();
  const section = parseServiceHubSection(searchParams.get('seccion'));
  const initialCategory = mapHubSectionToCategory(section);

  useSeo({
    title: LANDING_SEO.title,
    description: LANDING_SEO.description,
    canonical: buildAbsoluteUrl('/servicios'),
    robots: 'index,follow',
  });

  useEffect(() => {
    if (!searchParams.has('seccion')) return;

    window.requestAnimationFrame(() => {
      document.getElementById(SERVICES_CATALOG_ID)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [searchParams]);

  return (
    <div className={cn('services-storefront flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <ServicesStorefrontHero />
      <ServicesCatalogSection
        initialCategory={initialCategory}
        key={initialCategory ?? 'all'}
      />
      <ServicesCustomSolutionForm />
    </div>
  );
}
