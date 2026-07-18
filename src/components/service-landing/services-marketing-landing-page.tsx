import { useMemo } from 'react';

import { ServicesLandingFeaturesBar } from '@/components/service-landing/landing/services-landing-features-bar';
import { ServicesLandingHero } from '@/components/service-landing/landing/services-landing-hero';
import { ServicesLandingQuoteForm } from '@/components/service-landing/landing/services-landing-quote-form';
import { ServicesLandingServicesGrid } from '@/components/service-landing/landing/services-landing-services-grid';
import { ServicesLandingSpacesSection } from '@/components/service-landing/landing/services-landing-spaces-section';
import { ServicesLandingStatsBar } from '@/components/service-landing/landing/services-landing-stats-bar';
import { ServicesLandingTestimonials } from '@/components/service-landing/landing/services-landing-testimonials';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildServiceJsonLd, DEFAULT_SITE_TITLE } from '@/lib/seo';
import { findServiceSeoRoute } from '@/lib/service-seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';

export function ServicesMarketingLandingPage() {
  const seoConfig = useMemo(() => {
    const seoRoute = findServiceSeoRoute('/servicios');
    if (!seoRoute) {
      return {
        title: DEFAULT_SITE_TITLE,
        canonical: buildAbsoluteUrl('/servicios'),
        robots: 'index,follow' as const,
      };
    }

    return {
      title: seoRoute.title,
      description: seoRoute.description,
      canonical: buildAbsoluteUrl(seoRoute.pathname),
      robots: 'index,follow' as const,
      jsonLd: buildServiceJsonLd(
        {
          pathname: seoRoute.pathname,
          serviceName: seoRoute.serviceName,
          serviceType: seoRoute.serviceType,
          description: seoRoute.description,
        },
        SITE_ORIGIN,
      ),
    };
  }, []);

  useSeo(seoConfig);

  return (
    <div className={cn('services-marketing-landing flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <ServicesLandingHero />
      <ServicesLandingFeaturesBar />
      <ServicesLandingServicesGrid />
      <ServicesLandingStatsBar />
      <ServicesLandingSpacesSection />
      <ServicesLandingTestimonials />
      <ServicesLandingQuoteForm />
    </div>
  );
}
