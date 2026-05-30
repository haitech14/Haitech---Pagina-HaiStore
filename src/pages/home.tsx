import { BusinessSolutionsSection } from '@/components/business-solutions-section';
import { CategoryStrip } from '@/components/category-strip';
import { ClientsSection } from '@/components/clients-section';
import { FeaturedProducts } from '@/components/featured-products';
import { GuidesSection } from '@/components/guides-section';
import { HeroBanner } from '@/components/hero-banner';
import { Newsletter } from '@/components/newsletter';
import { TrustBar } from '@/components/trust-bar';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <CategoryStrip />

      <div className="container py-10 sm:py-12">
        <FeaturedProducts />
      </div>

      <BusinessSolutionsSection />

      <ClientsSection />

      <div className="container py-10 sm:py-12">
        <Newsletter />
      </div>

      <div className="container flex flex-col gap-14 pb-12 sm:pb-16">
        <TrustBar />
        <GuidesSection />
      </div>
    </div>
  );
}
