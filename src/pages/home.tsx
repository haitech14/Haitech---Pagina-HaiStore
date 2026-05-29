import { BrandStrip } from '@/components/brand-strip';
import { CategoryStrip } from '@/components/category-strip';
import { FeaturedProducts } from '@/components/featured-products';
import { GuidesSection } from '@/components/guides-section';
import { HeroBanner } from '@/components/hero-banner';
import { Newsletter } from '@/components/newsletter';
import { PromoBanners } from '@/components/promo-banners';
import { TrustBar } from '@/components/trust-bar';
import { printerBrands } from '@/data/brands';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <CategoryStrip />

      <div className="container flex flex-col gap-14 py-12 sm:py-16">
        <FeaturedProducts />
        <PromoBanners />
        <BrandStrip brands={printerBrands} />
        <TrustBar />
        <Newsletter />
        <GuidesSection />
      </div>
    </div>
  );
}
