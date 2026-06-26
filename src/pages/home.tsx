import { useMemo } from 'react';

import { CategoryStrip } from '@/components/category-strip';
import { HeroBanner } from '@/components/hero-banner';
import { HomeSeoIntro } from '@/components/home-seo-intro';
import { HomeHighlightedSection } from '@/components/home-highlighted-section';
import { HomeTrustStrip } from '@/components/home-trust-strip';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';
import { FooterBrandsSection } from '@/components/layout/footer-brands-section';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildHomeJsonLd, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const HomeMultifunctionTabsSection = lazy(() =>
  import('@/components/home-multifunction-tabs-section').then((m) => ({
    default: m.HomeMultifunctionTabsSection,
  })),
);
const HomeSuppliesSpareTabsSection = lazy(() =>
  import('@/components/home-supplies-spare-tabs-section').then((m) => ({
    default: m.HomeSuppliesSpareTabsSection,
  })),
);
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
const HomeEquipmentAdvisorSection = lazy(() =>
  import('@/components/home-equipment-advisor-section').then((m) => ({
    default: m.HomeEquipmentAdvisorSection,
  })),
);
const HomeTechnicalServiceBanner = lazy(() =>
  import('@/components/home-technical-service-banner').then((m) => ({
    default: m.HomeTechnicalServiceBanner,
  })),
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
      <HomeSeoIntro />
      <CategoryStrip />
      <HomeTrustStrip />
      <HomeHighlightedSection />

      <LazyHomeSection minHeight="260px">
        <HomeMultifunctionTabsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="260px">
        <HomeSuppliesSpareTabsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="220px">
        <HomeTechnicalServiceBanner />
      </LazyHomeSection>

      <LazyHomeSection minHeight="120px">
        <FooterBrandsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="360px">
        <ClientRecommendationsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="160px">
        <ClientsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="520px">
        <div className="bg-white">
          <HomeFaqSection />
          <HomeEquipmentAdvisorSection />
        </div>
      </LazyHomeSection>
    </div>
  );
}
