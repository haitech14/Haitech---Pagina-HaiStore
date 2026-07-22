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

/** Prefetch 2ª oleada temprana: promos + tech (estáticos). */
function prefetchHomeWave2Early() {
  void import('@/components/home/home-promotions-section');
  void import('@/components/home/home-technical-service-hero-banner');
}

/** Prefetch marcas / footer brands (entre oleadas). */
function prefetchHomeWave2Mid() {
  void import('@/components/layout/footer-brands-section');
}

/** Prefetch rails + servicio (más pesado; después de promos). */
function prefetchHomeWave2Late() {
  void import('@/components/home/home-storefront-featured-section');
  void import('@/components/home/home-storefront-service-section');
}

function scheduleIdle(run: () => void, timeoutMs: number): () => void {
  let idleId: number | undefined;
  let timeoutId: number | undefined;

  if (typeof window.requestIdleCallback === 'function') {
    idleId = window.requestIdleCallback(run, { timeout: timeoutMs });
  } else {
    timeoutId = window.setTimeout(run, Math.min(timeoutMs, 400));
  }

  return () => {
    if (idleId != null && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idleId);
    }
    if (timeoutId != null) window.clearTimeout(timeoutId);
  };
}

/**
 * Bloque de vitrina:
 * 1ª oleada: infobox + categorías.
 * 2ª oleada: promos/tech en idle; rails al scroll + home-bundle.
 */
export function HomeStorefrontBlock() {
  useEffect(() => {
    let cancelled = false;
    const cleanups = [
      scheduleIdle(() => {
        if (!cancelled) prefetchHomeWave2Early();
      }, 700),
      scheduleIdle(() => {
        if (!cancelled) prefetchHomeWave2Mid();
      }, 1600),
      scheduleIdle(() => {
        if (!cancelled) prefetchHomeWave2Late();
      }, 3200),
    ];

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return (
    <div className="home-landing-sans relative -mt-px bg-white">
      <HomeStorefrontInfoStrip />
      <HomeStorefrontCategoriesSection />

      <LazyHomeSection mountOnIdle idleTimeoutMs={800} minHeight="280px">
        <HomePromotionsSection />
      </LazyHomeSection>

      <LazyHomeSection mountOnIdle idleTimeoutMs={1000} minHeight="220px">
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
