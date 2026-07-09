import { useMemo } from 'react';

import { HeroBanner } from '@/components/hero-banner';
import { HomeBenefitsBlackBar } from '@/components/home/home-benefits-black-bar';
import {
  HOME_CONSUMABLES_ADVISORY,
  HomeFeaturedAdvisoryRow,
  HomeFeaturedProductsSection,
} from '@/components/home/home-featured-products-section';
import { HomeEquipmentQuickNavSection } from '@/components/home/home-equipment-quick-nav-section';
import { HomeHeroCatalogBanners } from '@/components/home/home-hero-catalog-banners';
import { HomeHeroPromoStrip } from '@/components/home/home-hero-promo-strip';
import { HomeServiceRentalSection } from '@/components/home/home-service-rental-section';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';
import { FooterBrandsSection } from '@/components/layout/footer-brands-section';
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
      <HomeHeroPromoStrip />
      <div className="home-landing-sans relative bg-white shadow-[0_8px_32px_rgba(15,31,61,0.08)]">
        <HomeEquipmentQuickNavSection />
        <div className="container pb-4 sm:pb-5">
          <HomeFeaturedAdvisoryRow
            message={HOME_CONSUMABLES_ADVISORY.message}
            campaign={HOME_CONSUMABLES_ADVISORY.campaign}
            description={HOME_CONSUMABLES_ADVISORY.description}
          />
        </div>
        <HomeHeroCatalogBanners />
      </div>
      <HomeBenefitsBlackBar />
      <div className="home-landing-sans bg-white">
        <HomeFeaturedProductsSection
          key="featured-consumables-after-equipment"
          variant="consumables"
          instanceId="consumables-after-equipment"
          advisoryPlacement="none"
        />
      </div>
      <LazyHomeSection minHeight="120px">
        <FooterBrandsSection />
      </LazyHomeSection>
      <HomeServiceRentalSection />

      <LazyHomeSection minHeight="280px">
        <ClientRecommendationsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="120px">
        <ClientsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="520px">
        <div className="bg-white">
          <HomeFaqSection />
        </div>
      </LazyHomeSection>
    </div>
  );
}
