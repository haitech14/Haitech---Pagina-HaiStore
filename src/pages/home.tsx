import { useMemo } from 'react';

import { HeroBanner } from '@/components/hero-banner';
import { HomeFinalCtaSection } from '@/components/home-final-cta-section';
import { HomeCategoryPromoTabsSection } from '@/components/home/home-category-promo-tabs-section';
import { HomeFindWhatYouNeedSection } from '@/components/home/home-find-what-you-need-section';
import { HomePromotionsSection } from '@/components/home/home-promotions-section';
import { HomeServiceRentalSection } from '@/components/home/home-service-rental-section';
import { HomeSocialProofSection } from '@/components/home/home-social-proof-section';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildHomeJsonLd, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';

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

      <HomePromotionsSection />

      <HomeCategoryPromoTabsSection />

      <div className="home-landing-sans relative bg-white shadow-[0_8px_32px_rgba(15,31,61,0.08)]">
        <HomeFindWhatYouNeedSection />
      </div>

      <LazyHomeSection minHeight="320px">
        <HomeSocialProofSection />
      </LazyHomeSection>

      <HomeServiceRentalSection />

      <LazyHomeSection minHeight="520px">
        <div className="bg-white">
          <HomeFaqSection />
        </div>
      </LazyHomeSection>

      <HomeFinalCtaSection />
    </div>
  );
}
