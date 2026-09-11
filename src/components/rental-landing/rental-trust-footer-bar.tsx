import { BadgeCheck, Headphones, Leaf, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

const TRUST_ITEMS = [
  {
    id: 'certificados',
    title: 'Equipos certificados y garantizados',
    icon: BadgeCheck,
  },
  {
    id: 'soporte',
    title: 'Soporte técnico en todo el Perú',
    icon: ShieldCheck,
  },
  {
    id: 'sostenible',
    title: 'Soluciones sostenibles',
    icon: Leaf,
  },
  {
    id: 'asesoria',
    title: 'Asesoría especializada en tu empresa',
    icon: Headphones,
  },
] as const;

export function RentalTrustFooterBar({ className }: { className?: string }) {
  return (
    <section
      aria-label="Compromiso Haitech Ricoh"
      className={cn('border-t border-[#ECECEC] bg-[#F7F7F8] py-8 sm:py-10', className)}
    >
      <div className="container flex flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <ul className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-5 shrink-0 text-[#E30613]" strokeWidth={1.7} aria-hidden />
                <span className="text-sm font-medium leading-snug text-[#374151]">{item.title}</span>
              </li>
            );
          })}
        </ul>
        <p className="shrink-0 text-sm font-semibold text-[#111111] lg:max-w-[15rem] lg:text-right">
          Con Ricoh, tu negocio nunca se detiene.
          <span className="mt-1 block h-0.5 w-16 rounded-full bg-[#E30613] lg:ml-auto" aria-hidden />
        </p>
      </div>
    </section>
  );
}
