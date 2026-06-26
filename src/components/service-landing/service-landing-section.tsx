import { ServiceLandingBenefitsBar } from '@/components/service-landing/service-landing-benefits-bar';
import { ServiceLandingCardsCarousel } from '@/components/service-landing/service-landing-cards-carousel';
import type { ServiceLandingConfig } from '@/types/service-landing';

interface ServiceLandingSectionProps {
  config: ServiceLandingConfig;
  sectionIdPrefix?: string;
}

export function ServiceLandingSection({
  config,
  sectionIdPrefix = 'servicios',
}: ServiceLandingSectionProps) {
  const panelId = `${sectionIdPrefix}-panel-${config.slug}`;
  const titleId = `${config.slug}-servicios-titulo`;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={`${sectionIdPrefix}-tab-${config.slug}`}
      className="flex flex-col gap-10 sm:gap-12"
    >
      <section aria-labelledby={titleId}>
        <h2 id={titleId} className="sr-only">
          Servicios de {config.metaTitle}
        </h2>
        <ServiceLandingCardsCarousel
          cards={config.cards}
          gridCols={config.gridCols ?? 'four'}
          ariaLabel={`Servicios de ${config.metaTitle}`}
        />
      </section>

      <ServiceLandingBenefitsBar benefits={config.benefits} />
    </div>
  );
}
