import { useSearchParams } from 'react-router-dom';

import { ServicesHubPage } from '@/components/service-landing/services-hub-page';
import { ServicesMarketingLandingPage } from '@/components/service-landing/services-marketing-landing-page';
import { tryParseServiceHubSection } from '@/lib/service-hub';

export function ServiciosPage() {
  const [searchParams] = useSearchParams();
  const section = tryParseServiceHubSection(searchParams.get('seccion'));

  if (section) {
    return <ServicesHubPage />;
  }

  return <ServicesMarketingLandingPage />;
}
