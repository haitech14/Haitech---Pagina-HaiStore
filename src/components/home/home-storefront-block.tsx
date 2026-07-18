import { useEffect } from 'react';

import { HomeStorefrontCategoriesSection } from '@/components/home/home-storefront-categories-section';
import { HomeStorefrontInfoStrip } from '@/components/home/home-storefront-info-strip';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';
import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';

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

/** Arranca la descarga de rails en cuanto se evalúa el módulo (en paralelo al primer pintado). */
prefetchHomeBelowFold();

/**
 * Bloque de vitrina:
 * infobox → categorías (inmediato) → resto diferido para no bloquear el primer pintado.
 */
export function HomeStorefrontBlock() {
  useEffect(() => {
    preloadCatalogIndexNow();

    let cancelled = false;
    const run = () => {
      if (!cancelled) prefetchHomeBelowFold();
    };

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(run, 120);
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

      <LazyHomeSection deferUntilVisible={false} minHeight="280px">
        <HomePromotionsSection />
      </LazyHomeSection>

      <LazyHomeSection deferUntilVisible={false} minHeight="220px">
        <HomeTechnicalServiceHeroBanner />
      </LazyHomeSection>

      <LazyHomeSection minHeight="200px">
        <FooterBrandsSection />
      </LazyHomeSection>

      <LazyHomeSection deferUntilVisible={false} minHeight="720px">
        <HomeStorefrontFeaturedSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="360px">
        <HomeStorefrontServiceSection />
      </LazyHomeSection>
    </div>
  );
}
