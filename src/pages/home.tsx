import { useMemo } from 'react';

import { HeroBanner } from '@/components/hero-banner';
import { HomeFinalCtaSection } from '@/components/home-final-cta-section';
import { HomeStorefrontBlock } from '@/components/home/home-storefront-block';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildHomeJsonLd, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const ClientRecommendationsSection = lazy(() =>
  import('@/components/client-recommendations-section').then((m) => ({
    default: m.ClientRecommendationsSection,
  })),
);

const ClientsSection = lazy(() =>
  import('@/components/clients-section').then((m) => ({ default: m.ClientsSection })),
);

const HomeFaqSection = lazy(() =>
  import('@/components/home-faq-section').then((m) => ({ default: m.HomeFaqSection })),
);

export function HomePage() {
  const homeSeo = useMemo(
    () => ({
      title: DEFAULT_SITE_TITLE,
      description: DEFAULT_SITE_DESCRIPTION,
      canonical: buildAbsoluteUrl('/'),
      ogType: 'website' as const,
      robots: 'index,follow' as const,
      jsonLd: buildHomeJsonLd(SITE_ORIGIN),
    }),
    [],
  );

  useSeo(homeSeo);

  return (
    <div className={cn('flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <HeroBanner />

      <HomeStorefrontBlock />

      <LazyHomeSection minHeight="420px">
        <div className="bg-white">
          <ClientRecommendationsSection />
          <ClientsSection />
        </div>
      </LazyHomeSection>

      <LazyHomeSection minHeight="520px">
        <div className="bg-white">
          <HomeFaqSection />
        </div>
      </LazyHomeSection>

      <HomeFinalCtaSection />
    </div>
  );
}
