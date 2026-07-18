import { ArrowRight, Calculator, CircleHelp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatEquipmentRentalPen } from '@/lib/rental-calculator';
import {
  formatRentalQuantityLabel,
  formatRentalVolumeLabel,
  useRentalQuickQuote,
} from '@/hooks/use-rental-quick-quote';
import { cn } from '@/lib/utils';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

interface RentalHeroQuoteCardProps {
  className?: string;
}

/** Cotizador flotante del hero de Alquiler (mockup). */
export function RentalHeroQuoteCard({ className }: RentalHeroQuoteCardProps) {
  const quote = useRentalQuickQuote();
  const price = formatEquipmentRentalPen(quote.estimate.estimatedMonthlyPen);

  const whatsappHref = buildHaitechWhatsAppUrl(
    [
      'Hola, quiero cotizar alquiler con esta configuración:',
      `• Tipo: ${quote.machineType === 'color' ? 'Color' : 'Blanco y negro'}`,
      `• Volumen mensual: ${formatRentalVolumeLabel(quote.selectedPlan.pagesPerMonth)}`,
      `• Cantidad: ${formatRentalQuantityLabel(quote.quantity)}`,
      `• Plazo: ${quote.customTerm ? 'Otro (a definir)' : `${quote.termMonths} meses`}`,
      `• Cuota mensual estimada: S/ ${price} + IGV`,
      '',
      '¿Me confirman disponibilidad y me envían la propuesta?',
    ].join('\n'),
  );

  return (
    <div
      className={cn(
        'w-full max-w-[380px] min-w-0 overflow-hidden rounded-2xl border border-border/40 bg-white shadow-[0_24px_60px_-28px_rgba(15,31,61,0.55)] sm:w-[360px] lg:w-[370px]',
        className,
      )}
    >
      <div className="space-y-2.5 p-3.5 sm:space-y-3 sm:p-4">
        <h2
          id="rental-quote-hero-title"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-[#0f1f3d] sm:text-[0.9375rem]"
        >
          <Calculator className="size-[1.125rem] shrink-0 text-red-600" strokeWidth={1.75} aria-hidden />
          Cotiza tu alquiler
        </h2>

        <div className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-0.5" role="group" aria-label="Tipo de impresión">
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
                  'h-8 rounded-md px-2 text-[0.6875rem] font-semibold transition-colors sm:text-[0.75rem]',
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2">
          <div className="space-y-1">
            <label htmlFor="rental-hero-volume" className="text-[0.625rem] font-medium text-neutral-600">
              Volumen mensual aproximado
            </label>
            <Select value={quote.selectedPlan.id} onValueChange={quote.setPlanId}>
              <SelectTrigger
                id="rental-hero-volume"
                className="h-9 rounded-lg border-neutral-200 bg-white text-xs shadow-none"
              >
                <SelectValue placeholder="Volumen" />
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

          <div className="space-y-1">
            <label htmlFor="rental-hero-qty" className="text-[0.625rem] font-medium text-neutral-600">
              Cantidad de equipos
            </label>
            <Select
              value={String(quote.quantity)}
              onValueChange={(value) => quote.setQuantity(Number(value))}
            >
              <SelectTrigger
                id="rental-hero-qty"
                className="h-9 rounded-lg border-neutral-200 bg-white text-xs shadow-none"
              >
                <SelectValue placeholder="Cantidad" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {formatRentalQuantityLabel(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[0.625rem] font-medium text-neutral-600">Plazo de alquiler</p>
          <div className="grid grid-cols-4 gap-1" role="group" aria-label="Plazo de alquiler">
            {quote.termPresets.map((months) => {
              const active = !quote.customTerm && quote.termMonths === months;
              return (
                <button
                  key={months}
                  type="button"
                  onClick={() => quote.selectTermPreset(months)}
                  className={cn(
                    'h-8 rounded-lg text-[0.625rem] font-semibold transition-colors sm:text-[0.6875rem]',
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
                'h-8 rounded-lg text-[0.625rem] font-semibold transition-colors sm:text-[0.6875rem]',
                quote.customTerm
                  ? 'border-2 border-red-600 bg-white text-red-600'
                  : 'border border-transparent bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80',
              )}
            >
              Otro
            </button>
          </div>
        </div>

        <div className="space-y-0.5 border-t border-neutral-100 pt-2.5">
          <p className="inline-flex items-center gap-1 text-[0.6875rem] text-neutral-500">
            Cuota mensual estimada
            <CircleHelp className="size-3 text-neutral-400" aria-hidden />
          </p>
          <p className="text-xl font-bold leading-none tracking-tight text-[#0f1f3d] sm:text-[1.5rem]">
            <span className="text-sm font-bold sm:text-base">S/ </span>
            {price}
            <span className="ml-1 text-xs font-semibold text-neutral-600 sm:text-sm">+ IGV</span>
          </p>
          <p className="text-[0.625rem] text-neutral-500">Incluye mantenimiento y tóner</p>
        </div>

        <Button
          asChild
          className="h-10 w-full gap-1.5 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
        >
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            Cotizar alquiler
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </Button>
      </div>
    </div>
  );
}
