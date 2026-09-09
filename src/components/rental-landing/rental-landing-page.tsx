import { useEffect } from 'react';

import { RentalBenefitsSection } from '@/components/rental-landing/rental-benefits-section';
import { RentalCalculator } from '@/components/rental-landing/rental-calculator';
import { RentalFaqSection } from '@/components/rental-landing/rental-faq-section';
import { RentalHeroSection } from '@/components/rental-landing/rental-hero-section';
import { RentalHowItWorks } from '@/components/rental-landing/rental-how-it-works';
import { RentalMachinesSection } from '@/components/rental-landing/rental-machines-section';
import { RENTAL_LANDING_CALCULATOR_ID } from '@/data/rental-landing-pricing';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const DEFAULT_TITLE = 'Alquiler de fotocopiadoras RICOH | Haitech';
const DEFAULT_DESCRIPTION =
  'Calcula tu plan de leasing, alquiler u outsourcing RICOH. Cuota estimada en segundos. Distribuidor Autorizado en Perú.';

interface RentalLandingPageProps {
  seoTitle?: string;
  seoDescription?: string;
  canonicalPath?: string;
}

export function RentalLandingPage({
  seoTitle = DEFAULT_TITLE,
  seoDescription = DEFAULT_DESCRIPTION,
  canonicalPath = '/servicios?seccion=alquiler',
}: RentalLandingPageProps) {
  useSeo({
    title: seoTitle,
    description: seoDescription,
    canonical: buildAbsoluteUrl(canonicalPath),
    robots: 'index,follow',
    ogType: 'website',
  });

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash !== RENTAL_LANDING_CALCULATOR_ID) return;
    const el = document.getElementById(RENTAL_LANDING_CALCULATOR_ID);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className={cn('flex flex-col bg-white', HOME_LANDING_SURFACE_CLASS)}>
      <RentalHeroSection />
      <RentalCalculator />
      <RentalMachinesSection />
      <RentalBenefitsSection />
      <RentalHowItWorks />
      <RentalFaqSection />
    </div>
  );
}
