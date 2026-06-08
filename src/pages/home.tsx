import { CategoryStrip } from '@/components/category-strip';
import { ClientRecommendationsSection } from '@/components/client-recommendations-section';
import { ClientsSection } from '@/components/clients-section';
import { CatalogCategorySections } from '@/components/catalog-category-sections';
import { FeaturedProducts } from '@/components/featured-products';
import { FlashDealsSection } from '@/components/flash-deals-section';
import { GuidesSection } from '@/components/guides-section';
import { HeroBanner } from '@/components/hero-banner';
import {
  HOME_CATALOG_EQUIPMENT_SECTIONS,
  HOME_CATALOG_SUPPLIES_SECTIONS,
} from '@/lib/home-catalog-sections';
import { Newsletter } from '@/components/newsletter';
import { NuestrasSolucionesSection } from '@/components/nuestras-soluciones-section';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <CategoryStrip />

      <div className="container flex flex-col gap-8 pb-6 pt-2 sm:gap-10 sm:pb-8 sm:pt-4">
        <FlashDealsSection />
        <FeaturedProducts />
        <CatalogCategorySections sectionsConfig={HOME_CATALOG_EQUIPMENT_SECTIONS} />
      </div>

      <NuestrasSolucionesSection />

      <div className="container flex flex-col gap-8 pb-6 pt-2 sm:gap-10 sm:pb-8 sm:pt-4">
        <CatalogCategorySections sectionsConfig={HOME_CATALOG_SUPPLIES_SECTIONS} />
      </div>

      <ClientsSection />
      <ClientRecommendationsSection />

      <div className="container flex flex-col gap-8 pb-12 sm:gap-10 sm:pb-16">
        <GuidesSection />
        <Newsletter />
      </div>
    </div>
  );
}
