import { ArrowRight, Palette, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SERVICES_CATALOG_ID } from '@/data/services-catalog';
import { cn } from '@/lib/utils';

export const RENTAL_PLANS_SECTION_ID = 'planes-y-equipos';

const PLAN_CARDS = [
  {
    id: 'mp-301sp',
    model: 'MP 301SP',
    description: 'Ideal para pequeñas empresas',
    badge: 'Recomendado',
    badgeClass: 'bg-emerald-500 text-white',
    image: '/products/b-n-ricoh-mp-3055-512.webp',
    imageAlt: 'Multifuncional Ricoh monocromática compacta',
    printType: 'bw' as const,
    volumeLabel: 'Hasta 5,000 pág/mes',
  },
  {
    id: 'im-350f',
    model: 'IM 350F',
    description: 'Oficinas en crecimiento',
    badge: 'Popular',
    badgeClass: 'bg-rose-500 text-white',
    image: '/products/b-n-ricoh-im-550f-c-l-p-512.webp',
    imageAlt: 'Multifuncional Ricoh IM serie B/N',
    printType: 'bw' as const,
    volumeLabel: 'Hasta 15,000 pág/mes',
  },
  {
    id: 'im-c4500',
    model: 'IM C4500',
    description: 'Color profesional para equipos medianos',
    badge: 'Más elegido',
    badgeClass: 'bg-red-600 text-white',
    image: '/products/color-ricoh-im-c4500-120v-512.webp',
    imageAlt: 'Multifuncional Ricoh IM C4500 a color',
    printType: 'color' as const,
    volumeLabel: 'Hasta 30,000 pág/mes',
  },
  {
    id: 'pro-c7200s',
    model: 'Pro C7200S',
    description: 'Alta producción y acabados',
    badge: 'Alta producción',
    badgeClass: 'bg-violet-600 text-white',
    image: '/products/de-producci-n-laser-color-ricoh-pro-c5300s-512.webp',
    imageAlt: 'Equipo de producción láser color Ricoh',
    printType: 'color' as const,
    volumeLabel: 'Hasta 100,000 pág/mes',
  },
] as const;

interface RentalPlansEquipmentSectionProps {
  className?: string;
}

/** Sección Planes y Equipos del módulo Alquiler. */
export function RentalPlansEquipmentSection({ className }: RentalPlansEquipmentSectionProps) {
  const scrollToCatalog = () => {
    document.getElementById(SERVICES_CATALOG_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section
      id={RENTAL_PLANS_SECTION_ID}
      aria-labelledby="rental-plans-equipment-title"
      className={cn('scroll-mt-20 bg-neutral-50/80 py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-10">
          <div className="max-w-md lg:pt-2">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-red-600">
              Planes y equipos
            </p>
            <h2
              id="rental-plans-equipment-title"
              className="mt-2 text-balance font-hero text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-[1.75rem]"
            >
              Soluciones que se adaptan a tu empresa
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-neutral-600">
              Elige el equipo ideal según el volumen de impresión de tu negocio. Todos nuestros
              planes incluyen mantenimiento y soporte técnico.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 h-10 gap-1.5 rounded-lg border-red-600 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={scrollToCatalog}
            >
              Ver todos los equipos
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-3.5">
            {PLAN_CARDS.map((card) => (
              <li
                key={card.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_8px_24px_-18px_rgba(15,31,61,0.2)]"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center bg-neutral-50 px-3 pt-8">
                  <span
                    className={cn(
                      'absolute left-3 top-3 rounded-md px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide',
                      card.badgeClass,
                    )}
                  >
                    {card.badge}
                  </span>
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-2.5">
                  <h3 className="text-sm font-bold tracking-tight text-[#0f1f3d]">{card.model}</h3>
                  <p className="mt-0.5 text-xs leading-snug text-neutral-500">{card.description}</p>
                  <div className="mt-auto flex items-center gap-3 border-t border-neutral-100 pt-2.5 text-[0.6875rem] text-neutral-500">
                    <span className="inline-flex items-center gap-1 font-medium">
                      {card.printType === 'color' ? (
                        <Palette className="size-3.5 text-red-500" aria-hidden />
                      ) : (
                        <Printer className="size-3.5 text-neutral-500" aria-hidden />
                      )}
                      {card.printType === 'color' ? 'Color' : 'B/N'}
                    </span>
                    <span className="truncate">{card.volumeLabel}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
