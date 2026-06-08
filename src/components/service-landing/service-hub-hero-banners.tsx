import { NuestrasSolucionesDarkGrid } from '@/components/nuestras-soluciones-cards';
import type { ServiceLandingSlug } from '@/data/service-landings';

interface ServiceHubHeroBannersProps {
  activeSection: ServiceLandingSlug;
  onSelect: (section: ServiceLandingSlug) => void;
  idPrefix?: string;
}

export function ServiceHubHeroBanners({
  activeSection,
  onSelect,
  idPrefix = 'servicios-hub',
}: ServiceHubHeroBannersProps) {
  return (
    <NuestrasSolucionesDarkGrid
      activeSection={activeSection}
      onSelect={onSelect}
      idPrefix={idPrefix}
    />
  );
}
