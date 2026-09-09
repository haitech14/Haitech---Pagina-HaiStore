import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Handshake,
  Laptop,
  Leaf,
  Users,
} from 'lucide-react';

import { RENTAL_CALCULATOR_REVEAL_EVENT } from '@/components/rental-landing/rental-hero-section';
import { RentalQuoteDialog, type RentalQuotePayload } from '@/components/rental-landing/rental-quote-dialog';
import { Button } from '@/components/ui/button';
import { getRecommendedModel } from '@/data/rental-landing-models';
import {
  calculateMonthlyPrice,
  clampContractMonths,
  contractMonthsFor,
  DEFAULT_RENTAL_CALCULATOR,
  formatRentalPen,
  modalityLabel,
  resolveEquipmentKind,
  RENTAL_EQUIPMENT_KINDS,
  RENTAL_LANDING_CALCULATOR_ID,
  RENTAL_VOLUME_STEPS,
  type RentalCalculatorInput,
  type RentalDelivery,
  type RentalEquipmentKind,
  type RentalIncludedServices,
  type RentalLocation,
  type RentalModality,
} from '@/data/rental-landing-pricing';
import { cn } from '@/lib/utils';

const FIELD_CLASS =
  'h-11 min-h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

const MODALITIES: readonly {
  id: RentalModality;
  title: string;
  subtitle: string;
  icon: typeof Handshake;
}[] = [
  { id: 'leasing', title: 'Leasing 24–36 meses', subtitle: 'Equipos nuevos con cuotas fijas.', icon: Handshake },
  { id: 'alquiler', title: 'Alquiler de equipo', subtitle: 'Equipos seminuevos, de 6 a 36 meses.', icon: Laptop },
  { id: 'outsourcing', title: 'Outsourcing', subtitle: 'Nos ocupamos de todo por ti.', icon: Users },
];

const SERVICE_OPTIONS: readonly { id: keyof RentalIncludedServices; label: string }[] = [
  { id: 'installation', label: 'Instalación y configuración' },
  { id: 'toner', label: 'Tóner y repuestos' },
  { id: 'training', label: 'Capacitación inicial' },
  { id: 'support', label: 'Soporte técnico' },
];

const MODALITY_BENEFITS = [
  {
    id: 'leasing',
    title: 'Leasing 24–36 meses',
    icon: Handshake,
    items: ['Cuotas predecibles', 'Opción al final del plazo', 'Ideal para crecer a largo plazo'],
  },
  {
    id: 'alquiler',
    title: 'Alquiler de equipo',
    icon: Laptop,
    items: ['Flexibilidad de plazos', 'Equipos seminuevos', 'Sin inversión inicial elevada'],
  },
  {
    id: 'outsourcing',
    title: 'Outsourcing',
    icon: Users,
    items: ['Gestión integral de equipos', 'Tóner y soporte incluido', 'Más tiempo para tu negocio'],
  },
] as const;

const HERO_MACHINES = [
  '/products/ricoh-im-430f.webp',
  '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp',
  '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
] as const;

