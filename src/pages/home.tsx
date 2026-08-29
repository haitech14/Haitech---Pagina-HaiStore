import { useMemo } from 'react';

import { HaitechHomeBrandIntro } from '@/components/haitech-home/haitech-home-brand-intro';
import { HaitechHomeCategoryCarousel } from '@/components/haitech-home/haitech-home-category-carousel';
import { HaitechHomeFavoritesSection } from '@/components/haitech-home/haitech-home-favorites-section';
import { HaitechHomeHeroCarousel } from '@/components/haitech-home/haitech-home-hero-carousel';
import { HaitechHomeMobileTrustStrip } from '@/components/haitech-home/haitech-home-mobile-trust-strip';
import { HaitechHomeWhatsAppButton } from '@/components/haitech-home/haitech-home-whatsapp-button';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';
import { SiteFooter } from '@/components/layout/site-footer';
import { useSeo } from '@/hooks/use-seo';
import { buildHomeJsonLd, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';

const HomeTechnicalServiceHeroBanner = lazy(() =>
  import('@/components/home/home-technical-service-hero-banner').then((m) => ({
    default: m.HomeTechnicalServiceHeroBanner,
  })),
);
const HaitechHomeCatalogModule = lazy(() =>
  import('@/components/haitech-home/haitech-home-catalog-module').then((m) => ({
    default: m.HaitechHomeCatalogModule,
  })),
);
const HaitechHomePostServicesBanners = lazy(() =>
  import('@/components/haitech-home/haitech-home-mid-banner').then((m) => ({
    default: m.HaitechHomePostServicesBanners,
  })),
);
const HaitechHomeMidBanner = lazy(() =>
  import('@/components/haitech-home/haitech-home-mid-banner').then((m) => ({
    default: m.HaitechHomeMidBanner,
  })),
);
const HaitechHomeLandingSection = lazy(() =>
  import('@/components/haitech-home/landing/haitech-home-landing-section').then((m) => ({
    default: m.HaitechHomeLandingSection,
  })),
);
const HaitechHomeLatestSection = lazy(() =>
  import('@/components/haitech-home/haitech-home-latest-section').then((m) => ({
    default: m.HaitechHomeLatestSection,
  })),
);
const HomeFaqSection = lazy(() =>
  import('@/components/home-faq-section').then((m) => ({ default: m.HomeFaqSection })),
);
const HomeFinalCtaSection = lazy(() =>
  import('@/components/home-final-cta-section').then((m) => ({ default: m.HomeFinalCtaSection })),
);
const SitePrefooter = lazy(() =>
  import('@/components/layout/site-prefooter').then((m) => ({ default: m.SitePrefooter })),
);

/** Home ecommerce HAITECH (layout tipo tienda profesional). */
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
    <div className="min-h-screen bg-white font-sans antialiased [font-family:Inter,Roboto,Arial,Helvetica,sans-serif]">
      <HaitechHomeHeroCarousel />
      <HaitechHomeBrandIntro />
      <HaitechHomeMobileTrustStrip />
      <HaitechHomeCategoryCarousel />
      <HaitechHomeFavoritesSection />

      <LazyHomeSection mountOnIdle idleTimeoutMs={800} minHeight="220px">
        <div className="bg-white py-2 sm:py-3">
          <HomeTechnicalServiceHeroBanner />
        </div>
      </LazyHomeSection>
      <LazyHomeSection minHeight="720px">
        <HaitechHomeCatalogModule />
      </LazyHomeSection>
      <LazyHomeSection minHeight="280px">
        <HaitechHomePostServicesBanners />
      </LazyHomeSection>
      <LazyHomeSection minHeight="240px">
        <HaitechHomeMidBanner />
      </LazyHomeSection>
      <LazyHomeSection minHeight="360px">
        <HaitechHomeLandingSection />
      </LazyHomeSection>
      <LazyHomeSection minHeight="400px">
        <HaitechHomeLatestSection />
      </LazyHomeSection>
      <LazyHomeSection minHeight="320px">
        <HomeFaqSection />
      </LazyHomeSection>
      <LazyHomeSection minHeight="200px">
        <HomeFinalCtaSection />
      </LazyHomeSection>
      <LazyHomeSection minHeight="160px">
        <SitePrefooter />
      </LazyHomeSection>

      <SiteFooter />
      <HaitechHomeWhatsAppButton />
    </div>
  );
}
