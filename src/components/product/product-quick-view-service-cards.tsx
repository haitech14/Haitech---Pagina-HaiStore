import { Headphones, ShieldCheck, Wrench } from 'lucide-react';

import { cn } from '@/lib/utils';

const SERVICE_ITEMS = [
  {
    id: 'garantia',
    icon: ShieldCheck,
    title: 'Garantía',
    subtitle: '12 meses',
  },
  {
    id: 'instalacion',
    icon: Wrench,
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
      className={cn('grid grid-cols-3 gap-2 sm:gap-3', className)}
      aria-label="Servicios incluidos"
    >
      {SERVICE_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            className="flex min-w-0 flex-col items-center rounded-lg border border-border bg-muted/20 px-2 py-3 text-center sm:px-3"
          >
            <Icon
              className="size-5 shrink-0 text-muted-foreground sm:size-[1.35rem]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <p className="mt-2 text-[0.6875rem] font-bold leading-tight text-foreground sm:text-xs">
              {item.title}
            </p>
            <p className="mt-0.5 text-[0.625rem] leading-snug text-muted-foreground sm:text-[0.6875rem]">
              {item.subtitle}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