export function RentalCalculator() {
  const [input, setInput] = useState<RentalCalculatorInput>(DEFAULT_RENTAL_CALCULATOR);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    const reveal = () => {
      document.getElementById(RENTAL_LANDING_CALCULATOR_ID)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };
    window.addEventListener(RENTAL_CALCULATOR_REVEAL_EVENT, reveal);
    return () => window.removeEventListener(RENTAL_CALCULATOR_REVEAL_EVENT, reveal);
  }, []);

  const breakdown = useMemo(() => calculateMonthlyPrice(input), [input]);
  const recommendedModel = useMemo(() => getRecommendedModel(input), [input]);
  const contractOptions = contractMonthsFor(input.modality);
  const volumeIndex = RENTAL_VOLUME_STEPS.indexOf(input.monthlyVolume);
  const includedServices = SERVICE_OPTIONS.filter((item) => input.services[item.id]);

  const patch = (next: Partial<RentalCalculatorInput>) => {
    setInput((current) => ({ ...current, ...next }));
  };

  const selectModality = (modality: RentalModality) => {
    setInput((current) => ({
      ...current,
      modality,
      contractMonths: clampContractMonths(modality, current.contractMonths),
    }));
  };

  const selectEquipmentKind = (equipmentKind: RentalEquipmentKind) => {
    const kind = resolveEquipmentKind(equipmentKind);
    patch({
      equipmentKind,
      paperFormat: kind.format,
      printType: kind.printType,
    });
  };

  const patchServices = (key: keyof RentalIncludedServices, value: boolean) => {
    setInput((current) => ({
      ...current,
      services: { ...current.services, [key]: value },
    }));
  };

  const quote: RentalQuotePayload = {
    ...input,
    estimatedMonthlyPrice: breakdown.total,
    recommendedModel,
  };

  const openQuote = () => setQuoteOpen(true);

  return (
    <section
      id={RENTAL_LANDING_CALCULATOR_ID}
      aria-labelledby="rental-calculator-title"
      className="scroll-mt-24 bg-[#F4F7FB] py-10 sm:py-14"
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E30613]">
              Tu negocio, sin límites
            </p>
            <h2
              id="rental-calculator-title"
              className="mt-2 text-balance text-[2.1rem] font-black leading-[1.05] tracking-tight text-[#111111] sm:text-5xl"
            >
              Calcula tu <span className="text-[#E30613]">alquiler</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6B7280] sm:text-base">
              Simula tu plan, compara modalidades y elige la opción que mejor se adapte a las
              necesidades de tu negocio.
            </p>
          </div>
          <div className="hidden items-end justify-end gap-3 lg:flex">
            <div className="flex items-end gap-2">
              {HERO_MACHINES.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-20 w-auto object-contain sm:h-28"
                  decoding="async"
                />
              ))}
            </div>
            <p className="max-w-[9.5rem] text-right text-[11px] font-semibold leading-snug text-[#111111]">
              Equipos hoy.
              <br />
              Grandes resultados mañana.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.7fr)]">
          <div className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
            <fieldset>
              <legend className="text-sm font-semibold text-[#111111]">
                1. Selecciona la modalidad de alquiler
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {MODALITIES.map((item) => {
                  const Icon = item.icon;
                  const selected = input.modality === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectModality(item.id)}
                      className={cn(
                        'flex min-h-[5.5rem] flex-col items-start gap-2 rounded-xl border px-3.5 py-3 text-left transition-colors',
                        selected
                          ? 'border-[#E30613] bg-[#FFF5F5]'
                          : 'border-[#E7E7E7] bg-white hover:border-[#D1D5DB]',
                      )}
                    >
                      <Icon
                        className={cn('size-5', selected ? 'text-[#E30613]' : 'text-[#9CA3AF]')}
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span>
                        <span className="block text-sm font-bold text-[#111111]">{item.title}</span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-[#6B7280]">
                          {item.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-7">
              <p className="text-sm font-semibold text-[#111111]">2. Configura tu plan</p>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <FieldLabel label="Tipo de equipo">
                    <select
                      className={FIELD_CLASS}
                      value={input.equipmentKind}
                      onChange={(event) =>
                        selectEquipmentKind(event.target.value as RentalEquipmentKind)
                      }
                    >
                      {RENTAL_EQUIPMENT_KINDS.map((kind) => (
                        <option key={kind.id} value={kind.id}>
                          {kind.label}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Cantidad de equipos">
                    <div className="flex h-11 items-center rounded-lg border border-[#E5E7EB]">
                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center text-lg text-[#6B7280]"
                        aria-label="Quitar equipo"
                        onClick={() => patch({ quantity: Math.max(1, input.quantity - 1) })}
                      >
                        −
                      </button>
                      <span className="min-w-10 flex-1 text-center text-sm font-semibold tabular-nums">
                        {input.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center text-lg text-[#6B7280]"
                        aria-label="Agregar equipo"
                        onClick={() => patch({ quantity: Math.min(50, input.quantity + 1) })}
                      >
                        +
                      </button>
                    </div>
                  </FieldLabel>

                  <FieldLabel label="Plazo">
                    <select
                      className={FIELD_CLASS}
                      value={input.contractMonths}
                      onChange={(event) =>
                        patch({
                          contractMonths: Number(event.target.value) as typeof input.contractMonths,
                        })
                      }
                    >
                      {contractOptions.map((months) => (
                        <option key={months} value={months}>
                          {months} meses
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <div>
                    <p className="mb-2 text-sm font-medium text-[#111111]">Uso mensual estimado</p>
                    <input
                      type="range"
                      min={0}
                      max={RENTAL_VOLUME_STEPS.length - 1}
                      step={1}
                      value={volumeIndex < 0 ? 1 : volumeIndex}
                      aria-label="Uso mensual estimado"
                      className="h-11 w-full accent-[#E30613]"
                      onChange={(event) => {
                        const next = RENTAL_VOLUME_STEPS[Number(event.target.value)];
                        if (next) patch({ monthlyVolume: next });
                      }}
                    />
                    <div className="mt-1 flex justify-between text-[11px] text-[#6B7280]">
                      <span>Bajo</span>
                      <span>Medio</span>
                      <span>Alto</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[#111111]">
                      {input.monthlyVolume.toLocaleString('es-PE')} páginas / mes
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-[#111111]">Servicios incluidos</p>
                    <ul className="space-y-2">
                      {SERVICE_OPTIONS.map((item) => (
                        <li key={item.id}>
                          <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm text-[#111111]">
                            <input
                              type="checkbox"
                              checked={input.services[item.id]}
                              onChange={(event) => patchServices(item.id, event.target.checked)}
                              className="size-4 accent-[#E30613]"
                            />
                            {item.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <FieldLabel label="Entrega">
                    <select
                      className={FIELD_CLASS}
                      value={input.delivery}
                      onChange={(event) => patch({ delivery: event.target.value as RentalDelivery })}
                    >
                      <option value="standard">Estándar (3–5 días)</option>
                      <option value="express">Express (24–48 h)</option>
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Ubicación">
                    <select
                      className={FIELD_CLASS}
                      value={input.location}
                      onChange={(event) => patch({ location: event.target.value as RentalLocation })}
                    >
                      <option value="lima">Lima</option>
                      <option value="provincias">Provincias</option>
                    </select>
                  </FieldLabel>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 min-h-11 border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111111] hover:bg-[#F9FAFB]"
                onClick={() =>
                  document.getElementById('rental-quote-card')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                  })
                }
              >
                Calcular ahora
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                className="h-11 min-h-11 bg-[#E30613] px-5 text-sm font-semibold text-white hover:bg-[#c40511]"
                onClick={openQuote}
              >
                Solicitar propuesta
              </Button>
            </div>
          </div>

          <aside
            id="rental-quote-card"
            className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6"
          >
            <p className="text-sm font-semibold text-[#111111]">Tu cotización estimada</p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Los valores son referenciales y variarán según la configuración.
            </p>

            <div className="mt-5">
              <p className="text-xs font-medium text-[#6B7280]">Cuota mensual estimada</p>
              <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                <p className="text-[2.15rem] font-black leading-none tracking-tight text-[#111111]">
                  {formatRentalPen(breakdown.total)}
                </p>
                {breakdown.savingsPercent > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#15803D]">
                    <Leaf className="size-3.5" aria-hidden />
                    Ahorra hasta {breakdown.savingsPercent}%
                  </span>
                ) : null}
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <CalendarDays className="size-3.5" aria-hidden />
                  Plazo
                </dt>
                <dd className="mt-1 font-semibold text-[#111111]">{input.contractMonths} meses</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B7280]">Total proyectado</dt>
                <dd className="mt-1 font-semibold text-[#111111]">
                  {formatRentalPen(breakdown.projectedTotal)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B7280]">Ahorro estimado</dt>
                <dd className="mt-1 font-semibold text-[#111111]">
                  {formatRentalPen(breakdown.savingsAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B7280]">Valor del equipo</dt>
                <dd className="mt-1 font-semibold text-[#111111]">
                  {formatRentalPen(breakdown.equipmentValue)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-[#EEF1F5] pt-4">
              <p className="text-sm font-semibold text-[#111111]">Servicios incluidos en tu plan</p>
              <ul className="mt-3 space-y-2">
                {includedServices.length > 0 ? (
                  includedServices.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm text-[#374151]">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#16A34A]" strokeWidth={2.4} />
                      {item.label}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#6B7280]">Sin servicios adicionales.</li>
                )}
              </ul>
              <p className="mt-3 flex items-center gap-2 text-xs font-medium text-[#6B7280]">
                <Building2 className="size-3.5" aria-hidden />
                Todo eso, en un solo plan.
              </p>
            </div>

            <p className="mt-4 text-xs text-[#6B7280]">
              {modalityLabel(input.modality)} · {recommendedModel.name} · {input.quantity} equipo
              {input.quantity === 1 ? '' : 's'}
            </p>

            <Button
              type="button"
              className="mt-5 h-11 min-h-11 w-full bg-[#E30613] text-sm font-semibold text-white hover:bg-[#c40511]"
              onClick={openQuote}
            >
              Solicitar propuesta
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <p className="mt-2 text-center text-[11px] text-[#9CA3AF]">
              Un asesor te contactará para personalizar esta cotización.
            </p>
          </aside>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)]">
          <div className="rounded-2xl border border-[#E6EAF0] bg-white p-5 sm:p-6">
            <p className="text-sm font-semibold text-[#111111]">Conoce los beneficios de cada modalidad</p>
            <ul className="mt-4 grid gap-5 sm:grid-cols-3">
              {MODALITY_BENEFITS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Icon className="size-5 text-[#E30613]" strokeWidth={1.75} aria-hidden />
                    <p className="mt-2 text-sm font-bold text-[#111111]">{item.title}</p>
                    <ul className="mt-2 space-y-1.5">
                      {item.items.map((line) => (
                        <li key={line} className="text-xs leading-snug text-[#6B7280]">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-[#111827] p-6 text-white">
            <img
              src="/home/alquiler-hero-bg.png"
              alt=""
              className="pointer-events-none absolute inset-0 size-full object-cover opacity-35"
              decoding="async"
            />
            <div className="absolute inset-0 bg-[#111827]/70" aria-hidden />
            <div className="relative">
              <p className="text-lg font-bold leading-snug">
                La tecnología que tu empresa necesita, sin complicaciones.
              </p>
              <p className="mt-2 text-sm text-white/75">
                Enfócate en crecer. Nosotros nos ocupamos del resto.
              </p>
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-white underline-offset-4 hover:underline"
                onClick={openQuote}
              >
                Comparar todas las opciones
              </button>
            </div>
          </div>
        </div>
      </div>

      <RentalQuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} quote={quote} />
    </section>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-[#111111]">
      {label}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
