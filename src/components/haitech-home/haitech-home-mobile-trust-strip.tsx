import { CreditCard, Headphones, Settings, Truck, type LucideIcon } from 'lucide-react';

import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

const TRUST_ITEMS: readonly {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  fill: string;
  glow: string;
}[] = [
  {
    id: 'envios',
    title: 'Envíos a todo el Perú',
    icon: Truck,
    color: '#059669',
    fill: '#A7F3D0',
    glow: 'rgba(5,150,105,0.18)',
  },
  {
    id: 'soporte',
    title: 'Soporte técnico especializado',
    icon: Headphones,
    color: '#7C3AED',
    fill: '#DDD6FE',
    glow: 'rgba(124,58,237,0.18)',
  },
  {
    id: 'repuestos',
    title: 'Repuestos y consumibles',
    icon: Settings,
    color: '#2563EB',
    fill: '#BFDBFE',
    glow: 'rgba(37,99,235,0.18)',
  },
  {
    id: 'compra',
    title: 'Compra segura y garantizada',
    icon: CreditCard,
    color: '#D97706',
    fill: '#FDE68A',
    glow: 'rgba(217,119,6,0.18)',
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
                <span
                  className="flex size-10 items-center justify-center rounded-full"
                  style={{ background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)` }}
                >
                  <Icon
                    className="size-6"
                    strokeWidth={1.6}
                    style={{ color: item.color }}
                    fill={item.fill}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-[9px] font-medium leading-tight text-[#222]">{item.title}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
