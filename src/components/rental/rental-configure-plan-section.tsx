import { ArrowRight, Minus, Plus, ShieldCheck, Sparkles, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RENTAL_EXTRA_SERVICES,
  formatRentalPriceWithIgv,
  formatRentalQuantityLabel,
  formatRentalVolumeLabel,
  useRentalQuickQuote,
  type RentalExtraServiceId,
} from '@/hooks/use-rental-quick-quote';
import { cn } from '@/lib/utils';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

export const RENTAL_CONFIGURE_PLAN_SECTION_ID = 'configura-tu-plan';

const PLAN_HIGHLIGHTS = [
  {
    id: 'adicionales',
    title: 'Servicios adicionales',
    description: 'Escoge las opciones que necesitas.',
    icon: Sparkles,
  },
  {
    id: 'cobertura',
    title: 'Cobertura y mantenimiento',
    description: 'Planes de soporte a nivel nacional.',
    icon: Wrench,
  },
  {
    id: 'recomendados',
    title: 'Equipos recomendados',
    description: 'Te sugerimos lo ideal para tu negocio.',
    icon: ShieldCheck,
  },
] as const;

interface RentalConfigurePlanSectionProps {
  className?: string;
}

/** Sección Configura tu plan del módulo Alquiler. */
export function RentalConfigurePlanSection({ className }: RentalConfigurePlanSectionProps) {
  const quote = useRentalQuickQuote({ withExtras: true });

  const selectedExtras = RENTAL_EXTRA_SERVICES.filter((item) => quote.extras[item.id]).map(
    (item) => item.label,
  );

  const whatsappHref = buildHaitechWhatsAppUrl(
    [
      'Hola, quiero solicitar cotización de alquiler con esta configuración:',
      `• Tipo: ${quote.machineType === 'color' ? 'Color' : 'Blanco y negro'}`,
      `• Volumen mensual: ${formatRentalVolumeLabel(quote.selectedPlan.pagesPerMonth)}`,
      `• Cantidad: ${formatRentalQuantityLabel(quote.quantity)}`,
      `• Plazo: ${quote.customTerm ? 'Otro (a definir)' : `${quote.termMonths} meses`}`,
      selectedExtras.length > 0 ? `• Extras: ${selectedExtras.join(', ')}` : null,
      `• Cuota mensual estimada: ${formatRentalPriceWithIgv(quote.estimate.estimatedMonthlyPen)}`,
      '',
      '¿Me pueden enviar la propuesta formal?',
    ]
      .filter((line): line is string => line != null)
      .join('\n'),
  );

  return (
    <section
      id={RENTAL_CONFIGURE_PLAN_SECTION_ID}
      aria-labelledby="rental-configure-plan-title"
      className={cn('scroll-mt-20 bg-neutral-100/80 py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] lg:gap-10">
          <div className="max-w-md lg:pt-2">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-red-600">
              Configura tu plan
            </p>
            <h2
              id="rental-configure-plan-title"
              className="mt-2 text-balance font-hero text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-[1.85rem] sm:leading-tight"
            >
              Personaliza tu alquiler según tus necesidades
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-neutral-600">
              Ajusta cada detalle y recibe una propuesta hecha a la medida de tu empresa.
            </p>

            <ul className="mt-6 space-y-4">
              {PLAN_HIGHLIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#0f1f3d]">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-snug text-neutral-500">{item.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_16px_40px_-28px_rgba(15,31,61,0.25)]">
            <div className="border-b border-border/50 px-4 py-3.5 sm:px-5">
              <h3 className="text-base font-bold tracking-tight text-[#0f1f3d]">
                Configuración de tu plan
              </h3>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
              <div className="space-y-5 p-4 sm:p-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-700">1. Tipo de impresión</p>
                  <div
                    className="grid grid-cols-2 gap-1.5 rounded-lg bg-neutral-100 p-1"
                    role="group"
                    aria-label="Tipo de impresión"
                  >
                    {(
                      [
                        { id: 'bw' as const, label: 'Blanco y negro' },
                        { id: 'color' as const, label: 'Color' },
                      ] as const
                    ).map((option) => {
                      const active = quote.machineType === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => quote.setMachineType(option.id)}
                          className={cn(
                            'h-9 rounded-md text-xs font-semibold transition-colors sm:text-sm',
                            active
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-transparent text-neutral-600 hover:text-neutral-900',
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="rental-config-volume"
                      className="text-xs font-semibold text-neutral-700"
                    >
                      2. Volumen mensual
                    </label>
                    <Select value={quote.selectedPlan.id} onValueChange={quote.setPlanId}>
                      <SelectTrigger
                        id="rental-config-volume"
                        className="h-10 rounded-lg border-neutral-200 text-sm shadow-none"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {quote.plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {formatRentalVolumeLabel(plan.pagesPerMonth)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-neutral-700">3. Cantidad de equipos</p>
                    <div className="flex h-10 items-center justify-between rounded-lg border border-neutral-200 px-1">
                      <button
                        type="button"
                        aria-label="Disminuir cantidad"
                        disabled={quote.quantity <= 1}
                        onClick={() => quote.setQuantity(Math.max(1, quote.quantity - 1))}
                        className="inline-flex size-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                      >
                        <Minus className="size-4" aria-hidden />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums text-[#0f1f3d]">
                        {quote.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar cantidad"
                        disabled={quote.quantity >= 20}
                        onClick={() => quote.setQuantity(Math.min(20, quote.quantity + 1))}
                        className="inline-flex size-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                      >
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-700">4. Plazo de alquiler</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Plazo de alquiler">
                    {quote.termPresets.map((months) => {
                      const active = !quote.customTerm && quote.termMonths === months;
                      return (
                        <button
                          key={months}
                          type="button"
                          onClick={() => quote.selectTermPreset(months)}
                          className={cn(
                            'h-9 rounded-lg px-3 text-xs font-semibold transition-colors',
                            active
                              ? 'border-2 border-red-600 bg-white text-red-600'
                              : 'border border-transparent bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80',
                          )}
                        >
                          {months} meses
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={quote.selectOtherTerm}
                      className={cn(
                        'h-9 rounded-lg px-3 text-xs font-semibold transition-colors',
                        quote.customTerm
                          ? 'border-2 border-red-600 bg-white text-red-600'
                          : 'border border-transparent bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80',
                      )}
                    >
                      Otro
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-neutral-700">5. Servicios adicionales</p>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {RENTAL_EXTRA_SERVICES.map((extra) => (
                      <li key={extra.id} className="flex items-center gap-2.5">
                        <Checkbox
                          id={`rental-extra-${extra.id}`}
                          checked={quote.extras[extra.id]}
                          onCheckedChange={() => quote.toggleExtra(extra.id as RentalExtraServiceId)}
                          className="border-neutral-300 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                        />
                        <label
                          htmlFor={`rental-extra-${extra.id}`}
                          className="cursor-pointer text-xs leading-snug text-neutral-700 sm:text-[0.8125rem]"
                        >
                          {extra.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <aside className="border-t border-border/50 bg-[#fdf4f4] p-4 sm:p-5 lg:border-l lg:border-t-0">
                <h4 className="text-sm font-bold tracking-tight text-[#0f1f3d]">
                  Resumen de tu cotización
                </h4>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-neutral-500">Equipos</dt>
                    <dd className="font-semibold text-[#0f1f3d]">{quote.quantity}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-neutral-500">Volumen mensual</dt>
                    <dd className="font-semibold text-[#0f1f3d]">
                      {formatRentalVolumeLabel(quote.selectedPlan.pagesPerMonth)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-neutral-500">Plazo</dt>
                    <dd className="font-semibold text-[#0f1f3d]">
                      {quote.customTerm ? 'Otro' : `${quote.termMonths} meses`}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 border-t border-red-100 pt-4">
                  <p className="text-xs text-neutral-500">Cuota mensual estimada</p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-[#0f1f3d] sm:text-2xl">
                    {formatRentalPriceWithIgv(quote.estimate.estimatedMonthlyPen)}
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-neutral-500">
                    Incluye mantenimiento y tóner
                  </p>
                </div>

                <Button
                  asChild
                  className="mt-5 h-11 w-full gap-1.5 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    Solicitar cotización
                    <ArrowRight className="size-4" aria-hidden />
                  </a>
                </Button>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
