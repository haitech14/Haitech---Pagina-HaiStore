import { CategoryStrip } from '@/components/category-strip';
import { HeroBanner } from '@/components/hero-banner';
import { HomeHighlightedSection } from '@/components/home-highlighted-section';
import { HomeTrustStrip } from '@/components/home-trust-strip';
import { lazy, LazyHomeSection } from '@/components/home/lazy-home-section';
import { FooterBrandsSection } from '@/components/layout/footer-brands-section';

const HomeMultifunctionTabsSection = lazy(() =>
  import('@/components/home-multifunction-tabs-section').then((m) => ({
    default: m.HomeMultifunctionTabsSection,
  })),
);
const HomeSuppliesSpareTabsSection = lazy(() =>
  import('@/components/home-supplies-spare-tabs-section').then((m) => ({
    default: m.HomeSuppliesSpareTabsSection,
  })),
);
const ClientRecommendationsSection = lazy(() =>
  import('@/components/client-recommendations-section').then((m) => ({
    default: m.ClientRecommendationsSection,
  })),
);
const ClientsSection = lazy(() =>
  import('@/components/clients-section').then((m) => ({ default: m.ClientsSection })),
);
const HomeFaqSection = lazy(() =>
  import('@/components/home-faq-section').then((m) => ({ default: m.HomeFaqSection })),
);
const HomeEquipmentAdvisorSection = lazy(() =>
  import('@/components/home-equipment-advisor-section').then((m) => ({
    default: m.HomeEquipmentAdvisorSection,
  })),
);

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <CategoryStrip />
      <HomeTrustStrip />
      <HomeHighlightedSection />

      <LazyHomeSection minHeight="260px">
        <HomeMultifunctionTabsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="260px">
        <HomeSuppliesSpareTabsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="120px">
        <FooterBrandsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="360px">
        <ClientRecommendationsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="160px">
        <ClientsSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="200px">
        <HomeFaqSection />
      </LazyHomeSection>

      <LazyHomeSection minHeight="320px">
        <HomeEquipmentAdvisorSection />
      </LazyHomeSection>
    </div>
  );
}
