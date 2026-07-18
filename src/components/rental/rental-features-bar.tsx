import { FileCheck2, ScrollText, Truck, UserRound } from 'lucide-react';

import { cn } from '@/lib/utils';

const RENTAL_FEATURES = [
  {
    id: 'envios',
    title: 'Envíos a todo Lima y Perú',
    description: 'Rápido y seguro',
    icon: Truck,
  },
  {
    id: 'atencion',
    title: 'Atención personalizada',
    description: 'Asesoría sin compromiso',
    icon: UserRound,
  },
  {
    id: 'originales',
    title: 'Equipos originales Ricoh',
    description: 'Garantía y calidad asegurada',
    icon: FileCheck2,
  },
  {
    id: 'contratos',
    title: 'Contratos flexibles',
    description: 'Planes a tu medida',
    icon: ScrollText,
  },
] as const;

interface RentalFeaturesBarProps {
  className?: string;
}

/** Barra de beneficios bajo el hero de Alquiler. */
export function RentalFeaturesBar({ className }: RentalFeaturesBarProps) {
  return (
    <section
      aria-label="Beneficios del alquiler"
      className={cn('border-y border-border/50 bg-white', className)}
    >
      <div className="container px-4 sm:px-6">
        <ul className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {RENTAL_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.id}
                className="flex items-start gap-3 px-1 py-5 sm:px-4 sm:py-6 lg:px-5"
              >
                <Icon
                  className="mt-0.5 size-6 shrink-0 text-red-600"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-tight text-[#0f1f3d]">{feature.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-neutral-500">{feature.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
