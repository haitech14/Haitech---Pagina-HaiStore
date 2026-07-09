import { useMemo, useState, useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { ChevronRight, Circle, Check, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SoftwareDetailGallery,
  SoftwareDetailInclusions,
} from '@/components/software-storefront/software-detail-gallery';
import {
  SoftwareDetailTabs,
  SoftwareDetailValueProps,
} from '@/components/software-storefront/software-detail-tabs';
import {
  SoftwarePlanComparison,
  SoftwarePlanSelector,
} from '@/components/software-storefront/software-plan-comparison';
import { useSoftwareQuote } from '@/context/software-quote-context';
import { useAuth } from '@/context/auth-context';
import {
  formatSoftwarePrice,
  getSoftwareBySlug,
  getSoftwareCategoryLabel,
  getSoftwareDisplayPrice,
  SOFTWARE_CONTRACT_DURATIONS,
} from '@/data/software-catalog';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { toast } from 'sonner';
import type { SoftwareContractType, SoftwarePlanId } from '@/types/software-catalog';
import { cn } from '@/lib/utils';

export function SoftwareDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? getSoftwareBySlug(slug) : undefined;
  const { effectiveRole } = useAuth();
  const { setSelectedSoftware, toggleSoftwareSelection, isSoftwareSelected } = useSoftwareQuote();

  const defaultPlanId = useMemo(() => {
    if (!item) return 'basico' as SoftwarePlanId;
    return (item.plans.find((plan) => plan.highlighted)?.id ??
      item.plans[0]?.id ??
      'basico') as SoftwarePlanId;
  }, [item]);

  const defaultDuration = useMemo(() => {
    if (!item) return 'mensual';
    return item.contractTypes.includes('mensual')
      ? 'mensual'
      : item.contractTypes[0] ?? 'mensual';
  }, [item]);

  const [selectedPlanId, setSelectedPlanId] = useState<SoftwarePlanId>(defaultPlanId);
  const [durationId, setDurationId] = useState<SoftwareContractType>(
    defaultDuration as SoftwareContractType,
  );

  useEffect(() => {
    setSelectedPlanId(defaultPlanId);
    setDurationId(defaultDuration as SoftwareContractType);
  }, [defaultPlanId, defaultDuration]);

  useSeo(
    item
      ? {
          title: item.title,
          description: item.shortDescription,
          canonical: buildAbsoluteUrl(`/software/${item.slug}`),
          robots: 'index,follow',
        }
      : {
          title: 'Software no encontrado',
          description: 'Software empresarial HaiStore',
          robots: 'noindex,nofollow',
        },
  );

  const isSelected = item ? isSoftwareSelected(item.slug) : false;

  useEffect(() => {
    if (!item || !isSelected) return;
    setSelectedSoftware({
      softwareSlug: item.slug,
      planId: selectedPlanId,
      durationId,
      unitPricePen: getSoftwareDisplayPrice(item, selectedPlanId, durationId, effectiveRole),
    });
  }, [item, isSelected, selectedPlanId, durationId, setSelectedSoftware, effectiveRole]);

  if (!item) {
    return <Navigate to="/software" replace />;
  }

  const availableDurations = SOFTWARE_CONTRACT_DURATIONS.filter((duration) =>
    item.contractTypes.includes(duration.id as (typeof item.contractTypes)[number]),
  );
  const currentPrice = getSoftwareDisplayPrice(item, selectedPlanId, durationId, effectiveRole);
  const whatsappHref = buildHaitechWhatsAppUrl(item.whatsappMessage);

  const handleSelectSoftware = () => {
    const wasSelected = isSelected;
    toggleSoftwareSelection({
      softwareSlug: item.slug,
      planId: selectedPlanId,
      durationId,
      unitPricePen: currentPrice,
    });
    toast.success(
      wasSelected ? 'Software deseleccionado' : 'Software seleccionado',
      {
        description: wasSelected
          ? undefined
          : 'Completa el formulario al final de la página para enviar tu solicitud.',
      },
    );
  };

  return (
    <div className={cn('software-storefront flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <div className="container px-4 py-6 sm:px-6 sm:py-8">
        <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
          <Link to="/software" className="hover:text-red-600">
            Catálogo
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link
            to={`/software?seccion=${item.categoryId}`}
            className="hover:text-red-600"
          >
            {getSoftwareCategoryLabel(item.categoryId)}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">{item.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <SoftwareDetailGallery item={item} />

              <div>
                <h1 className="text-2xl font-bold text-neutral-950 sm:text-3xl">{item.title}</h1>
                {item.reviewCount > 0 ? (
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span className="font-semibold text-foreground">{item.rating.toFixed(1)}</span>
                    <span>({item.reviewCount} reseñas)</span>
                  </div>
                ) : null}

                <p className="mt-4 text-2xl font-bold text-neutral-950">
                  Desde {formatSoftwarePrice(currentPrice, item.pricePeriod)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

                <div className="mt-6 space-y-5">
                  <SoftwarePlanSelector
                    item={item}
                    selectedPlanId={selectedPlanId}
                    onSelectPlan={setSelectedPlanId}
                    durationId={durationId}
                  />

                  <div>
                    <Label htmlFor="software-contract-duration">Duración del contrato</Label>
                    <Select
                      value={durationId}
                      onValueChange={(value) => setDurationId(value as SoftwareContractType)}
                    >
                      <SelectTrigger id="software-contract-duration" className="mt-1">
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

                  <div>
                    <p className="mb-3 text-sm font-semibold text-foreground">Incluye</p>
                    <SoftwareDetailInclusions items={item.inclusions} />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      aria-pressed={isSelected}
                      className={cn(
                        'min-h-11 flex-1 gap-2 font-semibold',
                        isSelected
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'border border-border bg-background text-foreground hover:border-red-600/40 hover:bg-red-50',
                      )}
                      onClick={handleSelectSoftware}
                    >
                      {isSelected ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <Circle className="size-4" aria-hidden="true" />
                      )}
                      {isSelected ? 'Seleccionado' : 'Seleccionar para cotización'}
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="min-h-11 flex-1 gap-2 font-semibold"
                    >
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                        <Icon path={mdiWhatsapp} size={0.85} className="text-[#25D366]" aria-hidden="true" />
                        Hablar con asesor
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <SoftwareDetailValueProps item={item} className="lg:hidden" />

            <SoftwareDetailTabs item={item} />

            <section aria-labelledby="software-comparacion-planes-titulo" className="space-y-4">
              <h2 id="software-comparacion-planes-titulo" className="text-xl font-bold text-neutral-950">
                Comparación de planes
              </h2>
              <SoftwarePlanComparison
                item={item}
                selectedPlanId={selectedPlanId}
                onSelectPlan={setSelectedPlanId}
                durationId={durationId}
              />
            </section>
          </div>

          <div className="hidden lg:block">
            <SoftwareDetailValueProps item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}
