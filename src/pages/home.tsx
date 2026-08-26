import { useMemo } from 'react';

import { HaitechHomeBrandIntro } from '@/components/haitech-home/haitech-home-brand-intro';
import { HaitechHomeCategoryCarousel } from '@/components/haitech-home/haitech-home-category-carousel';
import { HaitechHomeFavoritesSection } from '@/components/haitech-home/haitech-home-favorites-section';
import { HaitechHomeHeroCarousel } from '@/components/haitech-home/haitech-home-hero-carousel';
import { HaitechHomeLandingSection } from '@/components/haitech-home/landing/haitech-home-landing-section';
import { HaitechHomeLatestSection } from '@/components/haitech-home/haitech-home-latest-section';
import { HaitechHomeWhatsAppButton } from '@/components/haitech-home/haitech-home-whatsapp-button';
import { SiteFooter } from '@/components/layout/site-footer';
import { useSeo } from '@/hooks/use-seo';
import { buildHomeJsonLd, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';

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
      <HaitechHomeCategoryCarousel />
      <HaitechHomeFavoritesSection />
      <HaitechHomeLandingSection />
      <HaitechHomeLatestSection />
      <SiteFooter />
      <HaitechHomeWhatsAppButton />
    </div>
  );
}
