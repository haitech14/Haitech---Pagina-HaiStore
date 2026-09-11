import { ClipboardCheck, Headphones, Shield, Wrench } from 'lucide-react';

import { cn } from '@/lib/utils';

const SERVICES = [
  {
    id: 'preventivo',
    title: 'Mantenimiento preventivo',
    description: 'Evita fallas y prolonga la vida útil de tus equipos.',
    icon: Shield,
  },
  {
    id: 'diagnostico',
    title: 'Diagnóstico y reparación',
    description: 'Evaluación técnica para detectar problemas.',
    icon: Wrench,
  },
  {
    id: 'soporte',
    title: 'Soporte técnico especializado',
    description: 'Técnicos capacitados para equipos Ricoh.',
    icon: Headphones,
  },
  {
    id: 'ciclo',
    title: 'Mantenimiento inicial y final',
    description: 'Inicio y cierre del servicio incluidos.',
    icon: ClipboardCheck,
  },
] as const;

export function IncludedServices({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="maintenance-services-title"
      className={cn('bg-white py-12 sm:py-16', className)}
    >
      <div className="container px-4 sm:px-6">
        <h2
          id="maintenance-services-title"
          className="mx-auto max-w-2xl text-balance text-center text-2xl font-black tracking-tight text-[#111111] sm:text-3xl"
        >
          Todo lo necesario para mantener tu equipo funcionando
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                className="rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] p-5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-22px_rgba(15,23,42,0.4)]"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#E30613]">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-bold text-[#111111]">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">{service.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
