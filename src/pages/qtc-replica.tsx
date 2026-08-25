import { QtcBenefits } from '@/components/qtc-replica/qtc-benefits';
import { QtcBrandIntro } from '@/components/qtc-replica/qtc-brand-intro';
import { QtcCategoryNavigation } from '@/components/qtc-replica/qtc-category-navigation';
import { QtcFavoritesSection } from '@/components/qtc-replica/qtc-favorites-section';
import { QtcHeroCarousel } from '@/components/qtc-replica/qtc-hero-carousel';
import { QtcInfoFooter } from '@/components/qtc-replica/qtc-info-footer';
import { QtcLatestSection } from '@/components/qtc-replica/qtc-latest-section';
import { QtcMainHeader } from '@/components/qtc-replica/qtc-main-header';
import { QtcPromoBanners } from '@/components/qtc-replica/qtc-promo-banners';
import { QtcSecondaryNavigation } from '@/components/qtc-replica/qtc-secondary-navigation';
import { QtcTopBar } from '@/components/qtc-replica/qtc-top-bar';
import { QtcWhatsAppButton } from '@/components/qtc-replica/qtc-whatsapp-button';
import { useSeo } from '@/hooks/use-seo';

/**
 * Réplica visual desktop de la captura QTC (fuera del shell HaiStore).
 */
export function QtcReplicaPage() {
  useSeo({
    title: 'QTC Perú | Réplica visual',
    description: 'Réplica pixel-oriented de layout ecommerce QTC para referencia de diseño.',
    robots: 'noindex,nofollow',
  });

  return (
    <div className="min-h-screen bg-white font-sans antialiased [font-family:Inter,Roboto,Arial,Helvetica,sans-serif]">
      <QtcTopBar />
      <QtcMainHeader />
      <QtcCategoryNavigation />
      <QtcSecondaryNavigation />
      <QtcHeroCarousel />
      <QtcBrandIntro />
      <QtcFavoritesSection />
      <QtcPromoBanners />
      <QtcBenefits />
      <QtcLatestSection />
      <QtcInfoFooter />
      <QtcWhatsAppButton />
    </div>
  );
}
