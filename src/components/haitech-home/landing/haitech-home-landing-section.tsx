import { cn } from '@/lib/utils';

import { BusinessServices } from '@/components/haitech-home/landing/business-services';
import { CompanyBenefits } from '@/components/haitech-home/landing/company-benefits';
import { HaitechHomeShowcaseSection } from '@/components/haitech-home/landing/haitech-home-showcase-section';
import { PromoBanner } from '@/components/haitech-home/landing/promo-banner';
import { TrustedBrands } from '@/components/haitech-home/landing/trusted-brands';
import { WhatsAppCta } from '@/components/haitech-home/landing/whatsapp-cta';
import {
  HAITECH_LANDING_LINKS,
  HAITECH_LANDING_MAX_WIDTH,
} from '@/data/haitech-home-landing-section';

/** Bloque landing B2B: beneficios → promo → servicios → marcas → CTA. */
export function HaitechHomeLandingSection({ className }: { className?: string }) {
  return (
    <div className={cn('w-full bg-white', className)}>
      <HaitechHomeShowcaseSection />

      <div
        className="mx-auto space-y-7 px-4 pb-10 pt-2 sm:space-y-8 sm:px-6"
        style={{ maxWidth: HAITECH_LANDING_MAX_WIDTH }}
      >
        <PromoBanner offersHref={HAITECH_LANDING_LINKS.offers} />
        <BusinessServices />
        <TrustedBrands className="pt-2" />
        <CompanyBenefits />
        <WhatsAppCta whatsappUrl={HAITECH_LANDING_LINKS.whatsapp} />
      </div>
    </div>
  );
}
