import { useEffect } from 'react';

import { HomePromotionsSection } from '@/components/home/home-promotions-section';
import { HomeStorefrontCategoriesSection } from '@/components/home/home-storefront-categories-section';
import { HomeStorefrontFeaturedSection } from '@/components/home/home-storefront-featured-section';
import { HomeStorefrontInfoStrip } from '@/components/home/home-storefront-info-strip';
import { HomeStorefrontServiceSection } from '@/components/home/home-storefront-service-section';
import { HomeTechnicalServiceHeroBanner } from '@/components/home/home-technical-service-hero-banner';
import { FooterBrandsSection } from '@/components/layout/footer-brands-section';
import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';

/**
 * Bloque de vitrina:
 * infobox → categorías → promociones → distribuidor RICOH → marcas líderes →
 * destacados (marcas de toner arriba de Toner) → servicio.
 */
export function HomeStorefrontBlock() {
  useEffect(() => {
    // Mientras el usuario ve categorías/promos, empezar a bajar el índice (~1.3 MB).
    preloadCatalogIndexNow();
  }, []);

  return (
    <div className="home-landing-sans relative -mt-px bg-white">
      <HomeStorefrontInfoStrip />
      <HomeStorefrontCategoriesSection />
      <HomePromotionsSection />
      <HomeTechnicalServiceHeroBanner />
      <FooterBrandsSection />
      <HomeStorefrontFeaturedSection />
      <HomeStorefrontServiceSection />
    </div>
  );
}
