import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SoftwareCustomSolutionForm } from '@/components/software-storefront/software-custom-solution-form';
import { SoftwareSolutionsShowcase } from '@/components/software-storefront/software-solutions-showcase';
import { StorefrontChannelHeroBanner } from '@/components/store-storefront/storefront-channel-hero-banner';
import { SOFTWARE_CATALOG_ID } from '@/data/software-catalog';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const LANDING_SEO = {
  title: 'Software | Haitech',
  description:
    'Software de gestión documental, automatización de procesos e integración Ricoh para empresas en Perú. Cotiza licencias y planes con Distribuidor Autorizado Haitech.',
};

export function SoftwareHubPage() {
  const [searchParams] = useSearchParams();

  useSeo({
    title: LANDING_SEO.title,
    description: LANDING_SEO.description,
    canonical: buildAbsoluteUrl('/software'),
    robots: 'index,follow',
  });

  useEffect(() => {
    if (!searchParams.has('seccion')) return;

    window.requestAnimationFrame(() => {
      document.getElementById(SOFTWARE_CATALOG_ID)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [searchParams]);

  return (
    <div className={cn('software-storefront flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <StorefrontChannelHeroBanner channel="soluciones" />
      <SoftwareSolutionsShowcase />
      <SoftwareCustomSolutionForm />
    </div>
  );
}
