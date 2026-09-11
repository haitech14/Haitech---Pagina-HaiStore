import { useEffect, useState } from 'react';

import { BenefitsSection } from '@/components/maintenance-plan-landing/BenefitsSection';
import { FinalCTA } from '@/components/maintenance-plan-landing/FinalCTA';
import { IncludedServices } from '@/components/maintenance-plan-landing/IncludedServices';
import { MaintenanceCalculator } from '@/components/maintenance-plan-landing/MaintenanceCalculator';
import { MaintenanceHero } from '@/components/maintenance-plan-landing/MaintenanceHero';
import { ServiceModeSelector } from '@/components/maintenance-plan-landing/ServiceModeSelector';
import {
  MAINTENANCE_PLAN_CALCULATOR_ID,
  type MaintenanceServiceModeId,
} from '@/data/maintenance-plan';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const DEFAULT_TITLE = 'Plan de Mantenimiento Ricoh | Servicio Técnico Haitech';
const DEFAULT_DESCRIPTION =
  'Configura tu plan de mantenimiento Ricoh: preventivo, correctivo y soporte certificado. Cotiza en segundos. Distribuidor Autorizado en Perú.';

interface MaintenancePlanLandingPageProps {
  seoTitle?: string;
  seoDescription?: string;
  canonicalPath?: string;
}

export function MaintenancePlanLandingPage({
  seoTitle = DEFAULT_TITLE,
  seoDescription = DEFAULT_DESCRIPTION,
  canonicalPath = '/servicios?seccion=servicio-tecnico',
}: MaintenancePlanLandingPageProps) {
  const [serviceMode, setServiceMode] = useState<MaintenanceServiceModeId>('plan');

  useSeo({
    title: seoTitle,
    description: seoDescription,
    canonical: buildAbsoluteUrl(canonicalPath),
    robots: 'index,follow',
    ogType: 'website',
  });

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash !== MAINTENANCE_PLAN_CALCULATOR_ID) return;
    document
      .getElementById(MAINTENANCE_PLAN_CALCULATOR_ID)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className={cn('flex flex-col bg-white', HOME_LANDING_SURFACE_CLASS)}>
      <MaintenanceHero onSelectMode={setServiceMode} />
      <ServiceModeSelector value={serviceMode} onChange={setServiceMode} />
      <MaintenanceCalculator serviceMode={serviceMode} />
      {serviceMode === 'plan' ? (
        <>
          <IncludedServices />
          <BenefitsSection />
          <FinalCTA />
        </>
      ) : null}
    </div>
  );
}
