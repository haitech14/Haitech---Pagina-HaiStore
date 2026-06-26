import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { ChevronRight, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServicePurchaseActions } from '@/components/services-storefront/service-purchase-actions';
import { ServicesDetailGallery, ServicesDetailInclusions } from '@/components/services-storefront/services-detail-gallery';
import { ServicesDetailTabs, ServicesDetailValueProps } from '@/components/services-storefront/services-detail-tabs';
import {
  ServicesPlanComparison,
  ServicesPlanSelector,
} from '@/components/services-storefront/services-plan-comparison';
import {
  getCategoryLabel,
  getPlanPrice,
  getServiceBySlug,
  getServiceCardPriceLabel,
  isFixedPriceService,
  SERVICE_CONTRACT_DURATIONS,
} from '@/data/services-catalog';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import type { ServiceCartInput } from '@/lib/service-to-cart';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import type { ServiceContractType, ServicePlanId } from '@/types/services-catalog';
import { cn } from '@/lib/utils';

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? getServiceBySlug(slug) : undefined;

  const defaultDuration = useMemo(() => {
    if (!item) return 'mensual';
    if (item.pricingMode === 'fixed') return 'unico';
    return item.contractTypes.includes('mensual')
      ? 'mensual'
      : item.contractTypes[0] ?? 'mensual';
  }, [item]);

  const [selectedPlanId, setSelectedPlanId] = useState<ServicePlanId>('empresarial');
  const [durationId, setDurationId] = useState<ServiceContractType>(
    defaultDuration as ServiceContractType,
  );

  useSeo(
    item
      ? {
          title: item.title,
          description: item.shortDescription,
          canonical: buildAbsoluteUrl(`/servicios/${item.slug}`),
          robots: 'index,follow',
        }
      : {
          title: 'Servicio no encontrado',
          description: 'Servicio corporativo HaiStore',
          robots: 'noindex,nofollow',
        },
  );

  const cartInput = useMemo<ServiceCartInput | null>(() => {
    if (!item) return null;
    return {
      item,
      planId: selectedPlanId,
      durationId,
      unitPricePen: getPlanPrice(item, selectedPlanId, durationId),
    };
  }, [item, selectedPlanId, durationId]);

  if (!item || !cartInput) {
    return <Navigate to="/servicios" replace />;
  }

  const availableDurations = SERVICE_CONTRACT_DURATIONS.filter((duration) =>
    item.contractTypes.includes(duration.id as (typeof item.contractTypes)[number]),
  );
  const isFixedPrice = isFixedPriceService(item);
  const priceLabel = getServiceCardPriceLabel(item);
  const whatsappHref = buildHaitechWhatsAppUrl(item.whatsappMessage);

  return (
    <div className={cn('services-storefront flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <div className="container px-4 py-6 sm:px-6 sm:py-8">
        <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
          <Link to="/servicios" className="hover:text-red-600">
            Catálogo
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link to={`/servicios?seccion=${item.landingSlug}`} className="hover:text-red-600">
            {getCategoryLabel(item.categoryId)}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">{item.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <ServicesDetailGallery item={item} />

              <div>
                <h1 className="text-2xl font-bold text-neutral-950 sm:text-3xl">{item.title}</h1>
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="font-semibold text-foreground">{item.rating.toFixed(1)}</span>
                  <span>({item.reviewCount} reseñas)</span>
                </div>

                <p className="mt-4 text-2xl font-bold text-neutral-950">{priceLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

                <div className="mt-6 space-y-5">
                  {!isFixedPrice ? (
                    <>
                      <ServicesPlanSelector
                        item={item}
                        selectedPlanId={selectedPlanId}
                        onSelectPlan={setSelectedPlanId}
                        durationId={durationId}
                      />

                      <div>
                        <Label htmlFor="contract-duration">Duración del contrato</Label>
                        <Select
                          value={durationId}
                          onValueChange={(value) => setDurationId(value as ServiceContractType)}
                        >
                          <SelectTrigger id="contract-duration" className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDurations.map((duration) => (
                              <SelectItem key={duration.id} value={duration.id}>
                                {duration.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Precio fijo por intervención. El monto final puede variar según variante del
                      equipo (B/N o color) o complejidad detectada en sitio.
                    </p>
                  )}

                  <div>
                    <p className="mb-3 text-sm font-semibold text-foreground">Incluye</p>
                    <ServicesDetailInclusions items={item.inclusions} />
                  </div>

                  <ServicePurchaseActions cartInput={cartInput} />

                  <Button
                    asChild
                    variant="outline"
                    className="min-h-11 w-full gap-2 font-semibold"
                  >
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                      <Icon path={mdiWhatsapp} size={0.85} className="text-[#25D366]" aria-hidden="true" />
                      Hablar con asesor
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <ServicesDetailValueProps item={item} className="lg:hidden" />

            <ServicesDetailTabs item={item} />

            {!isFixedPrice ? (
              <section aria-labelledby="comparacion-planes-titulo" className="space-y-4">
                <h2 id="comparacion-planes-titulo" className="text-xl font-bold text-neutral-950">
                  Comparación de planes
                </h2>
                <ServicesPlanComparison
                  item={item}
                  selectedPlanId={selectedPlanId}
                  onSelectPlan={setSelectedPlanId}
                  durationId={durationId}
                />
              </section>
            ) : null}
          </div>

          <div className="hidden lg:block">
            <ServicesDetailValueProps item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}
