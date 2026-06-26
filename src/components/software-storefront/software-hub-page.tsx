import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SoftwareCatalogSection } from '@/components/software-storefront/software-catalog-section';
import { SoftwareCustomSolutionForm } from '@/components/software-storefront/software-custom-solution-form';
import { SoftwareStorefrontHero } from '@/components/software-storefront/software-storefront-hero';
import {
  mapSoftwareHubSectionToCategory,
  SOFTWARE_CATALOG_ID,
} from '@/data/software-catalog';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const LANDING_SEO = {
  title: 'Software empresarial',
  description:
    'Gestión documental, automatización de procesos e integración Ricoh. Cotiza licencias y planes para tu empresa en Perú.',
};

export function SoftwareHubPage() {
  const [searchParams] = useSearchParams();
  const section = searchParams.get('seccion') ?? '';
  const initialCategory = searchParams.has('seccion')
    ? mapSoftwareHubSectionToCategory(section)
    : null;

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
      <SoftwareStorefrontHero />
      <SoftwareCatalogSection
        initialCategory={initialCategory}
        key={initialCategory ?? 'all'}
      />
      <SoftwareCustomSolutionForm />
    </div>
  );
}
