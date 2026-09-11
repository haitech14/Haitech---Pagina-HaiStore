import { Clock3, LineChart, ShieldCheck, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';

const BENEFITS = [
  {
    id: 'costos',
    title: 'Reducción de costos',
    description: 'Menos reparaciones inesperadas.',
    icon: LineChart,
  },
  {
    id: 'productividad',
    title: 'Mayor productividad',
    description: 'Equipos disponibles cuando los necesitas.',
    icon: TrendingUp,
  },
  {
    id: 'vida-util',
    title: 'Mayor vida útil',
    description: 'Protege tu inversión.',
    icon: ShieldCheck,
  },
  {
    id: 'atencion',
    title: 'Atención especializada',
    description: 'Técnicos certificados.',
    icon: Clock3,
  },
] as const;

export function BenefitsSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="maintenance-benefits-title"
      className={cn('bg-[#F7F7F8] py-12 sm:py-16', className)}
    >
      <div className="container px-4 sm:px-6">
        <h2
          id="maintenance-benefits-title"
          className="mx-auto max-w-2xl text-balance text-center text-2xl font-black tracking-tight text-[#111111] sm:text-3xl"
        >
          ¿Por qué elegir un plan de mantenimiento?
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                key={benefit.id}
                className="rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.35)]"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#111111] text-white">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-bold text-[#111111]">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
