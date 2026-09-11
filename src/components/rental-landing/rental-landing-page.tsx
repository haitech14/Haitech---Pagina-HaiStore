import { useEffect } from 'react';

import { RentalHeroSection } from '@/components/rental-landing/rental-hero-section';
import { RentalSolutionConfigurator } from '@/components/rental-landing/solution-configurator/rental-solution-configurator';
import { RentalTrustFooterBar } from '@/components/rental-landing/rental-trust-footer-bar';
import { RENTAL_SOLUTION_CONFIGURATOR_ID } from '@/data/rental-solution-configurator';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const DEFAULT_TITLE = 'Alquiler de equipos Ricoh | Haitech';
const DEFAULT_DESCRIPTION =
  'Alquila multifuncionales Ricoh seminuevos con outsourcing incluido. Cotiza tu plan en segundos. Distribuidor Autorizado en Perú.';

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
    if (hash !== RENTAL_SOLUTION_CONFIGURATOR_ID) return;
    const el = document.getElementById(RENTAL_SOLUTION_CONFIGURATOR_ID);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className={cn('flex flex-col bg-white', HOME_LANDING_SURFACE_CLASS)}>
      <RentalHeroSection />
      <RentalSolutionConfigurator />
      <RentalTrustFooterBar />
    </div>
  );
}
