import { useEffect } from 'react';

import { HomeEquiposHeroBanner } from '@/components/home/home-equipos-hero-banner';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';

const FooterBrandsSection = lazy(() =>
  import('@/components/layout/footer-brands-section').then((m) => ({
    default: m.FooterBrandsSection,
  })),
);

function prefetchCatalogModule() {
  void import('@/components/layout/footer-brands-section');
}

/**
 * Módulo home: banner equipos → marcas líderes.
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
      <div className="py-2 sm:py-2.5">
        <HomeEquiposHeroBanner />
      </div>

      <LazyHomeSection mountOnIdle idleTimeoutMs={800} minHeight="160px">
        <FooterBrandsSection />
      </LazyHomeSection>
    </div>
  );
}