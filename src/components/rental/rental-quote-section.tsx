import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, MessageCircle, Send } from 'lucide-react';

import { ProductDetailPurchaseMode } from '@/components/product-detail/product-detail-purchase-mode';
import {
  ProductDetailRentalConfigurator,
  type EquipmentRentalEstimate,
} from '@/components/product-detail/product-detail-rental-configurator';
import { Button } from '@/components/ui/button';
import { DEFAULT_RENTAL_PLANS } from '@/data/rental-plans-defaults';
import { SERVICES_LANDING_FORM_ID } from '@/data/services-landing';
import { useRentalPlans } from '@/hooks/use-rental-plans';
import { formatEquipmentRentalPen } from '@/lib/rental-calculator';
import { cn } from '@/lib/utils';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import type { RentalPlanOption } from '@/types/product-detail';

export const RENTAL_QUOTE_SECTION_ID = 'cotizador-alquiler';

/** Ancho del cotizador embebido en el hero (~380–420 px). */
export const RENTAL_HERO_QUOTE_WIDTH_CLASS =
  'w-full max-w-[420px] min-w-0 sm:w-[390px] lg:w-[410px]';

const REFERENCE_EQUIPMENT_BASE_USD = 850;

function toRentalPlanOptions(plans: Array<{ pagesPerMonth: number; monthlyPricePen: number }>): RentalPlanOption[] {
  return plans.map((plan) => ({
    pagesPerMonth: plan.pagesPerMonth,
    monthlyPricePen: plan.monthlyPricePen,
  }));
}

function buildRentalQuoteWhatsAppMessage(estimate: EquipmentRentalEstimate): string {
  const machineLabel = estimate.isColorEquipment ? 'Color' : 'B/N monocromático';
  const volumeLine = estimate.isColorEquipment
    ? `${estimate.blackPages.toLocaleString('es-PE')} pág. B/N + ${estimate.colorPages.toLocaleString('es-PE')} pág. color`
    : `${estimate.a4Pages.toLocaleString('es-PE')} A4 / ${estimate.a3Pages.toLocaleString('es-PE')} A3 (equiv. ${estimate.billablePages.toLocaleString('es-PE')} A4)`;

  const extras = [
    estimate.extraServices.paper ? 'papel' : null,
    estimate.extraServices.operator ? 'operador' : null,
    estimate.extraServices.laptop ? 'laptop' : null,
    estimate.extraServices.laminator ? 'enmicadora' : null,
    estimate.extraServices.guillotine ? 'guillotina' : null,
    estimate.extraServices.residentTech ? 'técnico residente' : null,
    estimate.extraServices.spiralBinder ? 'espiraladora' : null,
    estimate.extraServices.ringBinder ? 'anilladora' : null,
  ].filter(Boolean);

  return [
    'Hola, quiero una cotización automática de alquiler con esta configuración:',
    `• Tipo de máquina: ${machineLabel}`,
    `• Volumen / mes: ${volumeLine}`,
    `• Escaneos / mes: ${estimate.scanPages.toLocaleString('es-PE')}`,
    `• Plazo: ${estimate.termMonths} meses`,
    `• Cantidad: ${estimate.equipmentQuantity} equipo(s)`,
    extras.length > 0 ? `• Extras: ${extras.join(', ')}` : null,
    `• Total estimado: S/ ${formatEquipmentRentalPen(estimate.estimatedMonthlyPen)}/mes`,
    '',
    '¿Me pueden confirmar disponibilidad y enviarme la propuesta formal?',
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

interface RentalQuoteCardProps {
  className?: string;
  /** Compacto para el hero (mismo formulario completo, tipografía más densa). */
  compact?: boolean;
}

export function RentalQuoteCard({ className, compact = false }: RentalQuoteCardProps) {
  const navigate = useNavigate();
  const { data: apiPlans } = useRentalPlans({ activeOnly: true });
  const rentalPlans = useMemo(() => {
    const source =
      apiPlans && apiPlans.length > 0
        ? apiPlans.filter((plan) => plan.active !== false)
        : DEFAULT_RENTAL_PLANS;
    return toRentalPlanOptions(source);
  }, [apiPlans]);

  const [estimate, setEstimate] = useState<EquipmentRentalEstimate | null>(null);

  const whatsappHref = useMemo(() => {
    if (!estimate) return buildHaitechWhatsAppUrl('Hola, quiero cotizar alquiler de equipos.');
    return buildHaitechWhatsAppUrl(buildRentalQuoteWhatsAppMessage(estimate));
  }, [estimate]);

  const scrollToContactForm = () => {
    document.getElementById(SERVICES_LANDING_FORM_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-white',
        compact
          ? 'shadow-[0_16px_48px_-20px_rgba(15,31,61,0.45)]'
          : 'shadow-[0_12px_40px_-24px_rgba(15,31,61,0.25)]',
        compact && RENTAL_HERO_QUOTE_WIDTH_CLASS,
        className,
      )}
    >
      <div
        className={cn(
          'border-b border-border/50 bg-white',
          compact ? 'px-3 py-2.5 sm:px-3.5' : 'px-3 pb-3 pt-3 sm:px-4 sm:pt-4',
        )}
      >
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.08em] text-red-600 sm:text-[0.6875rem]">
          Alquiler de equipos
        </p>
        <h2
          id={compact ? 'rental-quote-hero-title' : 'rental-quote-section-title'}
          className={cn(
            'mt-1 flex items-center gap-1.5 font-bold tracking-tight text-[#0f1f3d]',
            compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl',
          )}
        >
          <Calculator
            className={cn('shrink-0 text-red-600', compact ? 'size-5' : 'size-6 sm:size-7')}
            strokeWidth={1.75}
            aria-hidden={true}
          />
          Cotizador de alquiler
        </h2>
        <p
          className={cn(
            'mt-1 text-pretty leading-snug text-muted-foreground',
            compact ? 'text-[0.6875rem]' : 'mt-1.5 text-xs sm:text-sm',
          )}
        >
          Configura plan, volumen y plazo. El total se actualiza al instante.
        </p>
      </div>

      <div
        className={cn(
          compact ? 'space-y-3 p-3 sm:p-3.5' : 'space-y-3 p-3 sm:space-y-4 sm:p-4',
          compact && 'max-h-[min(72vh,34rem)] overflow-y-auto overscroll-contain',
        )}
      >
        <ProductDetailPurchaseMode
          purchaseMode="rent"
          onPurchaseModeChange={(mode) => {
            if (mode === 'buy') void navigate('/tienda');
          }}
          rentalPlans={rentalPlans}
          showRentalTab
        />

        <ProductDetailRentalConfigurator
          rentalPlans={rentalPlans}
          equipmentBasePriceUsd={REFERENCE_EQUIPMENT_BASE_USD}
          onEstimateChange={setEstimate}
          hideTitle
          variant="full"
          className="rounded-xl shadow-none ring-1 ring-border/50"
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            asChild
            className={cn(
              'w-full bg-red-600 text-white hover:bg-red-700',
              compact ? 'h-10' : 'h-11',
            )}
          >
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" aria-hidden={true} />
              Solicitar por WhatsApp
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn('w-full', compact ? 'h-10' : 'h-11')}
            onClick={scrollToContactForm}
          >
            <Send className="size-4" aria-hidden={true} />
            Completar solicitud
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RentalQuoteSection({ className }: { className?: string }) {
  return (
    <section
      id={RENTAL_QUOTE_SECTION_ID}
      aria-labelledby="rental-quote-section-title"
      className={cn('scroll-mt-20 py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          <RentalQuoteCard />
        </div>
      </div>
    </section>
  );
}
