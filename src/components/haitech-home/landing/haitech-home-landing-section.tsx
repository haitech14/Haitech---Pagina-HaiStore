import { useCart } from '@/context/cart-context';
import { cn, penToUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

import { BusinessServices } from '@/components/haitech-home/landing/business-services';
import { CompanyBenefits } from '@/components/haitech-home/landing/company-benefits';
import { FeaturedProducts } from '@/components/haitech-home/landing/featured-products';
import { PromoBanner } from '@/components/haitech-home/landing/promo-banner';
import { TrustedBrands } from '@/components/haitech-home/landing/trusted-brands';
import { WhatsAppCta } from '@/components/haitech-home/landing/whatsapp-cta';
import { WhyBuySection } from '@/components/haitech-home/landing/why-buy-section';
import {
  HAITECH_LANDING_FEATURED_PRODUCTS,
  HAITECH_LANDING_LINKS,
  HAITECH_LANDING_MAX_WIDTH,
  type FeaturedLandingProduct,
} from '@/data/haitech-home-landing-section';

function toCartProduct(item: FeaturedLandingProduct): Product {
  const priceUsd = Math.round(penToUsd(item.pricePEN) * 100) / 100;
  return {
    id: item.catalogProductId ?? item.id,
    name: `${item.name} ${item.description}`.trim(),
    description: item.description,
    price: priceUsd,
    currency: 'USD',
    image_url: item.image,
    stock: 1,
    category: 'Equipos',
    brand: 'RICOH',
    created_at: new Date().toISOString(),
  };
}

/** Bloque landing B2B: beneficios → productos → promo → servicios → marcas → CTA. */
export function HaitechHomeLandingSection({ className }: { className?: string }) {
  const { addItem } = useCart();

  const handleAddToCart = (product: FeaturedLandingProduct) => {
    addItem(toCartProduct(product), { openDrawer: true });
  };

  return (
    <div className={cn('w-full bg-white', className)}>
      <WhyBuySection />

      <div
        className="mx-auto space-y-7 px-4 pb-10 pt-2 sm:space-y-8 sm:px-6"
        style={{ maxWidth: HAITECH_LANDING_MAX_WIDTH }}
      >
        <FeaturedProducts
          products={HAITECH_LANDING_FEATURED_PRODUCTS}
          allProductsHref={HAITECH_LANDING_LINKS.allProducts}
          onAddToCart={handleAddToCart}
        />
        <PromoBanner offersHref={HAITECH_LANDING_LINKS.offers} />
        <BusinessServices />
        <TrustedBrands className="pt-2" />
        <CompanyBenefits />
        <WhatsAppCta whatsappUrl={HAITECH_LANDING_LINKS.whatsapp} />
      </div>
    </div>
  );
}
