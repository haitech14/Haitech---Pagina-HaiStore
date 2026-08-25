import {
  BadgeCheck,
  FileText,
  Headphones,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

const INFO_ITEMS: readonly {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'corporativa',
    title: 'Atención corporativa',
    subtitle: 'Asesoría especializada B2B',
    icon: Headphones,
  },
  {
    id: 'envios',
    title: 'Envíos a todo el Perú',
    subtitle: 'Cobertura nacional',
    icon: Truck,
  },
  {
    id: 'soporte',
    title: 'Soporte técnico certificado',
    subtitle: 'Respuesta rápida y efectiva',
    icon: BadgeCheck,
  },
  {
    id: 'facturacion',
    title: 'Facturación para empresas',
    subtitle: 'Boletas y facturas',
    icon: FileText,
  },
  {
    id: 'autorizado',
    title: 'Distribuidor autorizado',
    subtitle: 'Marcas líderes del mercado',
    icon: ShieldCheck,
  },
];

/**
 * Infobox de confianza debajo del hero (5 columnas en desktop).
 */
export function HaitechHomeInfoStrip({ className }: { className?: string }) {
  return (
    <section
      aria-label="Ventajas HAITECH"
      className={cn('w-full border-b border-black/[0.06] bg-white', className)}
    >
      <div
        className="mx-auto px-4 py-4 sm:py-5 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <ul
          className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-5"
          role="list"
        >
          {INFO_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className={cn(
                  'flex min-h-[3.5rem] items-center gap-3 px-1 py-3 sm:min-h-[4rem] sm:px-3 sm:py-2',
                  index > 0 && 'border-t border-black/[0.06] sm:border-t-0',
                  index > 0 && 'lg:border-l lg:border-black/[0.08] lg:pl-5',
                  index % 2 === 1 && 'sm:border-l sm:border-black/[0.08] sm:pl-5 lg:border-l',
                  index >= 2 && 'sm:border-t sm:border-black/[0.06] lg:border-t-0',
                )}
              >
                <Icon
                  className="size-7 shrink-0 text-[#E30613] sm:size-8"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <p className="min-w-0 font-[family-name:var(--font-infobox)] leading-snug">
                  <span className="block text-[13px] font-bold tracking-tight text-[#111111] sm:text-sm">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-[#6B7280] sm:text-xs">
                    {item.subtitle}
                  </span>
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
