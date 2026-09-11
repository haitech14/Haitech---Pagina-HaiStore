import { BriefcaseBusiness, Check, Copy, UserRound } from 'lucide-react';

import {
  SOLUTION_EXTRA_SERVICES,
  formatSolutionPen,
  type SolutionExtraId,
  type SolutionExtraService,
} from '@/data/rental-solution-configurator';
import { cn } from '@/lib/utils';

const SERVICE_ICONS = {
  operador: UserRound,
  papel: Copy,
  oficina: BriefcaseBusiness,
} as const;

interface ServiceCardProps {
  service: SolutionExtraService;
  enabled: boolean;
  onToggle: (id: SolutionExtraId) => void;
}

function ServiceSwitch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        checked ? 'bg-[#E30613]' : 'bg-[#D1D5DB]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
        )}
        aria-hidden="true"
      />
    </button>
  );
}

export function ServiceCard({ service, enabled, onToggle }: ServiceCardProps) {
  const Icon = SERVICE_ICONS[service.id];
  const priceLabel =
    service.perCopyPen != null
      ? `+ ${formatSolutionPen(service.perCopyPen, 3)} por copia`
      : service.monthlyPen != null
        ? `${formatSolutionPen(service.monthlyPen)} / mes`
        : '';

  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-2xl border bg-white p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.28)] transition-all duration-200 sm:p-5',
        enabled ? 'border-[#E30613]/45 ring-1 ring-[#E30613]/15' : 'border-[#E8E8E8]',
      )}
    >
      <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
        <ServiceSwitch
          checked={enabled}
          onCheckedChange={() => onToggle(service.id)}
          label={`${enabled ? 'Desactivar' : 'Activar'} ${service.title}`}
        />
      </div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#E30613]">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 className="mt-3 pr-12 text-base font-bold text-[#111111]">{service.title}</h3>
      <p className="mt-1 text-sm font-semibold text-[#E30613]">{priceLabel}</p>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{service.description}</p>
      {service.includes?.length ? (
        <ul className="mt-3 space-y-1">
          {service.includes.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-[#4B5563]">
              <Check className="size-3 shrink-0 text-[#E30613]" strokeWidth={2.5} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

interface AdditionalServicesProps {
  extras: Record<SolutionExtraId, boolean>;
  onToggle: (id: SolutionExtraId) => void;
}

export function AdditionalServices({ extras, onToggle }: AdditionalServicesProps) {
  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E30613] text-sm font-bold text-white">
          2
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#111111] sm:text-xl">
            Servicios adicionales (opcionales)
          </h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            Activa solo lo que necesites. El precio se suma a tu cotización.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {SOLUTION_EXTRA_SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            enabled={extras[service.id]}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
