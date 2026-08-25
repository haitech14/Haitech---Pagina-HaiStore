import { Handshake, Headphones, Store } from 'lucide-react';

import { QTC, QTC_BENEFITS } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

const ICONS = {
  store: Store,
  handshake: Handshake,
  headphones: Headphones,
} as const;

/**
 * Fila de beneficios (retiro / cuotas / atención).
 */
export function QtcBenefits({ className }: { className?: string }) {
  return (
    <section className={cn('w-full bg-white', className)} aria-label="Beneficios QTC">
      <div
        className="mx-auto px-4 py-8 xl:px-6"
        style={{ maxWidth: QTC.maxWidth }}
      >
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {QTC_BENEFITS.map((benefit) => {
            const Icon = ICONS[benefit.icon];
            return (
              <li
                key={benefit.id}
                className="flex min-h-[110px] items-center gap-4 rounded-[25px] border border-[#E8E8E8] bg-[#FAFAFA] px-5 py-4"
              >
                <span
                  className="inline-flex size-14 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: QTC.purple }}
                  aria-hidden="true"
                >
                  <Icon className="size-7" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="whitespace-pre-line text-[15px] font-bold leading-snug text-black sm:text-base">
                    {benefit.title}
                  </p>
                  {benefit.note ? (
                    <p className="mt-1 text-[11px] text-[#888]">{benefit.note}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
