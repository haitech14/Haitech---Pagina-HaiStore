import { useEffect } from 'react';

import { HomeEquiposHeroBanner } from '@/components/home/home-equipos-hero-banner';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';

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

function prefetchCatalogModule() {
  void import('@/components/layout/footer-brands-section');
  void import('@/components/home/home-storefront-featured-section');
}

/**
 * Módulo home (debajo de productos más vendidos):
 * banner equipos (encima de Marcas) → marcas líderes →
 * rails (multifuncionales, impresoras, escáneres).
 */
export function HaitechHomeCatalogModule() {
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const run = () => prefetchCatalogModule();

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(run, 400);
    }

    return () => {
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="home-landing-sans w-full bg-white">
      {/* Explora equipos — justo encima de Marcas Líderes */}
      <div className="py-2 sm:py-2.5">
        <HomeEquiposHeroBanner />
      </div>

      <LazyHomeSection mountOnIdle idleTimeoutMs={800} minHeight="160px">
        <FooterBrandsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="560px">
        <HomeStorefrontFeaturedSection />
      </LazyHomeSection>
    </div>
  );
}
