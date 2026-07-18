import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { RentalConfigurePlanSection } from '@/components/rental/rental-configure-plan-section';
import { RentalFeaturesBar } from '@/components/rental/rental-features-bar';
import { ServicesCatalogSection } from '@/components/services-storefront/services-catalog-section';
import { ServicesCustomSolutionForm } from '@/components/services-storefront/services-custom-solution-form';
import { ServicesStorefrontHero } from '@/components/services-storefront/services-storefront-hero';
import { mapHubSectionToCategory } from '@/data/services-catalog';
import type { ServiceLandingSlug } from '@/data/service-landings';
import type { ServiceCatalogCategoryId } from '@/types/services-catalog';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildServiceJsonLd, DEFAULT_SITE_TITLE } from '@/lib/seo';
import { parseServiceHubSection } from '@/lib/service-hub';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';
import { findServiceSeoRoute } from '@/lib/service-seo';

function categoryToHubSection(categoryId: ServiceCatalogCategoryId | null): ServiceLandingSlug | null {
  if (!categoryId) return null;
  if (categoryId === 'alquiler') return 'alquiler';
  if (categoryId === 'servicio-tecnico') return 'servicio-tecnico';
  if (categoryId === 'outsourcing') return 'outsourcing';
  if (
    categoryId === 'servicios-corporativos' ||
    categoryId === 'locales-eventos' ||
    categoryId === 'paquetes-corporativos'
  ) {
    return 'servicios-corporativos';
  }
  return null;
}

export function ServicesHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = parseServiceHubSection(searchParams.get('seccion'));
  const activeCategory = mapHubSectionToCategory(section);

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

  const handleCategoryChange = (categoryId: ServiceCatalogCategoryId | null) => {
    const nextSection = categoryToHubSection(categoryId);
    if (!nextSection) {
      setSearchParams({}, { replace: true });
      return;
    }
    if (nextSection === section) return;
    setSearchParams({ seccion: nextSection }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={cn('services-storefront flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <ServicesStorefrontHero section={section} />
      {section === 'alquiler' ? (
        <>
          <RentalFeaturesBar />
          <RentalConfigurePlanSection />
        </>
      ) : null}
      <ServicesCatalogSection
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        key={section}
      />
      <ServicesCustomSolutionForm />
    </div>
  );
}
