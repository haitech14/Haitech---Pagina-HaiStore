import { CreditCard, Headphones, Settings, Truck, type LucideIcon } from 'lucide-react';

import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

const TRUST_ITEMS: readonly {
  id: string;
  title: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'envios',
    title: 'Envíos a todo el Perú',
    icon: Truck,
  },
  {
    id: 'soporte',
    title: 'Soporte técnico especializado',
    icon: Headphones,
  },
  {
    id: 'repuestos',
    title: 'Repuestos y consumibles',
    icon: Settings,
  },
  {
    id: 'compra',
    title: 'Compra segura y garantizada',
    icon: CreditCard,
  },
];

/** Franja de confianza móvil (4 íconos) bajo banners de catálogo. */
export function HaitechHomeMobileTrustStrip({ className }: { className?: string }) {
  return (
    <section
      aria-label="Ventajas HAITECH"
      className={cn('w-full border-y border-black/[0.06] bg-white sm:hidden', className)}
    >
      <div className="mx-auto px-2 py-3.5" style={{ maxWidth: HAITECH_HOME.maxWidth }}>
        <ul className="grid grid-cols-4 gap-1" role="list">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex flex-col items-center gap-1.5 px-0.5 text-center">
                <Icon className="size-6 text-[#111]" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-[9px] font-medium leading-tight text-[#222]">{item.title}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
