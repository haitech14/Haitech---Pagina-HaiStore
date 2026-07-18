import { useEffect } from 'react';

import { HomeStorefrontCategoriesSection } from '@/components/home/home-storefront-categories-section';
import { HomeStorefrontInfoStrip } from '@/components/home/home-storefront-info-strip';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';

const HomePromotionsSection = lazy(() =>
  import('@/components/home/home-promotions-section').then((m) => ({
    default: m.HomePromotionsSection,
  })),
);

const HomeTechnicalServiceHeroBanner = lazy(() =>
  import('@/components/home/home-technical-service-hero-banner').then((m) => ({
    default: m.HomeTechnicalServiceHeroBanner,
  })),
);

const FooterBrandsSection = lazy(() =>
  import('@/components/layout/footer-brands-section').then((m) => ({
    default: m.FooterBrandsSection,
  })),
);

const HomeStorefrontFeaturedSection = lazy(() =>
  import('@/components/home/home-storefront-featured-section').then((m) => ({
    default: m.HomeStorefrontFeaturedSection,
  })),
);

const HomeStorefrontServiceSection = lazy(() =>
  import('@/components/home/home-storefront-service-section').then((m) => ({
    default: m.HomeStorefrontServiceSection,
  })),
);

function prefetchHomeBelowFold() {
  void import('@/components/home/home-promotions-section');
  void import('@/components/home/home-technical-service-hero-banner');
  void import('@/components/layout/footer-brands-section');
  void import('@/components/home/home-storefront-featured-section');
  void import('@/components/home/home-storefront-service-section');
}

/**
 * Bloque de vitrina:
 * infobox → categorías (inmediato) → resto solo al acercarse al viewport.
 */
export function HomeStorefrontBlock() {
  useEffect(() => {
    // Solo chunks below-fold; el índice 1.3MB lo cargan búsqueda o /tienda.
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      prefetchHomeBelowFold();
    };

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(run, 800);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="home-landing-sans relative -mt-px bg-white">
      <HomeStorefrontInfoStrip />
      <HomeStorefrontCategoriesSection />

      <LazyHomeSection minHeight="280px">
        <HomePromotionsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="220px">
        <HomeTechnicalServiceHeroBanner />
      </LazyHomeSection>

      <LazyHomeSection minHeight="200px">
        <FooterBrandsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="720px">
        <HomeStorefrontFeaturedSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="360px">
        <HomeStorefrontServiceSection />
      </LazyHomeSection>
    </div>
  );
}
