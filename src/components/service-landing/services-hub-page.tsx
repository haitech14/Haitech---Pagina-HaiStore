import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ServicesCatalogSection } from '@/components/services-storefront/services-catalog-section';
import { ServicesCustomSolutionForm } from '@/components/services-storefront/services-custom-solution-form';
import { ServicesStorefrontHero } from '@/components/services-storefront/services-storefront-hero';
import { mapHubSectionToCategory, SERVICES_CATALOG_ID } from '@/data/services-catalog';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildServiceJsonLd, DEFAULT_SITE_TITLE } from '@/lib/seo';
import { parseServiceHubSection } from '@/lib/service-hub';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';
import { findServiceSeoRoute } from '@/lib/service-seo';

export function ServicesHubPage() {
  const [searchParams] = useSearchParams();
  const section = parseServiceHubSection(searchParams.get('seccion'));
  const initialCategory = mapHubSectionToCategory(section);

  const seoRoute = useMemo(() => {
    const search = searchParams.toString();
    const fromQuery = findServiceSeoRoute('/servicios', search);
    if (fromQuery) return fromQuery;
    return findServiceSeoRoute('/servicios');
  }, [searchParams]);

  const seoConfig = useMemo(() => {
    if (!seoRoute) {
      return {
        title: DEFAULT_SITE_TITLE,
        canonical: buildAbsoluteUrl('/servicios'),
        robots: 'index,follow' as const,
      };
    }

    const serviceLd = buildServiceJsonLd(
      {
        pathname: seoRoute.pathname,
        serviceName: seoRoute.serviceName,
        serviceType: seoRoute.serviceType,
        description: seoRoute.description,
      },
      SITE_ORIGIN,
    );

    return {
      title: seoRoute.title,
      description: seoRoute.description,
      canonical: buildAbsoluteUrl(seoRoute.pathname),
      robots: 'index,follow' as const,
      jsonLd: serviceLd,
    };
  }, [seoRoute]);

  useSeo(seoConfig);

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
