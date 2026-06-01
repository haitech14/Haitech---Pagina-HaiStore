import { BusinessSolutionsSection } from '@/components/business-solutions-section';
import { CategoryStrip } from '@/components/category-strip';
import { ClientsSection } from '@/components/clients-section';
import { CatalogCategorySections } from '@/components/catalog-category-sections';
import { FeaturedProducts } from '@/components/featured-products';
import { GuidesSection } from '@/components/guides-section';
import { HeroBanner } from '@/components/hero-banner';
import { PromotionsHeroBanner } from '@/components/promotions-hero-banner';
import { Newsletter } from '@/components/newsletter';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <CategoryStrip />

      <div className="container flex flex-col gap-14 pb-6 pt-2 sm:gap-16 sm:pb-8 sm:pt-4">
        <FeaturedProducts />
        <CatalogCategorySections />
      </div>

      <PromotionsHeroBanner />

      <BusinessSolutionsSection />

      <ClientsSection />

      <div className="container py-10 sm:py-12">
        <Newsletter />
      </div>

      <div className="container flex flex-col gap-14 pb-12 sm:pb-16">
        <GuidesSection />
      </div>
    </div>
  );
}
