import { HomePromotionsSection } from '@/components/home/home-promotions-section';
import { HomeStorefrontCategoriesSection } from '@/components/home/home-storefront-categories-section';
import { HomeStorefrontFeaturedSection } from '@/components/home/home-storefront-featured-section';
import { HomeStorefrontInfoStrip } from '@/components/home/home-storefront-info-strip';
import { HomeStorefrontServiceSection } from '@/components/home/home-storefront-service-section';
import { HomeTechnicalServiceHeroBanner } from '@/components/home/home-technical-service-hero-banner';
import { FooterBrandsSection } from '@/components/layout/footer-brands-section';

/**
 * Bloque de vitrina:
 * infobox → categorías → promociones → marcas → distribuidor RICOH → destacados → servicio.
 * (La barra de confianza va como prefooter, antes de SiteFooter.)
 */
export function HomeStorefrontBlock() {
  return (
    <div className="home-landing-sans relative bg-white shadow-[0_8px_32px_rgba(15,31,61,0.08)]">
      <HomeStorefrontInfoStrip />
      <HomeStorefrontCategoriesSection />
      <HomePromotionsSection />
      <FooterBrandsSection />
      <HomeTechnicalServiceHeroBanner />
      <HomeStorefrontFeaturedSection />
      <HomeStorefrontServiceSection />
    </div>
  );
}
