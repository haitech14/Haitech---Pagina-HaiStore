import { CalendarClock, Droplets, Headphones, ShieldCheck, Wrench } from 'lucide-react';

import { cn } from '@/lib/utils';

const SERVICE_ITEMS = [
  {
    id: 'toner',
    icon: Droplets,
    title: 'Toner',
    subtitle: 'Original / compatible',
  },
  {
    id: 'garantia-extendida',
    icon: ShieldCheck,
    title: 'Garantía extendida',
    subtitle: 'Opcional',
  },
  {
    id: 'mantenimiento',
    icon: Wrench,
    title: 'Planes de mantenimiento',
    subtitle: 'Mensual',
  },
  {
    id: 'instalacion',
    icon: CalendarClock,
    title: 'Instalación',
    subtitle: 'Incluida',
  },
  {
    id: 'soporte',
    icon: Headphones,
    title: 'Soporte técnico',
    subtitle: 'Especializado',
  },
] as const;

interface ProductQuickViewServiceCardsProps {
  className?: string;
}

export function ProductQuickViewServiceCards({ className }: ProductQuickViewServiceCardsProps) {
  return (
    <ul
      className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5', className)}
      aria-label="Servicios y complementos"
    >
      {SERVICE_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            className="flex min-w-0 flex-col items-center rounded-lg border border-border bg-muted/20 px-2 py-2.5 text-center sm:px-2.5"
          >
            <Icon
              className="size-4 shrink-0 text-muted-foreground sm:size-[1.15rem]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <p className="mt-1.5 text-[0.625rem] font-bold leading-tight text-foreground sm:text-[0.6875rem]">
              {item.title}
            </p>
            <p className="mt-0.5 text-[0.5625rem] leading-snug text-muted-foreground sm:text-[0.625rem]">
              {item.subtitle}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
